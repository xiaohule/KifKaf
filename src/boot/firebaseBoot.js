import { boot } from "quasar/wrappers";
import { initializeApp, getApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  collection,
  where,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  orderBy,
  limit,
  doc,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  CustomProvider,
} from "firebase/app-check";
import { markRaw, ref, watch } from "vue";
// import Vue3Lottie from "vue3-lottie";
import { debounce } from "lodash";
import axios from "axios";
axios.defaults.baseURL = process.env.API_URL;
// import { Device } from "@capacitor/device";
// import { Platform, is } from "quasar";
// console.log("Platform is", Platform.is);

const firebaseConfig = {
  apiKey: "AIzaSyDMydjsxDCNqYeYFbNL0q8VtzM8sXE_rXg",
  authDomain: "kifkaf-d4850.firebaseapp.com",
  projectId: "kifkaf-d4850",
  storageBucket: "kifkaf-d4850.appspot.com",
  messagingSenderId: "296402111022",
  appId: "1:296402111022:web:9e147ef8aa0fcb44822dbf",
  measurementId: "G-6KB3RTH5GX",
};

const firebaseApp = initializeApp(firebaseConfig);
// Use IndexedDb persistence. Cf. https://github.com/firebase/firebase-js-sdk/issues/6087#issuecomment-1233478793 for markRaw
export const db = markRaw(
  initializeFirestore(firebaseApp, {
    localCache: persistentLocalCache(
      /*settings*/ { tabManager: persistentMultipleTabManager() },
    ),
  }),
);
// console.log("firebaseApp", firebaseApp, "db", db);

//AUTH
let auth;
export const getFirebaseAuth = () => {
  if (!auth) {
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
  }
  return auth;
};

//USER
export const isLoadingAuth = ref(true);

export const currentUser = ref(null);
//if signed out in one tab, sign out in all tabs //TODO:2 ensure this
onAuthStateChanged(getFirebaseAuth(), (user) => {
  console.log("onAuthStateChanged", user);
  currentUser.value = user;
  isLoadingAuth.value = false;
  // else router.push("/login");
});
// const analytics = getAnalytics(firebaseApp);

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
  console.log("In firebaseBoot, initializing app check for web or dev");
  const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(
      "6Lcwc_AmAAAAALodsOgDWM_0W3Ts1yrj_SKoPEfB",
    ),
    isTokenAutoRefreshEnabled: true,
  });
} else {
  import("@capacitor-firebase/app-check")
    .then(async (module) => {
      console.log("In firebaseBoot, initializing app check for native");

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
        getToken: () => {
          console.log("In firebaseBoot, running FirebaseAppCheck.getToken()");
          return FirebaseAppCheck.getToken();
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
      console.log("In firebaseBoot native and prod,  initialize called");
    })
    .catch((error) => {
      console.error(
        "In firebaseBoot, Failed to initialize app check for native, error:",
        error,
      );
    });
}

//DEVICE LANGUAGE
const setDeviceLanguage = async () => {
  let deviceLanguage = "";
  if (process.env.MODE !== "capacitor") {
    deviceLanguage = navigator.language || navigator.userLanguage;
    console.log("In firebaseBoot web mode, deviceLanguage is", deviceLanguage);
  } else {
    import("@capacitor/device")
      .then(async (module) => {
        const Device = module.Device;
        deviceLanguage = (await Device.getLanguageTag()).value; // deviceLanguage = "en-US";
        console.log(
          "In firebaseBoot native mode, deviceLanguage is",
          deviceLanguage,
        );
      })
      .catch((error) => {
        console.error(
          "In firebaseBoot, Failed to set deviceLanguage for native, error:",
          error,
        );
      });
  }
  await setDoc(
    doc(db, "users", currentUser.value.uid),
    { deviceLanguage },
    { merge: true },
  );
  console.log("In firebaseBoot, just set deviceLanguage to", deviceLanguage);
};

//LLM CALL RETRIES: at each start of the app, look for up to 3 moments with empty needsImportances have not been rated and retry the LLM call
const emptyNeedsMomentsRetry = async () => {
  // console.log(
  //   "In firebaseBoot > emptyNeedsMomentsRetry > capacitor mode is",
  //   process.env.MODE === "capacitor",
  // );

  if (!currentUser.value || !currentUser.value.uid) {
    console.log(
      "In firebaseBoot, in emptyNeedsMomentsRetry, returning early because no user",
    );
    return;
  }

  // Query moments where needsSatisAndImp is empty
  const emptyNeedsSatisAndImpQuery = query(
    collection(db, `users/${currentUser.value.uid}/moments`),
    where("needsSatisAndImp", "==", {}),
    where("retries", "<", 3),
    orderBy("retries"),
    orderBy("date", "desc"),
    limit(5),
  );

  const momentsWithEmptyNeedsSatisAndImp = await getDocs(
    emptyNeedsSatisAndImpQuery,
  );

  // Check if there are no matches and return early if true //alternative is momentsWithEmptyNeedsSatisAndImp.empty
  if (!momentsWithEmptyNeedsSatisAndImp.size) {
    console.log(
      "In firebaseBoot, in emptyNeedsMomentsRetry, no moments with empty needsSatisAndImp found",
    );
    return;
  }

  const idToken = await currentUser.value.getIdToken(/* forceRefresh */ true);

  // Use Promise.all to process all moments concurrently
  const processPromises = momentsWithEmptyNeedsSatisAndImp.docs.map(
    async (doc) => {
      console.log(
        "In firebaseBoot, in emptyNeedsMomentsRetry, triggering retry call to llm for moment",
        doc.data().text,
      );
      try {
        const response = await axios.get(`/api/learn/needs/`, {
          params: {
            momentText: doc.data().text,
            momentDate: JSON.stringify(doc.data().date),
            momentId: doc.id,
          },
          headers: {
            authorization: `Bearer ${idToken}`,
          },
        });
        await updateDoc(doc.ref, {
          retries: increment(1),
        });
        console.log(
          "In firebaseBoot, successful retried llm call for moment",
          doc.data().text,
          // "' :",
          // response.data,
        );
      } catch (error) {
        console.error(
          "In firebaseBoot.js > emptyNeedsMomentsRetry error:",
          error,
        );
      }
    },
  );

  // Wait for all moments to be processed
  await Promise.all(processPromises);
};

const llmRetryHandler = debounce(
  () => {
    console.log("In firebaseBoot, calling llmRetryHandler");
    emptyNeedsMomentsRetry();
  },
  60000,
  { leading: true, trailing: false },
);

//Call llmRetryHandler when going online
window.addEventListener("online", llmRetryHandler);
//Call llmRetryHandler when foregrounding app
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    llmRetryHandler();
  }
});

export default boot(({ router }) => {
  //if targeting a route that needs sign in without being signed in, redirect to login
  router.beforeEach((to, from, next) => {
    console.log(
      "In router.beforeEach, window.history:",
      window.history,
      "isLoadingAuth.value:",
      isLoadingAuth.value,
    );
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

  // Call llmRetryHandler during app initialization
  watch(
    currentUser,
    (newVal, oldVal) => {
      if (newVal) {
        setDeviceLanguage();
        llmRetryHandler();
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
