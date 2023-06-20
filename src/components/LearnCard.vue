<template >
  <!-- <q-item-label class="text-body1 text-weight-medium q-my-sm">Kifs</q-item-label> -->

  <!-- height="500px" -->
  <!-- TODO: need a better carousel that allow for more programmaticity for previous slides and auto height? -->
  <!-- <q-carousel v-model="slide" transition-prev="slide-right" transition-next="slide-left" swipeable animated
        control-color="button-on-background" navigation padding class="bg-transparent" height="480px">
        <q-carousel-slide :name="8" class="column no-wrap">
          test 8
        </q-carousel-slide>
        <q-carousel-slide :name="9" class="column no-wrap">
          test 9
        </q-carousel-slide>
        <q-carousel-slide :name="10" class="column no-wrap"> -->

  <q-card class="bg-surface q-px-md q-pt-md q-pb-none q-mb-lg rounded-borders-14" flat>
    <segmented-control v-model="segIdKifs" :segments="segKifs" element-name='LearnTabSegKifs' />

    <q-list v-if="segIdKifs === 'avgIntensity'">
      <q-card-section class="q-pt-xs q-pb-xs" clickable
        v-for="tag in momentsStore.avgIntensitySortedTags.slice(0, numDisplayedKifs)" :key="tag">
        <q-item data-cy="learn-tab-tag-row" class="q-px-none q-pb-none row">

          <q-item-section class="col-6">
            <q-item class="q-px-none q-py-none tags" style="min-height: 0px;" dense>
              {{ '#' + tag.id }}
            </q-item>
            <q-item class="q-px-none q-py-none" style="min-height: 0px;" dense>
              {{ tag.count }} {{ tag.count === 1 ? 'moment' : 'moments' }}
            </q-item>
          </q-item-section>

          <q-item-section class="col-5">
            <vue-slider v-model="tag.avgIntensity" :process="trackProcess" :min="-5" :max="5" :interval="1"
              disabled></vue-slider>
          </q-item-section>

          <q-item-section class=" col-1 text-center">
            {{ parseFloat(tag.avgIntensity.toFixed(1)) }}
          </q-item-section>

        </q-item>
      </q-card-section>
    </q-list>

    <q-list v-else-if="segIdKifs === 'pointsShare'">
      <q-card-section class="q-pt-xs q-pb-xs" clickable
        v-for="tag in momentsStore.pointsShareSortedTags.slice(0, numDisplayedKifs)" :key="tag">
        <div> {{ console.log(tag) }}</div>
        <q-item class="q-px-none q-pb-none row">

          <q-item-section class="col-6">
            <q-item class="q-px-none q-py-none tags" style="min-height: 0px;" dense>
              {{ '#' + tag.id }}
            </q-item>
            <q-item class="q-px-none q-py-none" style="min-height: 0px;" dense>
              {{ tag.count }} {{ tag.count === 1 ? 'moment' : 'moments' }}
            </q-item>
          </q-item-section>

          <!-- <q-item-section class="col-5">
                <vue-slider v-model="tag.avgIntensity" :process="trackProcess" :min="-5" :max="5" :interval="1"
                  disabled></vue-slider>
              </q-item-section> -->
          <q-item-section class=" col-6 ">
            Present in {{ (tag.posPointsShare * 100).toFixed(0) + "%" }} of your Kifs points
          </q-item-section>

        </q-item>
      </q-card-section>
    </q-list>

    <q-card-actions align="center">
      <q-btn color="primary"
        @click="numDisplayedKifs === 5 ? numDisplayedKifs = momentsStore.avgIntensitySortedTags.length : numDisplayedKifs = 5"
        class="q-ma-sm full-width" no-caps flat>{{ numDisplayedKifs === 5 ? 'Show more' : 'Show less' }}</q-btn>
    </q-card-actions>

  </q-card>
  <!-- </q-carousel-slide>
      </q-carousel> -->
</template>

<script setup>
import { ref } from 'vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";

//STORE INITIALIZATION
const momentsStore = useMomentsStore()
// onMounted(async () => {
//   if (!momentsStore.initialized) {
//     await momentsStore.fetchMoments();
//   }
// })

const numDisplayedKifs = ref(5)
const segKifs = ref([{ title: "Intensity avg", id: "avgIntensity" }, { title: "%", id: "pointsShare" }])
const segIdKifs = ref("avgIntensity")

function trackProcess(dotsPos) {
  //The position is expressed as a percentage, with 0 representing the start point and 100 representing the end point.
  // cf. https://nightcatsama.github.io/vue-slider-component/#/basics/process
  return [[50, dotsPos[0]]]
}
</script>

<style lang="scss">
.tags {
  font-size: 0.9rem;
  color: color(primary);
}

// .bg-button-on-background .q-icon {
//   margin-right: 8px;
// }
</style>



