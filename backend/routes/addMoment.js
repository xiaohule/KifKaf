// EXTERNAL DEPENDENCIES
var express = require("express");
const {
  authenticateUser,
} = require("../middlewares/authenticateUserMiddleware");
const {
  validateAddMomentRequest,
  unlockId,
} = require("../middlewares/validateRequestMiddleware");
const {
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
const axios = require("axios");
const { db, openai } = require("../utils/servicesConfig");

const promptVersion = "gpt4_7_2_1";
axios.defaults.baseURL = process.env.API_URL;

// ROUTER SETUP
var router = express.Router();

// USER AUTHENTICATION
router.use(authenticateUser); // Use the middleware for all routes in this router

// ROUTE
router.post("/add-moment/", validateAddMomentRequest, async (req, res) => {
  try {
    // console.log("req.headers", req.headers);
    console.log("In addMoment POST request received, req.body:", req.body); //returns { momentText: 'Feeling stressed of not knowing what I'm gonna do today', momentDate: '{"seconds":1682726400,"nanoseconds":0}', momentId: 'BZIk715iILySrIPz7IyY'}

    // DEFINE DOC REFS
    const userDocRef = db.collection("users").doc(req.uid);
    const momentDocRef = userDocRef
      .collection("moments")
      .doc(req.body.momentId);

    // 1ST CALL TO LLM
    let openaiRequestOptions = createOpenaiRequestOptions(
      promptVersion,
      req.body.momentText,
    );
    const response = await openai.chat.completions.create(openaiRequestOptions);
    let openaiResponseMessage = response.choices[0].message;
    let momentNeedsData = parseMomentNeedsData(openaiResponseMessage.content);

    console.log(
      "In addMoment > LLM response received for",
      req.body,
      // "XXX response=",
      // response,
      // "openaiResponseMessage.content=",
      // openaiResponseMessage.content,
      "momentNeedsData=",
      momentNeedsData,
    );

    // returns {'Emotional Safety & Inner Peace': [ 0.3, 0.8 ],'Self-Esteem & Social Recognition': [ 0.4, 0.7 ]} or {} if error or llm didn't understand the moment

    // 1ST VALIDATION OF LLM RESPONSE: IF INVALID LLM REPLY PERSIST & QUIT
    // Error handling logic for invalid moments: if unable to return needs rating, save the moment in invalidMoments collection, save reason in moment data and return
    // TODO:3 find a way to handle Oops to put it in needs so that doesn't trigger moments store retry
    if (!isValidMomentNeedsData(momentNeedsData)) {
      await persistInvalidMomentNeedsData(
        db,
        req,
        momentDocRef,
        momentNeedsData,
      );

      throw new Error(
        "In addMoment > momentNeedsData empty or erroneous, for mom " +
          JSON.stringify(req.body) +
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
      console.log("Error:", issueType, "for", req.body, momentNeedsData);

      openaiRequestOptions = updateOpenaiRequestOptions(
        promptVersion,
        openaiRequestOptions,
        openaiResponseMessage,
        issueType,
      );
      openaiResponseMessage = (
        await openai.chat.completions.create(openaiRequestOptions)
      ).choices[0].message;
      momentNeedsData = parseMomentNeedsData(openaiResponseMessage.content);

      console.log(
        "In addMoment > retried for ",
        req.body,
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
          "In addMoment > Error in retry: momentNeedsData empty or erroneous, for mom " +
            JSON.stringify(req.body) +
            " here is openaiResponseMessage: " +
            JSON.stringify(openaiResponseMessage),
          // " and here is the full response: " +
          // JSON.stringify(response),
        );
      }
    }

    //3RD VALIDATION OF LLM RESPONSE: IF CONTAINS UNEXPECTED NEED(S) SAVE THOSE & CONTINUE
    await persistUnexpectedNeedsIfAny(db, req, momentNeedsData);

    // SUCCESS PATH: ADD NEEDS TO MOM DOC & UPDATE AGGREGATE DOCS
    try {
      await persistNeedsData(
        db,
        req,
        userDocRef,
        momentDocRef,
        momentNeedsData,
      );
    } catch (error) {
      console.error(error);
      unlockId(req.body.momentId);
      return res.status(409).json({
        message:
          "In addMoment > persistNeedsDataSuccessPathUtils aborting persistNeedsData bec. either momentDoc doesn't exist or momentDoc.data().needs already filled",
        moment: req.body.momentText,
        momentId: req.body.momentId,
        error: error,
      });
    }

    // SEND SUCCESS RESPONSE IMMEDIATELY
    unlockId(req.body.momentId);
    res.status(200).json({
      message: "In addMoment > Successful update of moment needs and aggData",
      moment: req.body.momentText,
      momentId: req.body.momentId,
    });

    // TRIGGER COMPUTE INSIGHTS IF NEEDED
    // console.log("process.env.API_URL", process.env.API_URL);
    await axios.post(
      `/api/learn/compute-insights/`,
      {
        threshold: 3,
        origin: "addMoment",
      },
      {
        headers: {
          authorization: req.headers.authorization,
        },
      },
    );
  } catch (error) {
    // If an error occurs before the success response is sent, send a failure response
    console.error(error);
    unlockId(req.body.momentId);
    return res.status(500).json({
      message:
        "In addMoment > An error occurred while updating moment needs or aggData or computing insights",
      moment: req.body.momentText,
      momentId: req.body.momentId,
      error: error,
    });
  }
});

module.exports = router;
