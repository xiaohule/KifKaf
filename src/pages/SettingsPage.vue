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

      <q-item>
        <q-item-section>
          <q-item-label>KifKaf version 1.0.0</q-item-label>
        </q-item-section>
      </q-item>

    </q-list>

    <!--TODO: class="bg-surface q-mb-md q-px-xs q-py-sm rounded-borders-14" flat>  @show="focusFirstInput" -->
    <q-dialog v-model="editDialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6" v-if="currentSetting === 'displayName'">Change name</div>
          <div class="text-h6" v-else-if="currentSetting === 'email'">Change email</div>
          <div class="text-h6" v-else-if="currentSetting === 'password'">Change Password</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input v-if="currentSetting === 'password' || 'email'" ref="oldPwdInput" class="q-mx-sm q-mb-md" clearable
            rounded outlined v-model="oldPassword" label="Current Password" type="password" bg-color="surface-variant" />
          <!-- bg-color="white" color="white" :label=currentSetting -->
          <q-input ref="mainInput" class="q-mx-sm q-mb-md" clearable rounded outlined v-model="newSettingValue"
            :type="currentSetting === 'password' ? 'password' : currentSetting === 'displayName' ? 'text' : 'email'"
            bg-color="surface-variant" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat rounded label="Cancel" v-close-popup />
          <q-btn rounded color="primary" @click="updateSetting" padding="5px 25px">Save</q-btn>
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


  </q-page>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { auth } from "../boot/firebaseBoot.js";
import { signOut } from "firebase/auth";
import { useRouter } from 'vue-router'
import { useMomentsStore } from './../stores/moments.js'

const momentsStore = useMomentsStore()
const password = "*********"
const oldPassword = ref('')

const currentSetting = ref("")
const newSettingValue = ref("")
const editDialogOpen = ref(false)
const oldPwdInput = ref(null)
const mainInput = ref(null)

const openEditDialog = (setting) => {
  currentSetting.value = setting
  newSettingValue.value = setting === 'password' ? password : momentsStore.user[setting]
  editDialogOpen.value = true
  nextTick(() => {
    if (setting === 'password') oldPwdInput.value.$el.querySelector('input').focus();
    else mainInput.value.$el.querySelector('input').focus();
  })
}

const updateSetting = async () => {
  try {
    momentsStore.updateUser({ [currentSetting.value]: newSettingValue.value, oldPassword: oldPassword.value })
    editDialogOpen.value = false
    oldPassword.value = ''
  } catch (error) {
    // Handle authentication error
    console.log(error)
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
