<template>
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">
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
        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>About us</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>Privacy policy</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>Terms & conditions</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>Close account</q-item-label>
          </q-item-section>
        </q-item>
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
          <q-item-label>KifKaf version 1.0.0</q-item-label>
        </q-item-section>
      </q-item>

    </q-list>

    <!--TODO: allow for not re-inputting email if not needed -->
    <q-dialog v-model="editDialogOpen" position="top">
      <q-card class="bg-surface">

        <div v-if="currentSetting === 'displayName'">
          <q-card-section>
            <div class="text-h6">Change name</div>
          </q-card-section>
          <q-card-section>
            <q-input ref="mainInputRef" class="q-mx-sm q-mb-md" clearable rounded outlined v-model="newSettingValue"
              type="text" bg-color="surface-variant" label="First name Last name" />
          </q-card-section>
        </div>

        <div v-else-if="currentSetting === 'email'">
          <q-card-section class="text-h6">Change email</q-card-section>
          <q-card-section>
            Enter your email address
          </q-card-section>
          <q-input ref="mainInputRef" class="q-mx-md q-mb-md" clearable rounded outlined v-model="newSettingValue"
            type='email' bg-color="surface-variant" placeholder="jane.doe@mail.com" />
          <!-- //TODO: validate email -->
          <q-card-section>
            Enter your existing password to confirm
          </q-card-section>
          <q-input ref="oldPwdInputRef" class="q-mx-md q-mb-md" rounded outlined v-model="oldPassword"
            label="Current Password" :type="isPwdOld ? 'password' : 'text'" bg-color="surface-variant">
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
            label="Current Password" :type="isPwdOld ? 'password' : 'text'" bg-color="surface-variant">
            <template v-slot:append>
              <q-icon :name="isPwdOld ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="isPwdOld = !isPwdOld" />
            </template>
          </q-input>

          <q-card-section>
            Create a new password
          </q-card-section>
          <!-- TODO:for we should provide email guidelines (character, length) and have validation in place -->
          <q-input ref="mainInputRef" class="q-mx-md q-mb-md" rounded outlined v-model="newSettingValue"
            label="New Password" :type="isPwd ? 'password' : 'text'" bg-color="surface-variant">
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
        </div>

        <q-separator />
        <q-card-actions align="right">
          <q-btn flat rounded label="Cancel" v-close-popup />
          <q-btn rounded color="primary" @click="updateSetting" padding="5px 25px">Save</q-btn>
          <!-- TODO:for email should be "verify" instead of save and we should have a verifying flow -->
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
          <q-btn flat rounded label="Log out" color="primary" v-close-popup @click="logOut" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { auth } from "../boot/firebaseBoot.js";
import { signOut } from "firebase/auth";
import { useRouter } from 'vue-router'
import { useMomentsStore } from './../stores/moments.js'

const momentsStore = useMomentsStore()

const currentSetting = ref('')
const newSettingValue = ref('')
const oldPassword = ref('')
const isPwdOld = ref(true)
const isPwd = ref(true)

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
    momentsStore.updateUser({ [currentSetting.value]: newSettingValue.value, oldPassword: oldPassword.value })
    editDialogOpen.value = false
  } catch (error) {
    // Handle authentication error
    console.log(error)
  }
}

const router = useRouter()
const logOut = () => {
  signOut(auth).then(() => {
    console.log('logged out')
    setTimeout(() => {
      router.push('/login')
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
