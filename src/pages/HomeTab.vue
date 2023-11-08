<template >
  <q-page class="q-mx-auto q-pa-none" style="max-width: 600px;">
    <q-parallax style="height: 60vh; margin-top: -100px;" :speed="0.5">
      <template v-slot:media>
        <img src="~assets/home-background-1-tinified.png">
      </template>
      <!-- <template v-slot:content="scope"> -->
      <!-- <div class="absolute column items-center" :style="{
          opacity: 0.45 + (1 - scope.percentScrolled) * 0.55,
          top: (scope.percentScrolled * 60) + '%',
          left: 0,
          right: 0
        }"> -->
      <template v-slot:content>

        <!-- margin-top: 100px; -->
        <div style="width: 100%; margin-top: 100px; ">
          <q-item-label class="text-h5 text-weight-medium text-on-primary q-px-md q-mt-lg text-center">{{ greeting }}{{
            userFirstName }}</q-item-label>
          <q-item-label class="text-h6 text-on-primary q-px-md q-pt-xl">Got a feeling?</q-item-label>
          <!-- <Vue3Lottie :animationData="AstronautJSON" :height="200" :width="200" /> -->
          <!-- <Vue3Lottie animation-link="https://lottie.host/ce7c97f6-e0ea-4ea6-b8c6-50d28928f288/jjsUvZSbD1.json" :height="200"
      :width="200" :scale="2" /> -->

          <!-- // TODO:1 make the btn align with the end of the text area when it grows -->
          <q-input data-cy="new-moment-textarea" ref="newMomInputRef" v-model="newMomText" :shadow-text="inputShadowText"
            lazy-rules="ondemand" :rules="newMomRules" @blur="inputBlurred" class="text-body1 q-pa-md" type="text"
            autogrow rounded outlined bg-color="surface" color="transparent" :placeholder="placeholderText"
            input-class="new-moment-input">
            <template v-slot:append>
              <q-btn v-if="showSpeechRecognitionButton && !isRecognizing" color="primary" flat dense round icon="mic"
                size="17px" @click="toggleSpeech" />
              <q-btn v-else-if="showSpeechRecognitionButton && isRecognizing" color="primary" dense round icon="stop"
                size="17px" class="pulse-animation" @click="toggleSpeech" />
            </template>
            <template v-slot:after>
              <q-btn v-if="newMomText.length !== 0 && !isRecognizing" @click="onSubmit" round dense color="surface"
                text-color="primary" icon="r_arrow_forward" size="20px" padding="xs" />
              <q-btn v-else round dense unelevated color="surface" text-color="primary" disable icon="r_arrow_forward"
                size="20px" padding="sm" />
            </template>
          </q-input>
        </div>
      </template>

    </q-parallax>

    <div v-if="!momentsStore || !momentsStore.uniqueDays || momentsStore.uniqueDays.length == 0"></div>
    <div v-else class="q-px-md">
      <q-list>
        <div v-for="(day, index) in momentsStore.uniqueDays" :key="day">
          <q-item-label :class="[
            'text-body1',
            'text-weight-medium',
            'q-pa-none',
            'q-mb-sm',
            { 'q-mt-lg': index !== 0, 'negative-margin-first-item': index === 0 },
            { 'text-on-background': index !== 0, 'text-on-primary': index === 0 }
          ]" header>{{
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
import { showSpeechRecognitionButton, isRecognizing, useSpeechRecognition } from '../composables/speechRecognition.js'
import momentSyncIcon from 'src/components/momentSyncIcon.vue';
import momentBottomSheet from 'src/components/momentBottomSheet.vue'
// import { Vue3Lottie } from 'vue3-lottie'
// import AstronautJSON from './astronaut.json'
import { date } from 'quasar'
const { isSameDate } = date;

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

const errorDialogOpened = ref(false)
const errorDialogText = ref('')
const placeholderText = 'Feeling ... because ...'
const newMomInputRef = ref(null)
const newMomText = ref('')
const newMomDate = ref(null)
const userFirstName = computed(() => {
  if (momentsStore?.user?.displayName) {
    const firstName = momentsStore.user.displayName.split(' ')[0];
    let capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    return ", " + capitalizedFirstName;
  }
  return ''
})
const greeting = computed(() => {
  // Get the current hour using the Date object
  const hour = new Date().getHours()
  // Determine the greeting based on the hour
  if (hour < 12) {
    return 'Good Morning'
  } else if (hour >= 12 && hour <= 17) {
    return 'Good Afternoon'
  } else {
    return 'Good Evening'
  }
})

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
]

//SPEECH RECOGNITION
let toggleSpeech, stopSpeech
onMounted(async () => {
  const result = await useSpeechRecognition(newMomText, errorDialogOpened, errorDialogText);
  toggleSpeech = result.toggleSpeechRecognition;
  stopSpeech = result.stopSpeechRecognition;
});


//focus on textarea when speech recognition is turned off
watch(isRecognizing, (val) => {
  if (!val) newMomInputRef.value.$el.querySelector('textarea').select();
})

onDeactivated(async () => {
  console.log('HomeTab onDeactivate fired');
  if (isRecognizing.value) {
    await stopSpeech();
  }
})
onBeforeUnmount(async () => {
  console.log('onBeforeUnmount fired');
  if (isRecognizing.value) {
    await stopSpeech();
  }
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
const getSortedMomentsOfTheDay = (day) => { //TODO:1 this should be in momentssStore directly
  const dayDate = (new Timestamp(day, 0)).toDate()
  const ul = momentsStore?.momentsColl?.filter(moment => isSameDate(moment.date.toDate(), dayDate, "day"))
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

.negative-margin-first-item {
  margin-top: -7vh !important; // Use !important to override any existing margins if necessary.
  position: relative; // This gives the element a positioning context.
  z-index: 10; // Adjust the z-index so it is higher than the q-parallax's z-index.
}

// .white-blurred {
//   background: rgba(255, 255, 255, 0.33);
//   backdrop-filter: blur(10px);
// }

// div.q-field__control {
//   padding: 0 0px 0px 12px;
//   // background: rgba(255, 255, 255, 0.83);
//   // backdrop-filter: blur(1px);
// }

.q-field--outlined .q-field__control {
  padding: 0 6px 0px 12px;
}

.q-parallax__content {
  justify-content: flex-start;
}

.new-moment-input {
  max-height: 20vh;
  overflow-y: auto;
}
</style>



