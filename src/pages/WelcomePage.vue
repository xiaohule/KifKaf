<template>
  <q-page class="q-mx-auto" style="max-width: 600px; position: relative;">

    <q-header class="bg-transparent overlay-header">
      <q-toolbar>
        <q-avatar size="sm" square>
          <img src="icon-kifkaf-no-background.svg" />
        </q-avatar>
        <q-toolbar-title class="text-on-surface text-subtitle1 text-weight-medium
">Welcome to KifKaf</q-toolbar-title>
        <!-- <router-link to="/settings" style="text-decoration: none;">
          <q-btn flat round dense icon="account_circle" size="20px" class="text-on-surface">
          </q-btn>
        </router-link> -->
      </q-toolbar>
    </q-header>

    <!-- pagination-clickable="true"  class="mySwiper" -->
    <swiper-container pagination="true" navigation="true" space-between="30" centered-slides="true" autoplay-delay="2500"
      autoplay-disable-on-interaction="false">
      <!-- <swiper-slide> <img src="../assets/ios_6_1_home.png" /></swiper-slide> -->
      <swiper-slide> <img src="https://swiperjs.com/demos/images/nature-2.jpg" /></swiper-slide>
      <swiper-slide> <img src="https://swiperjs.com/demos/images/nature-3.jpg" /></swiper-slide>
      <swiper-slide>
        <img src="https://swiperjs.com/demos/images/nature-1.jpg" />
      </swiper-slide>
    </swiper-container>

    <div class="fixed-buttons">
      <q-btn rounded color="scrim" padding="sm" label="Log in" @click="goToLogin" class="text-body1 q-ml-md q-mr-sm"
        style="width: 100%; max-width: 300px;" no-caps />
      <q-btn rounded color="on-primary" text-color="scrim" padding="sm" label="Sign up" @click="goToSignUp"
        class="text-body1 q-ml-sm q-mr-md" style="width: 100%; max-width: 300px;" no-caps />
    </div>

    <!-- <div class="rounded-borders-14 q-my-md" id="firebaseui-auth-container"></div> -->
    <!-- <div v-if="renderLoader" class="flex justify-center">
      <q-spinner color="primary" size="3em" />
    </div>
    <div class="text-center" v-if="emailSent">A verification email has been sent. Please check your inbox and click on the
      link in the email to verify your account.</div> -->

    <!-- <q-separator /> -->
    <!-- make hyperlink to /contact page using vue router -->
    <!-- <div class="q-my-md text-center"><a class="text-caption text-outline" href="/#/contact"
        style="text-decoration: none">Contact us</a>
    </div> -->
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, onActivated, onDeactivated } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import * as firebaseui from 'firebaseui';
// import 'firebaseui/dist/firebaseui.css';
import { getFirebaseAuth, currentUser } from "../boot/firebaseBoot.js";
import { EmailAuthProvider, GoogleAuthProvider, sendEmailVerification, OAuthProvider } from 'firebase/auth';


//SWIPER
//TODO:2 for performance, we should move to append slides when many of them instead of pre-creating all of them and using v-for

const goToLogin = () => {
  router.push('/login'); // assuming '/login' is the route for your login page
};

const goToSignUp = () => {
  router.push('/signup'); // assuming '/signup' is the route for your signup page
};

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
// let ui;// Declare variable to store Firebase UI instance
// let unsubscribeAuthStateListener; // Declare variable to store the unsubscribe function

const AppleAuthProvider = new OAuthProvider('apple.com');

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
  signInFlow: 'redirect',// Sign-in flow configuration (popup window) //or popup
  signInSuccessUrl: '/',
  signInOptions: [
    EmailAuthProvider.PROVIDER_ID,
    // EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
    GoogleAuthProvider.PROVIDER_ID,
    // FacebookAuthProvider.PROVIDER_ID,
    OAuthProvider.PROVIDER_ID,
    'apple.com',
    AppleAuthProvider.PROVIDER_ID,
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
  // if (!firebaseui.auth.AuthUI.getInstance()) {
  //   console.log("Creating new FirebaseUI instance...");
  //   ui = new firebaseui.auth.AuthUI(getFirebaseAuth());
  //   console.log("Created new FirebaseUI instance.");
  // } else {
  //   // If an instance already exists, use it.
  //   ui = firebaseui.auth.AuthUI.getInstance();
  // }
  // // Start the Firebase UI widget.
  // ui.start('#firebaseui-auth-container', uiConfig);
});

onUnmounted(() => {
  console.log("Unmounting Login page...");
  // ui.delete(); // Clean up the Firebase UI instance when the component is unmounted
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

swiper-container {
  width: 100%;
  // height: 100%;
  height: 100vh; // This will make the container fill the entire height of the screen
}

swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; // This will make the slide fill the container's height
}

swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-header {
  position: absolute; // Set the header to an absolute position
  top: 0; // Position it at the top
  left: 0; // Position it on the left
  right: 0; // Stretch it to the right, making it full width
  z-index: 2; // Optional: make sure the header overlays the swiper content
}

.fixed-buttons {
  position: fixed;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  display: flex;
  z-index: 2; // to ensure it's above other content if needed
  // justify-content: space-around; // evenly space the buttons
  // bottom: 0; // position at the bottom of the page
  // padding: 6vh 0;
}


// .firebaseui-id-idp-button {
//   background-color: color(surface) !important;
//   box-shadow: none;

// }

// .firebaseui-idp-text {
//   color: color(on-surface) !important;
// }

// #firebaseui-auth-container>div>div.firebaseui-card-content>form>ul>li:nth-child(1)>button>span.firebaseui-idp-icon-wrapper>img {
//   filter: invert(100%);
// }
</style>

