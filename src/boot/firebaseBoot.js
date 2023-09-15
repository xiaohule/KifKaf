import { boot } from "quasar/wrappers";
import { initializeApp } from "firebase/app";
import {
  // getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { VueFire, VueFireAuth, getCurrentUser } from "vuefire";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { markRaw } from "vue";
import Vue3Lottie from "vue3-lottie";

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
// console.log("firebaseApp", firebaseApp);
// console.log("db", db);

export const auth = getAuth(firebaseApp);
// const analytics = getAnalytics(firebaseApp);

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
// Pass your reCAPTCHA v3 site key (public key). Make sure this key is the counterpart to the secret key you set in the Firebase console.
const appCheck = initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider("6Lcwc_AmAAAAALodsOgDWM_0W3Ts1yrj_SKoPEfB"),
  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true,
});

export default boot(({ app, router }) => {
  app.use(VueFire, {
    // imported above but could also just be created here
    firebaseApp,
    modules: [
      // we will see other modules later on
      VueFireAuth(),
    ],
  });

  //if signed out in one tab, sign out in all tabs
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push("/login");
    }
  });

  //if targeting a route that needs sign in without being signed in, redirect to login
  router.beforeEach(async (to) => {
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

  app.use(Vue3Lottie);
  // // Attach the application context to the global window object
  // window.appContext = app._context
});
