<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">

    <div v-if="!showWaitingForEmailVerif && !showPasswordRecovery && !showWaitingForPwdRecoveryEmail">
      <div class="text-h4 text-weight-bold q-mx-none q-mb-sm">Log in to KifKaf</div>

      <q-form @submit="onSubmit">
        <q-input data-cy="email-input" ref="emailInputRef" v-model="userEmail" placeholder="Enter your email" type='email'
          class="q-my-md" outlined bg-color="surface-variant" color="transparent" clearable>
        </q-input>

        <q-input v-if="isSignUp" ref="nameInputRef" v-model="userName" placeholder="What should we call you?" type='text'
          name="name" class="q-my-md" outlined bg-color="surface-variant" color="transparent" clearable>
        </q-input>

        <q-input v-if="onSubmitWasPressed" ref="pwdInputRef" v-model="userPassword" placeholder="Enter your password"
          :type="pwdVisible ? 'text' : 'password'" class="q-my-md" outlined bg-color="surface-variant"
          color="transparent">
          <template v-slot:append>
            <q-icon :name="pwdVisible ? 'visibility' : 'visibility_off'" class="cursor-pointer"
              @click="pwdVisible = !pwdVisible" />
          </template>
        </q-input>

        <div>
          <q-btn v-if="!onSubmitWasPressed" rounded label="Continue" type="submit" color="primary"
            class="q-ma-md full-width" padding="md" :disable="!isValidEmail" no-caps />
          <q-btn v-else rounded label="Sign in" type="submit" color="primary" class="q-ma-md full-width" padding="md"
            :disable="!isValidPassword" no-caps />
        </div>
      </q-form>

      <div v-if="onSubmitWasPressed" class="text-subtitle2 text-center">
        <a class="text-primary" style="text-decoration: none" @click="showPasswordRecovery = true">Trouble signing in?</a>
      </div>

      <div class="or-separator q-my-md">
        <div class="line"></div>
        <div class="or-text text-subtitle2 text-outline q-px-sm">or</div>
        <div class="line"></div>
      </div>

      <div>
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
          icon="fa-brands fa-apple" />
      </div>
    </div>

    <div v-else-if="showWaitingForEmailVerif">
      <div class="text-h4 text-weight-medium q-mx-sm q-mb-md">Log in to KifKaf</div>
      <div class="q-mx-sm q-my-md">A verification email has been sent. <br /> Please check your inbox and click on the
        link in the email to verify your account.</div>
    </div>

    <div v-else-if="showWaitingForPwdRecoveryEmail">
      <div class="text-h4 text-weight-medium q-mx-sm q-mb-md">Check your email</div>
      <div class="q-mx-sm q-my-md">Follow the instructions sent to {{ userEmail }} to recover your password.</div>
      <q-btn rounded label="Done" type="submit" color="primary" class="q-ma-md full-width" padding="md"
        @click="router.push('/login')" no-caps />
    </div>

    <div v-else-if="showPasswordRecovery">
      <div class="text-h4 text-weight-medium q-mx-sm q-mb-md">Recover your password</div>
      <div class="q-mx-sm q-my-md">Get instructions sent to this email that explain how to reset
        your password.
      </div>
      <q-form @submit="onSendPasswordRecoveryEmail()">
        <q-input v-model="userEmail" placeholder="Enter your email" type='email' class="q-my-md" outlined
          bg-color="surface-variant" color="transparent" clearable>
        </q-input>
        <div>
          <q-btn rounded label="Send" type="submit" color="primary" class="q-ma-md full-width" padding="md"
            :disable="!isValidEmail" no-caps />
        </div>
      </q-form>
    </div>

    <q-separator class="q-my-md" />

    <div class="q-ma-sm text-center"><a class="text-subtitle2 text-outline" href="/#/contact"
        style="text-decoration: none">Contact us</a>
    </div>

    <q-dialog v-model="errorDialogOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background q-pa-lg text-center" flat
        v-touch-swipe.mouse.down="(event) => { errorDialogOpened = false }">

        <q-icon name="error_outline" size="10vh" color="error" class="q-py-md" />
        <q-card-section class="text-h5 text-weight-medium q-py-md">{{ errorDialogText }}
        </q-card-section>
        <!-- <q-card-section class="q-py-md text-subtitle1 text-outline">Don't have an account? <a href="/#/signup"
            class="text-primary" style="text-decoration: none;">Sign up</a>
        </q-card-section> -->

      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFirebaseAuth, currentUser } from "../../boot/firebaseBoot.js";
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { signInWithGoogle, signInWithApple } from '../../composables/signInWith.js';
import { useMomentsStore } from '../../stores/moments.js'

//   window.addEventListener('offline', () => {
//   console.log("App is offline");
//   // Any offline handling logic...
// });
const momentsStore = useMomentsStore()
const auth = getFirebaseAuth();
const route = useRoute();
const router = useRouter();
const to =
  route.query.redirect && typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/'
const emailInputRef = ref(null)
const pwdInputRef = ref(null)
const nameInputRef = ref(null)
const userEmail = ref('')
const userPassword = ref('')
const userName = ref('')
const onSubmitWasPressed = ref(false)
const errorDialogOpened = ref(false)
const errorDialogText = ref('')
const isSignUp = ref(false)
const showWaitingForEmailVerif = ref(false)
const showPasswordRecovery = ref(false)
const showWaitingForPwdRecoveryEmail = ref(false)
const pwdVisible = ref(false)


const isValidEmail = computed(() => {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(userEmail.value)
  // /.+@.+\..+/.test(userEmail.value)
})
const isValidPassword = computed(() => {
  return userPassword.value?.length > 6
})

const isOffline = () => {
  if (!navigator?.onLine) {
    errorDialogText.value = `You are offline. Please connect to the internet to sign in.`
    errorDialogOpened.value = true
    return true
  }
  else return false
}

const isKnownEmail = async (email) => {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) return true
    else return false
  } catch (error) {
    console.error('Error fetching sign-in methods:', error);
  }
};

const onSubmit = async (event) => {

  if (isOffline()) return

  userEmail.value = userEmail.value.trim()

  //check if userEmail is an existing account, if it isn't consider this is a sign up and show name field
  isSignUp.value = !await isKnownEmail(userEmail.value);
  //show password field
  onSubmitWasPressed.value = true

  if (isSignUp.value) {
    if (!userName.value) nextTick(() => nameInputRef.value.focus())
    else if (!userEmail.value) nextTick(() => emailInputRef.value.focus())
  }
  else if (!userPassword.value) nextTick(() => pwdInputRef.value.focus())

  if (userEmail.value && userPassword.value) {
    userPassword.value = userPassword.value.trim()
    if (!isSignUp.value) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, userEmail.value, userPassword.value)
        console.log("In EmailLogin, Signed in");
        // console.log("Signed in:", userCredential);
        if (userCredential.user.emailVerified) {
          // User's email is already verified. Redirect to expected page.
          console.log("In EmailLogin>onSubmit User's email is already verified. Redirecting to", to);
          router.push(to);
        }
        else {
          showWaitingForEmailVerif.value = true
        }
      }
      catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error signing in:", errorCode, errorMessage);
        handleAuthError(errorCode, errorMessage)
      };
    }
    else {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, userEmail.value, userPassword.value)
        if (userName.value) {
          userName.value = userName.value.trim()
          await updateProfile(userCredential.user, {
            displayName: userName.value
          })
        }
        await sendEmailVerification(auth.currentUser)
        console.log("Signing up for", userCredential, "verification email sent.");
        showWaitingForEmailVerif.value = true
      }
      catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error signing up:", errorCode, errorMessage);
        handleAuthError(errorCode, errorMessage)
      };
    }
  }
}

const handleAuthError = (errorCode, errorMessage) => {
  console.log("Error signing in:", errorCode, errorMessage);

  if (errorCode === 'auth/wrong-password') {
    errorDialogText.value = `Incorrect password or email ${userEmail.value}`
    errorDialogOpened.value = true
    // The email and password you entered don't match.
  }
  else if (errorCode === 'auth/user-not-found') {
    errorDialogText.value = `No user found with email ${userEmail.value}`
    errorDialogOpened.value = true
    // That email address doesn't match an existing account.
  }
  else if (errorCode === 'auth/invalid-email') {
    errorDialogText.value = `Invalid email ${userEmail.value}`
    errorDialogOpened.value = true
    // That email address is invalid.
  }
  else if (errorCode === 'auth/user-disabled') {
    errorDialogText.value = `User with email ${userEmail.value} is disabled`
    errorDialogOpened.value = true
    // The user account has been disabled by an administrator.
  }
  else if (errorCode === 'auth/email-already-in-use') {
    errorDialogText.value = `Email ${userEmail.value} is already in use`
    errorDialogOpened.value = true
    // The email address is already in use by another account.
  }
  else {
    errorDialogText.value = `Error signing in with email ${userEmail.value}`
    errorDialogOpened.value = true
  }
}

let checkEmailVerifiedInterval; // Declare variable to store the interval ID
watch(currentUser, (newVal, oldVal) => {
  console.log('In EmailLogin page, watch currentUser:', newVal, ", replaced:", oldVal);
  if (newVal) {
    // User is signed in.
    if (newVal.emailVerified) {
      // User's email is already verified. Redirect to expected page.
      console.log("In EmailLogin > watch (currentUser), User's email is already verified. Redirecting to", to);
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

onUnmounted(() => {
  if (checkEmailVerifiedInterval) {
    clearInterval(checkEmailVerifiedInterval);
  }
});

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

const onSendPasswordRecoveryEmail = async () => {
  try {
    await sendPasswordResetEmail(auth, userEmail.value)

    console.log("Password reset email sent.");
    showWaitingForPwdRecoveryEmail.value = true
    showPasswordRecovery.value = false
  }
  catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("Error sending password reset email:", errorCode, errorMessage);
    handleAuthError(errorCode, errorMessage)
  };
}

</script>

<style lang="scss">
.or-separator {
  display: flex;
  align-items: center;

  .line {
    flex-grow: 1;
    height: 1px;
    background-color: #ccc; // you can adjust this color as per your design
  }
}

.q-dialog__inner>div {
  border-top-right-radius: 14px;
  border-top-left-radius: 14px;
}
</style>

