var express = require("express");
const {
  authenticateUser,
} = require("../middlewares/authenticateUserMiddleware");
const {
  lockId,
  isIdLocked,
  unlockId,
} = require("../middlewares/validateRequestMiddleware");
const { FieldValue } = require("firebase-admin/firestore");
const { db, openai } = require("../utils/servicesConfig");

// ROUTER SETUP
var router = express.Router();

async function pollRunCompletion(
  req,
  key,
  threadId,
  runId,
  interval = 2000,
  maxAttempts = 100,
) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const retrievedRun = await openai.beta.threads.runs.retrieve(
      threadId,
      runId,
    );
    console.log(
      "In computeInsights > pollRunCompletion for uid",
      req.uid,
      ", for period",
      key,
      ", retrievedRun.status:",
      retrievedRun.status,
    );
    if (retrievedRun.status === "completed") {
      return true; // Run is completed
    }
    // Wait for the specified interval before next check
    await new Promise((resolve) => setTimeout(resolve, interval));
    attempts++;
  }
  return false; // Max attempts reached without completion
}

function parseJsonFromInsights(insightsString) {
  try {
    // First, attempt to parse the string directly as JSON
    return JSON.parse(insightsString);
  } catch (error) {
    // If direct parsing fails, try extracting JSON using the regular expression to match JSON wrapped in triple backticks
    const jsonRegex = /```json\n([\s\S]*?)\n```/;
    const matches = insightsString.match(jsonRegex);

    if (matches && matches[1]) {
      try {
        // Parse the matched JSON string
        return JSON.parse(matches[1]);
      } catch (parseError) {
        console.error("Error parsing JSON: ", parseError);
        //STOP ROUTE FOR THIS PERIOD IF ERROR PARSING JSON
        throw new Error(
          "In computeInsights > parseJsonFromInsights error with" +
            insightsString +
            ":" +
            JSON.stringify(parseError),
        );
      }
    } else {
      console.error("No JSON found in the insights string.");
      //STOP ROUTE FOR THIS PERIOD IF NO JSON FOUND
      throw new Error(
        "In computeInsights > parseJsonFromInsights error with" +
          insightsString,
      );
    }
  }
}

async function waitForLockRelease(
  uid,
  lockName,
  interval = 2000,
  maxRetries = 20,
) {
  let retries = 0;
  while (retries < maxRetries) {
    if (!isIdLocked(uid, lockName)) {
      return true; // Lock is released
    }
    await new Promise((resolve) => setTimeout(resolve, interval)); // Wait
    retries++;
  }
  return false; // Max retries reached
}

// USER AUTHENTICATION
router.use(authenticateUser);

// ROUTE
router.post("/compute-insights/", async (req, res) => {
  //req.body contains threshold:3, origin:addMoment

  try {
    const threshold = req.body.threshold ? req.body.threshold : 3;

    // DOC REFS
    const userDocRef = db.collection("users").doc(req.uid);
    const momentsCollRef = userDocRef.collection("moments");

    // LOCK CHECK AND WAIT
    if (isIdLocked(req.uid, "computeInsights")) {
      console.log(
        `In computeInsights for uid ${req.uid}, waiting for lock release...`,
      );
      const lockReleased = await waitForLockRelease(req.uid, "computeInsights");

      if (!lockReleased) {
        console.log(
          `In computeInsights for uid ${req.uid}, lock not released after retries.`,
        );
        return res.status(409).json({
          message:
            "Error: In computeInsights > Lock not released after retries",
          uid: req.uid,
          body: req.body,
        });
      }
    }
    lockId(req.uid, "computeInsights");

    // MOMENTS QUERY
    const queryRef = momentsCollRef.where("sentToThread", "==", false); //TODO:3 we could optimize to reduce doc reads by preventing the return of docs that have needs.Oops or needs.error -> if so we need to add a valid:boolean field to moments
    const queriedMomentsSnapshot = await queryRef.get();
    if (queriedMomentsSnapshot.empty) {
      throw new Error(
        "In computeInsights for uid",
        req.uid,
        " > queriedMomentsSnapshot empty for body" + JSON.stringify(req.body),
      );
    }

    // MESSAGES MAP CREATION
    const messages = {};
    queriedMomentsSnapshot.forEach((doc) => {
      if (
        !doc.data().needs ||
        Object.keys(doc.data().needs).length === 0 ||
        doc.data().needs.Oops ||
        doc.data().needs.error
      ) {
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
          content: JSON.stringify({
            text: doc.data().text,
            date: doc.data().date,
            id: doc.id,
          }),
        });
      }
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

    // RUN AND PERSIST MESSAGES PER PERIOD
    // for each period of messages initialize aggregateMonthlyInsightsDoc with key as month
    //TODO:5 parallelize with Promise.allSettled instead
    for (const key of Object.keys(messages)) {
      try {
        console.log(
          "In computeInsights for uid",
          req.uid,
          "> for loop currently at key:",
          key,
          "messages[key]:",
          messages[key],
        );

        // AGGREGATE DOC CREATION OR INIT
        const aggregateMonthlyInsightsDocRef = userDocRef
          .collection("aggregateMonthly")
          .doc(`${key}-insights`);
        const aggregateMonthlyInsightsDoc =
          await aggregateMonthlyInsightsDocRef.get();

        // THREAD CREATION OR UPDATE
        let threadId;
        if (!aggregateMonthlyInsightsDoc.exists) {
          //create a new thread and add messages
          const messageThread = await openai.beta.threads.create({
            messages: messages[key],
          });
          threadId = messageThread.id;

          const defaultStructure = {
            threadId: threadId,
            nSuccessRun: 0,
            isNew: {
              summary: false,
              quote: false,
              book: false,
              suggestions: false,
            },
            summary: "",
            quote: { text: "", author: "", why: "" },
            book: { title: "", author: "", why: "" },
            suggestions: { continue: [], stop: [], start: [] },
            lastUpdate: FieldValue.serverTimestamp(),
          };
          await aggregateMonthlyInsightsDocRef.set(defaultStructure);
          console.log(
            "In computeInsights for uid",
            req.uid,
            ", doc ",
            `${key}-insights`,
            "wasn't created, created it and thread with threadId",
            threadId,
          );
        } else {
          threadId = aggregateMonthlyInsightsDoc.data().threadId;
          //add messages to existing thread
          for (const message of messages[key]) {
            await openai.beta.threads.messages.create(threadId, message);
          }
        }

        //PERSIST SENTTOTHREAD IN MOMENTS
        const updatePromises = messages[key].map((message) => {
          const momentDocRef = momentsCollRef.doc(
            JSON.parse(message.content).id,
          );
          return momentDocRef.update({ sentToThread: true });
        });
        await Promise.all(updatePromises);

        // DECIDE WHETHER TO RUN
        const messagesList = await openai.beta.threads.messages.list(threadId);
        // const nMessages = messagesList.data.length;
        //count user messages only
        const nMessages = messagesList.data.filter(
          (message) => message.role === "user",
        ).length;

        console.log(
          "In computeInsights for uid",
          req.uid,
          ", for period",
          key,
          " nMessages:",
          nMessages,
          nMessages >= threshold
            ? " >= threshold so running thread"
            : " < threshold so NOT running thread",
        );

        // RUN TRIGGERING
        if (nMessages >= threshold) {
          const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: "asst_tG10j9aoT8jhDMg2Vv80QbRq", //  "asst_rcBnWZtThCU7wUxkbZt8d7O8",
          });

          // RUN POLLING
          //By default, a Run goes into the queued state. You can periodically retrieve the Run to check on its status to see if it has moved to completed.
          const runCompleted = await pollRunCompletion(
            req,
            key,
            threadId,
            run.id,
          );

          //STOP ROUTE FOR THIS PERIOD IF RUN DID NOT COMPLETE
          if (!runCompleted) {
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

          let insightsString = responseMessages.data[0].content[0].text.value;
          console.log(
            "In computeInsights for uid",
            req.uid,
            ", for period",
            key,
            " insightsString:",
            insightsString,
          );

          const insightsObject = parseJsonFromInsights(insightsString);
          console.log(
            "In computeInsights for uid",
            req.uid,
            ", for period",
            key,
            " insightsObject:",
            insightsObject,
            "based on adding new message(s):",
            messages[key],
          );

          //STOP ROUTE FOR THIS PERIOD IF INSIGHTS OBJECT IS EMPTY
          if (Object.keys(insightsObject).length === 0) {
            throw new Error(
              "Error In computeInsights for uid" +
                req.uid +
                ", for period" +
                key +
                " insightsString:" +
                insightsString +
                "Insights object empty",
            );
          }

          //PERSIST INSIGHTS IF SUCCESS PATH
          //persist insights data in firestore in aggregateMonthlyInsightsDoc.insights
          await aggregateMonthlyInsightsDocRef.update({
            nSuccessRun: FieldValue.increment(1),
            isNew: {
              summary: true,
              quote: true,
              book: true,
              suggestions: true,
            },
            ...insightsObject,
            lastUpdate: FieldValue.serverTimestamp(),
          });

          console.log(
            "In computeInsights for uid",
            req.uid,
            "added insights to aggregateMonthly.",
            `${key}-insights`,
          );
        }
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
      message: "computeInsights > Successful for",
      uid: req.uid,
      body: req.body,
    });
  } catch (error) {
    console.log("In computeInsights, failure for ", req.body, "error: ", error);
    unlockId(req.uid, "computeInsights");
    return res.status(500).json({
      message: "In computeInsights failure when computing new insights for ",
      uid: req.uid,
      body: req.body,
    });
  }
});

module.exports = router;
