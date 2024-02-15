import { boot } from "quasar/wrappers";
import { initializeApp, getApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  collection,
  where,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  orderBy,
  doc,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
import {
  getAnalytics,
  logEvent as webLogEvent,
  setUserId as webSetUserId,
  setUserProperties as webSetUserProperties,
} from "firebase/analytics";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  CustomProvider,
} from "firebase/app-check";
import { markRaw, ref, watch } from "vue";
// import Vue3Lottie from "vue3-lottie";
import { debounce } from "lodash";
import axios from "axios";
import axiosRetry from "axios-retry";
import * as Sentry from "@sentry/vue";
import { i18n } from "./i18nBoot";
import { setQuasarLangPack } from "./quasarLangPackBoot";

axios.defaults.baseURL = process.env.API_URL;
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  onRetry: (retryCount, error, requestConfig) => {
    console.log(
      "In axiosRetry, retrying with retryCount:",
      retryCount,
      "err:",
      error,
      "requestConfig.url:",
      requestConfig.url,
      "requestConfig.data:",
      requestConfig.data,
    );
  },
});

const firebaseConfig = {
  apiKey: "AIzaSyDMydjsxDCNqYeYFbNL0q8VtzM8sXE_rXg",
  authDomain: "kifkaf-d4850.firebaseapp.com",
  projectId: "kifkaf-d4850",
  storageBucket: "kifkaf-d4850.appspot.com",
  messagingSenderId: "296402111022",
  appId: "1:296402111022:web:9e147ef8aa0fcb44822dbf",
  measurementId: "G-6KB3RTH5GX",
};

let firebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase app:", error);
}

let firebaseAnalytics;
try {
  if (process.env.MODE !== "capacitor") {
    firebaseAnalytics = getAnalytics(firebaseApp);
  } else {
    import("@capacitor-firebase/analytics")
      .then(async (module) => {
        firebaseAnalytics = module.FirebaseAnalytics;
      })
      .catch((error) => {
        console.error(
          "In firebaseBoot, Failed to initialize app check for Capacitor, error:",
          error,
        );
      });
  }
} catch (error) {
  console.error("Error initializing Firebase Analytics:", error);
}

export const setUserId = async (userId) => {
  if (process.env.MODE !== "capacitor") {
    webSetUserId(firebaseAnalytics, userId);
  } else {
    await firebaseAnalytics.setUserId({ userId: userId });
  }
};

export const setUserProperty = async (propertyKey, propertyValue) => {
  if (process.env.MODE !== "capacitor") {
    webSetUserProperties(firebaseAnalytics, {
      [propertyKey]: propertyValue,
    });
  } else {
    await firebaseAnalytics.setUserProperty({
      key: propertyKey,
      value: propertyValue,
    });
  }
};

//export logEvent function such that it is equally available in web and capacitor
export const logEvent = async (eventName, eventParams) => {
  if (process.env.MODE !== "capacitor") {
    console.log(
      "In firebaseBoot > logEvent, web mode eventName:",
      eventName,
      "eventParams:",
      eventParams,
    );
    webLogEvent(firebaseAnalytics, eventName, eventParams);
  } else {
    console.log(
      "In firebaseBoot > logEvent, capacitor mode eventName:",
      eventName,
      "eventParams:",
      eventParams,
    );
    await firebaseAnalytics.logEvent({ name: eventName, params: eventParams });
  }
};

export const setCurrentScreen = async (screenName, screenClass) => {
  if (process.env.MODE !== "capacitor") {
    webLogEvent(firebaseAnalytics, "screen_view", {
      firebase_screen: screenName,
      firebase_screen_class: screenClass,
    });
  } else {
    await firebaseAnalytics.setCurrentScreen({
      screenName: screenName,
      screenClassOverride: screenClass,
    });
  }
};

// Use IndexedDb persistence. Cf. https://github.com/firebase/firebase-js-sdk/issues/6087#issuecomment-1233478793 for markRaw
let dbInstance;
try {
  dbInstance = initializeFirestore(firebaseApp, {
    localCache: persistentLocalCache(
      /*settings*/ { tabManager: persistentMultipleTabManager() },
    ),
  });
} catch (error) {
  console.error("Error initializing Firestore database:", error);
}
export const db = markRaw(dbInstance);
// console.log("firebaseApp", firebaseApp, "db", db);

//AUTH
let auth;
export const getFirebaseAuth = () => {
  if (!auth) {
    try {
      console.log("In firebaseBoot > getFirebaseAuth,no auth yet");
      if (process.env.MODE !== "capacitor") {
        console.log("In firebaseBoot > getFirebaseAuth, web mode");
        auth = getAuth(firebaseApp);
      } else {
        console.log("In firebaseBoot > getFirebaseAuth, capacitor mode");
        auth = initializeAuth(getApp(), {
          persistence: indexedDBLocalPersistence,
        });
      }
      auth.useDeviceLanguage(); // or  auth.languageCode = 'it'; to explicitly set it
    } catch (error) {
      console.error("Error initializing authentication:", error);
    }
  }
  return auth;
};

//USER
export const isLoadingAuth = ref(true);

export const currentUser = ref(null);
const userDocRef = ref(null);
//if signed out in one tab, sign out in all tabs //TODO:2 ensure this
try {
  onAuthStateChanged(getFirebaseAuth(), (user) => {
    // console.log("onAuthStateChanged", user);
    currentUser.value = user;
    if (user?.uid) {
      Sentry.setUser({ id: user.uid });
      setUserId(user.uid);
      //To not mess with Firebase analytics identify test accounts
      if (
        user.email.endsWith("@yopmail.com") ||
        user.email.endsWith("@sharklasers.com") ||
        user.email.endsWith("@ethereal.email") ||
        user.email === "jules.douet@gmail.com" ||
        user.email === "xyzdelatour@gmail.com" ||
        user.email === "xyzdelatour2@gmail.com" ||
        user.uid === "UtCgVuTY2XUvYmnqqYULj4r5jaI3" ||
        user.uid === "WYnWOZ4OUhcLzIlXm2FtApdNs7F3"
      ) {
        setUserProperty("isTestAccount", "true");
      } else {
        setUserProperty("isTestAccount", "false");
      }
    }
    isLoadingAuth.value = false;
  });
} catch (error) {
  console.error("Error with onAuthStateChanged:", error);
}

//APP CHECK
// const checkIfVirtualDevice = async () => {
//   const info = await Device.getInfo();
//   // console.log(info);
//   if (info.isVirtual) {
//     console.log("Running in a virtual device");
//     return true;
//   } else {
//     console.log("Running in a non-virtual device");
//     return false;
//   }
// };
// const isVirtualDevice = await checkIfVirtualDevice();
// Set FIREBASE_APPCHECK_DEBUG_TOKEN to the CI one if CI, true (to use the dev whitelisted ones) if no in CI but in dev and false otherwise
self.FIREBASE_APPCHECK_DEBUG_TOKEN =
  process.env.CYPRESS_APP_CHECK_DEBUG_TOKEN_FROM_CI ||
  process.env.NODE_ENV === "development" ||
  false;
console.log(
  "FIREBASE_APPCHECK_DEBUG_TOKEN",
  self.FIREBASE_APPCHECK_DEBUG_TOKEN,
);
if (
  process.env.MODE !== "capacitor" ||
  process.env.NODE_ENV === "development"
  // || isVirtualDevice
) {
  try {
    console.log("In firebaseBoot, initializing app check for web or dev");
    const appCheck = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(
        "6Lcwc_AmAAAAALodsOgDWM_0W3Ts1yrj_SKoPEfB",
      ),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    console.error("In firebaseBoot, Error initializing app check:", error);
  }
} else {
  import("@capacitor-firebase/app-check")
    .then(async (module) => {
      console.log("In firebaseBoot, initializing app check for Capacitor");

      const FirebaseAppCheck = module.FirebaseAppCheck;

      // const initialize = async () => {

      // 1. Initialize on the native layer
      await FirebaseAppCheck.initialize({
        // siteKey: "6Lcwc_AmAAAAALodsOgDWM_0W3Ts1yrj_SKoPEfB",
        // debug: process.env.NODE_ENV === "development",
        isTokenAutoRefreshEnabled: true,
      });
      // 2. Set up a custom provider
      const appCheckCustomProvider = new CustomProvider({
        getToken: async () => {
          console.log("In firebaseBoot, running FirebaseAppCheck.getToken()");
          const token = await FirebaseAppCheck.getToken();
          // return FirebaseAppCheck.getToken();
          return token;
        },
      });
      const app = getApp();
      // 3. Initialize on the web layer
      const appCheck = initializeAppCheck(app, {
        provider: appCheckCustomProvider,
        isTokenAutoRefreshEnabled: true,
      });

      // };
      // await initialize();
      console.log("In firebaseBoot Capacitor && prod, app check initialized");
    })
    .catch((error) => {
      console.error(
        "In firebaseBoot, Failed to initialize app check for Capacitor, error:",
        error,
      );
    });
}

const setAppLocaleToUserPreference = async (userDocRef) => {
  const userDocSnap = await getDoc(userDocRef.value);
  if (userDocSnap.exists()) {
    const userLocale = userDocSnap.data().locale;
    if (userLocale) {
      i18n.global.locale.value = userLocale;

      //quasar lang pack
      await setQuasarLangPack(userLocale);

      console.log(
        "In firebaseBoot > in setLocaleToUserPreference, just set app locale to user's picked locale: ",
        userLocale,
      );
    } else
      console.log(
        "In firebaseBoot > in setLocaleToUserPreference, userDocSnap.data() is",
        userDocSnap.data(),
        "not containing locale",
      );
  } else
    console.log(
      "In firebaseBoot > in setLocaleToUserPreference, not able to get userDocSnap",
    );
};

//ADD MOMENT RETRY: at each start of the app, look for moments with empty needs and retry the LLM call
export const addDeleteMomentRetry = async (force = false) => {
  // console.log(
  //   "In firebaseBoot > addDeleteMomentRetry > capacitor mode is",
  //   process.env.MODE === "capacitor",
  // );

  if (!currentUser.value || !currentUser.value.uid) {
    console.log(
      "In firebaseBoot > in addDeleteMomentRetry, returning early because no user",
    );
    return;
  }

  // Query moments where needs is empty
  const addMomentRetryQuery = query(
    collection(userDocRef.value, "moments"),
    where("needs", "==", {}),
    where("retries", "<", force ? 10 : 3),
    orderBy("retries"),
    orderBy("date", "desc"),
  );

  const deleteMomentRetryQuery = query(
    collection(userDocRef.value, "moments"),
    where("deleted", "==", true),
    // where("deleteRetries", "<", 3),
  );

  const addMomentRetrySnapshot = await getDocs(addMomentRetryQuery);
  const deleteMomentRetrySnapshot = await getDocs(deleteMomentRetryQuery);

  if (!addMomentRetrySnapshot.size && !deleteMomentRetrySnapshot.size) {
    console.log("In firebaseBoot > addDeleteMomentRetry, no retry to execute");
    return;
  }

  const idToken = await currentUser.value.getIdToken(/* forceRefresh */ true);

  if (addMomentRetrySnapshot.size) {
    // Use Promise.all to process all moments concurrently
    const addMomentPromises = addMomentRetrySnapshot.docs.map(async (doc) => {
      console.log(
        "In firebaseBoot > in addDeleteMomentRetry > addMomentPromises, retrying addMoment for:",
        doc.data(),
      );
      try {
        await updateDoc(doc.ref, {
          lastTouch: Timestamp.now(),
        });

        const response = await axios.post(
          `/api/learn/add-moment/`,
          {
            momentText: doc.data().text,
            momentDate: JSON.stringify(doc.data().date),
            momentId: doc.id,
          },
          {
            headers: {
              authorization: `Bearer ${idToken}`,
            },
          },
        );
        console.log(
          "In firebaseBoot > in addDeleteMomentRetry > addMomentPromises, add-moment response:",
          response.data,
        );

        await updateDoc(doc.ref, {
          retries: increment(1),
        });
      } catch (error) {
        console.error(
          "In firebaseBoot.js > addDeleteMomentRetry > addMomentPromises error:",
          error,
        );
      }
    });

    // Wait for all moments to be processed
    await Promise.all(addMomentPromises);
  }

  if (deleteMomentRetrySnapshot.size) {
    const deleteMomentPromises = deleteMomentRetrySnapshot.docs.map(
      async (doc) => {
        console.log(
          "In firebaseBoot > addDeleteMomentRetry > deleteMomentPromises, retrying deleteMoment for:",
          doc.data(),
        );
        try {
          const response = await axios.post(
            `/api/learn/delete-moment/`,
            {
              momentId: doc.id,
            },
            {
              headers: {
                authorization: `Bearer ${idToken}`,
              },
            },
          );
          console.log(
            "In firebaseBoot > addDeleteMomentRetry > deleteMomentPromises delete-moment response:",
            response.data,
          );
        } catch (error) {
          console.error(
            "In firebaseBoot.js > addDeleteMomentRetry > deleteMomentPromises error:",
            error,
          );
        }
      },
    );

    // Wait for all moments to be processed
    await Promise.all(deleteMomentPromises);
  }
};

const httpRetryHandler = debounce(
  () => {
    console.log("In firebaseBoot, calling httpRetryHandler");
    addDeleteMomentRetry();
  },
  60000,
  { leading: true, trailing: false },
);

//Call httpRetryHandler when going online
window.addEventListener("online", httpRetryHandler);
//Call httpRetryHandler when foregrounding app
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    httpRetryHandler();
  }
});

export default boot(({ router }) => {
  //if targeting a route that needs sign in without being signed in, redirect to login
  router.beforeEach((to, from, next) => {
    // console.log(
    //   "In router.beforeEach, window.history:",
    //   window.history,
    //   "isLoadingAuth.value:",
    //   isLoadingAuth.value,
    // );
    if (isLoadingAuth.value) {
      watch(isLoadingAuth, (newValue) => {
        console.log(
          "In router.beforeEach, isLoadingAuth watcher, newValue:",
          newValue,
        );
        if (!newValue) {
          // Once loading completes, call this guard recursively.
          next(to.path);
        }
      });
    } else {
      if (to.meta.requiresAuth && !currentUser.value?.emailVerified) {
        console.log(
          "In router.beforeEach, NO user yet or email NOT verified, redirected to /welcome?redirect=",
          to.fullPath,
        );
        next({ path: "/welcome", query: { redirect: to.fullPath } });
      } else {
        console.log(
          "In router.beforeEach, no redirection, going to",
          to.fullPath,
        );
        next();
      }
    }
  });

  router.afterEach((to, from) => {
    console.log("In router.afterEach, from", from.path, " to ", to.path);

    // Define common routes and group routes for transitions
    const tabRoutes = ["/", "/insights"];
    const slideInRoutes = ["/privacy-policy", "/terms", "/contact"];

    if (
      tabRoutes.includes(from.path) &&
      !tabRoutes.includes(to.path) &&
      to.path !== "/welcome"
    ) {
      // If coming from a tab route and not going to one, slide new comp in
      to.meta.transition = "slide-in";
      // console.log("In router.afterEach1");
    } else if (
      tabRoutes.includes(to.path) &&
      !tabRoutes.includes(from.path) &&
      !from.path.includes("login")
    ) {
      // If going to a tab route and not coming from one, slide old comp out
      to.meta.transition = "slide-out";
      // console.log("In router.afterEach2");
    } else if (tabRoutes.includes(to.path) && from.path.includes("login")) {
      to.meta.transition = "";
    }
    // Handle other specific routes
    else if (slideInRoutes.includes(to.path)) {
      // If going to a leaf route, slide new comp in
      to.meta.transition = "slide-in";
      // console.log("In router.afterEach3");
    } else if (slideInRoutes.includes(from.path)) {
      // If coming from a leaf route, slide old comp out
      to.meta.transition = "slide-out";
      // console.log("In router.afterEach4");
    } else if (from.path === "/settings") {
      // If coming from settings, slide new comp in unless it's welcome
      to.meta.transition = to.path === "/welcome" ? "" : "slide-in";
      // console.log("In router.afterEach5");
    } else if (to.path === "/settings") {
      // If going to settings, slide old comp out
      to.meta.transition = "slide-out";
      // console.log("In router.afterEach6");
    } else {
      const toDepth = to.path.split("/").length;
      const fromDepth = from.path.split("/").length;
      // if going to children route, slide new comp in, if going to parent route, slide old comp out
      if (toDepth > fromDepth) to.meta.transition = "slide-in";
      else if (toDepth < fromDepth) to.meta.transition = "slide-out";
      // console.log("In router.afterEach7");
    }

    console.log(
      "In router.afterEach, to.meta.transition set to",
      to.meta.transition,
    );
  });

  // Call httpRetryHandler during app initialization
  watch(
    currentUser,
    (newVal) => {
      if (newVal) {
        userDocRef.value = doc(db, "users", currentUser.value.uid);
        setAppLocaleToUserPreference(userDocRef);
        httpRetryHandler();
      }
    },
    { immediate: true },
  );

  //   window.addEventListener('offline', () => {
  //   console.log("App is offline");
  //   // Any offline handling logic...
  // });

  // app.use(Vue3Lottie);
  // // Attach the application context to the global window object
  // window.appContext = app._context
});
