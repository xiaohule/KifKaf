<template>
  <q-page class="q-mx-auto" style="max-width: 600px" padding>
    <q-list padding>
      <q-item-label header>Account details</q-item-label>

      <q-card class="bg-white q-mb-md q-px-xs q-py-sm rounded-borders-14" flat>
        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label caption>
              Name
            </q-item-label>
            <q-item-label>Jules Douet</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label caption>
              Email
            </q-item-label>
            <q-item-label>jules.douet@gmail.com</q-item-label>
          </q-item-section>
        </q-item>


        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label caption>
              Password
            </q-item-label>
            <q-item-label>*******</q-item-label>
          </q-item-section>
        </q-item>
      </q-card>

      <q-card class="bg-white q-mb-md q-px-xs q-py-sm rounded-borders-14" flat>
        <q-item clickable v-ripple>
          <q-item-section>

            <q-item-label>Language</q-item-label>
            <q-item-label caption>
              English
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-card>

      <q-card class="bg-white q-mb-md q-px-xs q-py-sm rounded-borders-14" flat>
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

      <q-card class="bg-white q-mb-md q-px-xs q-py-sm rounded-borders-14" flat>
        <q-item clickable v-ripple @click="confirm = true">
          <q-item-section>
            <q-item-label>Log out</q-item-label>
          </q-item-section>
        </q-item>
      </q-card>

      <q-dialog v-model="confirm">
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="signal_wifi_off" color="primary" text-color="white" />
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

      <!-- <q-item-label header>General</q-item-label>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="check1" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Notifications</q-item-label>
          <q-item-label caption>
            Notify me about updates to apps or games that I downloaded
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="check2" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Sound</q-item-label>
          <q-item-label caption>
            Auto-update apps at anytime. Data charges may apply
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="check3" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Auto-add widgets</q-item-label>
          <q-item-label caption>
            Automatically add home screen widgets
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced />
      <q-item-label header>Notifications</q-item-label>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Battery too low</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle color="blue" v-model="notif1" val="battery" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Friend request</q-item-label>
          <q-item-label caption>Allow notification</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-toggle color="green" v-model="notif2" val="friend" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Picture uploaded</q-item-label>
          <q-item-label caption>Allow notification when uploading images</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-toggle color="red" v-model="notif3" val="picture" />
        </q-item-section>
      </q-item>

      <q-separator spaced />
      <q-item-label header>Other settings</q-item-label>

      <q-item>
        <q-item-section side>
          <q-icon color="teal" name="volume_down" />
        </q-item-section>
        <q-item-section>
          <q-slider v-model="volume" :min="0" :max="10" label color="teal" />
        </q-item-section>
        <q-item-section side>
          <q-icon color="teal" name="volume_up" />
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section side>
          <q-icon color="deep-orange" name="brightness_medium" />
        </q-item-section>
        <q-item-section>
          <q-slider v-model="brightness" :min="0" :max="10" label color="deep-orange" />
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section side>
          <q-icon color="primary" name="mic" />
        </q-item-section>
        <q-item-section>
          <q-slider v-model="mic" :min="0" :max="50" label />
        </q-item-section>
      </q-item> -->
    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from "../boot/firebaseBoot.js";
import { signOut } from "firebase/auth";
import { useRouter } from 'vue-router'

const router = useRouter()
const confirm = ref(false)
const logOut = () => {
  // confirm.value = false
  signOut(auth).then(() => {
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });
  setTimeout(() => {
    router.push('/login')
  }, 10)
}

</script>

<style lang="scss"></style>
