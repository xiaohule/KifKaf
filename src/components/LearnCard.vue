<template >
  <q-card class="bg-surface q-px-md q-pt-md q-pb-sm q-mb-lg rounded-borders-14" flat>
    <segmented-control :modelValue="segStatsId" @update:modelValue="newValue => segmentedControlClicked(newValue)"
      :segments="segStats" :element-name="segStatsName" />

    <div v-if="avgIntensitySortedTags.length > 0">
      <q-list v-if="segStatsId.includes('avgIntensity')">
        <q-card-section class="q-pt-xs q-pb-xs" clickable v-for="tag in avgIntensitySortedTags.slice(0, numDisplayed)"
          :key="tag">
          <q-item class="q-px-none q-pb-none row">

            <q-item-section class="col-6">
              <q-item class="q-px-none q-py-none tags" style="min-height: 0px;" dense>
                {{ '#' + tag.id }}
              </q-item>
              <q-item class="q-px-none q-py-none" style="min-height: 0px;" dense>
                {{ tag.count }} {{ tag.count === 1 ? 'moment' : 'moments' }}
              </q-item>
            </q-item-section>

            <q-item-section class="col-5">
              <vue-slider v-model="tag.avgIntensity" :process="trackProcess" :min="-5" :max="5" :interval="1" disabled
                tooltip="none"></vue-slider>
            </q-item-section>

            <q-item-section class="col-1 text-center">
              {{ parseFloat(tag.avgIntensity.toFixed(1)) }}
            </q-item-section>

          </q-item>
        </q-card-section>
      </q-list>

      <q-list v-else-if="segStatsId.includes('percentShare')">
        <q-card-section class="q-pt-xs q-pb-xs" clickable v-for="tag in percentShareSortedTags.slice(0, numDisplayed)"
          :key="tag">
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
    </div>

    <div v-else class="bg-surface q-px-md q-py-md rounded-borders-14" flat>
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
      <q-btn color="primary" @click="showButtonClicked" class="q-mx-sm q-mt-sm full-width" no-caps flat>{{
        props.learnCardExpanded ? 'Show less' : 'Show more' }}</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";
import { uid } from 'quasar'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

const momentsStore = useMomentsStore()

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
  frequencySelected: {
    type: Boolean,
    default: false,
  },
  learnCardExpanded: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['click:segmentedControl'], ['click:showButton'])

let segUid = uid()
// Example: 501e7ae1-7e6f-b923-3e84-4e946bff31a8
const segStats = ref([{ title: "Intensity average", id: "avgIntensity" + segUid }, { title: "Frequency", id: "percentShare" + segUid }])
// const segStatsId = ref("avgIntensity" + segUid)
const segStatsId = computed(() => {
  return props.frequencySelected ? "percentShare" + segUid : "avgIntensity" + segUid
})

const segStatsName = "segStats" + segUid

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

const numDisplayed = computed(() => {
  return props.learnCardExpanded ? avgIntensitySortedTags.value.length : 5
})

const segmentedControlClicked = () => {
  props.frequencySelected ? emits('click:segmentedControl', { value: false, flag: props.flag }) : emits('click:segmentedControl', { value: true, flag: props.flag });
}
const showButtonClicked = () => {
  props.learnCardExpanded ? emits('click:showButton', { value: false, flag: props.flag }) : emits('click:showButton', { value: true, flag: props.flag });
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
