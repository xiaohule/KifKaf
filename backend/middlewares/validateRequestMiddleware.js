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
  if (!req.query.momentText || typeof req.query.momentText !== "string") {
    return res.status(400).json({
      message: "Error: invalid momentText in query",
      query: req.query,
    });
  }

  const momentdateObject = JSON.parse(req.query.momentDate);
  if (!momentdateObject || !momentdateObject.seconds) {
    return res.status(400).json({
      message: "Error: Invalid momentDate in query",
      query: req.query,
    });
  }

  if (isMomentIdLocked(req.query.momentId)) {
    console.log(
      "Error: duplicate request detected for query",
      req.query,
      "lockedMomentIds:",
      lockedMomentIds,
    );
    return res.status(409).json({
      message: "Error: duplicate request detected for query",
      query: req.query,
    });
  }

  lockMomentId(req.query.momentId);

  next();
}

module.exports = {
  validateRequest,
  lockMomentId,
  unlockMomentId,
  isMomentIdLocked,
};
