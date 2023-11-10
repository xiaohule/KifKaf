<template >
  <q-page class="q-mx-auto q-pa-none" style="max-width: 600px;">
    <q-parallax style="height: 60vh; max-height:600px; margin-top: -100px;" :speed="0.5">
      <template v-slot:media>
        <img src="~assets/home-background-1-tinified.png">
        <!-- trop dark mais pas mal-->
        <!-- <img src="~assets/ink.png"> -->
        <!-- pas mal -->
        <!-- <img src="~assets/pexels-brakou-abdelghani-1723637.png"> -->
        <!-- pas mal -->
        <!-- <img src="~assets/pexels-brakou-abdelghani-11723637.png"> -->

        <!-- trop froid -->
        <!-- <img src="~assets/luke-chesser-3rWagdKBF7U-unsplash.png"> -->
        <!-- pas mal à réorienter -->
        <!-- <img src="~assets/luke-chesser-eICUFSeirc0-unsplash.png"> -->

        <!-- <img src="~assets/home2.png"> -->
        <!-- <img src="~assets/basicGradient.png"> -->
        <!-- pas mal -->
        <!-- <img src="~assets/Rectangle29.png"> -->
        <!-- <img src="~assets/Rectangle31.png"> -->
        <!-- <img src="~assets/Rectangle32.png"> -->
      </template>
      <!-- <Vue3Lottie :animationData="AstronautJSON" :height="200" :width="200" /> -->
      <!-- <Vue3Lottie animation-link="https://lottie.host/ce7c97f6-e0ea-4ea6-b8c6-50d28928f288/jjsUvZSbD1.json" :height="200"
      :width="200" :scale="2" /> -->
      <template v-slot:content>

        <!-- // TODO:1 make the btn align with the end of the text area when it grows -->
        <!-- /* display: grid; */
  /* grid-template-rows: 1fr 2fr; Ratio for B and C */
  /* overflow: hidden; Hide B when the container is too small */     -->
        <div style="width: 100%;  margin-top: 100px; height: 60vh;position: relative; z-index: 20;">
          <div class="welcoming-title text-h5 text-weight-medium text-on-primary q-pa-md text-center"
            style=" position: absolute; top: 12%; transform: translateY(-50%); left: 0; right: 0;">{{ greeting }}{{
              userFirstName }}</div>
          <div class="cta-div q-py-md"
            style="position: absolute; top: 45%; transform: translateY(-50%); left: 0; right: 0;">
            <div class="cta-title text-body1 text-weight-medium text-on-primary q-px-md">Got a feeling?</div>
            <q-input class="text-body1 q-px-md q-py-sm" data-cy="new-moment-textarea" ref="newMomInputRef"
              v-model="newMomText" :shadow-text="inputShadowText" lazy-rules="ondemand" :rules="newMomRules"
              @blur="inputBlurred" type="text" autogrow rounded outlined bg-color="surface" color="transparent"
              :placeholder="placeholderText" input-class="new-moment-input">
              <template v-slot:append>
                <q-btn v-if="showSpeechRecognitionButton && !isRecognizing" color="primary" flat dense round icon="mic"
                  size="17px" @click="toggleSpeech" />
                <q-btn v-else-if="showSpeechRecognitionButton && isRecognizing" color="primary" dense round icon="r_stop"
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
        </div>
      </template>
    </q-parallax>

    <div v-if="momentsStore.getShowWelcomeTutorial" class="q-px-md negative-margin-welcome-tutorial"
      style="position: relative; z-index: 25;">
      <q-list>

        <q-item class="q-px-xs q-py-none" style="min-height: 0px;">
          <q-item-section class="text-body1 text-weight-medium text-on-primary">Welcome to
            KifKaf</q-item-section>
          <q-item-section side>
            <q-btn flat dense icon="r_close" color="background" size="12px"
              @click=" momentsStore.setShowWelcomeTutorial(false)" padding="none" />
          </q-item-section>
        </q-item>

        <q-item class="q-pl-xs q-pr-sm q-pt-xs q-pb-xs" style="min-height: 0px;">
          <q-item-section class="text-subtitle2 text-weight-medium">
            <q-linear-progress :value="momentsStore.getWelcomeTutorialStep / 3" color="surface" track-color="grey" rounded
              animation-speed="500" />
          </q-item-section>
          <q-item-section side class="text-caption
text-on-primary">{{ momentsStore.getWelcomeTutorialStep +
  "/3 complete" }}
          </q-item-section>
        </q-item>

        <q-item class="q-px-none q-py-xs">
          <!-- ref="swiperWelcomeTutorial"  init="false"  auto-height="true" pagination-dynamic-bullets="true" slides-per-view="1.05"-->
          <swiper-container pagination="true" grab-cursor="true" space-between="10" style="width: 100%;">
            <swiper-slide>
              <q-card v-if="momentsStore?.getWelcomeTutorialStep < 1" class="bg-surface q-pa-md rounded-borders-14"
                style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label>
                      Capture life's ups and downs with micro-journaling. Your moments are private; only you can see them.
                    </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <img src="~assets/tuto1.svg"
                      style="max-height: 100%; width: auto; object-fit: contain; margin-right:16px;" />
                  </q-item-section>
                </q-item>
                <q-btn rounded color="primary" padding="xs" label="Log a Moment" @click="tutoLogMoment"
                  class="text-subtitle1 text-weight-medium" style="width: 100%; " no-caps
                  :disable="newMomText.length !== 0" />
              </q-card>
              <q-card v-else class="bg-surface q-pa-md rounded-borders-14" style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-subtitle1 text-on-surface text-weight-medium q-pb-sm">
                      First Moment logged
                    </q-item-label>
                    <q-item-label>
                      Emotions are your body's language. Embrace the habit of noting them down and you're halfway there.
                    </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <q-icon size="50px" color="positive" name="r_check_circle" class="q-mx-md" />
                  </q-item-section>
                </q-item>
              </q-card>
            </swiper-slide>
            <swiper-slide>
              <q-card v-if="momentsStore?.getWelcomeTutorialStep < 2" class="bg-surface q-pa-md rounded-borders-14"
                style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label>
                      For each moment, KifKaf surfaces the related needs and how well they're being met. </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <img src="~assets/tuto2.svg"
                      style="max-height: 100%; width: auto; object-fit: contain; margin-right:8px;" />
                  </q-item-section>
                </q-item>
                <q-btn rounded color="primary" padding="xs" label="View needs" @click="tutoViewNeeds"
                  :disable="!momentsStore.getLatestMomentId" class="text-subtitle1 text-weight-medium"
                  style="width: 100%; " no-caps />
              </q-card>
              <q-card v-else class="bg-surface q-pa-md rounded-borders-14" style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-subtitle1 text-on-surface text-weight-medium q-pb-sm">
                      Needs Revealed
                    </q-item-label>
                    <q-item-label>
                      Understanding the deeper needs behind your feelings paves the way to fulfillment.
                    </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <q-icon size="50px" color="positive" name="r_check_circle" class="q-mx-md" />
                  </q-item-section>
                </q-item>
              </q-card>
            </swiper-slide>
            <swiper-slide>
              <q-card v-if="momentsStore?.getWelcomeTutorialStep < 3" class="bg-surface q-pa-md rounded-borders-14"
                style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label>
                      Your emotions tell a story. After 5 Moments, patterns start emerging.
                    </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <img src="~assets/tuto3_1.png"
                      style="max-height: 100%; width: auto; object-fit: contain; margin-right:8px;" />
                  </q-item-section>
                </q-item>
                <q-btn rounded color="primary" padding="xs" label="Explore Insights" @click="tutoExploreInsights"
                  :disable="!momentsStore.getLatestMomentId" class="text-subtitle1 text-weight-medium"
                  style="width: 100%; " no-caps />
              </q-card>
              <q-card v-else class="bg-surface q-pa-md rounded-borders-14" style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-subtitle1 text-on-surface text-weight-medium q-pb-sm">
                      You’re all set!
                    </q-item-label>
                    <q-item-label>
                      Keep logging Moments to fine-tune KifKaf and get the most out of it.
                    </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <q-icon size="50px" color="positive" name="r_check_circle" class="q-mx-md" />
                  </q-item-section>
                </q-item>
              </q-card>
            </swiper-slide>
          </swiper-container>
        </q-item>
      </q-list>
    </div>

    <div v-if="!momentsStore || !momentsStore.uniqueDays || momentsStore.uniqueDays.length == 0"></div>
    <div v-else class="q-px-md">
      <q-list>
        <div v-for="( day, index ) in  momentsStore.uniqueDays " :key="day">
          <q-item-label :class="[
            'text-body1',
            'text-weight-medium',
            'q-pa-none',
            'q-mb-sm',
            (index === 0 && !momentsStore.getShowWelcomeTutorial) ? 'negative-margin-first-item' : (index === 0 ? 'q-mt-none' : 'q-mt-lg'),
            (index === 0 && !momentsStore.getShowWelcomeTutorial) ? 'text-on-primary' : 'text-on-background'
          ]" header>{{
  momentsStore.getFormattedDate(day) }}</q-item-label>

          <q-item class="bg-surface q-mb-md q-px-none q-py-none rounded-borders-14">
            <q-list full-width style="width: 100%;">
              <q-item v-for=" moment  in  getSortedMomentsOfTheDay(day) " :key="moment.id" clickable v-ripple
                class="q-px-none q-py-md" style="min-height: 0px;" @click="openBottomSheet(moment.id)">

                <q-item-section avatar top class="q-px-none" style="min-width: 20px;">
                  <moment-sync-icon :moment-id="moment.id" :expected-llm-call-duration="expectedLlmCallDuration" />
                </q-item-section>
                <q-item-section class="text-body2 q-pb-none q-pl-none q-pr-md">{{ moment.text
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
import { ref, onMounted, onDeactivated, onBeforeUnmount, computed, onActivated, watch, nextTick } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { useRouter } from 'vue-router'
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
const router = useRouter()

// const swiperWelcomeTutorial = ref(null)
// const swiperInitialized = ref(false)

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
  // if (!swiperInitialized.value) {
  //   swiperWelcomeTutorial.value.initialize();
  //   swiperInitialized.value = true
  // }
})

// onDeactivated(() => {
//   console.log('ONDEACTIVATED')
//   swiperInitialized.value = false
// });

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

//WELCOME TUTORIAL
const tutoLogMoment = () => {
  newMomText.value = 'Feeling excited to get to know me better with KifKaf!'
  // newMomInputRef.value.focus()
  nextTick(() => {
    newMomInputRef.value.$el.querySelector('textarea').select()
  })
}
const tutoViewNeeds = async () => {
  openBottomSheet(momentsStore.getLatestMomentId);
  await momentsStore.setWelcomeTutorialStep(2);
}
const tutoExploreInsights = async () => {
  await router.push('/learn')
  await momentsStore.setWelcomeTutorialStep(3);
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

.negative-margin-welcome-tutorial {
  margin-top: -80px !important; // Use !important to override any existing margins if necessary.
  position: relative; // This gives the element a positioning context.
  z-index: 10; // Adjust the z-index so it is higher than the q-parallax's z-index.
}

.negative-margin-first-item {
  margin-top: -50px !important; // Use !important to override any existing margins if necessary.
  position: relative; // This gives the element a positioning context.
  z-index: 10; // Adjust the z-index so it is higher than the q-parallax's z-index.
}

// .white-blurred {
//   background: rgba(255, 255, 255, 0.33);
//   backdrop-filter: blur(10px);
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
  // transition: height 0.5s;   /* Transition effect when growing */
}

.welcoming-title {
  transition: opacity 0.5s ease, visibility 0.5s ease;
  opacity: 1;
  visibility: visible;
}

/* Media query for smaller heights */
@media (max-height: 650px) {
  .welcoming-title {
    opacity: 0;
    visibility: hidden;
    overflow: hidden;
  }
}

.cta-title {
  transition: opacity 0.5s ease, visibility 0.5s ease;
  opacity: 1;
  visibility: visible;
}

.cta-div {
  transition: top 0.5s ease;
}

@media (max-height: 450px) {
  .cta-title {
    opacity: 0;
    visibility: hidden;
    overflow: hidden;
  }

  .cta-div {
    top: 15% !important;
  }
}

.q-linear-progress__track,
.q-linear-progress__model {
  border-radius: 4px;
}

swiper-container {
  // width: 100%;
  // // height: 100%;
  // // height: 100vh; // This will make the container fill the entire height of the screen
  --swiper-pagination-color: #{$primary};
  // // --swiper-pagination-left: auto;
  // // --swiper-pagination-right: 8px;
  // --swiper-pagination-bottom: -5px;
  // // --swiper-pagination-top: auto;
  // // --swiper-pagination-fraction-color: inherit;
  // // --swiper-pagination-progressbar-bg-color: rgba(0, 0, 0, 0.25);
  // // --swiper-pagination-progressbar-size: 4px;
  // // --swiper-pagination-bullet-size: 12px;
  // // --swiper-pagination-bullet-width: 8px;
  // // --swiper-pagination-bullet-height: 8px;
  // // --swiper-pagination-bullet-inactive-color: #000;
  // // --swiper-pagination-bullet-inactive-opacity: 0.2;
  // // --swiper-pagination-bullet-opacity: 1;
  // // --swiper-pagination-bullet-horizontal-gap: 4px;
  // // --swiper-pagination-bullet-vertical-gap: 6px;
}
</style>



