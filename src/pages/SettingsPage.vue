<template>
  <q-page class="q-mx-auto" style="max-width: 600px" padding>
    <q-list padding>
      <q-item-label header>Account details</q-item-label>

      <q-card class="bg-surface q-mb-md q-px-xs q-py-sm rounded-borders-14" flat>
        <q-item clickable v-ripple @click="openEditDialog('displayName')">
          <q-item-section>
            <q-item-label caption>
              Name
            </q-item-label>
            <q-item-label>{{ displayName }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="openEditDialog('email')">
          <q-item-section>
            <q-item-label caption>
              Email
            </q-item-label>
            <q-item-label>{{ email }}</q-item-label>
          </q-item-section>
        </q-item>


        <q-item clickable v-ripple @click="openEditDialog('password')">
          <q-item-section>
            <q-item-label caption>
              Password
            </q-item-label>
            <q-item-label>{{ password }}</q-item-label>
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
        @click="confirmLogout = true">
        <q-item>
          <q-item-section>
            <q-item-label>Log out</q-item-label>
          </q-item-section>
        </q-item>
      </q-card>

      <q-dialog v-model="editDialogOpen" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6" v-if="currentSetting === 'displayName'">Name</div>
            <div class="text-h6" v-else-if="currentSetting === 'email'">Email</div>
            <div class="text-h6" v-else-if="currentSetting === 'password'">Change Password</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-input v-if="currentSetting === 'password'" v-model="oldPassword" label="Old Password" type="password" />
            <!-- bg-color="white" color="white" :label=currentSetting -->
            <q-input class="q-mx-sm q-mb-md" clearable rounded outlined autofocus v-model="newSettingValue"
              :type="currentSetting === 'password' ? 'password' : currentSetting === 'displayName' ? 'text' : 'email'" />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn color="primary" @click="updateSetting">Save</q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>


      <q-dialog v-model="confirmLogout">
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="signal_wifi_off" class="bg-primary text-on-primary" />
            <!-- TODO: remove wifi -->
            <span class="q-ml-sm">Your login details will be deleted once you log out.</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" v-close-popup />
            <q-btn flat label="Log out" color="primary" v-close-popup @click="logOut" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-item>
        <q-item-section>
          <q-item-label>KifKaf version 1.0.0</q-item-label>
        </q-item-section>
      </q-item>

    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth } from "../boot/firebaseBoot.js";
import { signOut } from "firebase/auth";
import { useRouter } from 'vue-router'
import { useMomentsStore } from './../stores/moments.js'

const momentsStore = useMomentsStore()

const user = ref(null)
const displayName = ref("")
const email = ref("")
const password = "*********"
const oldPassword = ref('')


onMounted(async () => {
  user.value = await momentsStore.user;
  displayName.value = user.value.displayName;
  email.value = user.value.email;
})

const currentSetting = ref("")
const newSettingValue = ref("")
const editDialogOpen = ref(false)

const openEditDialog = (setting) => {
  currentSetting.value = setting
  newSettingValue.value = setting === 'password' ? password : user.value[setting]
  editDialogOpen.value = true
}

const reauthenticate = async (password) => {
  const cred = firebase.auth.EmailAuthProvider.credential(user.value.email, password)
  return user.value.reauthenticateWithCredential(cred)
}

const updateSetting = async () => {
  if (currentSetting.value === 'password') {
    try {
      await reauthenticate(oldPassword.value)
      await userStore.updateUser({ [currentSetting.value]: newSettingValue.value })
      dialogOpen.value = false
      oldPassword.value = ''
    } catch (error) {
      // Handle authentication error
      console.log(error)
    }
  } else {
    await userStore.updateUser({ [currentSetting.value]: newSettingValue.value })
    editDialogOpen.value = false
  }
}

const router = useRouter()
const confirmLogout = ref(false)
const logOut = () => {
  signOut(auth).then(() => {
    console.log('logged out')
    setTimeout(() => {
      router.push('/login')
    }, 10)
  }).catch((error) => {
    console.log("Error logging out", error);
  });
  confirmLogout.value = false
}

</script>

<style lang="scss"></style>
