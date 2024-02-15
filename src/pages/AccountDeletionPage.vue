<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">
    <div class="text-h4 text-weight-bold q-mx-none q-mb-sm">{{ t('deleteYourAccount') }}</div>

    <div v-if="deletingAccountDialogOpened === false">
      <q-item-label header>
        {{ t('error.accountDeletionFailed') }}
      </q-item-label>
    </div>

    <q-separator class="q-my-md" />

    <div class="q-ma-sm text-center"><a class="text-subtitle2 text-outline" href="/#/contact"
        style="text-decoration: none">{{ t('contactUs') }}</a>
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
          <div class="text-h6 text-weight-medium">{{ t('accountDeletionInProgress') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{ t('deletingYourAccount') }} </q-card-section>
        <div class="text-center q-px-auto q-mx-auto">
          <q-spinner color="primary" size="3em" />
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="accountDeletedDialogOpened" persistent>
      <q-card class="bg-background q-py-sm">
        <!-- <q-card> -->
        <q-card-section>
          <div class="text-h6 text-weight-medium"> {{ t('accountDeleted') }} </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{ t('accountDeletedText') }}
        </q-card-section>
        <q-card-actions align="center">
          <q-btn rounded :label="t('gotIt')" color="primary" class="full-width" padding="md" no-caps
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
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  onRetry: (retryCount, error, requestConfig) => {
    console.log(
      "In axiosRetry, retrying with retryCount:",
      retryCount,
      "err:",
      error,
      "requestConfig.url:",
      requestConfig.url,
      "requestConfig.data:",
      requestConfig.data,
    );
  },
});

const ms = useMomentsStore()
const { t } = useI18n();
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
    const fetchedSignInMethods = await fetchSignInMethodsForEmail(auth, ms.user.email);
    await deleteUser(currentUser.value);

    console.log("in AccountDeletionPage, fetchedSignInMethods:", fetchedSignInMethods);
    if (fetchedSignInMethods.includes("apple.com")) {
      const authorizationCode = ms.userDoc?.authorizationCode;
      if (authorizationCode) {
        console.log("in AccountDeletionPage, attempting to revoke apple tokens, authorizationCode:", authorizationCode);
        await revokeAppleTokens(authorizationCode);
      }
    }
    accountDeletedDialogOpened.value = true;
  } catch (error) {
    console.log("in AccountDeletionPage, direct account deletion failed with error:", error, "code:", error.code);
    //if error is "auth/requires-recent-login" then reauthenticate and try again
    if (error.code === "auth/requires-recent-login") {
      console.log("in AccountDeletionPage, requires-recent-login, re-authenticating");
      deletingAccountDialogOpened.value = false;
      accountDeletedDialogOpened.value = false;
      return
    }
    else {
      //if other error then it's very likely user is already deleted but page was refreshed, so move to welcome page
      router.push('/welcome');
    }
    //TODO:1 reauthentication needed to get ms.userCredentials
    // console.log("in handleOnline, currentUser.value:", currentUser.value);
    // console.log("in handleOnline, ms.userCredentials:", ms.userCredentials);
    // await reauthenticateWithCredential(currentUser.value, ms.userCredentials);
    // deletingAccountDialogOpened.value = true;
    // console.log("User re-authenticated.");
    // console.log("Error re-authenticating and deleting user:", error);
  }
  ms.$reset()
};


onMounted(async () => {
  // Check if user is online at the time of mounting
  if (navigator.onLine) {
    handleOnline();
  } else {
    errorDialogText.value = t('error.accountDeletionOffline')
    errorDialogOpened.value = true
    // Set up the online event listener
    window.addEventListener('online', handleOnline);
  }
})

onUnmounted(() => {
  // Clean up the online event listener
  window.removeEventListener('online', handleOnline);
});

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
  padding: 8px 0px 8px;
}
</style>
