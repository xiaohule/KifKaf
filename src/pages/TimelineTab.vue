<template>
  <q-page class="q-mx-auto" style="max-width: 600px" padding>

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
      <div class="row">
        <div ref="inputRef" class="q-mx-sm q-mb-md col-10" bg-color="white" color="white">
          <new-moment-editor v-model="content" />
        </div>
        <q-btn v-if="rawNewText !== '' && !isRecognizing" round dense color="primary" icon="arrow_forward"
          @click="onSubmit" class="col-1" />
      </div>
      <!-- <q-input ref="inputRef" class="q-mx-sm q-mb-md" bg-color="white" color="white" type="text" rounded outlined autogrow
        v-model="rawNewText" placeholder="Feeling ... when/at/to ...  #mytag">
        <template v-slot:append>
          <q-btn v-if="rawNewText !== ''" round dense color="primary" icon="arrow_forward" @click="onSubmit" />
        </template>
      </q-input> -->
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import NewMomentEditor from './../components/NewMomentEditor.vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

const content = ref('')
const newIntensity = ref(0)
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
</script>

<style lang="scss">
// new-moment-editor {
//   min-height: 300px;
//   max-height: 500px;
//   overflow-y: auto;
//   background: #FAF594;
//   border: 3px solid #0D0D0D;
//   border-radius: 0.5rem;
//   margin: 1rem 0;
//   // position: relative;
// }
</style>
