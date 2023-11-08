<template >
  <q-card class="bg-surface q-px-sm q-pt-md q-pb-sm q-mb-lg rounded-borders-14" flat>
    <segmented-control style="margin-bottom: 8px;" v-if="props.segControl" :modelValue="segStatsId"
      @update:modelValue="newValue => segmentedControlClicked(newValue)" :segments="segStats"
      :element-name="segStatsName" />

    <div
      v-if="momentsStore.aggregateData && momentsStore.aggregateData[props.dateRange] && momentsStore.aggregateData[props.dateRange][sortingKey]?.length > 0">
      <div class="q-px-sm q-py-xs text-body2 text-outline">{{ props.flag == 'satisfaction' ? (props.secondSegSelected ?
        satisfactionInfo : unsatisfactionInfo) : importanceInfo }}
      </div>
      <q-list class="q-mt-xs">
        <!-- <transition-group appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut"> -->
        <transition-group appear enter-active-class="meala" leave-active-class="meala la" move-class="meala"
          enter-from-class="eflt" leave-to-class="eflt">

          <q-item v-for="item in momentsStore.aggregateData[props.dateRange][sortingKey].slice(0, numDisplayed).filter(item => item[props.flag == 'satisfaction' ? (props.secondSegSelected ?
            'satisfactionImpactLabelValue'
            : 'unsatisfactionImpactLabelValue') : 'importanceValue'] > 0.005)" :key="item.needName"
            class="q-pt-sm q-pb-sm q-px-xs" clickable>

            <q-item-section avatar class="q-pr-none" style="min-width: 52px;">
              <q-avatar square font-size="35px">
                {{ momentsStore.needsMap[item.needName][0] }}
              </q-avatar>
            </q-item-section>

            <q-item-section>

              <q-item class="q-pa-none" dense style="min-height: 0px;">
                <q-item-section class="text-subtitle2 text-weight-medium">{{ item.needName }}</q-item-section>
                <q-item-section side class="text-body2 text-on-surface">{{ parseFloat((item[props.flag == 'satisfaction' ?
                  (props.secondSegSelected ?
                    'satisfactionImpactLabelValue'
                    : 'unsatisfactionImpactLabelValue') : 'importanceValue'] * 100).toFixed(0)) + "%" }}
                </q-item-section>
              </q-item>

              <q-item class="q-pa-none" dense style="min-height: 0px;">
                <q-item-section class="text-caption text-outline">
                  <!-- {{ props.flag == 'satisfaction' ? (props.secondSegSelected ? 'Satisfied in' : 'Unsatisfied in') :
                    'Popped in' }} -->
                  {{ item.occurrenceCount }}
                  {{ item.occurrenceCount == 1 ? 'moment' : 'moments' }}
                </q-item-section>
                <q-item-section side class="text-caption text-outline">{{ props.flag ==
                  'satisfaction' ?
                  (props.secondSegSelected
                    ?
                    'of all satisfaction' :
                    'of all unsatisfaction'
                  ) : 'of total importance' }}
                </q-item-section>
              </q-item>

              <q-item class="q-px-xs q-pt-none" dense style="min-height: 0px;">
                <q-linear-progress :value="item[props.flag == 'satisfaction' ? (props.secondSegSelected ?
                  'satisfactionImpactDisplayValue'
                  : 'unsatisfactionImpactDisplayValue') : 'importanceDisplayValue']"
                  :buffer="item['importanceDisplayValue']"
                  :color="props.flag == 'satisfaction' ? (props.secondSegSelected ? 'green' : 'red') : '#{$primary}'"
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

    <q-card-actions
      v-if="momentsStore.aggregateData && momentsStore.aggregateData[props.dateRange] && momentsStore.aggregateData[props.dateRange][sortingKey]?.length > 5"
      align="center">
      <q-btn color="primary" @click="showButtonClicked" class="q-mx-sm q-mt-sm full-width" no-caps flat>{{
        props.learnCardExpanded ? 'Show less' : 'Show more' }}</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";
import { uid } from 'quasar'
import { date } from 'quasar'
const { formatDate } = date;

const momentsStore = useMomentsStore()

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

const emits = defineEmits(['click:segmentedControl', 'click:showButton', 'ready:aggregateData'])

const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear().toString());
const currentYYYYdMM = computed(() => `${currentYear.value}-${(currentDate.value.getMonth() + 1).toString().padStart(2, "0")}`);

const getPeriodLabel = computed(() => {
  return (dateRange) => {
    if (dateRange.length === 7) return (currentYYYYdMM.value === dateRange) ? 'this month' : (dateRange.substring(0, 4) === currentYear.value)
      ? `last ${formatDate(dateRange, 'MMMM')}`
      : `in ${formatDate(dateRange, 'MMMM YYYY')}`
    else if (dateRange.length === 4) return (currentYear.value === dateRange) ? 'this year' : `in ${dateRange}`;
  }
})

// const unsatisfactionInfo = "Your unsatisfied needs sorted from highest to lowest unsatisfaction impact."
const unsatisfactionInfo = `The needs that caused you the most unsatisfaction ${getPeriodLabel.value(props.dateRange)}.`
// const satisfactionInfo = "Your satisfied needs sorted from highest to lowest satisfaction impact."
const satisfactionInfo = `The needs that brought you the most satisfaction ${getPeriodLabel.value(props.dateRange)}.`
// const importanceInfo = "Your needs sorted from most to less important."
const importanceInfo = `The needs that held the greatest importance for you  ${getPeriodLabel.value(props.dateRange)}.`

const sortingKey = computed(() => {
  return props.flag == 'satisfaction' ? (props.secondSegSelected ? 'satisfaction' : 'unsatisfaction') : 'importance'
})

let segUid = uid()
// Example: 501e7ae1-7e6f-b923-3e84-4e946bff31a8
const segStats = ref([{ title: "Unsatisfied", id: "unsatisfied" + segUid }, { title: "Satisfied", id: "satisfied" + segUid }])
const segStatsId = computed(() => {
  return props.secondSegSelected ? "satisfied" + segUid : "unsatisfied" + segUid
})
const segStatsName = "segStats" + segUid

watch(() => momentsStore.aggregateData && momentsStore.aggregateData[props.dateRange] && momentsStore.aggregateData[props.dateRange][sortingKey.value], (newVal, oldVal) => {
  // console.log('In LearnCardNeeds, watch XXX55', newVal, ", replaced:", oldVal);
  if (newVal && newVal.length > 0) emits('ready:aggregateData', { flag: props.flag })
}, { immediate: true })

const numDisplayed = computed(() => {
  return props.learnCardExpanded ? momentsStore.aggregateData[props.dateRange][sortingKey.value].length : 5
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
