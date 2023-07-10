<template>
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">
    <div class="text-center">Welcome to KifKaf</div>
    <div class="rounded-borders-14" id="firebaseui-auth-container"></div>
    <!-- TODO:1 add contact us -->
    <q-separator />

    <div class="q-py-md text-caption text-outline text-center">Contact us</div>
    <q-spinner id="loader" color="primary" size="3em" />
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { auth } from "../boot/firebaseBoot.js";
import { EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth';
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

// TODO:2 add rounded corners style

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

.firebaseui-idp-icon {
  // color: color(on-surface) !important;
  // background-color: color(on-surface) !important;
  // border-color: color(on-surface) !important;
}

#firebaseui-auth-container>div>div.firebaseui-card-content>form>ul>li:nth-child(1)>button>span.firebaseui-idp-icon-wrapper>img {
  filter: invert(100%);
}
</style>

