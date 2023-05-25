<template>
  <q-page class="q-mx-auto" style="max-width: 600px" padding>
    <!-- TODO: welcome user -->

    <q-card class="bg-blue-2 q-mb-sm q-pa-xs rounded-borders-14" flat>
      <q-card-section class="text-subtitle1 q-pb-none">
        Add a new Moment
      </q-card-section>

      <q-card-section class="q-mb-sm q-pt-sm">
        <q-item class="q-px-none">
          <q-item-section class="col-11">
            <vue-slider v-model="newIntensity" :process="trackProcess" :min="-5" :max="5" :interval="1" drag-on-click
              adsorb :marks="marksEmoji"></vue-slider>
          </q-item-section>

          <q-item-section side class="col text-subtitle1 text-dark">
            {{ newIntensity }}
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-input ref="inputRef" class="q-mx-sm q-mb-md" bg-color="white" color="white" type="text" rounded outlined autogrow
        v-model="rawNewText" placeholder="Feeling ... when/at/to ...  #mytag">
        <template v-slot:append>
          <q-btn v-if="rawNewText !== '' && !isRecognizing" round dense color="primary" icon="arrow_forward"
            @click="onSubmit" />
          <q-btn v-else :color="isRecognizing ? 'primary' : null" :flat="!isRecognizing" dense round icon="mic"
            @click="toggleSpeechRecognition" />
        </template>
      </q-input>
    </q-card>

    <div v-if="!momentsStore || !momentsStore.uniqueDays || momentsStore.uniqueDays.length === 0">No Moments found</div>
    <q-list v-else>
      <q-card class="bg-white q-mb-sm q-pa-xs rounded-borders-14" v-for="day in uniqueDays" :key="day" flat>
        <q-card-section class="text-subtitle1 q-pb-none">
          {{ day }}
        </q-card-section>

        <q-list>
          <q-card-section class="q-pt-xs q-pb-xs" clickable v-for="moment in momentsOfTheDay(day)" :key="moment.id">
            <q-item class="q-px-none">
              <q-item-section>
                <vue-slider v-model="moment.intensity" :process="trackProcess" :min="-5" :max="5" :interval="1"
                  disabled></vue-slider>
              </q-item-section>

              <q-item-section side>
                {{ moment.intensity }}
              </q-item-section>
            </q-item>

            <q-item class="q-py-none" dense>{{ moment.text }}</q-item>
            <q-item v-if="moment.tags && moment.tags.length > 0" class="tags q-py-none" dense>{{ moment.tags.map(tag =>
              '#' + tag).join(' ') }}</q-item>
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
import { ref, onMounted, computed } from 'vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { useMomentsStore } from './../stores/moments.js'
import { Timestamp } from 'firebase/firestore'
import { date } from "quasar";

const { formatDate } = date;

const momentsStore = useMomentsStore()
onMounted(async () => {
  await momentsStore.fetchMoments();
})

const newIntensity = ref(0)
const rawNewText = ref('')
const newText = ref('')
const newTags = ref([])
const newDate = ref(null)

const uniqueDays = computed(() => {
  return momentsStore.uniqueDays || []
})

const momentsOfTheDay = (day) => {
  const moments = computed(() => momentsStore.moments.value)
  const ul = moments.value.filter(m => formatLikeUniqueDays(m) === day)
  const ol = ul.sort((a, b) => b.date.seconds - a.date.seconds)
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
  return [[50, dotsPos[0]]]
}

const recognitionName = window.webkitSpeechRecognition || window.SpeechRecognition
let recognition;

if ('webkitSpeechRecognition' in window) {
  recognition = new recognitionName();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "fr-FR";
  recognition.onerror = function (event) {
    console.error(event);
  };
}

const isRecognizing = ref(false);

const toggleSpeechRecognition = () => {
  if (!recognition) {
    return;
  }

  if (!isRecognizing.value) {
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];

        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      rawNewText.value = finalTranscript + interimTranscript;
    };

    recognition.start();
    isRecognizing.value = true;
  } else {
    recognition.stop();
    isRecognizing.value = false;
  }
}

const inputRef = ref(null)
const appendHashtag = () => {
  rawNewText.value += '#'
  inputRef.value.focus()
}

onMounted(() => {
  var bottomBar = document.getElementById('bottombar');
  var viewport = window.visualViewport;
  let pendingUpdate = false;

  function viewportHandler(event) {
    if (pendingUpdate) return;
    pendingUpdate = true;

    requestAnimationFrame(() => {
      pendingUpdate = false;
      const layoutViewport = document.getElementById("layoutViewport");

      const offsetLeft = viewport.offsetLeft;
      const offsetTop = viewport.height - layoutViewport.getBoundingClientRect().height + viewport.offsetTop;

      bottomBar.style.transform = `translate(${offsetLeft}px, ${offsetTop}px) scale(${1 / viewport.scale})`;
    });
  }

  window.visualViewport.addEventListener("scroll", viewportHandler);
  window.visualViewport.addEventListener("resize", viewportHandler);
})

const onSubmit = (event) => {
  event.preventDefault()
  newDate.value = Timestamp.now()

  const words = rawNewText.value.split(' ')
  words.forEach((word) => {
    if (word.startsWith('#')) {
      newTags.value.push(word.slice(1))
    } else {
      newText.value += word + ' '
    }
  })

  newText.value = newText.value.trim()

  momentsStore.addMoment({
    date: newDate.value,
    intensity: newIntensity.value,
    text: newText.value,
    tags: newTags.value,
  })

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
}</style>
