<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px;">
    <!-- <q-list> -->
    <q-item-label class="text-body1 text-weight-medium q-my-sm">Add a new Moment</q-item-label>
    <!-- TODO:2 welcome user -->
    <!-- <template>
      <p v-if="user">Hello {{ user.providerData.displayName }}</p>
    </template> -->

    <q-card class="bg-surface q-mb-lg q-px-xs q-py-md rounded-borders-14" flat>
      <!-- // TODO:1 make the btn align with the end of the text area when it grows -->
      <!-- TODO:3 add a signal that speech recognition is on,
          TODO:1 maybe this two overlapping button is bad design? In that case put the mic button left of the sending one? -->
      <q-field rounded outlined bg-color="surface-variant" color="transparent" class="q-ma-md">
        <template v-slot:control>
          <!-- class="no-outline" -->
          <new-moment-editor data-cy="new-moment-editor" v-model="rawNewText" class="full-width"
            @create:editor="initializeEditor" />
        </template>
        <template v-slot:append>
          <q-btn v-if="rawNewTextValid && !isRecognizing" round dense color="primary" icon="arrow_forward"
            @click="onSubmit" class="" />
          <q-btn v-else-if="showSpeechRecognitionButton" color="primary" :flat=!isRecognizing dense round icon="mic"
            @click="toggleSpeechRecognition" class="" />
        </template>
      </q-field>
    </q-card>


    <div v-if="!momentsStore || !momentsStore.uniqueDays || momentsStore.uniqueDays.length == 0"></div>
    <div v-else>
      <q-item-label class="text-body1 text-weight-medium q-my-sm">Moments</q-item-label>

      <q-card class="bg-surface q-mb-md q-px-none q-pt-xs q-pb-xs rounded-borders-14"
        v-for="day in momentsStore.uniqueDays" :key="day" flat>
        <q-card-section class="text-subtitle1 q-pb-none q-px-md">
          {{ day }}
        </q-card-section>

        <q-card-section class="q-py-xs q-px-none" clickable v-for="moment in getMomentsOfTheDay(day)" :key="moment.id">
          <!-- <q-item class=" q-px-none q-pb-none">
        <q-item-section>
          <vue-slider v-model="moment.intensity" :process="trackProcess" :min="-5" :max="5" :interval="1" disabled
            tooltip="none"></vue-slider>
        </q-item-section>

        <q-item-section side>
          {{ moment.intensity }}
        </q-item-section>
        </q-item> -->
          <q-card-section class="q-pt-sm q-pb-none q-px-md" style="min-height: 0px;" dense>{{ moment.text
          }}</q-card-section>
          <q-card-section v-if="moment.needsSatisAndImp && Object.keys(moment.needsSatisAndImp).length > 0"
            class="q-px-none q-py-xs chip-container" style="min-height: 0px;">
            <div class="horizontal-scroll" :style="getPadding(moment.id)" @scroll="onScroll($event, moment.id)">
              <!-- <q-card-section v-if="moment.needsSatisAndImp && Object.keys(moment.needsSatisAndImp).length > 0"
            class="q-pt-none q-pb-xs q-px-none chips-container" style="min-height: 0px;"> -->
              <!-- removable v-model="vanilla" text-color="white" :title="vanillaLabel" -->
              <q-chip v-for="need in Object.entries(moment.needsSatisAndImp).sort(([, a], [, b]) => b[1] - a[1])"
                :key="need[0]" outline :color="getChipColor(need[1])" :icon="momentsStore.needsMap[need[0]]"
                :label="need[0]" class="needs" />
            </div>
          </q-card-section>
        </q-card-section>
      </q-card>
    </div>
    <!-- <virtual-keyboard-bar v-show="momentsStore.isEditorFocused" @append-hashtag="appendHashtag" /> -->
  </q-page>
</template>

<script setup>
import { ref, onMounted, onDeactivated, onBeforeUnmount, computed, onActivated } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { Timestamp } from 'firebase/firestore'
import { date } from "quasar";
// destructuring to keep only what is needed in date
const { formatDate } = date;
import NewMomentEditor from './../components/NewMomentEditor.vue'

// TODO:2 make below dynamic imports?
import { isRecognizing, recognition, useSpeechRecognition } from '../composables/speechRecognition.js'
// import VirtualKeyboardBar from './../components/VirtualKeyboardBar.vue'

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

const newIntensity = ref(0)
const rawNewText = ref('') //<p></p>
const newText = ref('')
const newTags = ref([])
const newDate = ref(null)
const scrolledMoments = ref({}); // This object will store scrollLeft values for each moment

onActivated(() => {
  // console.log('HomeTab onActivate recog fired');
  if (scrolledMoments.value) {
    scrolledMoments.value = {};
  }
})

// DISPLAY PREVIOUS MOMENTS
const formatLikeUniqueDays = (moment) => {
  const ts = new Timestamp(moment.date.seconds, moment.date.nanoseconds);
  const dt = ts.toDate();
  dt.setHours(0, 0, 0, 0);
  dt.getTime();
  return date.formatDate(dt, "MMMM D, YYYY")
};

const getMomentsOfTheDay = (day) => { //TODO:2 this should be in momentssStore directly
  const ul = momentsStore?.momentsColl?.value?.filter(m => formatLikeUniqueDays(m) == day)
  // sort array ul per descending moments.value.date.seconds
  const ol = ul?.sort((a, b) => b.date.seconds - a.date.seconds);
  return ol;
}

// const appendHashtag = () => {
//   editorInstance.value.commands.insertContent('#')
// }

//SPEECH RECOGNITION
const {
  showSpeechRecognitionButton,
  toggleSpeechRecognition,
} = useSpeechRecognition(rawNewText)
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
})

const rawNewTextValid = computed(() => {
  // Return true if there's at least one character that is neither a space nor a '#'
  if (!editorInstance.value) return false
  return [...editorInstance.value.getText()].some(c => c !== ' ' && c !== '#');

})

const editorInstance = ref(null)
const initializeEditor = (editor) => {
  editorInstance.value = editor
  //Hack to fix the issue of Mentionlist shutting down on first tap on # button
  rawNewText.value += '#'
  setTimeout(() => {
    rawNewText.value = ''
  }, 1)
}

// ADD MOMENT
const onSubmit = (event) => {
  event.preventDefault()
  newDate.value = Timestamp.now()
  // Split the text by space to get all words
  const words = editorInstance.value.getText().split(' ')
  // Iterate over each word
  words.forEach((word) => {
    // If the word starts with a '#' and it's not entirely made of '#' chars, remove the '#' and add it to the tags array
    if (word.startsWith('#') && !/^#+$/.test(word)) {
      const wordParts = word.split('#')
      wordParts.forEach((part) => {
        if (part !== '') {
          // check if it already exists in the tags
          if (!newTags.value.includes(part)) {
            // If not, add it to the tags array
            newTags.value.push(part)
          }
        }
      })
    } else if (!word.startsWith('#')) {
      // Otherwise, add it to the parsed text
      const cleanedWord = word.endsWith('#') ? word.replace('#', '') : word // this removes '# ' from the word, for example 'cool# ' becomes 'cool '
      newText.value += cleanedWord + ' '
    }
  })
  // Trim the trailing space off the parsed text
  newText.value = newText.value.trim()

  momentsStore.addMoment({
    date: newDate.value,
    intensity: newIntensity.value,
    text: newText.value,
    tags: newTags.value,
  })

  newIntensity.value = 0
  editorInstance.value.commands.clearContent(true)
  newText.value = ''
  newTags.value = []
  newDate.value = null
  // console.log('CHECK NO DUPLICATES in unitque tags', momentsStore.uniqueTags);
}

const getChipColor = (needsStats) => {
  if (needsStats[0] < 0.4) return 'red'
  else if (needsStats[0] > 0.6) return 'green'
  else return 'primary'
}

const onScroll = (event, id) => {
  scrolledMoments.value[id] = event.target.scrollLeft;
};

const getPadding = (id) => {
  // If the scrollLeft value for the given ID is 0 or undefined,
  // return the desired padding. Otherwise, no padding.
  return scrolledMoments.value[id] ? 'padding-left: 0;' : 'padding-left: 16px;';
};

</script>

<style lang="scss">
.needs {
  font-size: 0.8rem;
  // max-width: 200px; //truncate
}

// .chips-container {
//   display: flex;
//   flex-wrap: wrap;
//   align-items: center;
//   justify-content: flex-start;
// }

// .chips-container {
//   display: flex;
//   flex-wrap: wrap;
//   column-gap: 4px;
//   /* This will be the space between the chips */
//   align-items: center;
//   justify-content: flex-start;
//   /* This makes sure that items are aligned to the start */
// }

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
  /* adjust this value as per your requirements */
}

.q-field--outlined .q-field__control:before {
  border: none;
}

.horizontal-scroll .q-chip:first-child {
  margin-left: 0;
}
</style>



