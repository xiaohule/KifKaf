<template>
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">

    <div v-if="!momentsStore || !momentsStore.user"></div>

    <div v-else>
      <q-list padding>

        <q-item-label header>Account details</q-item-label>


        <q-card class="bg-surface q-mb-md q-px-xs q-py-sm rounded-borders-14" flat>
          <q-item clickable v-ripple @click="openEditDialog('displayName')">
            <q-item-section>
              <q-item-label caption>
                Name
              </q-item-label>
              <q-item-label>{{ momentsStore.user.displayName }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="openEditDialog('email')">
            <q-item-section>
              <q-item-label caption>
                Email
              </q-item-label>
              <q-item-label>{{ momentsStore.user.email }}</q-item-label>
            </q-item-section>
          </q-item>


          <q-item clickable v-ripple @click="openEditDialog('password')">
            <q-item-section>
              <q-item-label caption>
                Password
              </q-item-label>
              <q-item-label>*********</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>

        <q-card class="bg-surface q-mb-md q-px-xs q-py-sm rounded-borders-14" flat>
          <q-item clickable v-ripple>
            <q-item-section>

              <q-item-label>Language</q-item-label>
              <q-item-label caption>
                English
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-card>

        <q-card class="bg-surface q-mb-md q-px-xs q-py-sm rounded-borders-14" flat>
          <!-- TODO:1 later do About us section -->
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
              <q-item-label>Terms of Service</q-item-label>
            </q-item-section>
          </q-item>
          <!-- TODO:1 fail if no internet connection and ask user for connection -->
          <!-- <q-item clickable v-ripple @click="contactUsDialogOpen = true"> -->
          <q-item clickable v-ripple to="/contact">
            <q-item-section>
              <q-item-label>Contact us</q-item-label>
            </q-item-section>
          </q-item>
          <!-- TODO:1 later allow to Close account -->
          <!-- <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>Close account</q-item-label>
          </q-item-section>
        </q-item> -->
        </q-card>

        <q-card class="bg-surface q-mb-md q-px-xs q-py-sm rounded-borders-14" flat clickable v-ripple
          @click="logoutDialogOpen = true">
          <q-item>
            <q-item-section>
              <q-item-label>Log out</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>

        <q-item>
          <q-item-section>
            <q-item-label>KifKaf version {{ version }}</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </div>

    <!--TODO:1 allow for not re-inputting email if not needed -->
    <q-dialog v-model="editDialogOpen" position="top">
      <q-card class="bg-surface">

        <div v-if="currentSetting === 'displayName'">
          <q-card-section class="text-h6">Change name</q-card-section>
          <q-card-section>
            <q-input ref="mainInputRef" class="q-mx-sm q-mb-md" clearable rounded outlined v-model="newSettingValue"
              type="text" bg-color="surface-variant" label="First & last name" lazy-rules :rules="displayNameRules" />
          </q-card-section>
        </div>

        <div v-else-if="currentSetting === 'email'">
          <q-card-section class="text-h6">Change email</q-card-section>
          <q-card-section>
            Enter your email address
          </q-card-section>
          <q-input ref="mainInputRef" class="q-mx-md q-mb-md" clearable rounded outlined v-model="newSettingValue"
            type='email' bg-color="surface-variant" placeholder="jane.doe@mail.com" lazy-rules :rules="emailRules" />
          <q-card-section>
            Enter your password to confirm
          </q-card-section>
          <q-input ref="oldPwdInputRef" class="q-mx-md q-mb-md" rounded outlined v-model="oldPassword" label="Password"
            :type="isPwdOld ? 'password' : 'text'" bg-color="surface-variant" lazy-rules :rules="passwordRules">
            <template v-slot:append>
              <q-icon :name="isPwdOld ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="isPwdOld = !isPwdOld" />
            </template>
          </q-input>
        </div>

        <div v-else-if="currentSetting === 'password'">
          <q-card-section class="text-h6">Change Password</q-card-section>
          <q-card-section>
            Enter your existing password
          </q-card-section>
          <q-input ref="oldPwdInputRef" class="q-mx-md q-mb-md" rounded outlined v-model="oldPassword"
            label="Existing Password" :type="isPwdOld ? 'password' : 'text'" bg-color="surface-variant" lazy-rules
            :rules="passwordRules">
            <template v-slot:append>
              <q-icon :name="isPwdOld ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="isPwdOld = !isPwdOld" />
            </template>
          </q-input>

          <q-card-section>
            Create a new password
          </q-card-section>
          <!-- TODO:2 for we should provide pwd guidelines (character, length) and have validation in place -->
          <q-input ref="mainInputRef" class="q-mx-md q-mb-md" rounded outlined v-model="newSettingValue"
            label="New Password" :type="isPwd ? 'password' : 'text'" bg-color="surface-variant" lazy-rules
            :rules="passwordRules">
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
        </div>

        <q-separator />
        <q-card-actions align="right">
          <q-btn flat rounded label="Cancel" v-close-popup />
          <q-btn rounded color="primary" @click="updateSetting" padding="5px 25px">Save</q-btn>
          <!-- TODO:2 for email should be "verify" instead of save and we should have a verifying flow -->
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="logoutDialogOpen">
      <q-card class="bg-surface">
        <!-- <q-card> -->
        <q-card-section>
          <div class="text-h6">Log out</div>
        </q-card-section>
        <q-card-section>
          You will be returned to the login screen.
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat rounded label="Cancel" color="primary" v-close-popup />
          <q-btn flat rounded data-cy="logout-button" label="Log out" color="primary" v-close-popup @click="logOut" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { getFirebaseAuth } from "../boot/firebaseBoot.js";
import { signOut } from "firebase/auth";
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useMomentsStore } from './../stores/moments.js'
const version = process.env.__APP_VERSION__

const $q = useQuasar()
const router = useRouter()
const momentsStore = useMomentsStore()
onMounted(async () => {
  try {
    if (!momentsStore.userFetched) {
      await momentsStore.fetchUser();
    }
  } catch (error) {
    console.error('await momentsStore.fetchUser() error:', error);
  }
})

const currentSetting = ref('')
const newSettingValue = ref('')
const oldPassword = ref('')
const isPwdOld = ref(true)
const isPwd = ref(true)

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

const editDialogOpen = ref(false)
const logoutDialogOpen = ref(false)

const oldPwdInputRef = ref(null)
const mainInputRef = ref(null)

const openEditDialog = (setting) => {
  currentSetting.value = setting
  newSettingValue.value = setting === 'password' ? '' : momentsStore.user[setting]
  editDialogOpen.value = true
  nextTick(() => {
    if (setting === 'password') oldPwdInputRef.value.$el.querySelector('input').focus();
    else mainInputRef.value.$el.querySelector('input').focus();
  })
}

watch(editDialogOpen, (val) => {
  if (!val) {
    currentSetting.value = ''
    newSettingValue.value = ''
    oldPassword.value = ''
    isPwdOld.value = true
    isPwd.value = true
  }
})

// let keyboardOpen = false
// onMounted(() => {
//   window.visualViewport.addEventListener('resize', adjustDialogPosition)
// })
// onBeforeUnmount(() => {
//   window.visualViewport.removeEventListener('resize', adjustDialogPosition)
// })
// const adjustDialogPosition = () => {
//   // console.log('window.screen.height', window.screen.height) //844
//   // console.log('viewportHeight', window.innerHeight) //664
//   // console.log('window.visualViewport.height', window.visualViewport.height) //394.65625
//   nextTick(() => {
//     const dialogElement = document.querySelector('.q-dialog__inner>div')
//     if (!keyboardOpen && window.visualViewport.height < window.innerHeight) {
//       keyboardOpen = true
//       dialogElement.style.top = '10%'
//     } else if (keyboardOpen && window.visualViewport.height < window.innerHeight) {
//       keyboardOpen = false
//       dialogElement.style.top = '50%'
//     }
//   })
// }

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
    await momentsStore.updateUser({ [currentSetting.value]: newSettingValue.value, oldPassword: oldPassword.value })
    editDialogOpen.value = false
    $q.notify({
      icon: 'done',
      color: 'positive',
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

const logOut = () => {
  signOut(getFirebaseAuth()).then(() => {
    setTimeout(() => {
      momentsStore.$reset()
      router.push('/welcome')
      console.log('logged out')
    }, 10)
  }).catch((error) => {
    console.log("Error logging out", error);
  });
  logoutDialogOpen.value = false
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
</style>
