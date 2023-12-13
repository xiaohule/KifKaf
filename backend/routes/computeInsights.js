// EXTERNAL DEPENDENCIES
var express = require("express");
const {
  authenticateUser,
} = require("../middlewares/authenticateUserMiddleware");
const {
  lockId,
  isIdLocked,
  unlockId,
  validateComputeInsightsRequest,
} = require("../middlewares/validateRequestMiddleware");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const {
  initAggregateDoc,
} = require("../utils/persistNeedsDataSuccessPathUtils");
const { db, openai } = require("../utils/servicesConfig");

// ROUTER SETUP
var router = express.Router();

// USER AUTHENTICATION
router.use(authenticateUser); // Use the middleware for all routes in this router

// ROUTE
router.post(
  "/compute-insights/",
  validateComputeInsightsRequest,
  async (req, res) => {
    //req.body contains threshold:3, origin:addMoment

    //DATES
    // const now = new Date();
    // const currentYear = now.getFullYear();
    // const currentMonth = now.getMonth();
    // const firstDayOfMonthTs = Timestamp.fromDate(
    //   new Date(currentYear, currentMonth, 1, 0, 0, 0),
    // );
    // const lastDayOfMonthTs = Timestamp.fromDate(
    //   new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
    // );
    // const currentYYYYdMM =
    //   currentYear + "-" + (currentMonth < 9 ? "0" : "") + (currentMonth + 1);

    try {
      const threshold = req.body.threshold ? req.body.threshold : 3;
      // console.log("In computeInsights > req.headers", req.headers);
      console.log(
        "In computeInsights for uid",
        req.uid,
        " > POST request received, with req.body:",
        req.body,
      );

      //LOCK
      if (isIdLocked(req.uid, "computeInsights")) {
        console.log(
          "In computeInsights for uid",
          req.uid,
          " > Error: duplicate request detected",
        );
        return res.status(409).json({
          message: "Error: In computeInsights > duplicate request detected:",
          uid: req.uid,
          body: req.body,
        });
      }
      lockId(req.uid, "computeInsights");

      // DOC & QUERY REFS
      const userDocRef = db.collection("users").doc(req.uid);
      const momentsCollRef = userDocRef.collection("moments");

      // console.log(
      //   "In computeInsights, querying firestore for all moments with sentToThread == false",
      // );
      const queryRef = momentsCollRef
        // .where("date", ">=", firstDayOfMonthTs)
        // .where("date", "<=", lastDayOfMonthTs)
        .where("sentToThread", "==", false);
      //TODO:4 we could optimize to reduce doc reads by preventing the return of docs that have needs.Oops or needs.error -> if so we need to add a valid:boolean field to moments

      // DOC READS
      const queriedMomentsSnapshot = await queryRef.get();
      // console.log("In computeInsights, queriedMomentsSnapshot:", queriedMomentsSnapshot);

      if (queriedMomentsSnapshot.empty) {
        throw new Error(
          "In computeInsights for uid",
          req.uid,
          " > queriedMomentsSnapshot empty for body" + JSON.stringify(req.body),
        );
      }

      // MESSAGE(S) CREATION
      const messages = {};
      queriedMomentsSnapshot.forEach((doc) => {
        // console.log(
        //   "In computeInsights for uid",req.uid," forEach queriedMomentsSnapshot, doc.id",
        //   doc.id,
        //   "=>",
        //   doc.data().text,
        // );
        if (
          !doc.data().needs ||
          doc.data().needs.Oops ||
          doc.data().needs.error
        ) {
          // console.log(
          //   "In computeInsights for uid",req.uid,", moment needs.Oops or needs.error, so skipping.",
          // );
          return;
        } else {
          const momentDate = doc.data().date.toDate();
          const momentYYYYdMM =
            momentDate.getFullYear() +
            "-" +
            (momentDate.getMonth() < 9 ? "0" : "") +
            (momentDate.getMonth() + 1);
          // if messages.momentYYYYdMM does not exist, create it
          if (!messages[momentYYYYdMM]) messages[momentYYYYdMM] = [];

          messages[momentYYYYdMM].push({
            role: "user",
            // add a json containing only the text and date key-value pairs of doc.data() to content
            content: JSON.stringify({
              text: doc.data().text,
              date: doc.data().date,
              id: doc.id,
            }),
          });
        }
      });

      console.log(
        "In computeInsights for uid",
        req.uid,
        ", messages before threshold filtering:",
        messages,
      );

      // in messages, keep only the months that have at least threshold messages
      Object.keys(messages).forEach((key) => {
        if (messages[key].length < threshold) delete messages[key];
      });

      // if messages is empty, return
      if (Object.keys(messages).length === 0) {
        console.log(
          "In computeInsights for uid",
          req.uid,
          " > Not enough moments to trigger a run",
        );
        unlockId(req.uid, "computeInsights");
        return res.status(200).json({
          message:
            "In computeInsights > Not enough messages to trigger a run for",
          uid: req.uid,
          body: req.body,
        });
      }

      console.log(
        "In computeInsights for uid",
        req.uid,
        ", messages to be sent to thread:",
        messages,
      );

      // RUN AND PERSIST MESSAGES PER PERIOD
      // for each key of messages run initAggregateDoc on aggregateMonthlyInsightsDocRef with key as month
      //TODO:5 parallelize with Promise.allSettled instead
      for (const key of Object.keys(messages)) {
        try {
          console.log(
            "In computeInsights for uid",
            req.uid,
            ", Object.keys(messages).forEach with  key:",
            key,
            "messages[key]:",
            messages[key],
          );

          //BATCH CREATION
          const batch = db.batch();

          // AGGREGATE DOC CREATION OR INIT
          const aggregateMonthlyInsightsDocRef = userDocRef
            .collection("aggregateMonthly")
            .doc(`${key}-insights`);
          await initAggregateDoc(aggregateMonthlyInsightsDocRef, "insights"); //init if non-existent, do nothing otherwise
          const aggregateMonthlyInsightsDoc =
            await aggregateMonthlyInsightsDocRef.get();

          // THREAD CREATION OR UPDATE
          let threadId = aggregateMonthlyInsightsDoc.data().threadId;
          if (!threadId) {
            //create a new thread and add messages
            const messageThread = await openai.beta.threads.create({
              messages: messages[key],
            });

            threadId = messageThread.id;
            // persist thread id in aggregateMonthlyInsightsDoc
            batch.update(aggregateMonthlyInsightsDocRef, { threadId });

            console.log(
              "In computeInsights for uid",
              req.uid,
              ", no thread id initially found for doc ",
              `${key}-insights`,
              "created a new thread",
              messageThread,
            );
          } else {
            //add messages to existing thread
            const threadMessages = await openai.beta.threads.messages.create(
              threadId,
              messages[key],
            );
            console.log(
              "In computeInsights for uid",
              req.uid,
              ", thread id ",
              threadId,
              "found for doc ",
              `${key}-insights`,
              "updated thread",
              threadMessages,
            );
          }

          //PERSIST SENTTOTHREAD IN MOMENTS
          messages[key].forEach((message) => {
            const momentDocRef = momentsCollRef.doc(
              JSON.parse(message.content).id,
            );
            batch.update(momentDocRef, { sentToThread: true });
          });

          // RUN TRIGGERING
          const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: "asst_rcBnWZtThCU7wUxkbZt8d7O8",
          });
          // console.log(
          //   "In computeInsights for uid",
          //   req.uid,
          //   ", for period",
          //   key,
          //   " run:",
          //   run,
          // );

          // RUN POLLING
          //By default, a Run goes into the queued state. You can periodically retrieve the Run to check on its status to see if it has moved to completed.
          const runId = run.id;
          let runStatus = "queued";
          let attempts = 0;
          const maxAttempts = 20; // Set a maximum number of retries
          const delay = (ms) =>
            new Promise((resolve) => setTimeout(resolve, ms)); // Delay function

          while (runStatus !== "completed" && attempts < maxAttempts) {
            await delay(5000); // Wait for 5 seconds before the next check
            try {
              const runUpdate = await openai.beta.threads.runs.retrieve(
                threadId,
                runId,
              );
              runStatus = runUpdate.status;
              console.log(
                "In computeInsights for uid",
                req.uid,
                ", for period",
                key,
                ", runStatus:",
                runStatus,
              );
            } catch (pollingError) {
              console.error(
                "In computeInsights for uid",
                req.uid,
                ", for period",
                key,
                ", Error checking run status:",
                pollingError,
              );
              break; // Exit loop in case of an error
            }
            attempts++;
          }

          if (runStatus !== "completed") {
            console.error(
              "In computeInsights for uid",
              req.uid,
              ", for period",
              key,
              ", Run did not complete within the expected time.",
            );
            throw new Error(
              "In computeInsights > assistant api run did not complete within the expected time for run" +
                JSON.stringify(run),
            );
          }

          // CHECK MESSAGES
          const responseMessages =
            await openai.beta.threads.messages.list(threadId);
          // console.log("In computeInsights, responseMessages:", responseMessages);

          let insightsString = responseMessages.data[0].content[0].text.value;
          // Remove Markdown formatting if any
          insightsString = insightsString
            .replace(/```json\n|\n```/g, "")
            .trim();
          const insightsObject = JSON.parse(insightsString);
          console.log(
            "In computeInsights for uid",
            req.uid,
            ", for period",
            key,
            " responseMessages:",
            insightsObject,
          );

          if (Object.keys(insightsObject).length === 0) {
            throw new Error(
              "In computeInsights > responseMessages.data[0].content[0].text.value is empty for body" +
                JSON.stringify(req.body),
            );
          }

          // PERSIST INSIGHTS IF SUCCESS PATH
          //persist insights data in firestore in aggregateMonthlyInsightsDoc.insights
          batch.update(aggregateMonthlyInsightsDocRef, {
            nSuccessRun: FieldValue.increment(1),
            ...insightsObject,
          });

          //BATCH COMMIT
          await batch.commit();

          console.log(
            "In computeInsights for uid",
            req.uid,
            "added insights to aggregateMonthly.",
            `${key}-insights`,
          );
        } catch (error) {
          console.log(
            "In computeInsights for uid",
            req.uid,
            ", for period",
            key,
            " error:",
            error,
          );
        }
      }

      unlockId(req.uid, "computeInsights");
      return res.status(200).json({
        message: "In computeInsights Successful computing new insights for",
        uid: req.uid,
        body: req.body,
      });
    } catch (error) {
      console.log(
        "In computeInsights, failure for ",
        req.body,
        "error: ",
        error,
      );
      unlockId(req.uid, "computeInsights");
      return res.status(500).json({
        message: "In computeInsights failure when computing new insights for ",
        uid: req.uid,
        body: req.body,
        // error: error,
      });
    }
  },
);

module.exports = router;
