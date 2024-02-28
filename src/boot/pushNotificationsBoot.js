import { boot } from "quasar/wrappers";
import { PushNotifications } from "@capacitor/push-notifications";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter(); // Assuming you're using Vue Router

export const pushNotifRegistrationToken = ref("");

const addListeners = async () => {
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
      if (notification?.data?.targetPage) {
        console.log(
          "In pushNotificationsBoot > Push notification targetPage: ",
          notification.data.targetPage,
        );
        router.push(notification.data.targetPage);
      }
    },
  );

  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (notification) => {
      console.log(
        "In pushNotificationsBoot > Push notification action performed",
        notification.actionId,
        notification.inputValue,
      );
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
      await addListeners();
      console.log("In pushNotifBoot, listeners added");
    } catch (error) {
      console.error("In pushNotifBoot, error adding listeners:", error);
    }
  }
  // } else { //TODO:7 make this dynamic import?
  //   import("@sentry/capacitor")
  //     .then((module) => {
  //       console.log("pushNotifCapacitor module:", module);
  //       const SentryCapacitor = module;
  //       SentryCapacitor.init();
  //       console.log("In pushNotifBoot, pushNotif initialized for capacitor");
  //     })
  //     .catch((error) => {
  //       console.error(
  //         "In pushNotifBoot, Failed to initialize pushNotif for Capacitor, error:",
  //         error,
  //       );
  //     });
  // }
});
