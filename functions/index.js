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
const cors = require("cors")({ origin: true });
const bodyParser = require("body-parser");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const axios = require("axios");
const qs = require("qs");

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

const storage = new Storage();
// app.kifkaf.services or app.kifkaf.kifkaf
const clientId = "app.kifkaf.kifkaf";

// sending Contact Us email from Contact Us page
exports.sendEmail = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(400).send("Request must be a POST");
      return;
    }

    // Parse the request body
    bodyParser.json()(req, res, async () => {
      const { senderEmail, message } = req.body;

      // if (!senderEmail || !message) {
      //   res.status(400).send("Missing senderEmail or message");
      //   return;
      // }

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

async function downloadAuthKey() {
  const destFilename = path.join("/tmp", "AuthKey_HX7MCQ5H23.p8");
  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destFilename,
  };
  // gs://kifkaf-d4850.appspot.com/AuthKey_HX7MCQ5H23.p8
  // Downloads the file
  await storage
    .bucket("kifkaf-d4850.appspot.com")
    .file("AuthKey_HX7MCQ5H23.p8")
    .download(options);
  console.log(`AuthKey downloaded to ${destFilename}.`);
  return destFilename;
}

async function makeJWT() {
  const authKeyPath = await downloadAuthKey();
  const privateKey = fs.readFileSync(authKeyPath);

  //Sign with your team ID and key ID information.
  const token = jwt.sign(
    {
      iss: "236382978W",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      aud: "https://appleid.apple.com",
      sub: clientId,
    },
    privateKey,
    {
      algorithm: "ES256",
      header: {
        alg: "ES256",
        kid: "HX7MCQ5H23",
      },
    },
  );
  return token;
}

exports.revokeToken = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    const { authorizationCode } = request.body;
    functions.logger.log("Received authorization code:", authorizationCode);

    const clientSecret = await makeJWT();

    let data = {
      code: authorizationCode,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
    };

    // first get the refresh token
    try {
      const res = await axios.post(
        "https://appleid.apple.com/auth/token",
        qs.stringify(data),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      console.log("1st https://appleid.apple.com (token) executed");
      const refreshToken = res.data.refresh_token;

      data = {
        token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        token_type_hint: "refresh_token",
      };

      // use the refresh token to revoke
      try {
        const res = await axios.post(
          "https://appleid.apple.com/auth/revoke",
          qs.stringify(data),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );
        console.log("2nd https://appleid.apple.com (revoke) executed");

        functions.logger.log(res.status);
        response.status(200).send({ status: "success" });
      } catch (revokeError) {
        functions.logger.log(revokeError);
        response
          .status(500)
          .send({ status: "failed", message: revokeError.toString() });
      }
    } catch (refreshError) {
      functions.logger.log(refreshError);
      response
        .status(500)
        .send({ status: "failed", message: refreshError.toString() });
    }
  });
});
