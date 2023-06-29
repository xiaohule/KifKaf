<template >
  <q-card class="bg-surface q-px-md q-pt-md q-pb-sm rounded-borders-14" flat>
    <segmented-control v-model="segId" :segments="seg" :element-name="segName" />

    <div v-if="avgIntensitySortedTags.length > 0">
      <q-list v-if="segId.includes('avgIntensity')">
        <q-card-section class="q-pt-xs q-pb-xs" clickable v-for="tag in avgIntensitySortedTags.slice(0, numDisplayed)"
          :key="tag">
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
        <q-card-section class="q-pt-xs q-pb-xs" clickable v-for="tag in percentShareSortedTags.slice(0, numDisplayed)"
          :key="tag">
          <q-item data-cy="learn-tab-tag-row-percentShare" class="q-px-none q-pb-none row">

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
    </div>

    <div v-else class="bg-surface q-px-md q-py-md q-mb-lg rounded-borders-14" flat>
      <div v-if="props.flag === 'positive'">
        <div
          v-if="!momentsStore || !momentsStore.getTags(allTimeDateRange, props.flag).value.length || momentsStore.getTags(allTimeDateRange, props.flag).value.length === 0">
          First add some Kifs in Home tab to learn about what energizes you!
        </div>
        <div v-else>
          No Kifs for this period
        </div>
      </div>
      <div v-else>
        <div
          v-if="!momentsStore || !momentsStore.getTags(allTimeDateRange, props.flag).value.length || momentsStore.getTags(allTimeDateRange, props.flag).value.length === 0">
          First add some Kafs in Home tab to learn about what drains you!
        </div>
        <div v-else>
          No Kafs for this period
        </div>
      </div>
    </div>

    <q-card-actions v-if="avgIntensitySortedTags.length > 5" align="center">
      <q-btn color="primary" @click="numDisplayed === 5 ? numDisplayed = avgIntensitySortedTags.length : numDisplayed = 5"
        class="q-mx-sm q-mt-sm full-width" no-caps flat>{{ numDisplayed === 5 ? 'Show more' : 'Show less' }}</q-btn>
    </q-card-actions>
  </q-card>
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
    default: 'positive',
  },
  dateRange: {
    type: Array,
    //set default to be the first day of the year to today
    default: () => { [new Date(new Date().getFullYear(), 0, 1), new Date()] },
  },
});

const momentsStore = useMomentsStore()

const seg = ref([{ title: "Intensity average", id: `avgIntensity${props.flag}` }, { title: "Frequency", id: `percentShare${props.flag}` }])
const segId = ref(`avgIntensity${props.flag}`)
const segName = `LearnTabSeg${props.flag}`
const numDisplayed = ref(5)
const allTimeDateRange = ref([new Date(0), new Date()])

const avgIntensitySortedTags = computed(() => {
  return momentsStore.getTags(props.dateRange, props.flag, 'avgIntensity', props.flag === 'positive').value
})

const percentShareSortedTags = computed(() => {
  return momentsStore.getTags(props.dateRange, props.flag, 'percentShare').value
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

// .carousel .vue-slider {
//   box-sizing: content-box !important;
// }

// .carousel .segmented-control {
//   box-sizing: inherit !important;
// }
</style>
