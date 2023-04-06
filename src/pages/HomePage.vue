<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">

      <q-card class="new-moment-card bg-blue-2" flat>
        <q-card-section class="date-card-section">
          <div class="text-subtitle1">
            Add a new Moment
          </div>
        </q-card-section>

        <q-card-section class="q-py-none">
          <q-item>
            <q-item-section>
              <div>
                <vue-slider v-model="newIntensity" :process="trackProcess" :min="-5" :max="5" :interval="0.1"
                  :drag-on-click="true"></vue-slider>
              </div>
            </q-item-section>
            <q-item-section avatar>
              <div>{{ newIntensity > 0 ? `+${newIntensity}` : newIntensity }}</div>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-card-section class="q-py-none">
          <q-form @submit="onSubmit">

            <q-input bg-color="white" color="white" rounded outlined v-model="text"
              label="Feeling ... when/at/to ...  #mytag" lazy-rules
              :rules="[val => val && val.length > 0 || 'Please type something']">

              <template v-slot:after>
                <q-btn round color="primary" icon="arrow_forward" />
              </template>
            </q-input>

          </q-form>
        </q-card-section>
      </q-card>

      <q-list class="date-cards-list">

        <q-item class="date-card-item q-px-none" v-for="item in uniqueDatesList" :key="item">
          <q-card class="date-card bg-white col" flat>
            <q-card-section class="date-card-section">
              <div class="text-subtitle1">
                {{ item }}
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-list class="moments-list">

                <q-item class="moment-item" clickable v-for="moment in momentsList.filter(i => i.date === item)"
                  :key="moment.id">
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

                    <div class="moment">{{ moment.moment }}</div>
                    <div class="tags">{{ moment.tags.join(' ') }}</div>

                  </div>
                </q-item>

              </q-list>
            </q-card-section>
          </q-card>
        </q-item>

      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import uniqueId from 'lodash.uniqueid'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

const newIntensity = ref(0)

function trackProcess(dotsPos) {
  //The position is expressed as a percentage, with 0 representing the start point and 100 representing the end point.
  // cf. https://nightcatsama.github.io/vue-slider-component/#/basics/process
  return [[50, dotsPos[0]]]
}

//TODO get from DB
const momentsList = ref([
  {
    id: uniqueId('moment_'),
    date: 'Today',
    intensity: -3.3,
    moment: 'Feeling guilty and sad when mam tell us we stay in touch bec. she will have difficulties when we leave matthieu’s home bec. I want my mum to be happy and striving',
    tags: ['#mam', '#guilt']
  },
  {
    id: uniqueId('moment_'),
    date: 'Today',
    intensity: +2.1,
    moment: 'Feeling safe and powerful when managing my money online',
    tags: ['#autonomy', '#safety', '#successful']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 18',
    intensity: +2.8,
    moment: 'Feeling smart and useful when discussing with Thomas about his project and mine, bec. I felt less of a failure',
    tags: ['#usefulness']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 18',
    intensity: +3.3,
    moment: '🍑 with mona, good connection and sharing, we had a good chat which made me feel like a valuable partner to her not only physically but intellectually',
    tags: ['#sex', '#body']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 17',
    intensity: 4.1,
    moment: 'Feeling grateful to have the sun on my face while walking down from Montmarte bec. it felt warm and natural',
    tags: ['#sun', '#nature']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 17',
    intensity: -3.7,
    moment: 'Feeling like I am losing my time at the playfight workshop bec. I am not learning anything',
    tags: ['#impatience']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 17',
    intensity: +1.8,
    moment: 'Feeling content and proud when theorizing about office locking and my chance bec. I like feeling different and free',
    tags: ['#autonomy', '#walk']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 17',
    intensity: +2.1,
    moment: 'Feeling completely relaxed and epic at the end of movement course when lying down ',
    tags: ['#rest', '#harmony', '#movement']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 13',
    intensity: +2.3,
    moment: 'Feeling aroused and capable when playfight jamming with bastos caro and new ppl',
    tags: ['#body', '#women', '#lettinggo', '#dance']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 13',
    intensity: -3.3,
    moment: 'Feeling incapable to help mam when she tells me she’s not going well on phone call bec. hard to see loved ones struggle',
    tags: ['#mam']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 9',
    intensity: -2.3,
    moment: 'Feeling guilty to have let Maria down yest. night bec. I need to be more trustful',
    tags: ['#trustfulness', '#maria']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 7',
    intensity: -2.1,
    moment: 'Feeling disrespected that mona came to sleep with me despite me saying no bec. I wanted to work',
    tags: ['#sayingno', '#autonomy']
  },
  {
    id: uniqueId('moment_'),
    date: 'March 7',
    intensity: +2.3,
    moment: 'Finally alone at home',
    tags: ['#autonomy']
  },
  {
    id: uniqueId('moment_'),
    date: 'February 27',
    intensity: +4.1,
    moment: 'Feeling grateful and cuddled to have my tea prepared by James bec. proof of love',
    tags: ['#james', '#cocooning', '#proofoflove']
  },
  {
    id: uniqueId('moment_'),
    date: 'February 27',
    intensity: -4.1,
    moment: 'Feeling stressed of not knowing what I’m gonna do today',
    tags: ['#selfesteem']
  },
  {
    id: uniqueId('moment_'),
    date: 'February 25',
    intensity: -1.1,
    moment: 'Feeling moody bec. of the grey weather',
    tags: ['#weather']
  },
])

//TODO make it a computed, avoid creating new set each time
const uniqueDatesList = ref([...new Set(momentsList.value.map(moment => moment.date))])


</script>

<style lang="scss">
.tags {

  font-size: 0.9rem;
  color: $primary;
}
</style>



