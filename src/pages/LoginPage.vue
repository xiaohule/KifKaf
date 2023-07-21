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
    <!-- <div to="/contact" class="q-py-md text-caption text-outline text-center">Contact us</div> -->
    <!-- <q-item clickable v-ripple to="/contact">
      <q-item-section>
        <q-item-label>Contact us</q-item-label>
      </q-item-section>
    </q-item> -->
  </q-page>
</template>

<script setup>
import { onActivated, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { auth } from "../boot/firebaseBoot.js";
import { EmailAuthProvider, GoogleAuthProvider, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { getCurrentUser } from 'vuefire'

const route = useRoute();
const router = useRouter();

const emailSent = ref(false); // reactive property to track email sent status
const renderLoader = ref(false); // reactive property to track loader rendering status
let ui;// Declare variable to store Firebase UI instance
let unsubscribeAuthStateListener; // Declare variable to store the unsubscribe function
let checkEmailVerifiedInterval; // Declare variable to store the interval ID


const to =
  route.query.redirect && typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/'

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
        return true; // User is signed in.
      } else {
        // User email not verified
        renderLoader.value = false
        emailSent.value = true; // Set to true to show the message
        // redirecting back to the intended page after login
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
  // signInSuccessUrl: '/',
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
  // Once the user is loaded, getCurrentUser() will immediately resolve the current user. Sometimes, the Firebase SDK might be able to automatically log in the user with a hidden cookie or local storage. In that case, you can automatically redirect the user to the page they were trying to access before being automatically logged in.
  const currentUser = await getCurrentUser()
  if (currentUser) {
    router.push(to)
  }

  // Check if a FirebaseUI instance already exists. If not, create one.
  if (!firebaseui.auth.AuthUI.getInstance()) {
    ui = new firebaseui.auth.AuthUI(auth);
  } else {
    // If an instance already exists, use it.
    ui = firebaseui.auth.AuthUI.getInstance();
  }
  // Start the Firebase UI widget.
  ui.start('#firebaseui-auth-container', uiConfig);
});


// Start checking email verification status every few seconds
checkEmailVerifiedInterval = setInterval(async () => {
  const user = auth.currentUser;
  if (user) {
    await user.reload();
    if (user.emailVerified) {
      console.log("User's email is now verified. Redirecting to home page.");
      router.push(to);
      clearInterval(checkEmailVerifiedInterval);
    }
  }
}, 3000); // Check every 5 seconds. Adjust this as needed.

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

