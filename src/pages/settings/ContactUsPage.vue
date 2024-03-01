<!-- src/pages/settings/ContactUsPage.vue -->
<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">
    <div class="text-h4 text-weight-bold q-mx-none q-mb-sm">{{ t('contactUs') }}</div>

    <q-card class="bg-transparent q-pt-sm" flat>
      <q-card-section class="q-px-sm q-py-sm">
        <div v-html="t('contactUsHtml1')"></div>
        <div> {{ t('contactUs2') }} <a href='mailto:hello@kifkaf.app' class='text-primary'
            style='text-decoration: none'>hello@kifkaf.app</a>.</div>
      </q-card-section>

      <!-- TODO:2 add name and email and possibility to edit them even in signed up case -->
      <q-card-section class="q-px-sm q-pt-xs q-pb-none">
        <q-input v-if="!(ms?.user?.email)" ref="emailInputRef" v-model="emailAddress" color="transparent" rounded outlined
          type="text" bg-color="surface-variant" :placeholder="t('yourEmail')" lazy-rules :rules="emailRules" />
        <q-input v-model="contactUsMessage" color="transparent" rounded outlined type="textarea" rows="10"
          bg-color="surface-variant" :placeholder="t('yourMessage')" lazy-rules :rules="messageRules" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn rounded :label="t('send')" color="primary" @click="sendContactUsMessage" class="full-width" padding="md"
          :loading="loading"
          :disable="!((ms?.user?.email || (emailAddress && emailAddress.length > 0)) && contactUsMessage && contactUsMessage.length > 0)"
          no-caps />
      </q-card-actions>

      <q-card-section class="q-px-sm q-py-none text-caption text-outline text-center">{{ t('weUsuallyReply') }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useMomentsStore } from 'src/stores/moments.js'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  onRetry: (retryCount, error, requestConfig) => {
    console.log(
      "In axiosRetry, retrying with retryCount:",
      retryCount,
      "err:",
      error,
      "requestConfig.url:",
      requestConfig.url,
      "requestConfig.data:",
      requestConfig.data,
    );
  },
});

const $q = useQuasar()
const ms = useMomentsStore()
const { t } = useI18n()
const router = useRouter()

onMounted(async () => {
  try {
    if (!ms.userFetched) {
      await ms.fetchUser();
    }
  } catch (error) {
    console.error('In contactUsPage fetchUser error:', error);
  }
})

const emailInputRef = ref(null)
const emailAddress = ref('')
const contactUsMessage = ref('')
const loading = ref(false)

const emailRules = [
  val => (val && val.length > 0) || t('pleaseTypeEmail'),
  val => /.+@.+\..+/.test(val) || t('emailMustBeValid'),
]

const messageRules = [
  val => (val && val.length > 0) || t('pleaseTypeYourMessage')
]

const sendContactUsMessage = async (event) => {
  event.preventDefault()
  if (!ms?.user?.email) {
    emailInputRef.value.validate()
    if (emailInputRef.value.hasError) {
      emailInputRef.value.focus()
      return
    }
  }

  // Here you can send the message to your backend
  loading.value = true
  const senderEmail = ms?.user?.email ? ms.user.email : emailAddress.value
  const senderName = ms?.user?.displayName ? ms.user.displayName : "Unknown"
  try {
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
      message: t('messageSent')
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
