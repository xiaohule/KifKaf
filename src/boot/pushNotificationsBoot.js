import { boot } from "quasar/wrappers";
import { PushNotifications } from "@capacitor/push-notifications";
import { ref } from "vue";

export const pushNotifRegistrationToken = ref("");

const addListeners = async (router) => {
  await PushNotifications.addListener("registration", (token) => {
    pushNotifRegistrationToken.value = token.value;
    console.info(
      "In pushNotificationsBoot > Registration token: ",
      token.value,
    );
  });

  await PushNotifications.addListener("registrationError", (err) => {
    console.error("In pushNotificationsBoot > Registration error: ", err.error);
  });

  await PushNotifications.addListener(
    "pushNotificationReceived",
    (notification) => {
      console.log(
        "In pushNotificationsBoot > Push notification received: ",
        notification,
      );
    },
  );

  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (notification) => {
      console.log(
        "In pushNotificationsBoot > Push notification action performed",
        notification.actionId,
        notification.inputValue,
        notification,
      );
      if (notification?.notification?.data?.targetPage) {
        console.log(
          "In pushNotificationsBoot > Push notification targetPage: ",
          notification.notification.data.targetPage,
        );
        router.push(notification.notification.data.targetPage);
      }
    },
  );
};

export const getDeliveredNotifications = async () => {
  const notificationList = await PushNotifications.getDeliveredNotifications();
  console.log(
    "In pushNotificationsBoot > delivered notifications",
    notificationList,
  );
};

export default boot(async ({ app, router }) => {
  if (process.env.MODE === "capacitor") {
    console.log("In pushNotifBoot, adding listeners");
    try {
      await addListeners(router);
      console.log("In pushNotifBoot, listeners added");
    } catch (error) {
      console.error("In pushNotifBoot, error adding listeners:", error);
    }
  }
});
