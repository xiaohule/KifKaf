<template >
  <q-page>
    <!-- flexbox container -->
    <div class="q-pa-md flexbox-container">

      <q-card class="new-moment-card bg-blue-2 q-mb-sm" flat>
        <div class="new-moment-grid-container">

          <q-card-section class="date-card-section">
            <div class="text-subtitle1">
              Add a new Moment
            </div>
          </q-card-section>

          <q-card-section class="q-py-none">
            <div>
              <vue-slider v-model="newIntensity" :process="trackProcess" :min="-5" :max="5" :interval="0.1"
                :drag-on-click="true"></vue-slider>
            </div>
          </q-card-section>

          <q-card-section class="q-py-none">
            <div>{{ newIntensity > 0 ? `+${newIntensity}` : newIntensity }}</div>
          </q-card-section>

          <q-card-section class="q-py-none input-card-section">
            <q-form @submit="onSubmit">

              <q-input bg-color="white" color="white" rounded outlined v-model="rawNewText"
                label="Feeling ... when/at/to ...  #mytag" lazy-rules
                :rules="[val => val && val.length > 0 || 'Please type something']">

                <!-- <template v-slot:after> -->
                <div>
                  <q-btn label="Submit" round color="primary" icon="arrow_forward" type="submit" />
                </div>
                <!-- </template> -->

              </q-input>

            </q-form>
          </q-card-section>
        </div>
      </q-card>

      <q-list class="date-cards-list">
        <q-item class="date-card-item q-px-none" v-for="day in momentsStore.uniqueDays" :key="day">
          <q-card class="date-card bg-white col" flat>
            <div class="previous-moments-grid-container">

              <q-card-section class="date-card-section">
                <div class="text-subtitle1">{{ day }}</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-list class="moments-list">
                  <q-item class="moment-item" clickable v-for="moment in momentsOfTheDay(day)" :key="moment.id">
                    <div>
                      <q-item class="q-px-none row">
                        <q-item-section>
                          <!-- TODO block clicking and differentiate appearance of those sliders -->
                          <div>
                            <vue-slider v-model="moment.intensity" :process="trackProcess" :min="-5" :max="5"
                              :interval="0.1" disabled></vue-slider>
                          </div>
                        </q-item-section>
                        <q-item-section avatar>
                          <div>{{ moment.intensity > 0 ? `+${moment.intensity}` : moment.intensity }}</div>
                        </q-item-section>
                      </q-item>
                      <div class="moment">{{ moment.text }}</div>
                      <div class="tags">{{ moment.tags.map(tag => '#' + tag).join(' ') }}</div>

                    </div>
                  </q-item>

                </q-list>
              </q-card-section>
            </div>

          </q-card>
        </q-item>

      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { useMomentsStore } from './../stores/moments.js'
import { Timestamp } from 'firebase/firestore'
import { date } from "quasar";
// destructuring to keep only what is needed in date
const { formatDate } = date;

const momentsStore = useMomentsStore()
momentsStore.fetchMoments('jdouet');
// console.log('onSetup', momentsStore.uniqueDays)

// onBeforeMount(() => {
//   console.log('onBeforeMount', momentsStore.uniqueDays)
// })

// onMounted(() => {
//   console.log('onMounted', momentsStore.uniqueDays)
// })

// onUpdated(() => {
//   console.log('onUpdated', momentsStore.uniqueDays)
// })

// onBeforeUpdate(() => {
//   console.log('onBeforeUpdate', momentsStore.uniqueDays)
// })

// uniqueDaysList.value = momentsStore.uniqueDays;
// uniqueDaysList.value = await momentsStore.uniqueDays;

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
  console.log('onSubmit', newDate.value, newIntensity.value, newText.value, newTags.value,)

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
.flexbox-container {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  max-width: 700px;
}

.new-moment-grid-container {
  display: grid;
  grid-template-columns: 11fr 2fr;
  grid-template-rows: auto auto auto;
  grid-gap: 1rem;
}

.date-card-section {
  grid-column: 1 / 3;
}

//TODO break it in 2 different cells
.input-card-section {
  grid-column: 1 / 3;
}

.previous-moments-grid-container {
  display: grid;
  grid-template-columns: 11fr 2fr;
  grid-template-rows: auto auto auto auto;
  grid-gap: 1rem;
}

.tags {
  font-size: 0.9rem;
  color: $primary;
}
</style>



