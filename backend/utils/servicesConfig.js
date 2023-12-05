require("dotenv").config();
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const OpenAI = require("openai");

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

module.exports = { db, openai };
