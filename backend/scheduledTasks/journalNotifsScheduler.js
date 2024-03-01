// scheduledTasks/journalNotifsScheduler.js
const nodeCron = require("node-cron");
const moment = require("moment-timezone");
const admin = require("firebase-admin");
const { db } = require("../utils/servicesConfig");

const messages = {
  "en-US": {
    title: "Today's feelings",
    body: "Time to jot down today's ups and downs!",
  },
  "fr-FR": {
    title: "Émotions du jour",
    body: "Que vous reste-t-il de cette journée ?", // C'est le moment de noter vos émotions !  Alors que vous reste-t-il d'aujourd'hui?
  },
};
// Temps d'écriture
// Prenez un moment pour réfléchir dans votre journal
//How are you feeling this evening?
//Your evening reflection space is ready
//It's time for a short ...

const MAX_RETRIES = 5; // Maximum number of retries
const BASE_DELAY = 10000; // Base delay in ms (10 seconds)
const MAX_DELAY = 3600000; // Maximum delay in ms (60 minutes)

function sendJournalNotif(
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
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log(
        "journalNotifsScheduler > successfully sent message:",
        response,
      );
    })
    .catch((error) => {
      console.error("journalNotifsScheduler > error sending message:", error);

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

        console.log(`journalNotifsScheduler > retrying in ${delay}ms...`);
        setTimeout(
          () => sendJournalNotif(fcmToken, language, attempt + 1, delay * 2),
          delay,
        );
      } else {
        console.log(
          "journalNotifsScheduler > non-retryable error or max retries reached. Giving up.",
        );
      }
    });
}

// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *
nodeCron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    let usersSnapshot;

    if (process.env.SERVER_NODE_ENV === "development") {
      usersSnapshot = await db
        .collection("users")
        .where("isTestAccount", "==", true)
        .where("journalNotifs", "==", true)
        .where("fcmToken", "!=", "")
        .get();
    } else {
      // Fetch users with journal notifications enabled and notification time non-empty and fcmToken present
      usersSnapshot = await db
        .collection("users")
        .where("journalNotifs", "==", true)
        .where("fcmToken", "!=", "")
        .get();
    }

    const currentTimeUTC = `${now
      .getUTCHours()
      .toString()
      .padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")}`; // Convert current time to UTC for comparison

    console.log(
      `journalNotifsScheduler ${currentTimeUTC} > ${usersSnapshot.size}  ${
        process.env.SERVER_NODE_ENV === "development" ? "TEST user" : "user"
      } w/ journalNotifs and fcmToken.`,
    );

    usersSnapshot.forEach((doc) => {
      const userDoc = doc.data();

      const journalNotifsTimeUTC = moment
        .tz(userDoc.journalNotifsTime, "HH:mm", userDoc.timeZone)
        .utc()
        .format("HH:mm");

      console.log(
        `journalNotifsScheduler > uid: ${doc.id} | journalNotifsTimeUTC: ${journalNotifsTimeUTC} | currentTimeUTC: ${currentTimeUTC}`,
      );

      if (journalNotifsTimeUTC === currentTimeUTC) {
        // Send notification if time matches
        sendJournalNotif(
          userDoc.fcmToken,
          userDoc.locale || userDoc.deviceLocale,
        ); // Assuming FCM token is stored in user profile
      }
    });
  } catch (error) {
    console.error("journalNotifsScheduler > error :", error);
  }
});
