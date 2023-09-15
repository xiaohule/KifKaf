<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px;">
    <!-- <q-list> -->
    <q-item-label class="text-body1 text-weight-medium q-my-sm">Add a new Moment</q-item-label>
    <!-- TODO:2 welcome user -->
    <!-- <template>
      <p v-if="user">Hello {{ user.providerData.displayName }}</p>
    </template> -->

    <!-- <Vue3Lottie :animationData="AstronautJSON" :height="200" :width="200" /> -->
    <!-- <Vue3Lottie animation-link="https://lottie.host/ce7c97f6-e0ea-4ea6-b8c6-50d28928f288/jjsUvZSbD1.json" :height="200"
      :width="200" :scale="2" /> -->

    <q-card class="bg-surface q-mb-xl q-px-none q-py-sm rounded-borders-14" flat>
      <!-- // TODO:1 make the btn align with the end of the text area when it grows -->
      <!-- TODO:3 add a signal that speech recognition is on -->
      <q-input data-cy="new-moment-textarea" ref="newMomInputRef" v-model="newMomText" :shadow-text="inputShadowText"
        lazy-rules="ondemand" :rules="newMomRules" @blur="inputBlurred" class="q-ma-md q-pb-none text-body1" type="text"
        autogrow rounded outlined bg-color="surface-variant" color="transparent">
        <template v-slot:append>
          <q-btn v-if="showSpeechRecognitionButton && !isRecognizing" color="primary" flat dense round icon="mic"
            @click="toggleSpeechRecognition" />
          <q-btn v-else-if="showSpeechRecognitionButton && isRecognizing" color="primary" dense round icon="stop"
            class="pulse-animation" @click="toggleSpeechRecognition" />
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
          <q-item-label header class="text-body1 text-weight-medium text-on-background q-pa-none q-mt-lg q-mb-sm">{{ day
          }}</q-item-label>

          <q-item class="bg-surface q-mb-md q-px-none q-py-sm rounded-borders-14">
            <q-list>
              <q-item v-for="moment in getSortedMomentsOfTheDay(day)" :key="moment.id" clickable v-ripple
                class="q-px-none q-py-md" style="min-height: 0px;">

                <q-item-section avatar top class="q-px-none" style="min-width: 20px;">
                  <q-icon v-if="moment.needsSatisAndImp && Object.keys(moment.needsSatisAndImp).length > 0" size="20px"
                    color="primary" name="check_circle" class="q-mx-md" />
                  <!-- display stateful-circular-progress only if moment.date is less than expectedLlmCallDuration seconds ago -->
                  <stateful-circular-progress :expected-duration="expectedLlmCallDuration"
                    v-else-if="moment.date.seconds && moment.date.seconds > (currentTime - expectedLlmCallDuration)" />
                  <q-icon v-else size="20px" color="error-dark" name="error" class="q-mx-md" />
                </q-item-section>
                <q-item-section class=" q-pb-none q-pl-none q-pr-md" dense>{{ moment.text
                }}</q-item-section>

                <!-- <q-card-section
                    v-if="moment.needsSatisAndImp && (moment.needsSatisAndImp.error || moment.needsSatisAndImp.oops)"
                    class="q-px-none q-py-xs" style="min-height: 0px;"> -->
                <!-- add the "+" for manually adding needs -->
                <!-- </q-card-section>
                  <q-card-section v-else-if="moment.needsSatisAndImp && Object.keys(moment.needsSatisAndImp).length > 0"
                    class="q-px-none q-py-xs chip-container" style="min-height: 0px;">
                    <div class="horizontal-scroll" :style="setChipsRowPadding(moment.id)"
                      @scroll="onChipsRowScroll($event, moment.id)"> -->
                <!-- removable v-model="vanilla" text-color="white" :title="vanillaLabel" -->
                <!-- <q-chip v-for="need in Object.entries(moment.needsSatisAndImp).sort(([, a], [, b]) => b[1] - a[1])"
                        :key="need[0]" outline :color="getChipColor(need[1])" :icon="momentsStore.needsMap[need[0]]"
                        :label="need[0]" class="needs" />
                    </div>
                  </q-card-section>

                  <q-card-section v-else-if="!moment.hideSpinner" class="q-px-none q-py-xs text-center"
                    style="min-height: 0px;">
                    <q-spinner-dots color="" size="2em" />
                  </q-card-section> -->
              </q-item>

            </q-list>
          </q-item>
        </div>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onDeactivated, onBeforeUnmount, computed, onActivated, watch } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { Timestamp } from 'firebase/firestore'
import { date } from "quasar";
const { formatDate } = date; // destructuring to keep only what is needed in date
import { isRecognizing, recognition, useSpeechRecognition } from '../composables/speechRecognition.js' // TODO:2 make this dynamic imports?
import statefulCircularProgress from 'src/components/statefulCircularProgress.vue';
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
    await momentsStore.emptyNeedsMomentsRetry();
  } catch (error) {
    console.error('await momentsStore.fetchMoments() error:', error);
  }
})

onMounted(() => {
  // Update the currentTime every second
  timeInterval = setInterval(() => {
    currentTime.value = Timestamp.now().seconds;
  }, 1000);
})

onActivated(() => {
  if (newMomInputRef.value && newMomText.value.length > 0) newMomInputRef.value.focus()
  momsWithScrolledNeeds.value = {};
})

onDeactivated(() => {
  // console.log('HomeTab onDeactivate recog fired');
  if (recognition) {
    recognition.stop();
    isRecognizing.value = false;
  }
})
onBeforeUnmount(() => {
  // console.log('onBeforeUnmount recog fired');
  if (recognition) {
    recognition.stop();
    isRecognizing.value = false;
  }
  clearInterval(timeInterval);
})

const placeholderText = 'Feeling...when/at/to...bec...'
const newMomInputRef = ref(null)
const newMomText = ref('')
const newMomDate = ref(null)
const momsWithScrolledNeeds = ref({}); // This object will store scrollLeft values for each moment
const expectedLlmCallDuration = ref(40);
const currentTime = ref(Timestamp.now().seconds);
let timeInterval;

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
const {
  showSpeechRecognitionButton,
  toggleSpeechRecognition,
} = useSpeechRecognition(newMomText)
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
const formatLikeUniqueDays = (moment) => {
  const ts = new Timestamp(moment.date.seconds, moment.date.nanoseconds);
  const dt = ts.toDate();
  dt.setHours(0, 0, 0, 0);
  dt.getTime();
  return date.formatDate(dt, "MMMM D, YYYY")
};

const getSortedMomentsOfTheDay = (day) => { //TODO:2 this should be in momentssStore directly
  const ul = momentsStore?.momentsColl?.value?.filter(m => formatLikeUniqueDays(m) == day)
  // sort array ul per descending moments.value.date.seconds
  const ol = ul?.sort((a, b) => b.date.seconds - a.date.seconds);
  return ol;
}

// DISPLAY PREVIOUS MOMENTS NEEDS
const getChipColor = (needsStats) => {
  if (needsStats[0] < 0.4) return 'red'
  else if (needsStats[0] > 0.6) return 'green'
  else return 'primary'
}
const onChipsRowScroll = (event, id) => {
  momsWithScrolledNeeds.value[id] = event.target.scrollLeft;
};
const setChipsRowPadding = (id) => {
  // If the scrollLeft value for the given ID is 0 or undefined, return the desired padding. Otherwise, no padding.
  return momsWithScrolledNeeds.value[id] ? 'padding-left: 0;' : 'padding-left: 16px;';
};


</script>

<style lang="scss">
.needs {
  font-size: 0.8rem;
  // max-width: 200px; //truncate
}

/* Hide scrollbar for IE, Edge, and Firefox */
.chip-container {
  scrollbar-width: none;
  /* For Firefox */
  -ms-overflow-style: none;
  /* For Internet Explorer and Edge */
}

.horizontal-scroll {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  transition: padding-left 0.1s ease;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
}

.q-chip__icon {
  margin-bottom: 1.5px;
}

.q-field--outlined .q-field__control:before {
  border: none;
}

.horizontal-scroll .q-chip:first-child {
  margin-left: 0;
}

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
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.pulse-animation {
  animation: pulse 1s infinite;
}
</style>



