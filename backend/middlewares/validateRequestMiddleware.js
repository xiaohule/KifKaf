const lockedAddMomentIds = new Set(); //Since the code is running in a stateful server environment, lockedAddMomentIds is effective. However, be aware that in environments where multiple server instances are running (like in a clustered environment), this approach won't work since lockedAddMomentIds will only exist in memory for the specific server instance handling the request. In such cases, distributed lock manager like Redis or saving in firestore could be used.
//TODO:2 lockedAddMomentIds can potentially grow indefinitely. Consider implementing a mechanism to purge old IDs after a certain time or after they're no longer relevant. Also consider monitoring it.
const lockedDeleteMomentIds = new Set();

function lockMomentId(momentId, isDeleteMoment = false) {
  if (isDeleteMoment) {
    lockedDeleteMomentIds.add(momentId);
  } else {
    lockedAddMomentIds.add(momentId);
  }
}

function unlockMomentId(momentId, isDeleteMoment = false) {
  if (isDeleteMoment) {
    lockedDeleteMomentIds.delete(momentId);
  } else {
    lockedAddMomentIds.delete(momentId);
  }
}

function isMomentIdLocked(momentId, isDeleteMoment = false) {
  if (isDeleteMoment) {
    return lockedDeleteMomentIds.has(momentId);
  } else {
    return lockedAddMomentIds.has(momentId);
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

  if (isMomentIdLocked(req.body.momentId)) {
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

  lockMomentId(req.body.momentId);

  next();
}

function validateDeleteMomentRequest(req, res, next) {
  if (isMomentIdLocked(req.body.momentId, true /*isDeleteMoment*/)) {
    console.log(
      "validateDeleteMomentRequest > Error: duplicate request detected for body",
      req.body,
      "lockedDeleteMomentIds:",
      lockedDeleteMomentIds,
    );
    return res.status(409).json({
      message: "Error: duplicate request detected for body",
      moment: req.body.momentText,
      momentId: req.body.momentId,
    });
  }

  lockMomentId(req.body.momentId, true /*isDeleteMoment*/);

  next();
}

module.exports = {
  validateAddMomentRequest,
  validateDeleteMomentRequest,
  lockMomentId,
  unlockMomentId,
  isMomentIdLocked,
};
