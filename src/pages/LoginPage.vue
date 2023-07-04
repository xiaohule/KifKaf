<template>
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">
    <q-list>
      <q-item-label header class="text-center">Welcome to KifKaf app!</q-item-label>
      <div id="firebaseui-auth-container"></div>
      <q-item>
        <q-item-label> <a href="">What is KifKaf?</a>
          <span> | </span>
          <a href="">Message support</a>
          <span> | </span>
          <a href="">Terms</a></q-item-label>
      </q-item>
    </q-list>
    <q-spinner id="loader" color="primary" size="3em" />
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
      document.getElementById('loader').style.display = 'block';
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
    // GoogleAuthProvider.PROVIDER_ID,
  ],
  //TODO:3 add terms of service and privacy policy
  // // Terms of service url.
  // tosUrl: '<your-tos-url>',
  // // Privacy policy url.
  // privacyPolicyUrl: '<your-privacy-policy-url>'
};

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
  //TODO:1 set up email link auth https://firebase.google.com/docs/auth/web/firebaseui#email_link_authentication
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

