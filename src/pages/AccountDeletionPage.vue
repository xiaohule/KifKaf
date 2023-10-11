<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">
    <div class="text-h4 text-weight-medium q-mx-sm q-mb-md">Delete your account</div>

    <div v-if="deletingAccountDialogOpened === false">

      <q-item-label header>
        We're sorry, but we couldn't delete your account as your last sign-in session has expired.
        For your security, please log out, sign back in, and try deleting your account again.
      </q-item-label>

      <!-- <q-btn rounded unelevated color="on-primary" text-color="scrim" label="Continue with email"
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
      <q-btn rounded unelevated color="on-primary" text-color="scrim" label="Continue with Apple"
        @click="continueWithApple()" class="text-subtitle2 full-width q-ma-sm" style="height: 56px;" no-caps
        icon="fa-brands fa-apple" /> -->
    </div>

    <q-separator class="q-my-md" />

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

    <q-dialog v-model="deletingAccountDialogOpened">
      <q-card class="bg-background q-py-sm">
        <!-- <q-card> -->
        <q-card-section>
          <div class="text-h6 text-weight-medium">Account deletion in progress</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Deleting your account, please don't quit the app...
        </q-card-section>
        <q-card-actions align="center">
          <q-btn rounded label="Got it" color="primary" class="full-width" padding="md" no-caps
            @click="() => router.push('/welcome')" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="accountDeletedDialogOpened" persistent>
      <q-card class="bg-background q-py-sm">
        <!-- <q-card> -->
        <q-card-section>
          <div class="text-h6 text-weight-medium">Account deleted</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Your account has been deleted. All your moments, insights, and associated data have been permanently erased.
        </q-card-section>
        <q-card-actions align="center">
          <q-btn rounded label="Got it" color="primary" class="full-width" padding="md" no-caps
            @click="() => router.push('/welcome')" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { currentUser, getFirebaseAuth } from "../boot/firebaseBoot.js";
import { deleteUser, fetchSignInMethodsForEmail } from "firebase/auth";
// import {  reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, OAuthProvider, } from "firebase/auth";
import { useRouter } from 'vue-router'
import { useMomentsStore } from './../stores/moments.js'
import axios from 'axios';

const momentsStore = useMomentsStore()
const errorDialogOpened = ref(false)
const errorDialogText = ref('')
const deletingAccountDialogOpened = ref(false)
const accountDeletedDialogOpened = ref(false)
const router = useRouter()

const auth = getFirebaseAuth();
// const signInMethods = ref(null);

const revokeAppleTokens = async (authorizationCode) => {
  try {
    const response = await axios.post('https://us-central1-kifkaf-d4850.cloudfunctions.net/revokeToken', { authorizationCode });
    console.log('Function response:', response.data);

    if (response.status !== 200) {
      throw new Error(`Apple token revocation failed: ${response.data.error}`);
    }
    console.log('Apple tokens revoked successfully');
  } catch (error) {
    console.log("Failed in revokeAppleTokens")
    console.error(error);
    console.error(error.response ? error.response.data : error.message);
  }
};

const handleOnline = async () => {
  try {
    deletingAccountDialogOpened.value = true;
    console.log("in AccountDeletionPage, attempting direct deletion");
    const fetchedSignInMethods = await fetchSignInMethodsForEmail(auth, momentsStore.user.email);
    await deleteUser(currentUser.value);

    console.log("in AccountDeletionPage, fetchedSignInMethods:", fetchedSignInMethods);
    if (fetchedSignInMethods.includes("apple.com")) {
      console.log("in AccountDeletionPage, attempting to revoke apple tokens, authorizationCode:", momentsStore.getAuthorizationCode);
      await revokeAppleTokens(momentsStore.getAuthorizationCode);
    }
    accountDeletedDialogOpened.value = true;
  } catch (error) {
    console.log("in AccountDeletionPage, direct account deletion failed with error:", error);
    deletingAccountDialogOpened.value = false;
    accountDeletedDialogOpened.value = false;
    return
    //TODO:3 reauthentication needed to get momentsStore.userCredentials
    // console.log("in handleOnline, currentUser.value:", currentUser.value);
    // console.log("in handleOnline, momentsStore.userCredentials:", momentsStore.userCredentials);
    // await reauthenticateWithCredential(currentUser.value, momentsStore.userCredentials);
    // deletingAccountDialogOpened.value = true;
    // console.log("User re-authenticated.");
    // console.log("Error re-authenticating and deleting user:", error);
  }
  momentsStore.$reset()
};


onMounted(async () => {
  // Check if user is online at the time of mounting
  if (navigator.onLine) {
    handleOnline();
  } else {
    errorDialogText.value = `You are offline. Please connect to the internet to delete your account.`
    errorDialogOpened.value = true
    // Set up the online event listener
    window.addEventListener('online', handleOnline);
  }
})

onUnmounted(() => {
  // Clean up the online event listener
  window.removeEventListener('online', handleOnline);
});


// onMounted(async () => {
// try {
//   signInMethods.value = await fetchSignInMethodsForEmail(auth, momentsStore.user.email);
// } catch (error) {
//   console.error('Error fetching sign-in methods:', error);
// }
// console.log("signInMethods.value:", signInMethods.value);
// console.log("signInMethods.value[0]:", signInMethods.value[0]); //"apple.com", "google.com", "password"
// //if signInMethods.value contains "password" set showPassword.value to true
// if (!signInMethods.value.includes("password")) showPassword.value = false;
// }
// )

// const continueWithGoogle = async () => {
//   if (isOffline()) return
//   try {
//     await signInWithGoogle();
//   } catch (error) {
//     console.error(error);
//   }
// }

// const continueWithApple = async () => {
//   if (isOffline()) return
//   try {
//     await signInWithApple();
//   } catch (error) {
//     console.error(error);
//   }
// }

</script>

<style lang="scss">
.q-dialog__inner>div {
  max-width: 400px;
  width: 90%;
  border-radius: 14px;
  // position: fixed;
  // top: 50%;
  // transform: translateY(-50%);
}

.q-item__label--header {
  padding: 8px 16px 8px;
}
</style>
