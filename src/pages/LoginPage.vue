<template>
  <q-page padding>
    <!-- The surrounding HTML is left untouched by FirebaseUI.
     Your app may use that space for branding, controls and other customizations.-->
    <h1>Welcome to KifKaf App</h1>
    <div id="firebaseui-auth-container"></div>
    <div id="loader">Loading...</div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useFirebaseAuth } from "vuefire";
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { getCurrentUser } from 'vuefire'
// import { auth} from
import { getAuth } from 'firebase/auth';  // TODO firebase

const auth = getAuth();
// const auth = useFirebaseAuth()
// const auth = useFirebaseAuth()
console.log('Here in LoginPage.vue')
console.log('auth', auth)
// console.log('authEmail', auth.EmailAuthProvider)

let ui;// Declare variable to store Firebase UI instance

// Configuration for the Firebase UI widget
const uiConfig = {
  callbacks: {
    // This function will be called when a sign-in flow successfully completes
    signInSuccessWithAuthResult: () => false, // Prevents redirect after sign-in
  },
  signInFlow: 'popup',// Sign-in flow configuration (popup window)
  signInOptions: [
    auth.EmailAuthProvider.PROVIDER_ID,
    // other providers you want to offer
  ],
};

onMounted(() => {
  // Initialize the FirebaseUI Widget using Firebase.
  ui = new firebaseui.auth.AuthUI(auth); // Instantiate Firebase UI with the Firebase auth instance
  ui.start('#firebaseui-auth-container', uiConfig);  // Start the Firebase UI widget in the specified container with the given configuration
});

onUnmounted(() => {
  ui.delete(); // Clean up the Firebase UI instance when the component is unmounted
});

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

