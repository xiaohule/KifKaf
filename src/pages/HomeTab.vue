<template >
  <q-page class="q-mx-auto" style="max-width: 600px" padding>
    <!-- TODO: welcome user -->
    <!-- <template>
      <p v-if="user">Hello {{ user.providerData.displayName }}</p>
    </template> -->

    <q-card class="bg-blue-2 q-mb-sm q-pa-xs rounded-borders-14" flat>
      <q-card-section class="text-subtitle1 q-pb-none">
        Add a new Moment
      </q-card-section>

      <q-card-section class="q-mb-sm q-pt-sm">
        <q-item class="q-px-none">
          <q-item-section class="col-11">
            <vue-slider v-model="newIntensity" :process="trackProcess" :min="-5" :max="5" :interval="1" drag-on-click
              adsorb :marks="marksEmoji">
            </vue-slider>
          </q-item-section>

          <q-item-section side class="col text-subtitle1 text-dark">
            {{ newIntensity }}
          </q-item-section>
        </q-item>
      </q-card-section>

      <!-- // TODO: make the btn align with the end of the text area when it grows -->
      <!-- TODO: add a signal that speech recognition is on, TODO: maybe this two overlapping button is bad design? In that case put the mic button left of the sending one? -->
      <q-field rounded outlined bg-color="white" color="transparent" class="q-ma-md">
        <template v-slot:control>
          <!-- class="no-outline" -->
          <new-moment-editor v-model="rawNewText" class="full-width" @create:editor="initializeEditor" />
        </template>
        <template v-slot:append>
          <q-btn v-if="rawNewTextValid && !isRecognizing" round dense color="primary" icon="arrow_forward"
            @click="onSubmit" class="" />
          <q-btn v-else-if="showSpeechRecognitionButton" :color="isRecognizing ? 'primary' : null" :flat=!isRecognizing
            dense round icon="mic" @click="toggleSpeechRecognition" class="" />
        </template>
      </q-field>
    </q-card>

    <div v-if="!momentsStore || !computedUniqueDays || computedUniqueDays.length === 0">No Moments found</div>
    <q-list v-else>
      <q-card class="bg-white q-mb-sm q-px-xs q-pt-xs q-pb-md rounded-borders-14" v-for="day in computedUniqueDays"
        :key="day" flat>
        <q-card-section class="text-subtitle1 q-pb-none">
          {{ day }}
        </q-card-section>

        <q-list>
          <q-card-section class="q-pt-xs q-pb-xs" clickable v-for="moment in getMomentsOfTheDay(day)" :key="moment.id">
            <q-item class="q-px-none q-pb-none">
              <q-item-section>
                <vue-slider v-model="moment.intensity" :process="trackProcess" :min="-5" :max="5" :interval="1"
                  disabled></vue-slider>
              </q-item-section>

              <q-item-section side>
                {{ moment.intensity }}
              </q-item-section>
            </q-item>

            <q-item class="q-py-none" style="min-height: 0px;" dense>{{ moment.text }}</q-item>
            <q-item v-if="moment.tags && moment.tags.length > 0" class="tags q-py-none" style="min-height: 0px;" dense>{{
              moment.tags.map(tag =>
                '#' +
                tag).join(' ') }}</q-item>
          </q-card-section>
        </q-list>
      </q-card>
    </q-list>

    <!-- && !isScrolling -->
    <!-- TODO: append inside the p of <p><span data-type="mention" class="mention" data-id="mam">#mam</span> is likely #</p> -->
    <virtual-keyboard-bar v-show="momentsStore.isEditorFocused" @append-hashtag="appendHashtag" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onDeactivated, onBeforeUnmount, computed } from 'vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { useMomentsStore } from './../stores/moments.js'
import { Timestamp } from 'firebase/firestore'
import { date } from "quasar";
import { isRecognizing, recognition, useSpeechRecognition } from '../composables/speechRecognition.js'
import NewMomentEditor from './../components/NewMomentEditor.vue'
import VirtualKeyboardBar from './../components/VirtualKeyboardBar.vue'
// destructuring to keep only what is needed in date
const { formatDate } = date;

//STORE INITIALIZATION
const momentsStore = useMomentsStore()
// Using await with fetchMoments ensures the function completes its execution before the component is mounted, which can be useful if your component relies on the data fetched by fetchMoments to render correctly.
onMounted(async () => {
  if (!momentsStore.initialized) {
    await momentsStore.fetchMoments();
  }
})

//TODO: change to a reactive object?
const newIntensity = ref(0)
const rawNewText = ref('') //<p></p>
const newText = ref('')
const newTags = ref([])
const newDate = ref(null)

// DISPLAY PREVIOUS MOMENTS
const formatLikeUniqueDays = (moment) => {
  const ts = new Timestamp(moment.date.seconds, moment.date.nanoseconds);
  const dt = ts.toDate();
  dt.setHours(0, 0, 0, 0);
  dt.getTime();
  return date.formatDate(dt, "MMMM D, YYYY")
};
const computedUniqueDays = computed(() => {
  return momentsStore.uniqueDays || []
})
const getMomentsOfTheDay = (day) => {
  const moments = computed(() => momentsStore.moments.value)
  const ul = moments.value.filter(m => formatLikeUniqueDays(m) === day)
  // sort array ul per descending moments.value.date.seconds
  const ol = ul.sort((a, b) => b.date.seconds - a.date.seconds);
  return ol;
}

//SLIDER
const marksEmoji = {
  '-4.7': '😭',
  '-4': '',
  '-3': '',
  '-2': '',
  '-1': '',
  '0': '😑',
  '1': '',
  '2': '',
  '3': '',
  '4': '',
  '4.7': '😆'
}
function trackProcess(dotsPos) {
  //The position is expressed as a percentage, with 0 representing the start point and 100 representing the end point.
  // cf. https://nightcatsama.github.io/vue-slider-component/#/basics/process
  return [[50, dotsPos[0]]]
}

//SPEECH RECOGNITION
const {
  showSpeechRecognitionButton,
  toggleSpeechRecognition,
} = useSpeechRecognition(rawNewText) //TODO: fix this
onDeactivated(() => {
  console.log('onDeactivate recog fired');
  if (recognition) {
    recognition.stop();
    isRecognizing.value = false;
  }
})
onBeforeUnmount(() => {
  console.log('onBeforeUnmount recog fired');
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
const appendHashtag = () => {
  editorInstance.value.commands.insertContent('#')  // console.log('rawNewText.value After concat', rawNewText.value);
  // console.log('momentsStore.isEditorFocused after concat', momentsStore.isEditorFocused);
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
  // rawNewText.value = ''
  editorInstance.value.commands.clearContent(true)
  newText.value = ''
  newTags.value = []
  newDate.value = null

  console.log('CHECK NO DUPLICATES in unitque tags', momentsStore.uniqueTags);
}

</script>

<style lang="scss">
.rounded-borders-14 {
  border-radius: 14px;
}

.tags {
  font-size: 0.9rem;
  color: $primary;
}
</style>



