import { getFirebaseAuth } from "../boot/firebaseBoot.js";
import {
  // signInWithRedirect,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  // signInWithPopup,
} from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { logEvent } from "../boot/firebaseBoot.js";
import { Quasar } from "quasar";
import { useMomentsStore } from "./../stores/moments.js";
const ms = useMomentsStore();

const auth = getFirebaseAuth();

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    //     auth.languageCode = 'it';
    // auth.useDeviceLanguage(); // To apply the default browser preference instead of explicitly setting it.
    if (
      process.env.MODE !== "capacitor" //  || process.env.NODE_ENV === "development" || isVirtualDevice
    ) {
      console.log("In signInWith, google sign in for web");

      // await signInWithRedirect(auth, provider);
      await signInWithPopup(auth, provider);
    } else {
      console.log("In signInWith, google sign in for Capacitor");

      // 1. Create credentials on the native layer
      const result = await FirebaseAuthentication.signInWithGoogle();
      // 2. Sign in on the web layer using the id token
      const credential = GoogleAuthProvider.credential(
        result.credential?.idToken,
      );
      await signInWithCredential(auth, credential);
    }
    ms.tmpLastLoginMethod = "google";
    logEvent("login", { method: "google" });
  } catch (error) {
    console.error(error);
  }
};

const formatLocaleToUnderscore = (locale) => {
  if (!locale) return "en_US"; // Default fallback

  const normalized = locale.replace("-", "_").toLowerCase();
  const parts = normalized.split("_");
  // if (parts.length === 1) {
  // If only language code is present
  switch (parts[0]) {
    case "en":
      return "en_US";
    case "fr":
      return "fr_FR";
    // Add more default regions for other languages as needed
    default:
      return "en_US"; //`${parts[0]}_${parts[0].toUpperCase()}`;
  }
  // }
  // If both language and region codes are present
  // return `${parts[0]}_${parts[1].toUpperCase()}`;
};

export const signInWithApple = async () => {
  try {
    let authorizationCode;
    const provider = new OAuthProvider("apple.com");
    provider.setCustomParameters({
      //Localize the Apple authentication screen in French.
      locale: formatLocaleToUnderscore(Quasar.lang.getLocale()),
    });

    // console.log("In signInWith, process.env.MODE:", process.env.MODE);
    if (process.env.MODE !== "capacitor") {
      console.log("In signInWith, apple sign in for web");

      // await signInWithRedirect(auth, provider);
      await signInWithPopup(auth, provider);
      // const result = await signInWithPopup(auth, provider);
      // console.log("In signInWith>signInWithApple, result:", result);
      // const credential = OAuthProvider.credentialFromResult(result);
      // console.log("In signInWith>signInWithApple, credential:", credential);
      //TODO:1 i'm not able to find the authorizationCode in the credential
      authorizationCode = "";
    } else {
      console.log("In signInWith, apple sign in for Capacitor");
      // 1. Create credentials on the native layer
      const result = await FirebaseAuthentication.signInWithApple();
      authorizationCode = result.credential?.authorizationCode;

      // 2. Sign in on the web layer using the id token
      const credential = provider.credential({
        idToken: result.credential?.idToken,
        rawNonce: result.credential?.nonce,
      });
      await signInWithCredential(auth, credential);
    }
    ms.tmpLastLoginMethod = "apple";
    logEvent("login", { method: "apple" });
    // console.log("In sighInWith, authorizationCode:", authorizationCode);
    return authorizationCode;
  } catch (error) {
    console.error(error);
  }
};

// // Define a separate function to handle the result of the redirect
// export const handleRedirectResult = async () => {
//   try {
//     const result = await getRedirectResult(auth);
//     console.log("In handleRedirectResult, result:", result);
//     const provider = new OAuthProvider("apple.com");
//     const credential = provider.credentialFromResult(auth, result);
//     console.log("In handleRedirectResult, credential:", credential);
//     const credential2 = OAuthProvider.credentialFromResult(result);
//     console.log("In handleRedirectResult, credential2:", credential2);
//     console.log(
//       "In handleRedirectResult, credential.authorizationCode:",
//       credential.authorizationCode,
//     );
//     return credential.authorizationCode;
//   } catch (error) {
//     console.error(error);
//   }
// };
