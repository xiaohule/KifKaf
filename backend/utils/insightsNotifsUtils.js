// utils/insightsNotifsUtils.js
const admin = require("firebase-admin");

const messages = {
  "en-US": {
    title: "New Insights available",
    body: "Discover what your moments reveal about your needs and their satisfactions.",
  },
  "fr-FR": {
    title: "Nouveaux éclairages disponibles",
    body: "Découvrez ce que vos moments révèlent sur vos besoins et leur satisfaction.",
  },
};

const MAX_RETRIES = 5; // Maximum number of retries
const BASE_DELAY = 10000; // Base delay in ms (10 seconds)
const MAX_DELAY = 3600000; // Maximum delay in ms (60 minutes)

function sendInsightsNotif(
  fcmToken,
  language = "en-US",
  attempt = 0,
  retryAfter = BASE_DELAY,
) {
  const localizedMessage = messages[language] || messages["en-US"];
  const message = {
    token: fcmToken,
    notification: {
      title: localizedMessage.title,
      body: localizedMessage.body,
    },
    apns: {
      payload: {
        aps: {
          // Set 'badge' to 1 for 'set' type, or use 'INCREMENT' for 'increment' type
          badge: 1,
        },
      },
    },
    data: {
      targetPage: "/insights",
    },
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("insightsNotifsUtils > successfully sent message:", response);
    })
    .catch((error) => {
      console.error("insightsNotifsUtils > error sending message:", error);

      //if error.code doesn't containt 'exceeded' and attempt < MAX_RETRIES
      if (attempt < MAX_RETRIES) {
        let delay;
        if (error.headers && error.headers["retry-after"]) {
          // Use the Retry-After header if available
          delay = parseInt(error.headers["retry-after"]) * 1000; // Convert to milliseconds
        } else {
          // Calculate delay using exponential backoff with jitter
          delay = Math.min(retryAfter + Math.random() * 1000, MAX_DELAY);
        }

        console.log(`insightsNotifsUtils > retrying in ${delay}ms...`);
        setTimeout(
          () => sendJournalNotif(fcmToken, language, attempt + 1, delay * 2),
          delay,
        );
      } else {
        console.log(
          "insightsNotifsUtils > non-retryable error or max retries reached. Giving up.",
        );
      }
    });
}

module.exports = {
  sendInsightsNotif,
};
