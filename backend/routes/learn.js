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
const e = require("express");
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
  importanceSum: 0,
  satisfactionSum: 0,
  occurrenceCount: 0,
};

const needsMap = needsList.reduce((acc, need) => {
  acc[need] = { ...needsInitValues };
  return acc;
}, {});

const getAggregateDocRef = async (uid, collectionName, docName) => {
  const aggregateDocRef = db
    .collection("users")
    .doc(uid)
    .collection(collectionName)
    .doc(docName);
  const aggregateDoc = await aggregateDocRef.get();
  if (!aggregateDoc.exists) {
    await aggregateDocRef.set({
      nMoments: 0,
      needs: needsMap, // needs: {need1: { importanceSum: 0, satisfactionSum: 0, occurrenceCount: 0 }, need2: { importanceSum: 0, satisfactionSum: 0, occurrenceCount: 0 }, ...}
      totalNeedsImportanceSum: 0,
      lastUpdate: FieldValue.serverTimestamp(),
    });
    console.log(collectionName, " > ", docName, " doc created");
  }
  return aggregateDocRef;
};

//TODO: 2 aggregate overall needs satisfaction in case we need it in the future
function generateAggregateUpdateData(
  momentImportancesResp,
  momentImportancesTotal,
) {
  const baseData = {
    nMoments: FieldValue.increment(1),
    totalNeedsImportanceSum: FieldValue.increment(momentImportancesTotal),
    lastUpdate: FieldValue.serverTimestamp(),
  };
  for (let need in momentImportancesResp) {
    baseData[`needs.${need}.importanceSum`] = FieldValue.increment(
      momentImportancesResp[need],
    );
    baseData[`needs.${need}.satisfactionSum`] = FieldValue.increment(0); //TODO:0 get satisfacton
    baseData[`needs.${need}.occurrenceCount`] = FieldValue.increment(1);
  }
  return baseData;
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
    res.status(403).send("Unauthorized: Invalid ID token.");
  }
};

router.use(authenticate); // Use the middleware for all routes in this router

router.get("/needs/", async (req, res) => {
  try {
    // console.log("req.headers", req.headers);
    console.log("GET request received", req.query); //returns { moment:'Feeling sad to be working so much' }

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
    let issueType = "";
    // Check if all values are zero or if the sum is less than a threshold (0.1 in this case)
    if (Object.keys(parsedContent).length === 0) {
      issueType = "parsedContentEmpty";
    } else {
      const sumOfAllValues = Object.values(parsedContent).reduce(
        (a, b) => a + b,
        0,
      );
      if (sumOfAllValues < 0.1) {
        issueType = "sumOfAllValuesLow";
      } else if (!Object.values(parsedContent).some((value) => value > 0.1)) {
        issueType = "noValuesMoreThanThreshold";
      }
    }

    if (issueType) {
      console.log(
        (issueType = "parsedContentEmpty"
          ? "Error: All values in parsedContent are zero, moment & parsedContent"
          : (issueType = "sumOfAllValuesLow"
              ? "Error: The sum of all values in parsedContent is less than 0.1, moment & parsedContent"
              : (issueType = "noValuesMoreThanThreshold"
                  ? "Error: No values in parsedContent are more than 0.1, moment & parsedContent"
                  : "Error: issueType not recognized"))),
        req.query,
        parsedContent,
      );
      console.log(
        "response.data.choices[0].message",
        response.data.choices[0].message,
      );

      // append the returned assistant response and the user's response to request_options.messages and call openai.createChatCompletion again
      request_options.messages.push(
        response.data.choices[0].message, // This adds the last response from the assistant
        {
          role: "user",
          content: (issueType = "parsedContentEmpty"
            ? "Why did you return an empty result? All moments do hint at some needs. Please provide a revised answer. Don’t justify it, just return the expected JSON result."
            : (issueType = "sumOfAllValuesLow"
                ? "Why are all need importance values zero? All moments do hint at some needs. Please provide a revised answer. Don’t justify it, just return the expected JSON result."
                : (issueType = "noValuesMoreThanThreshold"
                    ? "Why are all need importance values so low? Please provide a revised answer. Don’t justify it, just return the expected JSON result."
                    : "Error: issueType not recognized"))),
        },
      );
      const replyResponse = await openai.createChatCompletion(request_options);
      // Update the 'parsedContent' from the new response
      parsedContent = JSON.parse(replyResponse.data.choices[0].message.content);
      console.log(
        "HERE req.query",
        req.query,
        "HERE parsedContent after reply",
        parsedContent,
      );
      if (!parsedContent || parsedContent.error) {
        console.log(
          "Error in reply: parsedContent empty or erroneous, for mom",
          req.query,
          "here are response.data.choices[0].message: ",
          response.data.choices[0].message,
        );
      }
    }

    const momentImportancesResp = parsedContent;

    let momentImportancesTotal = 0;
    for (let need in momentImportancesResp) {
      //if need is not in needsList, add it to offlistNeeds collection
      if (needsList.includes(need)) {
        momentImportancesTotal += momentImportancesResp[need];
      } else {
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
        });
      }
    }

    // ENRICH MOMENT DOC & UPDATE AGGREGATE DOCS
    //get all time, yearly and monthly aggregate docs
    let aggregateAllTimeDocRef, aggregateYearlyDocRef, aggregateMonthlyDocRef;
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

      aggregateAllTimeDocRef = await getAggregateDocRef(
        req.uid,
        "aggregateAllTime",
        "all_time",
      );
      aggregateYearlyDocRef = await getAggregateDocRef(
        req.uid,
        "aggregateYearly",
        momentYear,
      );
      aggregateMonthlyDocRef = await getAggregateDocRef(
        req.uid,
        "aggregateMonthly",
        momentYearMonth,
      );
    } else {
      console.error("Invalid momentdate provided in the headers.");
      return res.status(400).send("Invalid momentdate provided.");
    }

    const momentDocRef = db
      .collection("users")
      .doc(req.uid)
      .collection("moments")
      .doc(req.query.momentId);
    const aggregateUpdateData = generateAggregateUpdateData(
      momentImportancesResp,
      momentImportancesTotal,
    );

    //batch persist llm data in firestore
    try {
      // Get a new write batch
      const batch = db.batch();
      //update aggregate docs
      batch.update(aggregateAllTimeDocRef, aggregateUpdateData);
      batch.update(aggregateYearlyDocRef, aggregateUpdateData);
      batch.update(aggregateMonthlyDocRef, aggregateUpdateData);
      //enrich moment doc
      batch.update(momentDocRef, { needsImportances: momentImportancesResp });
      // Commit the batch
      await batch.commit();

      console.log(
        "Batch write success, ",
        req.query,
        " enriched by needs rating and aggregate docs all time and",
        //keep only the last two part of the path
        aggregateYearlyDocRef.path.split("/").slice(-2).join("/"),
        aggregateMonthlyDocRef.path.split("/").slice(-2).join("/"),
        "updated",
      );
    } catch (err) {
      console.log(
        "Batch write failure, ",
        req.query,
        "NOT enriched by needs rating and aggregate docs NOT updated: ",
        err,
      );
      return res
        .status(500)
        .send(
          "Internal server error when updating moment needs or aggregate data",
        );
    }

    res.json(parsedContent);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send("An error occurred while making or saving the prediction");
  }
});

//route to test performance
router.get("/dummy", async (req, res) => {
  try {
    res.json("Dummy response");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while making the prediction");
  }
});

module.exports = router;
