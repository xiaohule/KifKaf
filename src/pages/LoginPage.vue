<template>
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">
    <div class="text-center">Welcome to KifKaf</div>
    <div class="rounded-borders-14 q-my-md" id="firebaseui-auth-container"></div>
    <div v-if="renderLoader" class="flex justify-center">
      <q-spinner color="primary" size="3em" />
    </div>
    <div class="text-center" v-if="emailSent">A verification email has been sent. Please check your inbox and click on the
      link in the email to verify your account.</div>

    <q-separator />

    <!-- make hyperlink to /contact page using vue router -->
    <div class="q-my-md text-center"><a class="text-caption text-outline" href="/#/contact"
        style="text-decoration: none">Contact us</a>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { getFirebaseAuth, currentUser } from "../boot/firebaseBoot.js";
import { EmailAuthProvider, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';

const route = useRoute(); //TODO:3 remove?
const router = useRouter();
const to =
  route.query.redirect && typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/'
let checkEmailVerifiedInterval; // Declare variable to store the interval ID

watch(currentUser, (newVal, oldVal) => {
  console.log('In Login page, watch currentUser:', newVal, ", replaced:", oldVal);

  if (newVal) {
    // User is signed in.
    if (newVal.emailVerified) {
      // User's email is already verified. Redirect to expected page.
      console.log("User's email is already verified. Redirecting to", to);
      router.push(to);
    }
    else {
      checkEmailVerifiedInterval = setInterval(async () => {
        await newVal.reload();
        console.log("user reload completed.");
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

const emailSent = ref(false); // reactive property to track email sent status
const renderLoader = ref(false); // reactive property to track loader rendering status
let ui;// Declare variable to store Firebase UI instance
// let unsubscribeAuthStateListener; // Declare variable to store the unsubscribe function



// Configuration for the Firebase UI widget
const uiConfig = {
  callbacks: {
    // This function will be called when a sign-in flow successfully completes
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      // // Force a refresh of the user's state
      // await authResult.user.reload();

      if (authResult.user.emailVerified) {
        // User successfully signed in.
        renderLoader.value = true
        emailSent.value = false; // Email already verified, so set this to false
        console.log("Sign in successful, redirecting...", authResult, redirectUrl);
        // redirecting back to the intended page after login
        router.push(to)
        return false; // User is signed in.
      } else {
        // User email not verified
        renderLoader.value = false
        emailSent.value = true; // Set to true to show the message
        sendEmailVerification(authResult.user);  // Send email verification to user.
        console.log("User email not verified, sending email...", authResult, redirectUrl);
        return false; // User needs to verify email.
      }
    },
    uiShown: function () {
      // The widget is rendered.
      // Hide the loader.
      renderLoader.value = false; // Set to true to show the message
    },
    signInFailure: function (error) {
      // Handle sign-in failure errors here
      console.error('Sign-in failure:', error);
      return Promise.resolve(); // Return a promise to avoid the default error message
    },
  },
  signInFlow: 'popup',// Sign-in flow configuration (popup window)
  signInSuccessUrl: '/',
  signInOptions: [
    EmailAuthProvider.PROVIDER_ID,
    // EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
    GoogleAuthProvider.PROVIDER_ID,
    // FacebookAuthProvider.PROVIDER_ID,
  ],
  tosUrl: () => {
    window.location.assign('/#/terms/')
  },
  privacyPolicyUrl: () => {
    window.location.assign('/#/privacy-policy/')
  }
};

onMounted(async () => {
  //Disabled temporarily as it was causing a bug that when one open tab logged as a and opening second tab to log as b, expected tab a disconnect from a, getting tab b log as tab a unless ctrl+R and then it shows b. Or i was thinking I had just logged in as b but it was actually a...
  //TODO: 2 or maybe we should fix it by disabling /*settings*/ { tabManager: persistentMultipleTabManager() } in /Users/julesdouet/web-projects/quasar-project/src/boot/firebaseBoot.js when in development mode?


  // Check if a FirebaseUI instance already exists. If not, create one.
  if (!firebaseui.auth.AuthUI.getInstance()) {
    console.log("Creating new FirebaseUI instance...");
    ui = new firebaseui.auth.AuthUI(getFirebaseAuth());
    console.log("Created new FirebaseUI instance.");
  } else {
    // If an instance already exists, use it.
    ui = firebaseui.auth.AuthUI.getInstance();
  }
  // Start the Firebase UI widget.
  ui.start('#firebaseui-auth-container', uiConfig);
});

onUnmounted(() => {
  console.log("Unmounting Login page...");
  ui.delete(); // Clean up the Firebase UI instance when the component is unmounted
  if (checkEmailVerifiedInterval) {
    clearInterval(checkEmailVerifiedInterval);
  }
});
</script>

<style lang="scss">
.mdl-card {
  border-radius: 14px;
  box-shadow: none
}

.mdl-button {
  border-radius: 50px;
  box-shadow: none;

}

.firebaseui-id-idp-button {
  background-color: color(surface) !important;
  box-shadow: none;

}

.firebaseui-idp-text {
  color: color(on-surface) !important;
}

#firebaseui-auth-container>div>div.firebaseui-card-content>form>ul>li:nth-child(1)>button>span.firebaseui-idp-icon-wrapper>img {
  filter: invert(100%);
}
</style>

