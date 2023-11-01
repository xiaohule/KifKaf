// EXTERNAL DEPENDENCIES
var express = require("express");
require("dotenv").config();
var admin = require("firebase-admin");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const OpenAI = require("openai");
const {
  authenticateUser,
} = require("../middlewares/authenticateUserMiddleware");
const {
  validateRequest,
  unlockMomentId,
} = require("../middlewares/validateRequestMiddleware");
const {
  needsList,
  createOpenaiRequestOptions,
  parseMomentNeedsData,
  isValidMomentNeedsData,
  needRatingsIssueType,
  updateOpenaiRequestOptions,
} = require("../utils/openaiPromptsUtils");
const {
  persistInvalidMomentNeedsData,
  persistUnexpectedNeedsIfAny,
} = require("../utils/persistNeedsDataErrorPathUtils");
const {
  persistNeedsData,
} = require("../utils/persistNeedsDataSuccessPathUtils");

// FIREBASE SETUP
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY),
  ),
});
const db = getFirestore();

// OPENAI SETUP
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // maxRetries: 0, // default is 2
  // timeout: 20 * 1000, // 20 seconds (default is 10 minutes, requests which time out will be retried twice by default.)
});
const gptModel = "gpt-3.5-turbo"; //gpt-3.5-turbo or gpt-4

// ROUTER SETUP
var router = express.Router();

// USER AUTHENTICATION
router.use(authenticateUser); // Use the middleware for all routes in this router

// ROUTE
router.get("/needs/", validateRequest, async (req, res) => {
  //TODO:1 make this a post request? pro and cons of post vs get?
  try {
    // console.log("req.headers", req.headers);
    // console.log("GET request received", req.query); //returns { momentText: 'Feeling stressed of not knowing what I'm gonna do today', momentDate: '{"seconds":1682726400,"nanoseconds":0}', momentId: 'BZIk715iILySrIPz7IyY'}

    // DEFINE DOC REFS
    const userDocRef = db.collection("users").doc(req.uid);
    const momentDocRef = userDocRef
      .collection("moments")
      .doc(req.query.momentId);

    // 1ST CALL TO LLM
    let openaiRequestOptions = createOpenaiRequestOptions(
      gptModel,
      req.query.momentText,
    );
    let openaiResponseMessage = (
      await openai.chat.completions.create(openaiRequestOptions)
    ).choices[0].message;
    let momentNeedsData = parseMomentNeedsData(openaiResponseMessage.content);

    console.log(
      "LLM response received and parsed for",
      req.query,
      ", momentNeedsData=",
      momentNeedsData,
    );
    // returns {'Emotional Safety & Inner Peace': [ 0.3, 0.8 ],'Self-Esteem & Social Recognition': [ 0.4, 0.7 ]} or {} if error or llm didn't understand the moment

    // 1ST VALIDATION OF LLM RESPONSE: IF INVALID LLM REPLY PERSIST & QUIT
    // Error handling logic for invalid moments: if unable to return needs rating, save the moment in invalidMoments collection, save reason in moment data and return
    // TODO:3 find a way to handle Oops to put it in needsSatisAndImp so that doesn't trigger moments store retry
    if (!isValidMomentNeedsData(momentNeedsData)) {
      await persistInvalidMomentNeedsData(
        db,
        req,
        momentDocRef,
        momentNeedsData,
      );

      throw new Error(
        "momentNeedsData empty or erroneous, for mom " +
          JSON.stringify(req.query) +
          " here is momentNeedsData: " +
          JSON.stringify(momentNeedsData),
        // " and here is the full response: " +
        // JSON.stringify(response),
      );
    }

    // 2ND VALIDATION OF LLM RESPONSE: IF INVALID NEEDS RATINGS RETRY & REDO 1ST VALIDATION
    //if able to return needs rating, but erroneous ones, retry
    const issueType = needRatingsIssueType(momentNeedsData);
    if (issueType) {
      console.log("Error:", issueType, "for", req.query, momentNeedsData);

      openaiRequestOptions = updateOpenaiRequestOptions(
        gptModel,
        openaiRequestOptions,
        openaiResponseMessage,
        issueType,
      );
      openaiResponseMessage = (
        await openai.chat.completions.create(openaiRequestOptions)
      ).choices[0].message;
      momentNeedsData = parseMomentNeedsData(openaiResponseMessage.content);

      console.log(
        "Retried for ",
        req.query,
        "bec. it had Error ",
        issueType,
        ", new momentNeedsData after reply: ",
        momentNeedsData,
      );

      if (!isValidMomentNeedsData(momentNeedsData)) {
        await persistInvalidMomentNeedsData(
          db,
          req,
          momentDocRef,
          momentNeedsData,
        );

        throw new Error(
          "Error in retry: momentNeedsData empty or erroneous, for mom " +
            JSON.stringify(req.query) +
            " here is openaiResponseMessage: " +
            JSON.stringify(openaiResponseMessage),
          // " and here is the full response: " +
          // JSON.stringify(response),
        );
      }
    }

    //3RD VALIDATION OF LLM RESPONSE: IF CONTAINS UNEXPECTED NEED(S) SAVE THOSE & CONTINUE
    await persistUnexpectedNeedsIfAny(db, req, momentNeedsData);

    // SUCCESS: ADD NEEDS TO MOM DOC & UPDATE AGGREGATE DOCS
    try {
      await persistNeedsData(
        db,
        req,
        userDocRef,
        momentDocRef,
        momentNeedsData,
      );
    } catch (e) {
      console.log(
        "Transaction failure, ",
        req.query,
        "NOT enriched by needs rating and aggregate docs NOT updated: ",
        e,
      );
      unlockMomentId(req.query.momentId);
      return res.status(500).json({
        message:
          "Internal server error when updating moment needs or aggregate data for query",
        query: req.query,
      });
    }

    unlockMomentId(req.query.momentId);
    return res.status(200).json({
      message: "Llm response received and processed for query",
      query: req.query,
    });
  } catch (err) {
    console.error(err);
    unlockMomentId(req.query.momentId);
    return res.status(500).json({
      message:
        "An error occurred while making or saving the prediction for query",
      query: req.query,
    });
  }
});

module.exports = router;

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
