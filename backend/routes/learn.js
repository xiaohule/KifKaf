var express = require("express");
var admin = require("firebase-admin");
var serviceAccount = require("./../serviceAccountKey.json");
const {
  getFirestore,
  Timestamp,
  FieldValue,
  // Filter,
} = require("firebase-admin/firestore");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

var router = express.Router();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = getFirestore();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const needsList = [
  "Physical Safety",
  "Food",
  "Shelter",
  "Financial Security",
  "Rest & Relaxation",
  "Comfort",
  "Physical Movement",
  "Physical Touch",
  "Sexual Expression",
  "Contact with Nature",
  "Social Connection",
  "Belongingness & Community",
  "Empathy, Understanding & Validation",
  "Affection, Love & Intimacy",
  "Emotional Safety & Well-Being",
  "Personal Privacy",
  "Personal Autonomy",
  "Self-Esteem & Social Recognition",
  "Competence",
  "Efficiency",
  "Societal Contribution",
  "Personal Expression & Creativity",
  "Exploration",
  "Inspiration",
  "Learning",
  "Self-Actualization",
  "Challenge",
  "Novelty",
  "Entertainment",
  "Humor",
  "Play",
  "Moral Integrity",
  "Social Justice",
  "Order & Structure",
  "Altruism",
  "Life's Meaning & Purpose",
  "Joyful Celebration",
  "Grieving & Mourning",
  "Inner Peace",
  "Spiritual Transcendence",
];

const needsInitValues = {
  occurrenceCount: 0,
  importancesSum: 0,
  satisfactionSum: 0,
  importanceValue: 0,
  satisfactionValue: 0,
  importanceDisplayValue: 0,
  satisfactionImpactDisplayValue: 0,
  unsatisfactionImpactDisplayValue: 0,
  satisfactionImpactLabelValue: 0,
  unsatisfactionImpactLabelValue: 0,
};

const needsMap = needsList.reduce((acc, need) => {
  acc[need] = { ...needsInitValues };
  return acc;
}, {});

const initAggregateDoc = async (aggregateDocRef, isRaw = false) => {
  const aggregateDoc = await aggregateDocRef.get();
  if (!aggregateDoc.exists) {
    if (isRaw) {
      await aggregateDocRef.set({
        nMoments: 0,
        totalImportances: 0,
        lastUpdate: FieldValue.serverTimestamp(),
        needs: needsMap, // needs: {need1: { importancesSum: 0, satisfactionSum: 0, occurrenceCount: 0 }, need2: { importancesSum: 0, satisfactionSum: 0, occurrenceCount: 0 }, ...}
        maxImportanceValue: 0,
        totalSatisfactionImpact: 0,
        totalUnsatisfactionImpact: 0,
      });
    } else {
      await aggregateDocRef.set({
        lastUpdate: FieldValue.serverTimestamp(),
      });
    }
  }
};

function generateNewRawData(mom, doc, momentImportancesResp) {
  //variables are prefixed by "moment" when related to the processed moment, "" when related to a need and "total"/"max" when aggregated over all needs
  const momentImportancesSum = Object.values(momentImportancesResp).reduce(
    (acc, currentValue) => acc + currentValue,
    0,
  );

  const baseData = {
    nMoments: FieldValue.increment(1),
    totalImportances: doc.data().totalImportances + momentImportancesSum,
    lastUpdate: FieldValue.serverTimestamp(),
    totalSatisfactionImpact: 0,
    totalUnsatisfactionImpact: 0,
    maxImportanceValue: 0,
  };

  //1st loop only on mom's needs to update value that relies only on the moment data
  for (let need in doc.data().needs) {
    if (momentImportancesResp[need]) {
      const occurrenceCount = doc.data().needs[need].occurrenceCount + 1;
      baseData[`needs.${need}.occurrenceCount`] = occurrenceCount;

      baseData[`needs.${need}.importancesSum`] =
        doc.data().needs[need].importancesSum + momentImportancesResp[need];

      const satisfactionSum =
        doc.data().needs[need].satisfactionSum + Math.random(); //TODO: 4 get satisfacton
      baseData[`needs.${need}.satisfactionSum`] = satisfactionSum;

      baseData[`needs.${need}.satisfactionValue`] =
        satisfactionSum / occurrenceCount;
    } else {
      //needed in baseData for display data update
      baseData[`needs.${need}.occurrenceCount`] =
        doc.data().needs[need].occurrenceCount;
      baseData[`needs.${need}.satisfactionValue`] =
        doc.data().needs[need].satisfactionValue;
      //not needed: importancesSum & satisfactionSum
    }
  }

  // 2nd loop on all needs to compute maxImportanceValue, totalSatisfactionImpact and totalUnsatisfactionImpact
  for (let need in doc.data().needs) {
    // console.log(
    //   " In generateNewRawData 2nd loop for need:",
    //   need,
    //   "baseData[`needs.${need}.importancesSum`]",
    //   baseData[`needs.${need}.importancesSum`],
    // );
    const importanceValue =
      (baseData[`needs.${need}.importancesSum`] ??
        doc.data().needs[need].importancesSum) / baseData.totalImportances;
    baseData[`needs.${need}.importanceValue`] = importanceValue;

    if (importanceValue > baseData.maxImportanceValue) {
      baseData.maxImportanceValue = importanceValue;
    }

    const satisfactionValue =
      baseData[`needs.${need}.satisfactionValue`] ??
      doc.data().needs[need].satisfactionValue;
    baseData.totalSatisfactionImpact += importanceValue * satisfactionValue;
    baseData.totalUnsatisfactionImpact +=
      importanceValue * (1 - satisfactionValue);
  }

  //3rd loop on all needs now that we know maxImportanceValue, totalSatisfactionImpact and totalUnsatisfactionImpact
  for (let need in doc.data().needs) {
    const importanceDisplayValue =
      baseData[`needs.${need}.importanceValue`] / baseData.maxImportanceValue;
    baseData[`needs.${need}.importanceDisplayValue`] = importanceDisplayValue;

    const satisfactionValue =
      baseData[`needs.${need}.satisfactionValue`] ??
      doc.data().needs[need].satisfactionValue;
    baseData[`needs.${need}.satisfactionImpactDisplayValue`] =
      importanceDisplayValue * satisfactionValue;
    baseData[`needs.${need}.unsatisfactionImpactDisplayValue`] =
      importanceDisplayValue * (1 - satisfactionValue);

    baseData[`needs.${need}.satisfactionImpactLabelValue`] =
      (baseData[`needs.${need}.importanceValue`] * satisfactionValue) /
      baseData.totalSatisfactionImpact;
    baseData[`needs.${need}.unsatisfactionImpactLabelValue`] =
      (baseData[`needs.${need}.importanceValue`] * (1 - satisfactionValue)) /
      baseData.totalUnsatisfactionImpact;
  }
  // console.log(
  //   "In generateNewRawData, for mom ",
  //   mom,
  //   " for doc: ",
  //   doc.id,
  //   "for momentImportancesResp: ",
  //   momentImportancesResp,
  //   " returning baseData:",
  //   baseData,
  // );

  return baseData;
}

//   {
//     2023: {
//       nMoments: FieldValue.increment(1),
//       totalImportances: FieldValue.increment(momentImportancesTotal),
//       lastUpdate: FieldValue.serverTimestamp(),
//       needs: {
//         needName: {,
//             occurrenceCount: FieldValue.increment(1);

//             importancesSum: FieldValue.increment(momentImportancesResp[need],
//             satisfactionSum: FieldValue.increment(Math.random(),

//             importanceValue: importancesSum / totalImportances,
//             satisfactionValue: satisfactionSum / occurrenceCount,
//             importanceDisplayValue: importanceDisplayValue,
//             satisfactionImpactDisplayValue: satisfactionImpactDisplayValue,
//             unsatisfactionImpactDisplayValue: unsatisfactionImpactDisplayValue,
//             satisfactionImpactLabelValue:satisfactionImpactDisplayValue/totalSatisfactionImpact,
//             unsatisfactionImpactLabelValue:unsatisfactionImpactDisplayValue,
//         }
//       },
//     maxImportanceValue: 0,
//     totalSatisfactionImpact: 0,
//     totalUnsatisfactionImpact: 0,
//   };
// }

const propertiesOfInterest = [
  "occurrenceCount",
  "satisfactionImpactLabelValue",
  "unsatisfactionImpactLabelValue",
  "importanceDisplayValue",
  "satisfactionImpactDisplayValue",
  "unsatisfactionImpactDisplayValue",
  "importanceValue",
  "satisfactionValue",
];

function allPropertiesZeroForNeed(newRawData, need) {
  return propertiesOfInterest.every((prop) => {
    let key = `needs.${need}.${prop}`;
    return newRawData[key] === 0 || newRawData[key] === undefined;
  });
}

function generateNewDisplayArray( //TODO:4 we could remove all data that won't be used in the frontend to reduce the size of the response
  newRawData,
  filterBy = "none",
  sortBy = "none",
) {
  try {
    // console.log(
    //   "In generateNewDisplayData with filterBy:",
    //   filterBy,
    //   "sortBy:",
    //   sortBy,
    //   // "newRawData:",
    //   // newRawData,
    // );
    if (!newRawData)
      throw new Error("In generateNewDisplayArray newRawData is empty");

    let needsDataArray = [];
    let auxObject = {}; // to track existing needs

    Object.keys(newRawData).forEach((key) => {
      if (key.startsWith("needs.")) {
        let [_, need, property] = key.split(".");

        if (
          !allPropertiesZeroForNeed(newRawData, need) &&
          propertiesOfInterest.includes(property)
        ) {
          if (!auxObject[need]) {
            auxObject[need] = { needName: need };
            needsDataArray.push(auxObject[need]);
          }

          auxObject[need][property] = newRawData[key];
        }
      }
    });

    console.log(
      "In generateNewDisplayArray with filterBy:",
      filterBy,
      "sortBy:",
      sortBy,
      "returning needsDataArray after arrayization:",
      needsDataArray,
    );

    if (needsDataArray.length == 0)
      throw new Error("In generateNewDisplayArray needsDataArray is empty");

    //Filtering
    needsDataArray = needsDataArray.filter((obj) => {
      let needData = obj;

      if (filterBy === "unsatisfaction")
        return needData.satisfactionValue < 1 && needData.occurrenceCount > 0;
      if (filterBy === "satisfaction")
        return needData.satisfactionValue > 0 && needData.occurrenceCount > 0;

      return needData.occurrenceCount > 0;
    });

    //Sorting
    if (sortBy !== "none") {
      needsDataArray.sort((a, b) => b[sortBy] - a[sortBy]);
    }

    console.log(
      "In generateNewDisplayArray with filterBy:",
      filterBy,
      "sortBy:",
      sortBy,
      "returning needsDataArray after filter sorting:",
      needsDataArray,
    );

    return needsDataArray;
  } catch (error) {
    console.error("Error generateNewDisplayArray:", error);
    return [];
  }
}

const createOpenAIRequestOptions = (moment) => {
  const request_options = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          '**Context**: You and I are collaborating as scientists working to understand the importance of various universal human needs based on described experiences. You are a psychology expert specializing in human needs.\n\n**Instructions**:\n1. You\'ll receive a "Moment", a description of an individual\'s life experience.\n2. For that moment, rate the importance each need of the list of Universal Human Needs (provided below) is likely holding for the individual who reported it. Rate from 0.0 (not important at all) to 1.0 (very important). 0.5 indicates moderate importance.\n3. Provide your result in the following JSON Format (include only needs with non-zero importance and don’t justify your answers, just return the expected JSON result):\n```\n{"Need Name": importance_value, ...}\n```\nNotes:\n- Both the satisfaction and dissatisfaction of a need do indicate its importance for the individual.\n- A moment might hint at a need\'s importance even if the need is not explicitly mentioned.\n\n**Universal Human Needs**:\n```\n[ "Physical Safety", "Food", "Shelter", "Financial Security", "Rest & Relaxation", "Comfort", "Physical Movement", "Physical Touch", "Sexual Expression", "Contact with Nature", "Social Connection", "Belongingness & Community", "Empathy, Understanding & Validation", "Affection, Love & Intimacy", "Emotional Safety & Well-Being", "Personal Privacy", "Personal Autonomy", "Self-Esteem & Social Recognition", "Competence", "Efficiency", "Societal Contribution", "Personal Expression & Creativity", "Exploration", "Inspiration", "Learning", "Self-Actualization", "Challenge", "Novelty", "Entertainment", "Humor", "Play", "Moral Integrity", "Social Justice", "Order & Structure", "Altruism", "Life\'s Meaning & Purpose", "Joyful Celebration", "Grieving & Mourning", "Inner Peace", "Spiritual Transcendence" ]\n```\n\n**Example**:\n1. Moment:\n```\n{"moment": "Feeling like I am wasting my time at the playfight workshop because I\'m not learning anything"}\n```\n2. Importance rating:\n   You would assess for each need whether the moment is referring to the satisfaction or dissatisfaction of it, or if the moment hint at its importance for the individual:\n- "Physical Safety": not related at all. importance_value: 0.0.\n  ...\n- "Physical Movement": indirectly related since playfight is an activity involving movement so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. importance_value: 0.5.\n- "Physical Touch": indirectly related since playfight is an activity involving touch so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. importance_value: 0.3.\n- "Sexual Expression": indirectly related since playfight and sexual expression share a lot of traits like play, creativity, physical touch, etc... importance_value: 0.1.\n- "Social Connection": indirectly related since playfight is an activity involving social connections so the user must attach importance to this need otherwise he wouldn\'t practice playfight at all. importance_value: 0.5.\n  ...\n- "Efficiency": directly related since the user is reporting a high dissatisfaction caused by "not learning anything" so the user must have a high need for efficiency importance_value: 0.7.\n  ...\n- "Learning": directly related since the user is reporting a high dissatisfaction caused by "not learning anything" so the user must have a need for learning that is somewhat important. importance_value: 0.9\n  ...\n3. Expected JSON result (only including needs with non-zero importance):\n```\n{ "Physical Movement": 0.5, "Physical Touch": 0.3, "Sexual Expression": 0.1, "Social Connection": 0.5, "Belongingness & Community": 0.1, "Personal Autonomy": 0.2, "Competence": 0.2, "Efficiency": 0.7, "Personal Expression & Creativity": 0.3, "Exploration": 0.3, "Challenge": 0.2, "Novelty": 0.4, "Learning": 0.9, "Self-Actualization": 0.2, "Play": 0.5 }\n```',
      },
      {
        role: "user",
        content: JSON.stringify(moment), // content: '{"moment": "Feeling aroused and capable when playfight jamming with penelope and new ppl"}',
      },
    ],
    temperature: 0,
    max_tokens: 500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };
  return request_options;
};

const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    return res.status(403).send("Unauthorized: No ID token provided.");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid; // Attach the uid to the request object
    next();
  } catch (error) {
    console.error("Token verification error", error);
    return res.status(403).send("Unauthorized: Invalid ID token.");
  }
};

router.use(authenticate); // Use the middleware for all routes in this router

const lockedMomentIds = new Set(); //TODO:1 Since the code is running in a stateful server environment, lockedMomentIds is effective. However, be aware that in environments where multiple server instances are running (like in a clustered environment), this approach won't work since lockedMomentIds will only exist in memory for the specific server instance handling the request. In such cases, distributed lock manager like Redis or saving in firestore could be used.
//TODO:2 lockedMomentIds can potentially grow indefinitely. Consider implementing a mechanism to purge old IDs after a certain time or after they're no longer relevant. Also consider monitoring it.

router.get("/needs/", async (req, res) => {
  //TODO:2 make this a post request? pro and cons of post vs get?
  try {
    if (lockedMomentIds.has(req.query.momentId)) {
      console.log(
        "Error: duplicate request detected for query",
        req.query,
        "lockedMomentIds:",
        lockedMomentIds,
      );
      return res
        .status(409)
        .send(
          "Error: duplicate request detected for query" +
            JSON.stringify(req.query),
        );
    }
    lockedMomentIds.add(req.query.momentId);

    // console.log("req.headers", req.headers);
    console.log("GET request received", req.query); //returns { moment:'Feeling sad to be working so much' }

    //TODO:1 Make sure you validate the data coming from the client before processing. For instance, before calling the OpenAI API, validate req.query.momentText to ensure it's in the expected format.

    // LLM CALL
    const request_options = createOpenAIRequestOptions(req.query.momentText);
    // console.log("request_options", request_options);
    const response = await openai.createChatCompletion(request_options);
    // console.log("response.data", response.data);
    // console.log( "response.data.choices[0].message",  response.data.choices[0].message );

    // Parse the response content to a JavaScript object
    let parsedContent = JSON.parse(response.data.choices[0].message.content);
    console.log(
      "LLM response received for",
      req.query,
      ", parsedContent=",
      parsedContent,
    );
    /* returns {"Emotional Safety & Well-Being": 0.8, "Personal Autonomy": 0.2, "Self-Esteem & Social Recognition": 0.2, "Exploration": 0.1, "Learning": 0.1, "Inner Peace": 0.1}*/
    if (!parsedContent || parsedContent.error) {
      console.log(
        "Error: parsedContent empty or erroneous, for mom",
        req.query,
        "here are response.data.choices[0].message: ",
        response.data.choices[0].message,
      );
    }

    // PROCESS LLM RESPONSE, REPLYING IF NECESSARY
    const issueTypeConditions = {
      parsedContentEmpty: Object.keys(parsedContent).length == 0,
      sumOfAllValuesLow:
        Object.values(parsedContent).reduce((a, b) => a + b, 0) < 0.1,
      noValuesMoreThanThreshold: !Object.values(parsedContent).some(
        (value) => value > 0.1,
      ),
    };
    const issueType = Object.keys(issueTypeConditions).find(
      (type) => issueTypeConditions[type],
    );

    if (issueType) {
      console.log("Error:", issueType, "for", req.query, parsedContent);

      const errorMessages = {
        parsedContentEmpty:
          "Why did you return an empty result? All moments do hint at some needs. Please provide a revised answer. Don’t justify it, just return the expected JSON result.",
        sumOfAllValuesLow:
          "Why are all need importance values zero? All moments do hint at some needs. Please provide a revised answer. Don’t justify it, just return the expected JSON result.",
        noValuesMoreThanThreshold:
          "Why are all need importance values so low? Please provide a revised answer. Don’t justify it, just return the expected JSON result.",
      };
      const errorMessage =
        errorMessages[issueType] || "Error: issueType not recognized";

      // append the returned assistant response and the user's response to request_options.messages and call openai.createChatCompletion again
      request_options.messages.push(
        response.data.choices[0].message, // This adds the last response from the assistant
        {
          role: "user",
          content: errorMessage,
        },
      );
      const replyResponse = await openai.createChatCompletion(request_options);
      // Update the 'parsedContent' from the new response
      parsedContent = JSON.parse(replyResponse.data.choices[0].message.content);
      console.log(
        "Retried for ",
        req.query,
        "bec. it had Error ",
        issueType,
        ", new parsedContent after reply: ",
        parsedContent,
      );
      if (
        !parsedContent ||
        parsedContent.error ||
        Object.keys(parsedContent).length == 0
      ) {
        console.log(
          "Error in retry: parsedContent empty or erroneous, for",
          req.query,
          "here are response.data.choices[0].message: ",
          response.data.choices[0].message,
        );
      }
    }

    let momentImportancesResp = parsedContent;

    for (let need in momentImportancesResp) {
      //if need is not in needsList, add it to offlistNeeds collection
      if (!needsList.includes(need)) {
        delete momentImportancesResp[need];
        console.log(need, " is not found in the needsList.");
        const offlisNeedsRef = db
          .collection("offlistNeeds")
          .doc(need)
          .collection("moments")
          .doc(req.query.momentId);
        await offlisNeedsRef.set({
          moment: req.query.momentText,
          needsImportance: parsedContent,
          user: req.uid,
          lastUpdate: FieldValue.serverTimestamp(),
        });
      }
    }

    // ENRICH MOMENT DOC & UPDATE AGGREGATE DOCS
    //get yearly and monthly aggregate docs
    const userDocRef = db.collection("users").doc(req.uid);
    let aggregateYearlyRawDocRef,
      aggregateMonthlyRawDocRef,
      aggregateYearlyDocRef,
      aggregateMonthlyDocRef;
    const momentdateObject = JSON.parse(req.query.momentDate);
    if (momentdateObject && momentdateObject.seconds) {
      const momentTs = new Timestamp(
        momentdateObject.seconds,
        momentdateObject.nanoseconds,
      );
      const momentDate = momentTs.toDate();
      const momentYear = momentDate.getFullYear().toString();
      const momentMonth = momentDate.getMonth() + 1;
      const momentYearMonth =
        momentYear + "-" + (momentMonth < 10 ? "0" : "") + momentMonth;

      aggregateYearlyRawDocRef = userDocRef
        .collection("aggregateYearly")
        .doc(`${momentYear}-raw`);
      aggregateMonthlyRawDocRef = userDocRef
        .collection("aggregateMonthly")
        .doc(`${momentYearMonth}-raw`);
      aggregateYearlyDocRef = userDocRef
        .collection("aggregateYearly")
        .doc(momentYear);
      aggregateMonthlyDocRef = userDocRef
        .collection("aggregateMonthly")
        .doc(momentYearMonth);
      await Promise.all([
        initAggregateDoc(aggregateYearlyRawDocRef, true),
        initAggregateDoc(aggregateMonthlyRawDocRef, true),
        initAggregateDoc(aggregateYearlyDocRef),
        initAggregateDoc(aggregateMonthlyDocRef),
      ]);
    } else {
      console.error("Invalid momentdate provided in the headers.");
      lockedMomentIds.delete(req.query.momentId);
      return res
        .status(400)
        .send(
          "Invalid momentdate provided for query" + JSON.stringify(req.query),
        );
    }

    const momentDocRef = userDocRef
      .collection("moments")
      .doc(req.query.momentId);

    //batch persist llm data in firestore
    try {
      await db.runTransaction(async (t) => {
        const aggregateYearlyRawDoc = await t.get(aggregateYearlyRawDocRef);
        const aggregateMonthlyRawDoc = await t.get(aggregateMonthlyRawDocRef);

        const newYearlyRawData = generateNewRawData(
          req.query.momentText,
          aggregateYearlyRawDoc,
          momentImportancesResp,
        );
        const newMonthlyRawData = generateNewRawData(
          req.query.momentText,
          aggregateMonthlyRawDoc,
          momentImportancesResp,
        );

        const newYearlyData = {
          lastUpdate: FieldValue.serverTimestamp(),
          unsatisfaction: generateNewDisplayArray(
            newYearlyRawData,
            "unsatisfaction",
            "unsatisfactionImpactLabelValue",
          ),
          satisfaction: generateNewDisplayArray(
            newYearlyRawData,
            "satisfaction",
            "satisfactionImpactLabelValue",
          ),
          importance: generateNewDisplayArray(
            newYearlyRawData,
            "none",
            "importanceValue",
          ),
        };

        const newMonthlyData = {
          lastUpdate: FieldValue.serverTimestamp(),
          unsatisfaction: generateNewDisplayArray(
            newMonthlyRawData,
            "unsatisfaction",
            "unsatisfactionImpactLabelValue",
          ),
          satisfaction: generateNewDisplayArray(
            newMonthlyRawData,
            "satisfaction",
            "satisfactionImpactLabelValue",
          ),
          importance: generateNewDisplayArray(
            newMonthlyRawData,
            "none",
            "importanceValue",
          ),
        };

        console.log(
          "In transaction before update, newYearlyData",
          newYearlyData,
        );
        //update aggregate docs
        t.update(aggregateYearlyRawDocRef, newYearlyRawData);
        t.update(aggregateMonthlyRawDocRef, newMonthlyRawData);
        t.update(aggregateYearlyDocRef, newYearlyData);
        t.update(aggregateMonthlyDocRef, newMonthlyData);

        t.update(momentDocRef, { needsImportances: momentImportancesResp });
        t.update(db.collection("users").doc(req.uid), { hasNeeds: true });
        //TODO:2 for more safety of the data we could check if the moment needsImportances were already set in the last minute and if so cancel the whole batch, so as not to corrupt aggregates by having a nMoments no longer matching the number of moments in the collection
      });

      console.log(
        "Transaction success for ",
        req.query,
        "docs updated: ",
        //keep only the last two part of the path
        aggregateYearlyDocRef.path.split("/").slice(-2).join("/"),
        aggregateMonthlyDocRef.path.split("/").slice(-2).join("/"),
      );
    } catch (e) {
      console.log(
        "Transaction failure, ",
        req.query,
        "NOT enriched by needs rating and aggregate docs NOT updated: ",
        e,
      );
      lockedMomentIds.delete(req.query.momentId);
      return res
        .status(500)
        .send(
          "Internal server error when updating moment needs or aggregate data for query" +
            JSON.stringify(req.query),
        );
    }

    lockedMomentIds.delete(req.query.momentId);
    return res
      .status(200)
      .send(
        "Llm response received and processed for query" +
          JSON.stringify(req.query),
      );
    // return res.json(parsedContent);
  } catch (err) {
    console.error(err);
    lockedMomentIds.delete(req.query.momentId);
    return res
      .status(500)
      .send(
        "An error occurred while making or saving the prediction for query" +
          JSON.stringify(req.query),
      );
  }
});

//route to test performance
// router.get("/dummy", async (req, res) => {
//   try {
//     return res.json("Dummy response");
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(500)
//       .send("An error occurred while making the prediction");
//   }
// });

module.exports = router;
