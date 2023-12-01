// EXTERNAL DEPENDENCIES
var express = require("express");
const {
  authenticateUser,
} = require("../middlewares/authenticateUserMiddleware");
const {
  validateDeleteMomentRequest,
  unlockMomentId,
} = require("../middlewares/validateRequestMiddleware");
const {
  updateAggDataAfterMomDelete,
} = require("../utils/deleteMomentSuccessPathUtils");
// } = require("../utils/persistNeedsDataSuccessPathUtils");
const { db } = require("../utils/servicesConfig");

// ROUTER SETUP
var router = express.Router();

// USER AUTHENTICATION
router.use(authenticateUser); // Use the middleware for all routes in this router

// ROUTE
router.post(
  "/delete-moment/",
  validateDeleteMomentRequest,
  async (req, res) => {
    try {
      // console.log("req.headers", req.headers);
      console.log("deleteMoment>  POST request received, req.body:", req.body);

      // DEFINE DOC REFS
      const userDocRef = db.collection("users").doc(req.uid);
      // console.log("deleteMoment> userDocRef:", userDocRef);

      // SUCCESS PATH: RECALCULATE AGGREGATE DOCS
      await updateAggDataAfterMomDelete(db, req, userDocRef);

      unlockMomentId(req.body.momentId, true /*isDeleteMoment*/);
      return res.status(200).json({
        message: "Agg Data updated following deletion of mom",
        moment: req.body.momentArchive,
        momentId: req.body.momentId,
      });
    } catch (err) {
      console.error(err);
      unlockMomentId(req.body.momentId, true /*isDeleteMoment*/);
      return res.status(500).json({
        message:
          "An error occurred while updating agg data following deletion of mom",
        moment: req.body.momentArchive,
        momentId: req.body.momentId,
      });
    }
  },
);

module.exports = router;
