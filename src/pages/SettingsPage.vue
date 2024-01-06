<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">
    <div class="text-h4 text-weight-bold q-mx-none q-mb-sm">Settings</div>

    <div v-if="!ms || !ms.user"></div>

    <div v-else>
      <q-list class="q-pt-none">

        <q-item-label header>Account details</q-item-label>

        <q-card class="bg-surface q-mb-md q-px-none q-py-sm rounded-borders-14" flat>
          <q-item clickable v-ripple @click="openEditDialog('displayName')">
            <q-item-section>
              <q-item-label caption>
                Name
              </q-item-label>
              <q-item-label>{{ ms.user.displayName }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item :clickable="signInMethodsIncludePassword === true" v-ripple @click="openEditDialog('email')">
            <q-item-section>
              <q-item-label caption>
                Email
              </q-item-label>
              <q-item-label>{{ ms.user.email }}</q-item-label>
            </q-item-section>
          </q-item>


          <q-item :clickable="signInMethodsIncludePassword === true" v-ripple @click="openEditDialog('password')">
            <q-item-section>
              <q-item-label caption>
                Password
              </q-item-label>
              <q-item-label>*********</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>

        <q-card class="bg-surface q-mb-md q-px-none q-py-sm rounded-borders-14" flat clickable v-ripple
          @click="languageDialogOpened = true">
          <q-item>
            <q-item-section>
              <q-item-label>Speech recognition language</q-item-label>
              <q-item-label caption>
                {{ displayPickedLanguage }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-card>

        <q-card class="bg-surface q-mb-md q-px-none q-py-sm rounded-borders-14" flat>
          <!-- TODO:2 later do About us/manual section -->
          <!-- <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>About us</q-item-label>
          </q-item-section>
        </q-item> -->
          <q-item clickable v-ripple to="/privacy-policy">
            <q-item-section>
              <q-item-label>Privacy policy</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/terms">
            <q-item-section>
              <q-item-label>Terms of service</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/contact">
            <q-item-section>
              <q-item-label>Contact us</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>

        <q-card data-cy="logout-settings-row" class="bg-surface q-mb-md q-px-none q-py-sm rounded-borders-14" flat
          clickable v-ripple @click="logoutDialogOpened = true">
          <q-item>
            <q-item-section>
              <q-item-label>Log out</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>

        <q-item-label header>Danger zone</q-item-label>
        <q-card class="bg-surface q-mb-md q-px-none q-py-sm rounded-borders-14" flat clickable v-ripple
          @click="deleteDialogOpened = true">
          <q-item>
            <q-item-section class="text-error">
              <q-item-label>Delete account</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>

        <q-item dense>
          <q-item-section>
            <q-item-label class="text-center">KifKaf version {{ version }}</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </div>
    <br />
    <br />
    <br />
    <br />

    <!--TODO:1 allow for not re-inputting email if not needed -->
    <q-dialog v-model="editDialogOpened" position="bottom" style="max-width: 600px">

      <q-card class="bg-background" flat style="height: 90vh;"
        v-touch-swipe.mouse.down="(event) => { editDialogOpened = false }">
        <q-toolbar class="q-pa-sm">
          <q-btn flat v-close-popup round dense icon="r_close" />
        </q-toolbar>

        <div v-if="currentSetting === 'displayName'">
          <q-card-section class="text-h6 text-weight-medium">Change name</q-card-section>
          <q-card-section>
            <q-input ref="mainInputRef" class="q-mx-sm q-mb-md" color="transparent" clearable rounded outlined
              v-model="newSettingValue" type="text" bg-color="surface-variant" placeholder="What should we call you?"
              lazy-rules :rules="displayNameRules" />
          </q-card-section>
        </div>

        <div v-else-if="currentSetting === 'email'">
          <q-card-section class="text-h6 text-weight-medium">Change email</q-card-section>
          <q-card-section>
            Enter your email address
          </q-card-section>
          <q-input ref="mainInputRef" class="q-mx-md q-mb-md" color="transparent" clearable rounded outlined
            v-model="newSettingValue" type='email' bg-color="surface-variant" placeholder="jane.doe@mail.com" lazy-rules
            :rules="emailRules" />
          <q-card-section>
            Enter your password to confirm
          </q-card-section>
          <q-input ref="oldPwdInputRef" class="q-mx-md q-mb-md" color="transparent" rounded outlined v-model="oldPassword"
            placeholder="Password" :type="isPwdOld ? 'password' : 'text'" bg-color="surface-variant" lazy-rules
            :rules="passwordRules">
            <template v-slot:append>
              <q-icon :name="isPwdOld ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="isPwdOld = !isPwdOld" />
            </template>
          </q-input>
        </div>

        <div v-else-if="currentSetting === 'password'">
          <q-card-section class="text-h6 text-weight-medium">Change Password</q-card-section>
          <q-card-section>
            Enter your existing password
          </q-card-section>
          <q-input ref="oldPwdInputRef" class="q-mx-md q-mb-sm" color="transparent" rounded outlined v-model="oldPassword"
            placeholder="Existing Password" :type="isPwdOld ? 'password' : 'text'" bg-color="surface-variant" lazy-rules
            :rules="passwordRules">
            <template v-slot:append>
              <q-icon :name="isPwdOld ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="isPwdOld = !isPwdOld" />
            </template>
          </q-input>

          <q-card-section>
            Create a new password
          </q-card-section>
          <!-- TODO:2 for we should provide pwd guidelines (character, length) and have adequate validation in place -->
          <q-input ref="mainInputRef" class="q-mx-md q-mb-sm" color="transparent" rounded outlined
            v-model="newSettingValue" placeholder="New Password" :type="isPwd ? 'password' : 'text'"
            bg-color="surface-variant" lazy-rules :rules="passwordRules">
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
        </div>

        <q-card-actions align="center" class="q-mx-sm">
          <q-btn rounded label="Save" color="primary" @click="updateSetting" class="full-width" padding="md" no-caps />
          <!-- TODO:2 for email should be "verify" instead of save and we should have a verifying flow -->
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="languageDialogOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background" flat style="height: 90vh;"
        v-touch-swipe.mouse.down="(event) => { languageDialogOpened = false }">
        <q-toolbar class="q-pa-sm">
          <q-btn flat v-close-popup round dense icon="r_close" />
        </q-toolbar>
        <q-card-section class="text-h6 text-weight-medium">Change speech recognition language</q-card-section>
        <q-card-section class="bg-surface q-mx-md q-py-sm q-px-none" style="border-radius: 14px;">

          <q-item tag="label" v-ripple v-for="(value, key) in speechRecoLanguageOptions" :key="key" class="">
            <q-item-section>
              <q-item-label>{{ value }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-radio v-model="pickedLanguage" checked-icon="r_check" unchecked-icon="none" :val="key" />
            </q-item-section>
          </q-item>
        </q-card-section>
        <!-- <q-card-actions align="center" class="q-mx-sm">
          <q-btn rounded label="Done" color="primary" @click="languageDialogOpened = false" class="full-width"
            padding="md" no-caps />
        </q-card-actions> -->
      </q-card>
    </q-dialog>

    <q-dialog v-model="logoutDialogOpened">
      <q-card class="bg-background q-py-sm">
        <q-card-section>
          <div class="text-h6 text-weight-medium">Log out</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          You will be returned to the login screen.
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat rounded label="Cancel" color="primary" padding="sm md" v-close-popup />
          <q-btn flat rounded data-cy="logout-button" label="Log out" color="primary" v-close-popup @click="logOut" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialogOpened">
      <q-card class="bg-background q-py-sm">
        <q-card-section>
          <div class="text-h6 text-weight-medium">Delete account</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Deleting your account is permanent. All your moments, insights, and associated data will be permanently erased.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn rounded label="Cancel" color="primary" padding="sm md" v-close-popup />
          <q-btn flat rounded label="Delete account" color="primary" v-close-popup @click="deleteAccount" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { getFirebaseAuth } from "../boot/firebaseBoot.js";
import { signOut, fetchSignInMethodsForEmail } from "firebase/auth";
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useMomentsStore } from './../stores/moments.js'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
const version = process.env.__APP_VERSION__

const $q = useQuasar()
const router = useRouter()
const ms = useMomentsStore()
const auth = getFirebaseAuth();

const signInMethods = ref(null);
const signInMethodsIncludePassword = ref(true)

const currentSetting = ref('')
const newSettingValue = ref('')
const oldPassword = ref('')
const isPwdOld = ref(true)
const isPwd = ref(true)
const oldPwdInputRef = ref(null)
const mainInputRef = ref(null)

const pickedLanguage = ref('en-US')
const speechRecoLanguageOptions = {
  "en-US": "English",
  "fr-FR": "Français",
  "es-ES": "Español",
  "it-IT": "Italiano",
  "de-DE": "Deutsch"
};
const displayPickedLanguage = computed(() => {
  // Direct match
  if (speechRecoLanguageOptions[pickedLanguage.value]) {
    return speechRecoLanguageOptions[pickedLanguage.value];
  }
  // Fallback to the closest locale based on the language code
  const languageCode = pickedLanguage.value.split('-')[0];
  for (const key in speechRecoLanguageOptions) {
    if (key.startsWith(languageCode)) {
      return speechRecoLanguageOptions[key];
    }
  }
  // Default to English if no match is found
  return 'English';
});

const editDialogOpened = ref(false)
const logoutDialogOpened = ref(false)
const deleteDialogOpened = ref(false)
const languageDialogOpened = ref(false)

onMounted(async () => {
  try {
    if (!ms.userFetched) {
      await ms.fetchUser();
    }
    console.log("In SettingsPage > onMounted before pickedLang setting, currently set at:", pickedLanguage.value);
    pickedLanguage.value = ms.userDoc?.speechRecoLanguage ||
      ms.userDoc?.deviceLanguage ||
      "en-US";
    console.log("In SettingsPage > onMounted pickedLanguage set at:", pickedLanguage.value);
  } catch (error) {
    console.error('await ms.fetchUser() error:', error);
  }
  try {
    signInMethods.value = await fetchSignInMethodsForEmail(auth, ms.user.email);
  } catch (error) {
    console.error('Error fetching sign-in methods:', error);
  }
  console.log("signInMethods.value:", signInMethods.value);
  console.log("signInMethods.value[0]:", signInMethods.value[0]); //"apple.com", "google.com", "password"
  //if signInMethods.value contains "password" set signInMethodsIncludePassword.value to true
  if (!signInMethods.value.includes("password")) signInMethodsIncludePassword.value = false;
}
)

const displayNameRules = [
  val => (val && val.length > 0) || 'Please type your name'
]
const emailRules = [
  val => (val && val.length > 0) || 'Please type something',
  val => /.+@.+\..+/.test(val) || 'E-mail must be valid',
  // val => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val) || 'E-mail must be valid',
]
const passwordRules = [
  val => (val && val.length > 0) || 'Please type something',
  val => val.length >= 6 || 'Password must be at least 6 characters'
]


const openEditDialog = (setting) => {
  currentSetting.value = setting
  newSettingValue.value = setting === 'password' ? '' : ms.user[setting]
  editDialogOpened.value = true
  // nextTick(() => {
  //   if (setting === 'password') oldPwdInputRef.value.$el.querySelector('input').focus();
  //   else mainInputRef.value.$el.querySelector('input').focus();
  // })
}

watch(editDialogOpened, (val) => {
  if (!val) {
    currentSetting.value = ''
    newSettingValue.value = ''
    oldPassword.value = ''
    isPwdOld.value = true
    isPwd.value = true
  }
})

const updateSetting = async () => {
  try {
    if (oldPwdInputRef.value) {
      oldPwdInputRef.value.validate()
      if (oldPwdInputRef.value.hasError) {
        // form has error
        console.log('oldPwdInputRef.value.hasError')
        return
      }
    }
    mainInputRef.value.validate()
    if (mainInputRef.value.hasError) {
      // form has error
      console.log('mainInputRef.value.hasError')
      return
    }
    await ms.updateUser({ [currentSetting.value]: newSettingValue.value, oldPassword: oldPassword.value })
    editDialogOpened.value = false
    $q.notify({
      icon: 'done',
      message: currentSetting.value === 'displayName' ? 'Name updated' : currentSetting.value === 'email' ? 'Email updated' : 'Password updated'
    })
  } catch (error) {
    // Handle authentication error
    console.log(error)
    if (error.code === 'auth/wrong-password') {
      isPwdOld.value = false
      oldPwdInputRef.value.$el.querySelector('input').focus();
      $q.notify({
        icon: 'error',
        color: 'negative',
        message: 'Wrong password'
      })
    } else if (error.code === 'auth/weak-password') {
      isPwd.value = false
      mainInputRef.value.$el.querySelector('input').focus();
      $q.notify({
        icon: 'error',
        color: 'negative',
        message: 'Password should be at least 6 characters'
      })
    } else {
      $q.notify({
        icon: 'error',
        color: 'negative',
        message: error.message
      })
    }
  }
  //TODO:2 disable Save button when no change were made and when one validation is not passed
}

watch(pickedLanguage, async (newVal, oldVal) => {
  console.log("In SettingsPage, pickedLanguage changed from", oldVal, "to", newVal);
  await ms?.setUserDocValue({ speechRecoLanguage });
})

const logOut = async () => {
  try {
    if (process.env.MODE === "capacitor") {
      console.log("In SettingsPage, signing out for Capacitor");
      await FirebaseAuthentication.signOut();
    }

    console.log("In SettingsPage, signing out for web");
    // Sign out on the web layer
    await signOut(auth)

    setTimeout(() => {
      ms.$reset()
      router.push('/welcome')
      console.log('logged out')
    }, 10)
    logoutDialogOpened.value = false
  }
  catch (error) {
    console.error(error);
  }
};

const deleteAccount = async () => {
  deleteDialogOpened.value = false
  console.log("In SettingsPage, heading to account deletion page");
  router.push('/account-deletion')
  // setTimeout(() => {
  //   ms.$reset()
  //   router.push('/welcome')
  //   console.log('logged out')
  // }, 10)
}
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

// .checkmark-icon {
//   color: blue;
//   float: right;
// }

// .checkmark-icon {
//     display: none;  /* Initially hidden */
//     color: blue;
//     float: right;   /* For right alignment */
// }

// .q-radio__inner,
// .q-radio__bg {
//   display: none;
// }
</style>
