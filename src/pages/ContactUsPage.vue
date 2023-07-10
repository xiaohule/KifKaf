<!-- src/pages/PrivacyPolicy.vue -->
<template>
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">
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
        <div class="bg-background rounded-borders-14 q-pa-sm q-mb-md text-center text-subtitle1">
          <a href="mailto:hello@kifkaf.app" target="_top">hello@kifkaf.app</a>
        </div>
      </q-card-section>

      <q-separator />

      <!-- TODO:1 add name and email and possibility to edit them -->
      <q-card-section class="q-pb-none">
        <q-input v-model="contactUsMessage" class="q-mx-sm" rounded outlined type="textarea" rows="5"
          bg-color="surface-variant" label="Your message" lazy-rules :rules="messageRules" />
      </q-card-section>
      <q-card-actions align="right">
        <!-- <q-btn flat rounded label="Cancel" @click="contactUsMessage = ''" /> -->
        <q-btn rounded label="Send" color="primary" @click="sendContactUsMessage" padding="5px 25px" :loading="loading"
          :disable="!(contactUsMessage && contactUsMessage.length > 0)" />
      </q-card-actions>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useMomentsStore } from './../stores/moments.js'

const $q = useQuasar()
const momentsStore = useMomentsStore()

const contactUsMessage = ref('')
const loading = ref(false)

const messageRules = [
  val => (val && val.length > 0) || 'Please type your message'
]

const sendContactUsMessage = async () => {
  // Here you can send the message to your backend
  loading.value = true
  try {
    const axiosModule = await import('axios');
    const axios = axiosModule.default;
    await axios.post('https://us-central1-kifkaf-d4850.cloudfunctions.net/sendEmail', {
      senderEmail: momentsStore.user.email,
      message: "Message sent by user " + momentsStore.user.displayName + "(" + momentsStore.user.email + ") : " + contactUsMessage.value
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    contactUsMessage.value = ''
    $q.notify({
      icon: 'done',
      color: 'positive',
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
