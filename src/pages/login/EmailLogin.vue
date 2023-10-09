<template>
  <q-page class="q-mx-auto q-px-md q-pt-none" style="max-width: 600px">
    <div class="text-h4 text-weight-medium q-mx-sm">Log in to KifKaf</div>

    <div v-if="!waitingForEmailVerif">
      <q-form @submit="onSubmit">
        <q-input ref="emailInputRef" v-model="userEmail" label="Enter your email" type='email' class="q-my-md" outlined
          bg-color="surface-variant" color="transparent" clearable>
        </q-input>

        <q-input v-if="isSignUp" ref="nameInputRef" v-model="userName" label="Enter your first & last name" type='text'
          name="name" class="q-my-md" outlined bg-color="surface-variant" color="transparent" clearable>
        </q-input>

        <q-input v-if="onSubmitWasPressed" ref="pwdInputRef" v-model="userPassword" label="Enter your password"
          type='password' class="q-my-md" outlined bg-color="surface-variant" color="transparent" clearable>
        </q-input>

        <div>
          <q-btn v-if="!onSubmitWasPressed" rounded label="Continue" type="submit" color="primary"
            class="q-ma-md full-width" padding="sm" :disable="!isValidEmail" no-caps />
          <q-btn v-else rounded label="Sign in" type="submit" color="primary" class="q-ma-md full-width" padding="sm"
            :disable="!isValidPassword" no-caps />
        </div>

      </q-form>

      <div class="or-separator q-my-md">
        <div class="line"></div>
        <div class="or-text text-caption text-outline q-px-sm">or</div>
        <div class="line"></div>
      </div>

      <div>
        <!-- <q-btn rounded unelevated color="on-primary" text-color="scrim" label="Continue with email"
        @click="() => router.push('/login/email')" class="text-subtitle2 full-width q-ma-sm" style="height: 40px;" no-caps
        icon="mail" /> -->
        <q-btn rounded unelevated color="on-primary" text-color="scrim" @click="continueWithGoogle()"
          class="text-subtitle2 full-width q-ma-sm" style="height: 40px;" no-caps>
          <template v-slot:default>
            <img style="width: 24px; height: 24px; margin-right: 12px;" src="~assets/sign_in_icon_google_light_normal.svg"
              alt="Google">
            Continue with Google
          </template>
        </q-btn>
        <q-btn rounded unelevated color="on-primary" text-color="scrim" padding="none" @click="continueWithApple()"
          class="text-subtitle2 full-width q-ma-sm" style="height: 40px;" no-caps>
          <template v-slot:default>
            <img style="width: 40px; height: 40px; margin-right: 0px;" src="~assets/sign_in_icon_apple_black.svg"
              alt="Apple">
            Continue with Apple
          </template>
        </q-btn>
      </div>
    </div>

    <div v-else>
      <div class="text-center">A verification email has been sent. Please check your inbox and click on
        the
        link in the email to verify your account.</div>
    </div>

    <q-separator class="q-my-md" />

    <div class="q-ma-sm text-center"><a class="text-caption text-outline" href="/#/contact"
        style="text-decoration: none">Contact us</a>
    </div>

    <q-dialog v-model="errorDialogOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background q-pa-lg text-center" flat>

        <q-icon name="error_outline" size="10vh" color="error" class="q-py-md" />
        <q-card-section class="text-h5 text-weight-medium q-py-md">{{ errorDialogText }}
        </q-card-section>
        <q-card-section class="q-py-md text-subtitle1 text-outline">Don't have an account? <a href="/#/signup"
            class="text-primary" style="text-decoration: none;">Sign up</a>
        </q-card-section>

      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFirebaseAuth, currentUser } from "../../boot/firebaseBoot.js";
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { signInWithGoogle, signInWithApple } from '../../composables/signInWith.js';

const auth = getFirebaseAuth();
const route = useRoute();
const router = useRouter();
const to =
  route.query.redirect && typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/'
const emailInputRef = ref(null)
const userEmail = ref('')
const userPassword = ref('')
const userName = ref('')
const onSubmitWasPressed = ref(false)
const errorDialogOpened = ref(false)
const errorDialogText = ref('')
const isSignUp = ref(false)
const waitingForEmailVerif = ref(false)

const isValidEmail = computed(() => {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(userEmail.value)
  // /.+@.+\..+/.test(userEmail.value)
})
const isValidPassword = computed(() => {
  return userPassword.value?.length > 6
})

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
  userEmail.value = userEmail.value.trim()

  if (!onSubmitWasPressed.value) {
    //check if userEmail is an existing account, if it isn't consider this is a sign up and show name field
    isSignUp.value = !await isKnownEmail(userEmail.value);

    //TODO:3 show passwd recovery option, TODO:3 show make pwd visible button

    //show password field
    onSubmitWasPressed.value = true
  }
  else if (userEmail.value && userPassword.value) {
    userPassword.value = userPassword.value.trim()
    if (!isSignUp.value) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, userEmail.value, userPassword.value)
        console.log("Signed in:", userCredential);
        if (userCredential.user.emailVerified) {
          // User's email is already verified. Redirect to expected page.
          console.log("User's email is already verified. Redirecting to", to);
          router.push(to);
        }
        else {
          waitingForEmailVerif.value = true
        }
      }
      catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
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
        else {
          errorDialogText.value = `Error signing in with email ${userEmail.value}`
          errorDialogOpened.value = true
        }
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
        waitingForEmailVerif.value = true
      }
      catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error signing up:", errorCode, errorMessage);
      };
    }
  }
}

let checkEmailVerifiedInterval; // Declare variable to store the interval ID
watch(currentUser, (newVal, oldVal) => {
  console.log('In EmailLogin page, watch currentUser:', newVal, ", replaced:", oldVal);
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
  try {
    await signInWithGoogle();
  } catch (error) {
    console.error(error);
  }
}

const continueWithApple = async () => {
  try {
    await signInWithApple();
  } catch (error) {
    console.error(error);
  }
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

.q-field__control {
  border-radius: 14px !important;
}

.q-field--outlined .q-field__control:before {
  border: none;
}

.q-dialog__inner>div {
  border-top-right-radius: 14px;
  border-top-left-radius: 14px;
}
</style>

