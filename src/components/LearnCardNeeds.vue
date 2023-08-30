<template >
  <q-card class="bg-surface q-px-md q-pt-md q-pb-sm q-mb-lg rounded-borders-14" flat>
    <segmented-control v-if="props.segControl" :modelValue="segStatsId"
      @update:modelValue="newValue => segmentedControlClicked(newValue)" :segments="segStats"
      :element-name="segStatsName" />

    <div v-if="periodFilteredSortedNeeds.length > 0">
      <q-list>
        <q-item v-for="[key, val] in periodFilteredSortedNeeds.slice(0, numDisplayed)" :key="key" class="q-pt-xs q-pb-xs"
          clickable>
          <!-- <q-item class="q-px-none q-pb-none row"> -->

          <q-item-section avatar>
            <q-avatar>
              <img :src="`https://cdn.quasar.dev/img/avatar2.jpg`">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ key }}</q-item-label>
                  <q-item-label caption lines="1">{{ val['occurrenceCount'] }}
                    {{ val['occurrenceCount'] == 1 ? 'moment' : 'moments' }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>{{ parseFloat((val[props.flag == 'satisfaction' ? (props.secondSegSelected ?
                  'satisfactionImpactLabelValue'
                  : 'unsatisfactionImpactLabelValue') : 'importanceValue'] * 100).toFixed(0)) + "%" }}
                </q-item-section>
              </q-item>
              <q-item class="q-pb-sm">
                <q-linear-progress :value="val[props.flag == 'satisfaction' ? (props.secondSegSelected ?
                  'satisfactionImpactDisplayValue'
                  : 'unsatisfactionImpactDisplayValue') : 'importanceDisplayValue']"
                  :buffer="val['importanceDisplayValue']"
                  :color="props.flag == 'satisfaction' ? (props.secondSegSelected ? 'green' : 'red') : 'blue'"
                  track-color="grey" :reverse="props.secondSegSelected" class="q-mt-sm" rounded />
              </q-item>
            </q-list>
          </q-item-section>



        </q-item>
      </q-list>
    </div>

    <div v-else class="bg-surface q-px-md q-py-md rounded-borders-14" flat>
      <!-- system not ready or no need ever recorded -->
      <div v-if="!momentsStore || !momentsStore.hasNeeds">
        Add Moments in the Home tab to learn more about your needs!
      </div>
      <!-- system ready but no need recorded for the period-->
      <div v-else>
        <div v-if="props.flag == 'satisfaction'">
          <div v-if="props.secondSegSelected">
            No satisfied needs for this period.
          </div>
          <div v-else>
            No unsatisfied needs for this period
          </div>
        </div>
        <div v-else>
          No needs for this period
        </div>
      </div>
    </div>

    <q-card-actions v-if="periodFilteredSortedNeeds.length > 5" align="center">
      <q-btn color="primary" @click="showButtonClicked" class="q-mx-sm q-mt-sm full-width" no-caps flat>{{
        props.learnCardExpanded ? 'Show less' : 'Show more' }}</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";
import { uid } from 'quasar'
// import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

const momentsStore = useMomentsStore()
onMounted(async () => {
  console.log('In LearnCardNeeds onMounted() with props.flag:', props.flag, 'and props.dateRange:', props.dateRange);
  try {
    if (!momentsStore.aggregateDataFetched) {
      await momentsStore.fetchAggregateData();
    }
  } catch (error) {
    console.error('In LearnCardNeeds store fetching error:', error);
  }
})

const props = defineProps({
  flag: {
    type: String,
    default: 'satisfaction',
  },
  dateRange: {
    type: String,
    //set default to be the first day of the year to today
    default: () => { new Date().getFullYear().toString() },
  },
  segControl: {
    type: Boolean,
    default: false,
  },
  secondSegSelected: {
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
  return props.secondSegSelected ? "satisfied" + segUid : "unsatisfied" + segUid
})
const segStatsName = "segStats" + segUid

const periodFilteredSortedNeeds = computed(() => {
  console.log('In periodFilteredSortedNeeds computed() with props.flag:', props.flag, 'and props.dateRange:', props.dateRange);
  if (!momentsStore.aggregateDataFetched) {
    console.log('In periodFilteredSortedNeeds computed() with momentsStore.aggregateDataFetched false');
    return [];
  }

  let filter, sortKey;

  if (props.flag == 'satisfaction') {
    filter = props.secondSegSelected ? 'satisfied' : 'unsatisfied';
    sortKey = props.secondSegSelected ? 'satisfactionImpactLabelValue' : 'unsatisfactionImpactLabelValue';
  }
  else if (props.flag == 'importance') {
    sortKey = 'importanceValue';
  }

  return momentsStore.getFilteredSortedNeeds(props.dateRange, filter, sortKey).value;
});

// setInterval(async () => {
//   // Recompute periodFilteredSortedNeeds.
//   periodFilteredSortedNeeds();
//   // Force Vue to repaint.
//   await nextTick();
// }, 2000);

// function trackProcess(dotsPos) {
//   //The position is expressed as a percentage, with 0 representing the start point and 100 representing the end point.
//   // cf. https://nightcatsama.github.io/vue-slider-component/#/basics/process
//   return [[50, dotsPos[0]]]
// }

const numDisplayed = computed(() => {
  return props.learnCardExpanded ? periodFilteredSortedNeeds.value.length : 5
})

const segmentedControlClicked = () => {
  props.secondSegSelected ? emits('click:segmentedControl', { value: false, flag: props.flag }) : emits('click:segmentedControl', { value: true, flag: props.flag });
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
</style>
