var admin = require("firebase-admin");

const authenticateUser = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No ID token provided." });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid; // Attach the uid to the request object
    next();
  } catch (error) {
    console.error("Token verification error", error);
    return res.status(401).json({ message: "Unauthorized: Invalid ID token." });
  }
};

module.exports = {
  authenticateUser,
};
