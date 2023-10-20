<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px;">
    <!-- <q-list> -->
    <q-item-label class="text-body1 text-weight-medium q-my-sm">Log a new Moment</q-item-label>
    <!-- TODO:2 welcome user -->
    <!-- <template>
      <p v-if="user">Hello {{ user.providerData.displayName }}</p>
    </template> -->
    <!-- <Vue3Lottie :animationData="AstronautJSON" :height="200" :width="200" /> -->
    <!-- <Vue3Lottie animation-link="https://lottie.host/ce7c97f6-e0ea-4ea6-b8c6-50d28928f288/jjsUvZSbD1.json" :height="200"
      :width="200" :scale="2" /> -->

    <q-card class="bg-surface q-mb-lg q-px-none q-py-sm rounded-borders-14" flat>
      <!-- // TODO:1 make the btn align with the end of the text area when it grows -->
      <!-- TODO:3 add a signal that speech recognition is on -->
      <q-input data-cy="new-moment-textarea" ref="newMomInputRef" v-model="newMomText" :shadow-text="inputShadowText"
        lazy-rules="ondemand" :rules="newMomRules" @blur="inputBlurred" class="q-ma-md q-pb-none text-body1" type="text"
        autogrow rounded outlined bg-color="surface-variant" color="transparent" :placeholder="placeholderText">
        <template v-slot:append>
          <q-btn v-if="showSpeechRecognitionButton && !isRecognizing" color="primary" flat dense round icon="mic"
            @click="toggleSpeech" />
          <q-btn v-else-if="showSpeechRecognitionButton && isRecognizing" color="primary" dense round icon="stop"
            class="pulse-animation" @click="toggleSpeech" />
        </template>
        <template v-slot:after>
          <q-btn v-if="newMomText.length !== 0 && !isRecognizing" @click="onSubmit" round dense unelevated color="primary"
            icon="arrow_forward" />
          <q-btn v-else round dense unelevated color="primary" disable icon="arrow_forward" />
        </template>
      </q-input>
    </q-card>

    <div v-if="!momentsStore || !momentsStore.uniqueDays || momentsStore.uniqueDays.length == 0"></div>
    <div v-else>
      <q-list>
        <div v-for="day in momentsStore.uniqueDays" :key="day">
          <q-item-label header class="text-body1 text-weight-medium text-on-background q-pa-none q-mt-lg q-mb-sm">{{
            momentsStore.getFormattedDate(day) }}</q-item-label>

          <q-item class="bg-surface q-mb-md q-px-none q-py-none rounded-borders-14">
            <q-list full-width style="width: 100%;">
              <q-item v-for="moment in getSortedMomentsOfTheDay(day)" :key="moment.id" clickable v-ripple
                class="q-px-none q-py-md" style="min-height: 0px;" @click="openBottomSheet(moment.id)">

                <q-item-section avatar top class="q-px-none" style="min-width: 20px;">
                  <moment-sync-icon :moment-id="moment.id" :expected-llm-call-duration="expectedLlmCallDuration" />
                </q-item-section>
                <q-item-section class=" q-pb-none q-pl-none q-pr-md">{{ moment.text
                }}</q-item-section>
              </q-item>

            </q-list>
          </q-item>
        </div>
      </q-list>
      <moment-bottom-sheet v-model="momPageOpened" :moment-id="bottomSheetMomentId"
        :expected-llm-call-duration="expectedLlmCallDuration" />
    </div>
    <q-dialog v-model="errorDialogOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background q-pa-lg text-center" flat>
        <q-icon name="error_outline" size="10vh" color="error" class="q-py-md" />
        <q-card-section class="text-h6 text-weight-medium q-py-md text-left	">
          <div v-html="errorDialogText"></div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onDeactivated, onBeforeUnmount, computed, onActivated, watch } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { Timestamp } from 'firebase/firestore'
import { date } from "quasar";
const { formatDate } = date; // destructuring to keep only what is needed in date
import { showSpeechRecognitionButton, isRecognizing, webRecognitionInstance, useSpeechRecognition } from '../composables/speechRecognition.js' // TODO:2 make this dynamic imports?
import momentSyncIcon from 'src/components/momentSyncIcon.vue';
import momentBottomSheet from 'src/components/momentBottomSheet.vue'
// import { Vue3Lottie } from 'vue3-lottie'
// import AstronautJSON from './astronaut.json'

//STORE INITIALIZATION
const momentsStore = useMomentsStore()
// Using await with fetchMoments ensures the function completes its execution before the component is mounted, which can be useful if your component relies on the data fetched by fetchMoments to render correctly.
onMounted(async () => {
  try {
    if (!momentsStore.momentsFetched) {
      await momentsStore.fetchMoments();
    }
  } catch (error) {
    console.error('await momentsStore.fetchMoments() error:', error);
  }
})

onActivated(() => {
  if (newMomInputRef.value && newMomText.value.length > 0) newMomInputRef.value.focus()
})

onDeactivated(() => {
  // console.log('HomeTab onDeactivate recog fired');
  if (webRecognitionInstance) {
    webRecognitionInstance.stop();
    isRecognizing.value = false;
  }
})
onBeforeUnmount(() => {
  // console.log('onBeforeUnmount recog fired');
  if (webRecognitionInstance) {
    webRecognitionInstance.stop();
    isRecognizing.value = false;
  }
})

const errorDialogOpened = ref(false)
const errorDialogText = ref('')
const placeholderText = 'Feeling...'
const newMomInputRef = ref(null)
const newMomText = ref('')
const newMomDate = ref(null)

const expectedLlmCallDuration = ref(60);
const momPageOpened = ref(false)
const bottomSheetMomentId = ref("")
const openBottomSheet = (momentId) => {
  console.log('in openBottomSheet momentId:', momentId)
  bottomSheetMomentId.value = momentId
  momPageOpened.value = true
}

// INPUT
const inputBlurred = () => {
  newMomInputRef.value.resetValidation()
}
const inputShadowText = computed(() => {
  if (newMomText.value.length === 0) {
    return placeholderText
  }
  else if (placeholderText.indexOf(newMomText.value) !== 0) {
    return ''
  }
  return placeholderText
    .split(newMomText.value)
    .slice(1)
    .join(newMomText.value)
})
const regex = /^(?=(?:[^A-Za-z0-9]*[A-Za-z0-9]){4})/;
const newMomRules = [
  val => (val && val.length > 0) || "That's short 😊, can you add more details?",
  val => (val && val.length < 1000) || "Whoa! 😄 That's a lot to take in. Can you split it into two moments?",
  val => (val && (val.split(/\s+/).filter(word => word.length > 0)).length >= 4) || "That's short 😊, can you add more details?",
  //ensure text is not fully non-alphanumeric
  val => (val && regex.test(val)) || "Oops! 😅 Got a bit lost there. Can you rephrase that for me?",
]//TODO:3 check what happen when quote char is used

//SPEECH RECOGNITION
let toggleSpeech
onMounted(async () => {
  const { toggleSpeechRecognition } = await useSpeechRecognition(newMomText, errorDialogOpened, errorDialogText);
  toggleSpeech = async () => {
    console.log('toggleSpeech fired');
    try {
      await toggleSpeechRecognition();
    } catch (error) {
      console.error('Error toggling speech recognition:', error);
    }
  }
});

//focus on textarea when speech recognition is turned off
watch(isRecognizing, (val) => {
  if (!val) newMomInputRef.value.$el.querySelector('textarea').select();
})

// ADD MOMENT
const onSubmit = (event) => {
  event.preventDefault()
  newMomInputRef.value.validate()
  if (newMomInputRef.value.hasError) {
    newMomInputRef.value.focus()
    return
  }
  newMomDate.value = Timestamp.now()
  momentsStore.addMoment({
    date: newMomDate.value,
    text: newMomText.value.trim(),
  })
  newMomText.value = ''
  newMomDate.value = null
}

// DISPLAY PREVIOUS MOMENTS
const getSortedMomentsOfTheDay = (day) => { //TODO:2 this should be in momentssStore directly
  const dayDate = (new Timestamp(day, 0)).toDate()
  const ul = momentsStore?.momentsColl?.filter(moment => date.isSameDate(moment.date.toDate(), dayDate, "day"))
  // sort array ul per descending moments.value.date.seconds
  const ol = ul?.sort((a, b) => b.date.seconds - a.date.seconds);
  return ol;
}
</script>

<style lang="scss">
.q-field__append.q-field__marginal.row.no-wrap.items-center.q-anchor--skip {
  display: none;
}

.q-textarea .q-field__native {
  padding: 16px 0px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
}

.pulse-animation {
  animation: pulse 1.3s infinite;
}
</style>



