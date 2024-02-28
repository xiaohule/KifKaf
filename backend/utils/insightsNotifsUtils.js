// utils/insightsNotifsUtils.js
const admin = require("firebase-admin");

const messages = {
  "en-US": {
    title: "Your Insights are ready",
    body: "Discover what your moments reveal about your needs and their satisfactions.",
  },
  "fr-FR": {
    title: "Vos éclairages sont prêts",
    body: "Découvrez ce que vos moments révèlent sur vos besoins et leur satisfaction.",
  },
};

const sendInsightsNotif = (fcmToken, language = "en-US") => {
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
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("insightsNotifsUtils > successfully sent message:", response);
    })
    .catch((error) => {
      console.log("insightsNotifsUtils > error sending message:", error);
    });
};

module.exports = {
  sendInsightsNotif,
};
