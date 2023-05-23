<template >
  <q-page class="q-pa-sm q-mx-auto" style="max-width: 600px">
    <!-- TODO: welcome user -->
    <!-- <template>
      <p v-if="user">Hello {{ user.providerData.displayName }}</p>
    </template> -->

    <q-card class="bg-blue-2 q-mb-sm q-pa-sm rounded-borders-14" flat>
      <q-card-section class="text-subtitle1 q-pb-sm">
        Add a new Moment
      </q-card-section>

      <q-card-section horizontal class="no-wrap items-center q-mx-xs q-mb-md">

        <q-card-section class="col-11">
          <vue-slider v-model="newIntensity" :process="trackProcess" :min="-5" :max="5" :interval="0.1"
            :drag-on-click="true"></vue-slider>
        </q-card-section>

        <q-card-section class="col-grow">
          {{ newIntensity > 0 ? `+${newIntensity}` : newIntensity }}
        </q-card-section>

      </q-card-section>

      <q-input class="q-mx-sm" bg-color="white" color="white" rounded outlined bottom-slots dense autogrow
        v-model="rawNewText" label="Feeling ... when/at/to ...  #mytag" lazy-rules
        :rules="[val => val && val.length > 0 || 'Please type something']">
        <!-- bottom-slots :dense="dense" -->

        <!-- TODO: make the btn align with the end of the text area when it grows -->
        <template v-slot:append>
          <q-btn v-if="rawNewText !== ''" round dense color="primary" icon="arrow_forward" @click="onSubmit" />
        </template>
      </q-input>
    </q-card>

    <div v-if="!momentsStore || !momentsStore.uniqueDays || momentsStore.uniqueDays.length === 0">No Moments found</div>
    <q-list v-else>
      <q-card class="bg-white q-mb-sm q-pa-sm rounded-borders-14 " v-for="day in momentsStore.uniqueDays" :key="day" flat>

        <q-card-section class="text-subtitle1 q-pb-none">
          {{ day }}
        </q-card-section>

        <q-card-section class="q-py-none">
          <q-list class="q-mx-none">
            <q-card-section class="q-px-none" clickable v-for="moment in momentsOfTheDay(day)" :key="moment.id">
              <q-item class="q-px-none">
                <q-item-section>
                  <!-- TODO: block clicking and differentiate appearance of those sliders -->
                  <vue-slider v-model="moment.intensity" :process="trackProcess" :min="-5" :max="5" :interval="0.1"
                    disabled></vue-slider>
                </q-item-section>

                <!-- TODO: keep avatar? -->
                <q-item-section side>
                  {{ moment.intensity > 0 ? `+${moment.intensity}` : moment.intensity }}
                </q-item-section>
              </q-item>

              <q-item class="q-py-none">{{ moment.text }}</q-item>
              <q-item v-if="moment.tags && moment.tags.length > 0" class="tags q-py-none">{{ moment.tags.map(tag => '#' +
                tag).join(' ') }}</q-item>
            </q-card-section>
          </q-list>
        </q-card-section>
      </q-card>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { useMomentsStore } from './../stores/moments.js'
import { Timestamp } from 'firebase/firestore'
import { date } from "quasar";
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

const momentsOfTheDay = (day) => {
  const ul = momentsStore.moments.value.filter(m => formatLikeUniqueDays(m) === day)
  // sort array ul per descending moments.value.date.seconds
  const ol = ul.sort((a, b) => b.date.seconds - a.date.seconds);
  return ol;
}

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
  console.log('New Moment added:', newDate.value, newIntensity.value, newText.value, newTags.value,)

  newIntensity.value = 0
  rawNewText.value = ''
  newText.value = ''
  newTags.value = []
  newDate.value = null
}

function trackProcess(dotsPos) {
  //The position is expressed as a percentage, with 0 representing the start point and 100 representing the end point.
  // cf. https://nightcatsama.github.io/vue-slider-component/#/basics/process
  return [[50, dotsPos[0]]]
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



