<template >
  <q-card class="bg-surface q-px-md q-pt-md q-pb-sm q-mb-lg rounded-borders-14" flat>
    <segmented-control style="margin-bottom: 8px;" v-if="props.segControl" :modelValue="segStatsId"
      @update:modelValue="newValue => segmentedControlClicked(newValue)" :segments="segStats"
      :element-name="segStatsName" />

    <q-card class="bg-primary-container" style="border-radius: 8px;" flat>
      <q-item class="q-px-md">
        <q-item-section side>
          <q-icon name="o_info" color="primary" size="32px" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ props.flag == 'satisfaction' ? (props.secondSegSelected ?
            satisfactionInfo : unsatisfactionInfo) : importanceInfo }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-card>

    <div v-if="periodFilteredSortedNeeds.length > 0">
      <q-list class="q-mt-xs">
        <!-- <transition-group appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut"> -->
        <transition-group appear enter-active-class="meala" leave-active-class="meala la" move-class="meala"
          enter-from-class="eflt" leave-to-class="eflt">

          <q-item v-for="[key, val] in periodFilteredSortedNeeds.slice(0, numDisplayed)" :key="key"
            class="q-pt-sm q-pb-sm q-px-xs" clickable>

            <q-item-section avatar class="q-pr-none">
              <q-avatar square font-size="35px">
                {{ val.emoji }}
              </q-avatar>
            </q-item-section>

            <q-item-section>

              <q-item class="q-px-xs" dense style="min-height: 0px;">
                <q-item-section>
                  <q-item-label>{{ key }}</q-item-label>
                  <q-item-label caption lines="1">{{ val.occurrenceCount }}
                    {{ val.occurrenceCount == 1 ? 'moment' : 'moments' }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>{{ parseFloat((val[props.flag == 'satisfaction' ? (props.secondSegSelected ?
                  'satisfactionImpactLabelValue'
                  : 'unsatisfactionImpactLabelValue') : 'importanceValue'] * 100).toFixed(0)) + "%" }}
                </q-item-section>
              </q-item>

              <q-item class="q-px-xs q-pt-none" dense style="min-height: 0px;">
                <q-linear-progress :value="val[props.flag == 'satisfaction' ? (props.secondSegSelected ?
                  'satisfactionImpactDisplayValue'
                  : 'unsatisfactionImpactDisplayValue') : 'importanceDisplayValue']"
                  :buffer="val['importanceDisplayValue']"
                  :color="props.flag == 'satisfaction' ? (props.secondSegSelected ? 'green' : 'red') : 'blue'"
                  track-color="grey" :reverse="props.secondSegSelected" class="q-mt-sm" rounded animation-speed="500" />
              </q-item>

            </q-item-section>
          </q-item>

        </transition-group>
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
import { computed, ref, onMounted, watch, nextTick } from 'vue'
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

const emits = defineEmits(['click:segmentedControl', 'click:showButton', 'ready:periodFilteredSortedNeeds'])

const unsatisfactionInfo = "Your unsatisfied needs sorted from highest to lowest unsatisfaction impact."
const satisfactionInfo = "Your satisfied needs sorted from highest to lowest satisfaction impact."
const importanceInfo = "Your needs sorted from most to less important."

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

watch(periodFilteredSortedNeeds, (newVal, oldVal) => {
  console.log('In periodFilteredSortedNeeds watch() with newVal:', newVal, 'and oldVal:', oldVal);
  if (newVal && newVal.length > 0) emits('ready:periodFilteredSortedNeeds', { flag: props.flag })
})

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
.meala {
  transition: all 0.5s ease;
}

.eflt {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.la {
  position: absolute;
}

.q-linear-progress__track,
.q-linear-progress__model {
  border-radius: 4px;
}
</style>
