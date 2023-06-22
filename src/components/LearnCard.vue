<template >
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

  <q-card class="bg-surface q-px-md q-pt-md q-pb-sm q-mb-lg rounded-borders-14" flat>
    <segmented-control v-model="segId" :segments="seg" :element-name="segName" />

    <q-list v-if="segId.includes('avgIntensity')">
      <q-card-section class="q-pt-xs q-pb-xs" clickable
        v-for="tag in filteredAvgIntensitySortedTags.slice(0, numDisplayed)" :key="tag">
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

          <q-item-section class="col-1 text-center">
            {{ parseFloat(tag.avgIntensity.toFixed(1)) }}
          </q-item-section>

        </q-item>
      </q-card-section>
    </q-list>

    <q-list v-else-if="segId.includes('percentShare')">
      <q-card-section class="q-pt-xs q-pb-xs" clickable
        v-for="tag in filteredPercentShareSortedTags.slice(0, numDisplayed)" :key="tag">
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
            <q-linear-progress :value="tag.percentShare" rounded color="primary" track-color="primary-container"
              class="q-mt-sm" />
          </q-item-section> -->
          <q-item-section class="col-6 text-center">
            In {{ (tag.percentShare * 100).toFixed(0) + "%" }} of moments
          </q-item-section>

        </q-item>
      </q-card-section>
    </q-list>

    <q-card-actions v-if="filteredAvgIntensitySortedTags.length > 5" align="center">
      <q-btn color="primary"
        @click="numDisplayed === 5 ? numDisplayed = filteredAvgIntensitySortedTags.length : numDisplayed = 5"
        class="q-mx-sm q-mt-sm full-width" no-caps flat>{{ numDisplayed === 5 ? 'Show more' : 'Show less' }}</q-btn>
    </q-card-actions>

  </q-card>
  <!-- </q-carousel-slide>
      </q-carousel> -->
</template>

<script setup>
import { computed, ref } from 'vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";

const props = defineProps({
  flag: {
    type: String,
    default: 'Kifs',
  }
});

//STORE INITIALIZATION
const momentsStore = useMomentsStore()
// onMounted(async () => {
//   if (!momentsStore.initialized) {
//     await momentsStore.fetchMoments();
//   }
// })

const seg = ref([{ title: "Intensity average", id: `avgIntensity${props.flag}` }, { title: "Frequency", id: `percentShare${props.flag}` }])
const segId = ref(`avgIntensity${props.flag}`)
const segName = `LearnTabSeg${props.flag}`
const numDisplayed = ref(5)

const filteredAvgIntensitySortedTags = computed(() => {
  const tempList = momentsStore.avgIntensitySortedTags.filter(tag => (props.flag === 'Kifs' ? tag.avgIntensity >= 0 : tag.avgIntensity < 0))
  return props.flag === 'Kifs' ? tempList : tempList.sort((a, b) => a.avgIntensity - b.avgIntensity)
})
const filteredPercentShareSortedTags = computed(() => {
  return momentsStore.percentShareSortedTags.filter(tag => (props.flag === 'Kifs' ? tag.avgIntensity >= 0 : tag.avgIntensity < 0))
})

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



