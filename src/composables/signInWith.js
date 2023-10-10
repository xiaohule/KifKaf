import { getFirebaseAuth } from "../boot/firebaseBoot.js";
import {
  signInWithRedirect,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";

const auth = getFirebaseAuth();

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    //     auth.languageCode = 'it';
    // // To apply the default browser preference instead of explicitly setting it.
    // // auth.useDeviceLanguage();
    if (
      !process.env.MODE === "capacitor" //  || process.env.NODE_ENV === "development" || isVirtualDevice
    ) {
      console.log("In signInWith, google sign in for web");

      await signInWithRedirect(auth, provider);
    } else {
      console.log("In signInWith, google sign in for native");

      const { FirebaseAuthentication } = await import(
        "app/src-capacitor/node_modules/@capacitor-firebase/authentication"
      );
      // 1. Create credentials on the native layer
      const result = await FirebaseAuthentication.signInWithGoogle();
      // 2. Sign in on the web layer using the id token
      const credential = GoogleAuthProvider.credential(
        result.credential?.idToken,
      );
      await signInWithCredential(auth, credential);
    }
  } catch (error) {
    console.error(error);
  }
};

export const signInWithApple = async () => {
  try {
    const provider = new OAuthProvider("apple.com");
    //     provider.setCustomParameters({
    //   // Localize the Apple authentication screen in French.
    //   locale: 'fr'
    // });
    if (!process.env.MODE === "capacitor") {
      console.log("In signInWith, apple sign in for web");
      await signInWithRedirect(auth, provider);
    } else {
      console.log("In signInWith, apple sign in for native");
      const { FirebaseAuthentication } = await import(
        "app/src-capacitor/node_modules/@capacitor-firebase/authentication"
      );
      // 1. Create credentials on the native layer
      const result = await FirebaseAuthentication.signInWithApple();
      // 2. Sign in on the web layer using the id token
      const credential = provider.credential({
        idToken: result.credential?.idToken,
        rawNonce: result.credential?.nonce,
      });
      await signInWithCredential(auth, credential);
    }
  } catch (error) {
    console.error(error);
  }
};
