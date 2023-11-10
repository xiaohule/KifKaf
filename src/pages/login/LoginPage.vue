<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">
    <div class="text-h4 text-weight-medium q-mx-sm q-mb-md">Log in to KifKaf</div>

    <div>
      <q-btn rounded unelevated color="on-primary" text-color="scrim" label="Continue with email"
        @click="() => router.push('/login/email')" class="text-subtitle2 full-width q-ma-sm" style="height: 56px;" no-caps
        icon="r_mail" />
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
import { currentUser } from "../../boot/firebaseBoot.js";
import { signInWithGoogle, signInWithApple } from '../../composables/signInWith.js';
import { useMomentsStore } from '../../stores/moments.js'

const momentsStore = useMomentsStore()
const route = useRoute();
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

</script>

<style lang="scss"></style>

