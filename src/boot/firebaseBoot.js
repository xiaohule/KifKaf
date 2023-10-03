import { boot } from "quasar/wrappers";
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  increment,
  orderBy,
  limit,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { VueFire, VueFireAuth, getCurrentUser } from "vuefire";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  CustomProvider,
} from "firebase/app-check";
import { markRaw } from "vue";
// import Vue3Lottie from "vue3-lottie";
import { debounce } from "lodash";
import axios from "axios";
import { Platform } from "quasar";

console.log("In firebaseBoot, Platform.is", Platform.is);
console.log("In firebaseBoot, process.env is", process.env);

const firebaseConfig = {
  apiKey: "AIzaSyDMydjsxDCNqYeYFbNL0q8VtzM8sXE_rXg",
  authDomain: "kifkaf-d4850.firebaseapp.com",
  projectId: "kifkaf-d4850",
  storageBucket: "kifkaf-d4850.appspot.com",
  messagingSenderId: "296402111022",
  appId: "1:296402111022:web:9e147ef8aa0fcb44822dbf",
  measurementId: "G-6KB3RTH5GX",
};

const firebaseWebApp = initializeApp(firebaseConfig);
// Use IndexedDb persistence. Cf. https://github.com/firebase/firebase-js-sdk/issues/6087#issuecomment-1233478793 for markRaw
export const db = markRaw(
  initializeFirestore(firebaseWebApp, {
    localCache: persistentLocalCache(
      /*settings*/ { tabManager: persistentMultipleTabManager() },
    ),
  }),
);
// console.log("firebaseWebApp", firebaseWebApp, "db", db);

export const auth = getAuth(firebaseWebApp);
// const analytics = getAnalytics(firebaseWebApp);

//APP CHECK
// Set FIREBASE_APPCHECK_DEBUG_TOKEN to the CI one if CI, true (to use the dev whitelisted ones) if no in CI but in dev and false otherwise
self.FIREBASE_APPCHECK_DEBUG_TOKEN =
  process.env.CYPRESS_APP_CHECK_DEBUG_TOKEN_FROM_CI ||
  process.env.NODE_ENV === "development" ||
  false;
console.log(
  "FIREBASE_APPCHECK_DEBUG_TOKEN",
  self.FIREBASE_APPCHECK_DEBUG_TOKEN,
);

if (!Platform.is.nativeMobile) {
  console.log("In firebaseBoot, initializing app check for web");

  const appCheck = initializeAppCheck(firebaseWebApp, {
    provider: new ReCaptchaV3Provider(
      "6Lcwc_AmAAAAALodsOgDWM_0W3Ts1yrj_SKoPEfB",
    ),
    isTokenAutoRefreshEnabled: true,
  });
} else {
  import("app/src-capacitor/node_modules/@capacitor-firebase/app-check")
    .then(async (module) => {
      console.log("In firebaseBoot, initializing app check for native");

      const nativeAppCheck = module.FirebaseAppCheck;

      // 1. Initialize on the native layer
      await nativeAppCheck.initialize({
        // siteKey: "6Lcwc_AmAAAAALodsOgDWM_0W3Ts1yrj_SKoPEfB",
        debug: process.env.NODE_ENV === "development",
        isTokenAutoRefreshEnabled: true,
      });
      // 2. Set up a custom provider
      const appCheckCustomProvider = new CustomProvider({
        getToken: () => {
          return nativeAppCheck.getToken();
        },
      });
      // 3. Initialize on the web layer
      const appCheck = initializeAppCheck(firebaseWebApp, {
        provider: appCheckCustomProvider,
        isTokenAutoRefreshEnabled: true,
      });
      console.log("In firebaseBoot native,  initialize called");
    })
    .catch((error) => {
      console.error("Failed to initialize app check for native, error:", error);
    });
}

//LLM CALL RETRIES: at each start of the app, look for up to 3 moments with empty needsImportances have not been rated and retry the LLM call
const emptyNeedsMomentsRetry = async () => {
  const user = await getCurrentUser();
  // const user = auth.currentUser;
  if (!user || !user.uid) {
    console.log("In emptyNeedsMomentsRetry, returning early because no user");
    return;
  }

  // Query moments where needsSatisAndImp is empty
  const emptyNeedsSatisAndImpQuery = query(
    collection(db, `users/${user.uid}/moments`),
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
      "In emptyNeedsMomentsRetry, no moments with empty needsSatisAndImp found",
    );
    return;
  }

  const idToken = await user.getIdToken(/* forceRefresh */ true);

  // Use Promise.all to process all moments concurrently
  const processPromises = momentsWithEmptyNeedsSatisAndImp.docs.map(
    async (doc) => {
      console.log(
        "In emptyNeedsMomentsRetry, triggering retry call to llm for moment",
        doc.data().text,
      );
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
        "Successful retried llm call for moment",
        doc.data().text,
        // "' :",
        // response.data,
      );
    },
  );

  // Wait for all moments to be processed
  await Promise.all(processPromises);
};

const llmRetryHandler = debounce(
  () => {
    console.log("llmRetryHandler called!");
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

export default boot(({ app, router }) => {
  app.use(VueFire, {
    // imported above but could also just be created here
    firebaseApp: firebaseWebApp,
    modules: [
      // we will see other modules later on
      VueFireAuth(),
    ],
  });

  //if targeting a route that needs sign in without being signed in, redirect to login
  router.beforeEach(async (to) => {
    // console.log("router.beforeEach", to);
    // routes with `meta: { requiresAuth: true }` will check for the users, others won't
    if (to.meta.requiresAuth) {
      const currentUser = await getCurrentUser();
      // if the user is not logged in, redirect to the login page
      if (!currentUser || !currentUser.emailVerified) {
        return {
          path: "/login",
          query: {
            // we keep the current path in the query so we can redirect to it after login
            // with `router.push(route.query.redirect || '/')`
            redirect: to.fullPath,
          },
        };
      }
    }
  });

  // Call llmRetryHandler during app initialization
  llmRetryHandler();

  //if signed out in one tab, sign out in all tabs
  onAuthStateChanged(auth, (user) => {
    // console.log("onAuthStateChanged", user);
    if (!user) {
      router.push("/login");
    }
  });

  //   window.addEventListener('offline', () => {
  //   console.log("App is offline");
  //   // Any offline handling logic...
  // });

  // app.use(Vue3Lottie);
  // // Attach the application context to the global window object
  // window.appContext = app._context
});
