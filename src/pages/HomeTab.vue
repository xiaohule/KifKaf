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
            <!-- {{ newIntensity > 0 ? `+${newIntensity}` : newIntensity }} -->
          </q-item-section>
        </q-item>
      </q-card-section>

      <!-- // TODO: make the btn align with the end of the text area when it grows -->
      <q-input ref="inputRef" class="q-mx-sm q-mb-md" bg-color="white" color="white" type="text" rounded outlined autogrow
        v-model="rawNewText" placeholder="Feeling ... when/at/to ...  #mytag">
        <template v-slot:append>
          <q-btn v-if="rawNewText !== '' && !isRecognizing" round dense color="primary" icon="arrow_forward"
            @click="onSubmit" />
          <q-btn v-else-if="showSpeechRecognitionButton" :color="isRecognizing ? 'primary' : null" :flat=!isRecognizing
            dense round icon="mic" @click="toggleSpeechRecognition" />
          <!-- TODO: add a signal that speech recognition is on, TODO: maybe this two overlapping button is bad design? In that case put the mic button left of the sending one? -->
        </template>
      </q-input>
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

    <div id="bottombar" class="bg-grey-4 q-pa-xs">
      <q-btn class="text-primary" flat round icon="tag" @click.prevent="appendHashtag" />
    </div>
    <div id="layoutViewport"></div>
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

// destructuring to keep only what is needed in date
const { formatDate } = date;

const momentsStore = useMomentsStore()
// Using await with fetchMoments ensures the function completes its execution before the component is mounted, which can be useful if your component relies on the data fetched by fetchMoments to render correctly.
onMounted(async () => {
  await momentsStore.fetchMoments();
})

//TODO: change to a reactive object
const newIntensity = ref(0)
const rawNewText = ref('')
const newText = ref('')
const newTags = ref([])
const newDate = ref(null)

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

const {
  showSpeechRecognitionButton,
  toggleSpeechRecognition,
} = useSpeechRecognition(rawNewText)

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

const inputRef = ref(null)
const appendHashtag = () => {
  rawNewText.value += '#'
  // nextTick(() => {
  inputRef.value.focus()
  // })
}

let viewportHandler;

onMounted(() => { //TODO: move to a composition function bec. will be used elsewhere, for example when updating?
  var bottomBar = document.getElementById('bottombar');
  // var viewport = window.visualViewport;
  let pendingUpdate = false;

  viewportHandler = (event) => {
    if (pendingUpdate) return;
    pendingUpdate = true;

    requestAnimationFrame(() => {
      pendingUpdate = false;
      const layoutViewport = document.getElementById("layoutViewport");

      // Since the bar is position: fixed we need to offset it by the
      // visual viewport's offset from the layout viewport origin.
      const viewport = event.target;
      const offsetLeft = viewport.offsetLeft;
      const offsetTop =
        viewport.height -
        layoutViewport.getBoundingClientRect().height +
        viewport.offsetTop;

      // You could also do this by setting style.left and style.top if you
      // use width: 100% instead.
      bottomBar.style.transform = `translate(${offsetLeft}px, ${offsetTop}px) scale(${1 / viewport.scale
        })`;
    });
  }

  window.visualViewport.addEventListener("scroll", viewportHandler);
  window.visualViewport.addEventListener("resize", viewportHandler);
})

onDeactivated(() => {
  window.visualViewport.removeEventListener("scroll", viewportHandler);
  window.visualViewport.removeEventListener("resize", viewportHandler);
})

onBeforeUnmount(() => {
  window.visualViewport.removeEventListener("scroll", viewportHandler);
  window.visualViewport.removeEventListener("resize", viewportHandler);
})


const onSubmit = (event) => {
  event.preventDefault()
  newDate.value = Timestamp.now() //Date.now()

  // Split the text by space to get all words
  const words = rawNewText.value.split(' ')
  // Iterate over each word
  words.forEach((word) => {
    if (word.startsWith('#')) {
      // If the word starts with a '#', remove the '#' and add it to the tags array
      newTags.value.push(word.slice(1))
    } else {
      // Otherwise, add it to the parsed text
      newText.value += word + ' '
    }
  })
  // Trim the trailing space off the parsed text
  newText.value = newText.value.trim()

  momentsStore.addMoment({
    date: newDate.value,
    intensity: newIntensity.value,
    text: newText.value,
    tags: newTags.value,
    // id: uniqueId('moment_') //removed bec. already generated in store and wasn't used
  })
  // console.log('New Moment added:', newDate.value, newIntensity.value, newText.value, newTags.value,)

  newIntensity.value = 0
  rawNewText.value = ''
  newText.value = ''
  newTags.value = []
  newDate.value = null
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

#layoutViewport {
  position: fixed;
  width: 100%;
  height: 100%;
  visibility: hidden;
}

#bottombar {
  position: fixed;
  left: 0px;
  right: 0px;
  bottom: 0px;
  transform-origin: left bottom;
  transform: translate(0px, 0px) scale(1);
}
</style>



