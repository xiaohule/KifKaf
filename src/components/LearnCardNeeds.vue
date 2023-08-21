<template >
  <q-card class="bg-surface q-px-md q-pt-md q-pb-sm q-mb-lg rounded-borders-14" flat>
    <segmented-control :modelValue="segStatsId" @update:modelValue="newValue => segmentedControlClicked(newValue)"
      :segments="segStats" :element-name="segStatsName" />

    <div v-if="unsatisfiedSortedNeeds.length > 0 || satisfiedSortedNeeds.length > 0">
      <q-list v-if="segStatsId.includes('unsatisfied')">
        <q-card-section class="q-pt-xs q-pb-xs" clickable v-for="need in unsatisfiedSortedNeeds.slice(0, numDisplayed)"
          :key="need">
          <q-item class="q-px-none q-pb-none row">

            <q-item-section class="col-6">
              <q-item class="q-px-none q-py-none tags" style="min-height: 0px;" dense>
                {{ '#' + need.id }}
              </q-item>
              <q-item class="q-px-none q-py-none" style="min-height: 0px;" dense>
                {{ need.count }} {{ need.count === 1 ? 'moment' : 'moments' }}
              </q-item>
            </q-item-section>

            <q-item-section class="col-5">
              <vue-slider v-model="need.avgImportance" :process="trackProcess" :min="-5" :max="5" :interval="1" disabled
                tooltip="none"></vue-slider>
            </q-item-section>

            <q-item-section class="col-1 text-center">
              {{ parseFloat(need.avgImportance.toFixed(1)) }}
            </q-item-section>

          </q-item>
        </q-card-section>
      </q-list>

      <q-list v-else-if="segStatsId.includes('satisfied')">
        <q-card-section class="q-pt-xs q-pb-xs" clickable v-for="need in satisfiedSortedNeeds.slice(0, numDisplayed)"
          :key="need">
          <q-item class="q-px-none q-pb-none row">

            <q-item-section class="col-6">
              <q-item class="q-px-none q-py-none tags" style="min-height: 0px;" dense>
                {{ '#' + need.id }}
              </q-item>
              <q-item class="q-px-none q-py-none" style="min-height: 0px;" dense>
                {{ need.count }} {{ need.count === 1 ? 'moment' : 'moments' }}
              </q-item>
            </q-item-section>
            <q-item-section class="col-6 text-center">
              In {{ (need.percentShare * 100).toFixed(0) + "%" }} of moments
            </q-item-section>

          </q-item>
        </q-card-section>
      </q-list>
    </div>

    <div v-else class="bg-surface q-px-md q-py-md rounded-borders-14" flat>
      <div
        v-if="!momentsStore || !momentsStore.getNeeds(allTimeDateRange).value.length || momentsStore.getNeeds(allTimeDateRange).value.length === 0">
        Add Moments in the Home tab to learn more about your needs!
      </div>
      <div v-else>
        No unsatisfied needs for this period
      </div>
    </div>

    <q-card-actions v-if="unsatisfiedSortedNeeds.length > 5" align="center">
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
  dateRange: {
    type: Array,
    //set default to be the first day of the year to today
    default: () => { [new Date(new Date().getFullYear(), 0, 1), new Date()] },
  },
  satisfiedSelected: {
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
const segStats = ref([{ title: "Unsatisfied", id: "unsatisfied" + segUid }, { title: "Satisfied", id: "satisfied" + segUid }])
const segStatsId = computed(() => {
  return props.satisfiedSelected ? "satisfied" + segUid : "unsatisfied" + segUid
})

const segStatsName = "segStats" + segUid

const allTimeDateRange = ref([new Date(0), new Date()])

const unsatisfiedSortedNeeds = computed(() => {
  return momentsStore.getNeeds(props.dateRange, 'unsatisfied').value
})

const satisfiedSortedNeeds = computed(() => {
  return momentsStore.getNeeds(props.dateRange, 'satisfied').value
})

function trackProcess(dotsPos) {
  //The position is expressed as a percentage, with 0 representing the start point and 100 representing the end point.
  // cf. https://nightcatsama.github.io/vue-slider-component/#/basics/process
  return [[50, dotsPos[0]]]
}

const numDisplayed = computed(() => {
  return props.learnCardExpanded ? unsatisfiedSortedNeeds.value.length : 5
})

const segmentedControlClicked = () => {
  props.satisfiedSelected ? emits('click:segmentedControl', { value: false }) : emits('click:segmentedControl', { value: true });
}
const showButtonClicked = () => {
  props.learnCardExpanded ? emits('click:showButton', { value: false }) : emits('click:showButton', { value: true });
}
</script>

<style lang="scss">
.tags {
  font-size: 0.9rem;
  color: color(primary);
}
</style>
