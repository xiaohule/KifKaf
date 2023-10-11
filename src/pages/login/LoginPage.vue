<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">
    <div class="text-h4 text-weight-medium q-mx-sm q-mb-md">Log in to KifKaf</div>

    <div>
      <q-btn rounded unelevated color="on-primary" text-color="scrim" label="Continue with email"
        @click="() => router.push('/login/email')" class="text-subtitle2 full-width q-ma-sm" style="height: 56px;" no-caps
        icon="mail" />
      <q-btn rounded unelevated color="on-primary" text-color="scrim" @click="continueWithGoogle()"
        class="text-subtitle2 full-width q-ma-sm" style="height: 56px;" no-caps>
        <template v-slot:default>
          <img style="width: 24px; height: 24px; margin-right: 12px;" src="~assets/sign_in_icon_google_light_normal.svg"
            alt="Google">
          Continue with Google
        </template>
      </q-btn>
      <!-- <q-btn rounded unelevated color="on-primary" text-color="scrim" padding="none" @click="continueWithApple()"
        class="text-subtitle2 full-width q-ma-sm" style="height: 40px;" no-caps>
        <template v-slot:default>
          <img style="width: 40px; height: 56px; margin-right: 0px;" src="~assets/sign_in_icon_apple_black.svg"
            alt="Apple">
          Continue with Apple
        </template>
      </q-btn> -->
      <q-btn rounded unelevated color="on-primary" text-color="scrim" label="Continue with Apple"
        @click="continueWithApple()" class="text-subtitle2 full-width q-ma-sm" style="height: 56px;" no-caps
        icon="fa-brands fa-apple" />
    </div>


    <div class="text-caption text-outline q-mx-sm q-my-md">By continuing, you are indicating that you accept our
      <a href="/#/terms" class="text-primary" style="text-decoration: none">Terms of Service</a> and <a
        href="/#/privacy-policy" class="text-primary" style="text-decoration: none;">Privacy Policy</a>.
    </div>

    <!-- <div class="rounded-borders-14 q-my-md" id="firebaseui-auth-container"></div> -->
    <!-- <div v-if="renderLoader" class="flex justify-center">
      <q-spinner color="primary" size="3em" />
    </div>
    <div class="text-center" v-if="emailSent">A verification email has been sent. Please check your inbox and click on the
      link in the email to verify your account.</div> -->

    <q-separator class="q-my-md" />

    <!-- make hyperlink to /contact page using vue router -->
    <div class="q-ma-sm text-center"><a class="text-subtitle2 text-outline" href="/#/contact"
        style="text-decoration: none">Contact us</a>
    </div>

    <q-dialog v-model="errorDialogOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background q-pa-lg text-center" flat>
        <q-icon name="error_outline" size="10vh" color="error" class="q-py-md" />
        <q-card-section class="text-h5 text-weight-medium q-py-md">{{ errorDialogText }}
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import * as firebaseui from 'firebaseui';
// import 'firebaseui/dist/firebaseui.css';
import { currentUser } from "../../boot/firebaseBoot.js";
import { signInWithGoogle, signInWithApple } from '../../composables/signInWith.js';
import { useMomentsStore } from '../../stores/moments.js'

const momentsStore = useMomentsStore()
const route = useRoute(); //TODO:3 remove?
const router = useRouter();
const to =
  route.query.redirect && typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/'
const errorDialogOpened = ref(false)
const errorDialogText = ref('')

const isOffline = () => {
  if (!navigator?.onLine) {
    errorDialogText.value = `You are offline. Please connect to the internet to sign in.`
    errorDialogOpened.value = true
    return true
  }
  else return false
}

const continueWithGoogle = async () => {
  if (isOffline()) return
  try {
    await signInWithGoogle();
    console.log("In LoginPage>continueWithGoogle, signed i, redirecting to", to);
    // router.push(to);
  } catch (error) {
    console.error(error);
  }
}

const continueWithApple = async () => {
  if (isOffline()) return
  try {
    const authorizationCode = await signInWithApple();
    momentsStore.setAuthorizationCode(authorizationCode)
  } catch (error) {
    console.error(error);
  }
}

let checkEmailVerifiedInterval; // Declare variable to store the interval ID
watch(currentUser, (newVal, oldVal) => {
  console.log('In Login page, watch currentUser:', newVal, ", replaced:", oldVal);

  if (newVal) {
    // User is signed in.
    if (newVal.emailVerified) {
      // User's email is already verified. Redirect to expected page.
      console.log("In LoginPage > watch(currentUser), user's email is already verified. Redirecting to", to);
      router.push(to);
    }
    else {
      checkEmailVerifiedInterval = setInterval(async () => {
        await newVal.reload();
        if (newVal.emailVerified) {
          console.log("User's email is now verified. Redirecting to", to);
          clearInterval(checkEmailVerifiedInterval); // Clear the interval
          router.push(to);
        }
      }
        , 300)
    }
  }
}, { immediate: true });

// const emailSent = ref(false); // reactive property to track email sent status
// const renderLoader = ref(false); // reactive property to track loader rendering status

// let ui;// Declare variable to store Firebase UI instance
// // let unsubscribeAuthStateListener; // Declare variable to store the unsubscribe function
// const AppleAuthProvider = new OAuthProvider('apple.com');
// // Configuration for the Firebase UI widget
// const uiConfig = {
//   callbacks: {
//     // This function will be called when a sign-in flow successfully completes
//     signInSuccessWithAuthResult: function (authResult, redirectUrl) {
//       // // Force a refresh of the user's state
//       // await authResult.user.reload();

//       if (authResult.user.emailVerified) {
//         // User successfully signed in.
//         renderLoader.value = true
//         emailSent.value = false; // Email already verified, so set this to false
//         console.log("Sign in successful, redirecting...", authResult, redirectUrl);
//         // redirecting back to the intended page after login
//         router.push(to)
//         return false; // User is signed in.
//       } else {
//         // User email not verified
//         renderLoader.value = false
//         emailSent.value = true; // Set to true to show the message
//         sendEmailVerification(authResult.user);  // Send email verification to user.
//         console.log("User email not verified, sending email...", authResult, redirectUrl);
//         return false; // User needs to verify email.
//       }
//     },
//     uiShown: function () {
//       // The widget is rendered.
//       // Hide the loader.
//       renderLoader.value = false; // Set to true to show the message
//     },
//     signInFailure: function (error) {
//       // Handle sign-in failure errors here
//       console.error('Sign-in failure:', error);
//       return Promise.resolve(); // Return a promise to avoid the default error message
//     },
//   },
//   signInFlow: 'redirect',// Sign-in flow configuration (popup window) //or popup
//   signInSuccessUrl: '/',
//   signInOptions: [
//     EmailAuthProvider.PROVIDER_ID,
//     // EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
//     GoogleAuthProvider.PROVIDER_ID,
//     // FacebookAuthProvider.PROVIDER_ID,
//     OAuthProvider.PROVIDER_ID,
//     'apple.com',
//     AppleAuthProvider.PROVIDER_ID,
//   ],
//   tosUrl: () => {
//     window.location.assign('/#/terms/')
//   },
//   privacyPolicyUrl: () => {
//     window.location.assign('/#/privacy-policy/')
//   }
// };

// onMounted(async () => {
//   //Disabled temporarily as it was causing a bug that when one open tab logged as a and opening second tab to log as b, expected tab a disconnect from a, getting tab b log as tab a unless ctrl+R and then it shows b. Or i was thinking I had just logged in as b but it was actually a...
//   //TODO: 2 or maybe we should fix it by disabling /*settings*/ { tabManager: persistentMultipleTabManager() } in /Users/julesdouet/web-projects/quasar-project/src/boot/firebaseBoot.js when in development mode?
//   // Check if a FirebaseUI instance already exists. If not, create one.
//   if (!firebaseui.auth.AuthUI.getInstance()) {
//     console.log("Creating new FirebaseUI instance...");
//     ui = new firebaseui.auth.AuthUI(getFirebaseAuth());
//     console.log("Created new FirebaseUI instance.");
//   } else {
//     // If an instance already exists, use it.
//     ui = firebaseui.auth.AuthUI.getInstance();
//   }
//   // Start the Firebase UI widget.
//   ui.start('#firebaseui-auth-container', uiConfig);
// });

// onUnmounted(() => {
//   console.log("Unmounting Login page...");
//   ui.delete(); // Clean up the Firebase UI instance when the component is unmounted
//   if (checkEmailVerifiedInterval) {
//     clearInterval(checkEmailVerifiedInterval);
//   }
// });
</script>

<style lang="scss"></style>

