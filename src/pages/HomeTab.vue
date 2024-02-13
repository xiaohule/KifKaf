<template >
  <q-page class="q-mx-auto q-pa-none" style="max-width: 600px;">
    <q-pull-to-refresh @refresh="refresh">

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
        <template v-slot:content>

          <!-- // TODO:1 make the btn align with the end of the text area when it grows -->
          <!-- /* display: grid; */
  /* grid-template-rows: 1fr 2fr; Ratio for B and C */
  /* overflow: hidden; Hide B when the container is too small */     -->
          <div style="width: 100%;  margin-top: 100px; height: 60vh; position: relative; z-index: 20;">
            <div class="hidden-if-height-sm text-h5 text-weight-medium text-on-primary q-pa-md text-center">{{
              t(getGreetingLabel) }}{{
    userFirstName }} 👋</div>
            <div class="pushed-up-if-height-xs q-py-md">
              <div class="hidden-if-height-xs text-body1 text-weight-medium text-on-primary q-px-md">{{
                t('momentInputPrompt') }}
              </div>
              <q-input class="text-body1 q-px-md q-py-sm" data-cy="new-moment-textarea" ref="newMomInputRef"
                v-model="newMomText" :shadow-text="inputShadowText" lazy-rules="ondemand" :rules="newMomRules"
                @blur="inputBlurred" type="text" autogrow rounded outlined bg-color="surface" color="transparent"
                :placeholder="placeholderText" input-class="new-moment-input">
                <template v-slot:append>
                  <q-btn v-if="showSpeechRecognitionButton && !isRecognizing" color="primary" flat dense round icon="mic"
                    size="17px" @click="toggleSpeech" />
                  <q-btn v-else-if="showSpeechRecognitionButton && isRecognizing" color="primary" dense round
                    icon="r_stop" size="17px" class="pulse-animation" @click="toggleSpeech" />
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

      <welcome-tutorial v-if="ms?.userDoc?.showWelcomeTutorial" :new-mom-text="newMomText"
        :new-mom-input-ref="newMomInputRef" @update:new-mom-text="newMomText = $event"
        @click:view-needs="momentModalId = $event; momentModalOpened = true"
        class="q-px-md negative-margin-welcome-tutorial" />

      <div v-if="!ms || !ms.getUniqueDaysTs || ms.getUniqueDaysTs.length == 0"></div>
      <div v-else class="q-px-md">
        <div v-for="( day, index ) in  ms.getUniqueDaysTs " :key="day">

          <div :class="[
            'text-h6',
            'text-weight-medium',
            'q-pa-none',
            'q-mb-sm',
            (index === 0 && !ms?.userDoc?.showWelcomeTutorial) ? 'negative-margin-first-item' : (index === 0 ? 'q-mt-none' : 'q-mt-lg'),
            (index === 0 && !ms?.userDoc?.showWelcomeTutorial) ? 'text-on-primary' : 'text-on-background'
          ]">{{ formatDayForMomList(day, false, t, d) }}</div>
          <q-card flat class="bg-surface q-mb-md q-px-none q-py-xs rounded-borders-14">
            <div v-for=" moment  in  ms.getSortedMomsFromDayAndNeed(day)" :key="moment.id" clickable v-ripple
              class="q-px-none q-py-sm" style="min-height: 0px;"
              @click="momentModalId = moment.id; momentModalOpened = true">

              <q-item class="q-px-xs" style="min-height: 0px;">
                <q-item-section avatar top class="q-px-none" style="min-width: 20px;">
                  <moment-sync-icon :moment-id="moment.id" />
                </q-item-section>
                <q-item-section class="selectable-text text-body2 q-pb-none q-pl-none q-pr-md">{{ moment.text
                }}</q-item-section>
              </q-item>
              <q-item v-if="moment.needs && (moment.needs.error || moment.needs.Oops)" class="q-px-xs q-pt-none q-pb-xs"
                style="min-height: 0px;">
                <!--TODO:2 do this part add the "+" for manually adding needs -->
              </q-item>
              <q-item v-else-if="moment.needs && Object.keys(moment.needs).length > 0"
                class="q-px-none q-pt-none q-pb-xs chip-container" style="min-height: 0px; width:100%;">
                <div class="horizontal-scroll" :style="setChipsRowPadding(moment.id)"
                  @scroll="onChipsRowScroll($event, moment.id)">
                  <q-chip v-for="need in Object.entries(moment.needs).sort(([, a], [, b]) => b.importance - a.importance)"
                    :key="need[0]" outline :color="getChipColor(need[1])" :icon="needsMap[need[0]][0]"
                    :label="t('needsList.' + need[0])" class="needs" />
                </div>
              </q-item>
            </div>
          </q-card>
        </div>
      </div>
      <q-dialog v-model="errorDialogOpened" position="bottom" style="max-width: 600px">
        <q-card class="bg-background q-pa-lg text-center" flat>
          <q-icon name="error_outline" size="10vh" color="error" class="q-py-md" />
          <q-card-section class="text-h6 text-weight-medium q-py-md text-left	">
            <div v-html="t(errorDialogText)"></div>
          </q-card-section>
        </q-card>
      </q-dialog>
      <br />

      <moment-modal v-model="momentModalOpened" :moment-id="momentModalId" />

    </q-pull-to-refresh>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from "vue-i18n"
import { Timestamp } from 'firebase/firestore'
import { showSpeechRecognitionButton, isRecognizing, useSpeechRecognition } from '../composables/speechRecognition.js'
import momentSyncIcon from 'src/components/momentSyncIcon.vue';
import momentModal from 'src/components/momentModal.vue'
import welcomeTutorial from 'src/components/welcomeTutorial.vue'
import { needsMap, getChipColor } from "./../utils/needsUtils";
import { useDateUtils } from './../composables/dateUtils.js'
import { addDeleteMomentRetry } from 'src/boot/firebaseBoot';

//STORE INITIALIZATION
const ms = useMomentsStore()
const { t, d } = useI18n()
const { getGreetingLabel, formatDayForMomList } = useDateUtils()
const errorDialogOpened = ref(false)
const errorDialogText = ref('')
const placeholderText = t('momentInputPlaceholder')
const newMomInputRef = ref(null)
const newMomText = ref('')
const newMomDate = ref(null)
const momsWithScrolledNeeds = ref({}); // This object will store scrollLeft values for each moment
const momentModalOpened = ref(false);
const momentModalId = ref("");

// const content = ref(t('mykey4'))

const emits = defineEmits(['update:isDialogOpened'])

// Using await with fetchMoments ensures the function completes its execution before the component is mounted, which can be useful if your component relies on the data fetched by fetchMoments to render correctly.
onMounted(async () => {
  try {
    if (!ms.momentsFetched) {
      await ms.fetchMoments();
    }
    if (newMomInputRef.value && newMomText.value.length > 0) newMomInputRef.value.focus()
    momsWithScrolledNeeds.value = {};
    if (!ms.aggDataInsightsFetched) {
      await ms.fetchAggDataInsights();
    }
  } catch (error) {
    console.error('await ms.fetchMoments() error:', error);
  }
})

const userFirstName = computed(() => {
  if (ms?.user?.displayName) {
    const firstName = ms.user.displayName.trim().split(' ')[0];
    let capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    return " " + capitalizedFirstName;
  }
  return ''
})

watch([errorDialogOpened, momentModalOpened], ([newVal1, newVal2], [oldVal1, oldVal2]) => {
  if (newVal1 || newVal2) emits('update:isDialogOpened', true)
  else emits('update:isDialogOpened', false)
})

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

// onDeactivated(async () => {
//   console.log('HomeTab > onDeactivate fired');
//   if (isRecognizing.value) {
//     await stopSpeech();
//   }
// })
onBeforeUnmount(async () => {
  console.log('HomeTab > onBeforeUnmount fired');
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
  ms.addMoment({
    date: newMomDate.value,
    lastTouch: newMomDate.value,
    text: newMomText.value.trim(),
  })
  newMomText.value = ''
  newMomDate.value = null
}

// DISPLAY PREVIOUS MOMENTS NEEDS
const onChipsRowScroll = (event, id) => {
  momsWithScrolledNeeds.value[id] = event.target.scrollLeft;
};
const setChipsRowPadding = (id) => {
  // If the scrollLeft value for the given ID is 0 or undefined, return the desired padding. Otherwise, no padding.
  return momsWithScrolledNeeds.value[id] ? 'padding-left: 0;' : 'padding-left: 56px;';
};

const refresh = async (done) => {
  await addDeleteMomentRetry(true)
  done()
}
</script>

<style lang="scss">
.q-parallax__content {
  justify-content: flex-start;
}

.q-field__append.q-field__marginal.row.no-wrap.items-center.q-anchor--skip {
  display: none;
}

.q-field__native {
  padding: 16px 0px;
}

.q-field--outlined .q-field__control {
  padding: 0 6px 0px 12px;
}

.new-moment-input {
  max-height: 20vh;
  overflow-y: auto;
  // transition: height 0.5s;   /* Transition effect when growing */
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
  position: relative;
  z-index: 25; //put it higher than parallax content (20) so that it's close icon is clickable
  margin-top: -80px;
  position: relative;
}

.negative-margin-first-item {
  position: relative;
  z-index: 10; // lower that parallax content so that priority is given to typing in the input
  margin-top: -50px;
}

.pushed-up-if-height-xs {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  transition: top 0.5s ease;
}

.hidden-if-height-sm {
  position: absolute;
  top: 12%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  transition: opacity 0.5s ease, visibility 0.5s ease;
  opacity: 1;
  visibility: visible;
}

.hidden-if-height-xs {
  transition: opacity 0.5s ease, visibility 0.5s ease;
  opacity: 1;
  visibility: visible;
}

.q-linear-progress__track,
.q-linear-progress__model {
  border-radius: 4px;
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
  width: 100%;
  -webkit-overflow-scrolling: touch;
  transition: padding-left 0.9s ease;
  // cursor: grab; //disabled bec. misleading since horizontal scroll doesn't work on desktop

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
}

.horizontal-scroll .q-chip:first-child {
  margin-left: 0;
}

.needs {
  font-size: 0.8rem;
  // max-width: 200px; //truncate
}

.q-chip__icon {
  margin-bottom: 2px;
}

// .white-blurred {
//   background: rgba(255, 255, 255, 0.33);
//   backdrop-filter: blur(10px);
// }

@media (max-height: 650px) {
  .hidden-if-height-sm {
    opacity: 0;
    visibility: hidden;
    overflow: hidden;
  }
}

@media (max-height: 450px) {
  .hidden-if-height-xs {
    opacity: 0;
    visibility: hidden;
    overflow: hidden;
  }

  .pushed-up-if-height-xs {
    top: 15%;
  }

  .negative-margin-welcome-tutorial {
    z-index: 10; // make it lower than parallax content (20) so that priority is given to typing in the input
  }


  // .q-pull-to-refresh__puller-container {
  //   top: 0px !important;
  // }

  // #q-app>div>div>main>div>div.q-pull-to-refresh__puller-container.fixed.row.flex-center.no-pointer-events.z-top {
  //   top: 0px !important;
  // }

  // .z-top {
  //     z-index: 7000 !important;
  // }
}
</style>


