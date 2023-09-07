var express = require("express");
var admin = require("firebase-admin");
var serviceAccount = require("./../serviceAccountKey.json");
const {
  getFirestore,
  Timestamp,
  FieldValue,
  // Filter,
} = require("firebase-admin/firestore");
const OpenAI = require("openai");
require("dotenv").config();

var router = express.Router();

//TODO:2 unify and clean error handling

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = getFirestore();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const needsList = [
  "Physical Well-Being",
  "Sustenance & Nourishment",
  "Shelter",
  "Financial Security",
  "Rest & Relaxation",
  "Physical Movement",
  "Physical Contact & Intimacy",
  "Contact with Nature",
  "Social Connection",
  "Belongingness & Community",
  "Support, Understanding & Validation",
  "Affection & Love",
  "Emotional Safety & Inner Peace",
  "Boundaries & Privacy",
  "Autonomy",
  "Self-Esteem & Social Recognition",
  "Competence & Effectiveness",
  "Outward Care & Contribution",
  "Self-Expression & Creativity",
  "Exploration, Novelty & Inspiration",
  "Learning",
  "Self-Actualization",
  "Challenge",
  "Play, Humor & Entertainment",
  "Fairness & Justice",
  "Order & Structure",
  "Meaning & Purpose",
  "Gratitude & Celebration",
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

function generateNewRawData(mom, doc, momentNeedsResp) {
  //variables are prefixed by "moment" when related to the processed moment, "" when related to a need and "total"/"max" when aggregated over all needs
  const momentImportancesSum = Object.values(momentNeedsResp).reduce(
    (acc, currentValue) => acc + currentValue[1],
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
  // console.log("baseData", baseData);

  //1st loop only on mom's needs to update value that relies only on the moment data
  for (let need in doc.data().needs) {
    //if need in momentNeedsResp with non-zero importance
    if (momentNeedsResp[need] && momentNeedsResp[need][1]) {
      const occurrenceCount = doc.data().needs[need].occurrenceCount + 1;
      baseData[`needs.${need}.occurrenceCount`] = occurrenceCount;

      baseData[`needs.${need}.importancesSum`] =
        doc.data().needs[need].importancesSum + momentNeedsResp[need][1];

      const satisfactionSum =
        doc.data().needs[need].satisfactionSum + momentNeedsResp[need][0];
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
  //   "for momentNeedsResp: ",
  //   momentNeedsResp,
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

//             importancesSum: FieldValue.increment(momentNeedsResp[need][1]),
//             satisfactionSum: FieldValue.increment(momentNeedsResp[need][0]),

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

function generateNewDisplayArray( //TODO:2 we could remove all data that won't be used in the frontend to reduce the size of the response
  newRawData,
  filterBy = "none",
  sortBy = "none",
) {
  try {
    // if (filterBy === "satisfaction") {
    //   console.log(
    //     "In generateNewDisplayData with filterBy:",
    //     filterBy,
    //     "sortBy:",
    //     sortBy,
    //     "newRawData:",
    //     newRawData,
    //   );
    // }
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
    // if (filterBy === "satisfaction") {
    //   console.log(
    //     "In generateNewDisplayArray with filterBy:",
    //     filterBy,
    //     "sortBy:",
    //     sortBy,
    //     "returning needsDataArray after arrayization:",
    //     needsDataArray,
    //   );
    // }

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
    // if (filterBy === "satisfaction") {
    //   console.log(
    //     "In generateNewDisplayArray with filterBy:",
    //     filterBy,
    //     "sortBy:",
    //     sortBy,
    //     "returning needsDataArray after filter sorting:",
    //     needsDataArray,
    //   );
    // }

    return needsDataArray;
  } catch (error) {
    console.error("Error in generateNewDisplayArray:", error);
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
          "**Context**:\nWe are collaborating to understand the satisfaction and importance levels of various human needs from described experiences. You specialize in human needs psychology.\n\n**Instructions**:\nFollow these steps when responding to user inputs:\n\nStep 1 - User provides an experience.\n\nStep 2 - For each need of the list of Universal Human Needs (see below), assess whether the experience indicates the satisfaction or lack thereof for that need or suggests that the user attaches importance to this need.\nEnclose all your work for this step within triple quotes (\"\"\").\n\nNote for Step 2:\nIf you don't understand the user's experience reply with \"\"\"Oops: I'm sorry, but I was unable to analyze your needs for this experience because [Reason]. Could you please retry with [Advice]\"\"\" and ignore following steps.\n\nStep 3 - From the needs identified in Step 2, select a maximum of 5 that correlate most with the experience. Fewer is fine, but no more than 5.\nEnclose all your work for this step within triple quotes (\"\"\").\n\nStep 4 - For each need selected at step 3, rate on a scale from [0.0,1.0]:\n\n- Its level of satisfaction for the user. 0.0 means that this need was fully unsatisfied and 1.0 means fully satisfied. Choose 0.5 if the satisfaction level appears neutral or uncertain.\n- The importance the user is likely attaching to this need. 0.0 means the experience suggests that this need isn't important at all for the user currently and 1.0 means highly important. Choose 0.5 for moderate importance.\n\nReturn your result in the following JSON Format. Only include needs with non-zero importance. Avoid explanations, just return the expected JSON result.\n```\n{\"need_name\": [satisfaction_value, importance_value], ...}\n```\n\nInsights for Step 4:\n\n- A strong sense of a need being met or unmet is a clear cue of its high importance to the user.\n- Even with no clear information on a need satisfaction, one can sometimes still infer that it has importance. e.g., for 'Felt so bad when running after eating spinach' we have no information on whether the need for 'Physical Movement' was met during this unfortunate experience but we can infer that it is somehow important for the user, otherwise he wouldn't go for a run anyway.\n- An experience might hint at a need's importance even if the need is not explicitly mentioned.\n- Over-satisfaction of a need might hint at the unsatisfaction of another need.\n  e.g., For 'Feeling overwhelmed from too much social interaction', the 'Social Connection' need may be over-satisfied and of lesser importance currently for the user, but the 'Boundaries & Privacy' need might be unsatisfied and of higher importance.\n\n**Universal Human Needs**:\n```['Physical Well-Being',\n  'Sustenance & Nourishment',\n  'Shelter',\n  'Financial Security',\n  'Rest & Relaxation',\n  'Physical Movement',\n  'Physical Contact & Intimacy',\n  'Contact with Nature',\n  'Social Connection',\n  'Belongingness & Community',\n  'Support, Understanding & Validation',\n  'Affection & Love',\n  'Emotional Safety & Inner Peace',\n  'Boundaries & Privacy',\n  'Autonomy',\n  'Self-Esteem & Social Recognition',\n  'Competence & Effectiveness',\n  'Outward Care & Contribution',\n  'Self-Expression & Creativity',\n  'Exploration, Novelty & Inspiration',\n  'Learning',\n  'Self-Actualization',\n  'Challenge',\n  'Play, Humor & Entertainment',\n  'Fairness & Justice',\n  'Order & Structure',\n  'Meaning & Purpose',\n  'Gratitude & Celebration',\n  'Spiritual Transcendence']```",
      },
      {
        role: "user",
        content:
          "Feeling like I am wasting my time at the playfight workshop because I'm not learning anything.",
      },
      {
        role: "assistant",
        content:
          "Step 2:\n\"\"\"\n'Physical Well-Being' - Not related.\n...\n'Physical Movement' - Implied by \"playfight workshop\", but the experience does not specify whether this need is satisfied or not.\n'Physical Contact & Intimacy' - Implied by \"playfight workshop\", but the experience does not specify whether this need is satisfied or not.\n...\n'Social Connection': Not directly related but may be implied by attending a workshop.\n...\n'Emotional Safety & Inner Peace' - You might be feeling emotionally unsettled because you are not gaining value.\n...\n'Autonomy' - You might feel a lack of autonomy over your learning process.\n'Self-Esteem & Social Recognition' - Not directly related, but the feeling of time-wasting might affect your self-esteem.\n'Competence & Effectiveness' - You might feel a lack of effectiveness due to the lack of learning.\n...\n'Exploration, Novelty & Inspiration' - You might have sought the workshop for novelty or exploration, which isn't being satisfied.\n'Learning' - Directly mentioned, you are not feeling that you are learning.\n'Self-Actualization' - The experience might touch upon a desire for personal growth.\n'Challenge' - The lack of learning might imply that the challenge isn't adequate.\n...\n'Play, Humor & Entertainment' - The term \"playfight\" might indicate some aspect of play, but it's not clear if it's being satisfied.\n...\n'Meaning & Purpose' - You might be questioning the purpose of the workshop.\n...\n\"\"\"\nStep 3:\n\"\"\"\n'Learning','Competence & Effectiveness','Exploration, Novelty & Inspiration','Challenge'\n\"\"\"\nStep 4:\n{\n\"Learning\": [0.0, 1.0],\n\"Competence & Effectiveness\": [0.0, 0.9],\n\"Exploration, Novelty & Inspiration\": [0.0, 0.8],\n\"Challenge\": [0.0, 0.7]\n}",
      },
      {
        role: "user",
        content:
          "Je me sens bien d'aller voir les copains pour dîner avec eux mais un petit peu agitée tout de même parce que j'ai beaucoup bossé je sens que mon besoin de récompense est élevé",
      },
      {
        role: "assistant",
        content:
          "Step 2:\n\"\"\"\n'Physical Well-Being' - Not directly related.\n...\n'Sustenance & Nourishment' - Related due to mention of \"dîner\".\n...\n'Rest & Relaxation' - Implied, given that you mentioned feeling \"agitée\" after working a lot.\n...\n'Social Connection' - Directly mentioned, as you are going to see friends for dinner.\n'Belongingness & Community' - Related due to the mention of \"copains\".\n...\n'Emotional Safety & Inner Peace' - Feeling \"agitée\" indicates a potential lack of inner peace.\n...\n'Self-Esteem & Social Recognition' - Your need for reward might be connected to a desire for recognition.\n'Competence & Effectiveness' - Not directly related.\n...\n'Play, Humor & Entertainment' - The idea of seeing friends might touch upon the need for play and humor.\n...\n'Fairness & Justice' - Your need for reward might connect to a sense of fairness.\n...\n'Meaning & Purpose' - Not directly related but might be underlying the need for reward.\n...\n'Gratitude & Celebration' - The idea of going to dinner with friends could be a form of celebration.\n\"\"\"\nStep 3:\n\"\"\"\n'Rest & Relaxation', 'Social Connection', 'Emotional Safety & Inner Peace', 'Self-Esteem & Social Recognition', 'Fairness & Justice'\n\"\"\"\nStep 4:\n{\n\"Rest & Relaxation\": [0.5, 0.9],\n\"Social Connection\": [0.8, 1.0],\n\"Emotional Safety & Inner Peace\": [0.5, 0.9],\n\"Self-Esteem & Social Recognition\": [0.7, 0.9],\n\"Fairness & Justice\": [0.7, 0.8]\n}",
      },
      {
        role: "user",
        content: "Feeling",
      },
      {
        role: "assistant",
        content:
          'Step 2:\n"""\nOops: I\'m sorry, but I was unable to analyze your needs for this experience because your input seems to be incomplete. Could you please retry with more information?\n"""',
      },
      {
        role: "user",
        content: JSON.stringify(moment), // content: "Feeling aroused and capable when playfight jamming with penelope and new ppl",
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

const extractNeedsRating = (content) => {
  // Regex pattern to search for content between { and }, not enclosed in triple quotes
  const regexPattern = /(?<!""")\{[^}]*\}(?!""")/;
  // Extract the content matching the pattern
  const match = content.match(regexPattern);
  if (!match) return {};
  // Parse the matched content as JSON
  return JSON.parse(match[0]);
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

const lockedMomentIds = new Set(); //Since the code is running in a stateful server environment, lockedMomentIds is effective. However, be aware that in environments where multiple server instances are running (like in a clustered environment), this approach won't work since lockedMomentIds will only exist in memory for the specific server instance handling the request. In such cases, distributed lock manager like Redis or saving in firestore could be used.
//TODO:2 lockedMomentIds can potentially grow indefinitely. Consider implementing a mechanism to purge old IDs after a certain time or after they're no longer relevant. Also consider monitoring it.

router.get("/needs/", async (req, res) => {
  //TODO:1 make this a post request? pro and cons of post vs get?
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
    // console.log("GET request received", req.query); //returns { momentText: 'Feeling stressed of not knowing what I'm gonna do today', momentDate: '{"seconds":1682726400,"nanoseconds":0}', momentId: 'BZIk715iILySrIPz7IyY'}

    //TODO:2 Make sure you validate the data coming from the client before processing. For instance, before calling the OpenAI API, validate req.query.momentText to ensure it's in the expected format.

    // LLM CALL
    const request_options = createOpenAIRequestOptions(req.query.momentText);
    // console.log("request_options", request_options);
    const response = await openai.chat.completions.create(request_options);
    // console.log(
    //   "LLM response received for",
    //   req.query,
    //   "response", //.choices[0].message
    //   response,
    // );

    // Parse the response content to a JavaScript object
    let momentNeedsResp = extractNeedsRating(
      response.choices[0].message.content,
    );
    console.log(
      "LLM response received and parsed for",
      req.query,
      ", momentNeedsResp=",
      momentNeedsResp,
    );
    // returns {'Emotional Safety & Inner Peace': [ 0.3, 0.8 ],'Self-Esteem & Social Recognition': [ 0.4, 0.7 ]} or {} if error or llm didn't understand the moment

    // TODO:4 find a way to handle Oops to put it in needsSatisAndImp so that doesn't trigger moments store retry
    const userDocRef = db.collection("users").doc(req.uid);
    const momentDocRef = userDocRef
      .collection("invalidMoments")
      .doc(req.query.momentId);

    if (
      !momentNeedsResp ||
      momentNeedsResp.error ||
      Object.keys(momentNeedsResp).length == 0 ||
      Object.values(momentNeedsResp).some((value) => value[1] === 0)
    ) {
      const invalidMomentsRef = db
        .collection("moments")
        .doc(req.query.momentId);

      const batch = db.batch();
      batch.set(invalidMomentsRef, {
        moment: req.query.momentText,
        reason: response.choices[0].message.content,
        user: req.uid,
        lastUpdate: FieldValue.serverTimestamp(),
      });
      batch.update(momentDocRef, { needsSatisAndImp: momentNeedsResp });
      await batch.commit();

      throw new Error(
        "momentNeedsResp empty or erroneous, for mom" +
          JSON.stringify(req.query) +
          "here are response.choices[0].message: " +
          JSON.stringify(response.choices[0].message),
      );
    }

    // PROCESS LLM RESPONSE, REPLYING IF NECESSARY
    const issueTypeConditions = {
      // momentNeedsRespEmpty: Object.keys(momentNeedsResp).length === 0,
      sumOfAllImportancesLow:
        Object.values(momentNeedsResp).reduce((a, b) => a[1] + b[1], 0) < 0.1,
      noImportancesMoreThanThreshold: !Object.values(momentNeedsResp).some(
        (value) => value[1] > 0.1,
      ),
      oneZeroImportance: Object.values(momentNeedsResp).some(
        (value) => value[1] === 0,
      ),
    };
    const issueType = Object.keys(issueTypeConditions).find(
      (type) => issueTypeConditions[type],
    );

    if (issueType) {
      console.log("Error:", issueType, "for", req.query, momentNeedsResp);

      const errorMessages = {
        // momentNeedsRespEmpty:
        //   "Why did you return an empty result? All moments do hint at some needs. Please provide a revised answer. Don't justify it, just return the expected JSON result.",
        sumOfAllImportancesLow:
          "Why are all need importance values zero? All moments do hint at some needs. Please provide a revised answer. Don't justify it, just return the expected JSON result.",
        noImportancesMoreThanThreshold:
          "Why are all need importance values so low? Please provide a revised answer. Don't justify it, just return the expected JSON result.",
      };

      // append the returned assistant response and the user's response to request_options.messages and call openai.createChatCompletion again
      request_options.messages.push(
        response.choices[0].message, // This adds the last response from the assistant
        {
          role: "user",
          content: errorMessages[issueType],
        },
      );
      const replyResponse =
        await openai.chat.completions.create(request_options);
      // Update the 'momentNeedsResp' from the new response
      momentNeedsResp = extractNeedsRating(
        replyResponse.choices[0].message.content,
      );
      console.log(
        "Retried for ",
        req.query,
        "bec. it had Error ",
        issueType,
        ", new momentNeedsResp after reply: ",
        momentNeedsResp,
      );
      if (
        !momentNeedsResp ||
        momentNeedsResp.error ||
        Object.keys(momentNeedsResp).length === 0 ||
        Object.values(momentNeedsResp).some((value) => value[1] === 0)
      ) {
        console.log(
          "Error in retry: momentNeedsResp empty or erroneous, for",
          req.query,
          "here is response.choices[0].message: ",
          response.choices[0].message,
        );
      }
    }

    for (let need in momentNeedsResp) {
      //if need is not in needsList, add it to offlistNeeds collection
      if (!needsList.includes(need)) {
        delete momentNeedsResp[need];
        console.log(need, " is not found in the needsList.");
        const offlisNeedsRef = db
          .collection("offlistNeeds")
          .doc(need)
          .collection("moments")
          .doc(req.query.momentId);
        await offlisNeedsRef.set({
          moment: req.query.momentText,
          needsSatisAndImp: momentNeedsResp,
          user: req.uid,
          lastUpdate: FieldValue.serverTimestamp(),
        });
      }
    }

    // ENRICH MOMENT DOC & UPDATE AGGREGATE DOCS
    //get yearly and monthly aggregate docs
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

    //batch persist llm data in firestore
    try {
      await db.runTransaction(async (t) => {
        const aggregateYearlyRawDoc = await t.get(aggregateYearlyRawDocRef);
        const aggregateMonthlyRawDoc = await t.get(aggregateMonthlyRawDocRef);

        const newYearlyRawData = generateNewRawData(
          req.query.momentText,
          aggregateYearlyRawDoc,
          momentNeedsResp,
        );
        const newMonthlyRawData = generateNewRawData(
          req.query.momentText,
          aggregateMonthlyRawDoc,
          momentNeedsResp,
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

        // console.log(
        //   "In transaction before update, newYearlyData",
        //   newYearlyData,
        // );
        //update aggregate docs
        t.update(aggregateYearlyRawDocRef, newYearlyRawData);
        t.update(aggregateMonthlyRawDocRef, newMonthlyRawData);
        t.update(aggregateYearlyDocRef, newYearlyData);
        t.update(aggregateMonthlyDocRef, newMonthlyData);

        t.update(momentDocRef, { needsSatisAndImp: momentNeedsResp });
        t.update(db.collection("users").doc(req.uid), { hasNeeds: true });
        //TODO:2 for more safety of the data we could check if the moment needsSatisAndImp were already set in the last minute and if so cancel the whole batch, so as not to corrupt aggregates by having a nMoments no longer matching the number of moments in the collection
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
