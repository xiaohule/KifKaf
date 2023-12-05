<!-- src/pages/PrivacyPolicy.vue -->
<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">
    <div class="text-h4 text-weight-bold q-mx-none q-mb-sm">Contact us</div>

    <q-card class="bg-surface q-pa-md rounded-borders-14" flat>
      <q-card-section class="q-py-xs">
        <p>
          It's our #1 priority to provide you with the smoothest possible experience. <br />
          Feedback, feature requests, and
          bug reports are always very welcome.
        </p>
        <p>
          Whatever you need, just write us in the form below or email us at:
        </p>
        <div class="bg-surface-variant rounded-borders-14 q-pa-sm q-mb-md text-center text-subtitle1">
          <a href="mailto:hello@kifkaf.app" target="_top">hello@kifkaf.app</a>
        </div>
      </q-card-section>

      <q-separator />

      <!-- TODO:2 add name and email and possibility to edit them -->
      <q-card-section class="q-pb-none">
        <q-input v-if="!(momentsStore?.user?.email)" v-model="emailAddress" class="q-mx-sm" color="transparent" rounded
          outlined type="text" bg-color="surface-variant" placeholder="Your email address" lazy-rules
          :rules="emailRules" />
        <q-input v-model="contactUsMessage" class="q-mx-sm" color="transparent" rounded outlined type="textarea" rows="5"
          bg-color="surface-variant" placeholder="Your message" lazy-rules :rules="messageRules" />
      </q-card-section>
      <q-card-actions align="right">
        <!-- <q-btn flat rounded label="Cancel" @click="contactUsMessage = ''" /> -->
        <q-btn rounded label="Send" color="primary" @click="sendContactUsMessage" padding="5px 25px" :loading="loading"
          :disable="!((momentsStore?.user?.email || (emailAddress && emailAddress.length > 0)) && contactUsMessage && contactUsMessage.length > 0)" />
      </q-card-actions>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useMomentsStore } from './../stores/moments.js'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const momentsStore = useMomentsStore()

onMounted(async () => {
  try {
    if (!momentsStore.userFetched) {
      await momentsStore.fetchUser();
    }
  } catch (error) {
    console.error('In contactUsPage fetchUser error:', error);
  }
})

const emailAddress = ref('')
const contactUsMessage = ref('')
const loading = ref(false)

const emailRules = [
  val => (val && val.length > 0) || 'Please type your email address',
  val => /.+@.+\..+/.test(val) || 'E-mail must be valid',
]

const messageRules = [
  val => (val && val.length > 0) || 'Please type your message'
]

const sendContactUsMessage = async () => {
  // Here you can send the message to your backend
  loading.value = true
  const senderEmail = momentsStore?.user?.email ? momentsStore.user.email : emailAddress.value
  const senderName = momentsStore?.user?.displayName ? momentsStore.user.displayName : "Unknown"
  try {
    const axiosModule = await import('axios');
    const axios = axiosModule.default;
    await axios.post('https://us-central1-kifkaf-d4850.cloudfunctions.net/sendEmail', {
      senderEmail: senderEmail,
      message: "Message sent by user " + senderName + "(" + senderEmail + ") : " + contactUsMessage.value
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    router.go(-1)
    contactUsMessage.value = ''
    $q.notify({
      icon: 'done',
      message: 'Message sent to KifKaf team. Thank you!'
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      icon: 'error',
      color: 'negative',
      message: error.message
    })
  }
  loading.value = false
}
</script>

<style lang="scss"></style>
