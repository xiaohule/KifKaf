const lockedMomentIds = new Set(); //Since the code is running in a stateful server environment, lockedMomentIds is effective. However, be aware that in environments where multiple server instances are running (like in a clustered environment), this approach won't work since lockedMomentIds will only exist in memory for the specific server instance handling the request. In such cases, distributed lock manager like Redis or saving in firestore could be used.
//TODO:2 lockedMomentIds can potentially grow indefinitely. Consider implementing a mechanism to purge old IDs after a certain time or after they're no longer relevant. Also consider monitoring it.

function lockMomentId(momentId) {
  lockedMomentIds.add(momentId);
}

function unlockMomentId(momentId) {
  lockedMomentIds.delete(momentId);
}

function isMomentIdLocked(momentId) {
  return lockedMomentIds.has(momentId);
}

function validateRequest(req, res, next) {
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
      "lockedMomentIds:",
      lockedMomentIds,
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

module.exports = {
  validateRequest,
  lockMomentId,
  unlockMomentId,
  isMomentIdLocked,
};
