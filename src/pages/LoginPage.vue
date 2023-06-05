<template>
  <q-page padding>
    <!-- The surrounding HTML is left untouched by FirebaseUI.
     Your app may use that space for branding, controls and other customizations.-->
    <h6>Welcome to KifKaf app!</h6>
    <div id="firebaseui-auth-container"></div>
    <div id="loader">Loading...</div>
    <br />
    <div>
      <a href="">What is KifKaf?</a>
      <span> | </span>
      <a href="">Message support</a>
      <span> | </span>
      <a href="">Terms</a>
    </div>

  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { auth } from "../boot/firebaseBoot.js";
import { EmailAuthProvider } from 'firebase/auth';
import { getCurrentUser } from 'vuefire'

const route = useRoute();
const router = useRouter();

let ui;// Declare variable to store Firebase UI instance

// Configuration for the Firebase UI widget
const uiConfig = {
  callbacks: {
    // This function will be called when a sign-in flow successfully completes
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      // User successfully signed in.
      console.log("Sign in successful, redirecting...", authResult, redirectUrl);
      // redirecting back to the intended page after login
      const to =
        route.query.redirect && typeof route.query.redirect === 'string'
          ? route.query.redirect
          : '/'
      router.push(to)
      return false;
    },
    uiShown: function () {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    },
  },
  signInFlow: 'popup',// Sign-in flow configuration (popup window)
  // signInSuccessUrl: '/',
  signInOptions: [
    EmailAuthProvider.PROVIDER_ID,
    // GoogleAuthProvider.PROVIDER_ID,
  ],
  // // Terms of service url.
  // tosUrl: '<your-tos-url>',
  // // Privacy policy url.
  // privacyPolicyUrl: '<your-privacy-policy-url>'
};

// onMounted(() => {
//   // Initialize the FirebaseUI Widget using Firebase.
//   ui = new firebaseui.auth.AuthUI(auth); // Instantiate Firebase UI with the Firebase auth instance
//   ui.start('#firebaseui-auth-container', uiConfig);  // Start the Firebase UI widget in the specified container with the given configuration
// });

onMounted(() => {
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


onUnmounted(() => {
  ui.delete(); // Clean up the Firebase UI instance when the component is unmounted
});

// Once the user is loaded, getCurrentUser() will immediately resolve the current user.
// Sometimes, the Firebase SDK might be able to automatically log in the user with a hidden cookie or local storage. In that case, you can automatically redirect the user to the page they were trying to access before being automatically logged in:
onMounted(async () => {
  const currentUser = await getCurrentUser()
  if (currentUser) {
    const to =
      route.query.redirect && typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/'
    router.push(to)
  }
})

</script>

<style lang="scss"></style>

