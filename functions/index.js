/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({origin: true});
const bodyParser = require("body-parser");

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

exports.sendEmail = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(400).send("Request must be a POST");
      return;
    }

    // Parse the request body
    bodyParser.json()(req, res, async () => {
      const {senderEmail, message} = req.body;

      const mailOptions = {
        from: senderEmail,
        to: "hello@kifkaf.app",
        subject: "Contact Us Message",
        text: message,
      };

      try {
        await mailTransport.sendMail(mailOptions);
        res.status(200).send("Email sent successfully");
      } catch (error) {
        console.error("There was an error while sending the email:", error);
        res.status(500).send("Error sending email");
      }
    });
  });
});
