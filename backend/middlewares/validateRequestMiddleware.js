const lockedAddMomentIds = new Set(); //Since the code is running in a stateful server environment, lockedAddMomentIds is effective. However, be aware that in environments where multiple server instances are running (like in a clustered environment), this approach won't work since lockedAddMomentIds will only exist in memory for the specific server instance handling the request. In such cases, distributed lock manager like Redis or saving in firestore could be used.
//TODO:2 lockedAddMomentIds can potentially grow indefinitely. Consider implementing a mechanism to purge old IDs after a certain time or after they're no longer relevant. Also consider monitoring it.
const lockedDeleteMomentIds = new Set();
const lockedComputeInsightsUid = new Set();

function lockId(
  id,
  type = "addMoment" /*or "deleteMoment", "computeInsights"*/,
) {
  if (type === "computeInsights") {
    lockedComputeInsightsUid.add(id);
  } else if (type === "deleteMoment") {
    lockedDeleteMomentIds.add(id);
  } else {
    lockedAddMomentIds.add(id);
  }
}

function unlockId(id, type = "addMoment") {
  if (type === "computeInsights") {
    lockedComputeInsightsUid.delete(id);
  } else if (type === "deleteMoment") {
    lockedDeleteMomentIds.delete(id);
  } else {
    lockedAddMomentIds.delete(id);
  }
}

function isIdLocked(id, type = "addMoment") {
  if (type === "computeInsights") {
    return lockedComputeInsightsUid.has(id);
  } else if (type === "deleteMoment") {
    return lockedDeleteMomentIds.has(id);
  } else {
    return lockedAddMomentIds.has(id);
  }
}

function validateAddMomentRequest(req, res, next) {
  if (!req.body.momentText || typeof req.body.momentText !== "string") {
    return res.status(400).json({
      message: "Error: invalid momentText in body",
      body: req.body,
    });
  }

  //TODO:2 also check that momentId is a string of 20 chars
  const momentdateObject = JSON.parse(req.body.momentDate);
  if (!momentdateObject || !momentdateObject.seconds) {
    return res.status(400).json({
      message: "Error: Invalid momentDate in body",
      moment: req.body.momentText,
      momentId: req.body.momentId,
    });
  }

  if (isIdLocked(req.body.momentId)) {
    console.log(
      "Error: duplicate request detected for body",
      req.body,
      "lockedAddMomentIds:",
      lockedAddMomentIds,
    );
    return res.status(409).json({
      message: "Error: duplicate request detected for body",
      moment: req.body.momentText,
      momentId: req.body.momentId,
    });
  }

  lockId(req.body.momentId);

  next();
}

function validateDeleteMomentRequest(req, res, next) {
  if (!req.body.momentId) {
    return res.status(400).json({
      message: "Error: aborting delete-moment bec. no momentId in body",
    });
  }

  if (isIdLocked(req.body.momentId, "deleteMoment")) {
    console.log(
      "validateDeleteMomentRequest > Error: duplicate request detected for body",
      req.body,
      "lockedDeleteMomentIds:",
      lockedDeleteMomentIds,
    );
    return res.status(409).json({
      message: "Error: duplicate request detected for body",
      moment: req.body.momentArchive,
      momentId: req.body.momentId,
    });
  }

  lockId(req.body.momentId, "deleteMoment");

  next();
}

function validateComputeInsightsRequest(req, res, next) {
  next();
}

module.exports = {
  validateAddMomentRequest,
  validateDeleteMomentRequest,
  validateComputeInsightsRequest,
  lockId,
  unlockId,
  isIdLocked,
};
