<template >
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">

    <div
      v-if="momentsStore.aggregateData && momentsStore.aggregateData[dateRange] && momentsStore.aggregateData[dateRange].importance.length > 0">

      <q-item class="q-pt-none q-pl-none q-pr-xs q-mx-none q-pb-xs">
        <q-item-section class="text-h4 text-weight-bold">{{ needName }}</q-item-section>
        <q-item-section avatar class="q-pr-none" style="min-width: 52px;">
          <q-avatar size="42px" font-size="28px" :color="momentsStore.needToColor[needName]">
            {{ momentsStore.needsMap[needName][0] }}
          </q-avatar>
        </q-item-section>
      </q-item>
      <q-item class="q-pa-none q-pb-lg" dense style="min-height: 0px;">
        <span class="q-pa-none text-body2">
          {{ momentsStore.aggregateData[dateRange].importance.find(item => item.needName == needName).occurrenceCount }}
          {{ momentsStore.aggregateData[dateRange].importance.find(item => item.needName == needName).occurrenceCount == 1
            ?
            'moment' : 'moments' }}&nbsp;</span>
        <span class="q-pa-auto" style="font-size:0.4em;line-height:4;">●</span>
        <span class="text-body2 text-outline">&nbsp;{{ momentsStore.getDateLabel(dateRange) }}</span>
      </q-item>
    </div>

    <!-- <div style="position: relative; height:30vh;">

      <Doughnut v-if="loaded" ref="chartRef" :data="chartData" :options="chartOptions" class="q-mx-auto" />

      <div class="overlay-content" style="position: absolute; top: 44%; left: 50%; transform: translate(-50%, -50%);">
        <div v-if="isSegmentClicked">
          <q-avatar v-if="chartData.datasets[0].labels[clickedIndex] !== 'Others'" size="84px" font-size="56px"
            style="align-items: center; justify-content: center; display: flex; margin: 0 auto 8px;"
            :color="momentsStore.needToColor[chartData.datasets[0].labels[clickedIndex]]">
            {{ momentsStore.needsMap[chartData.datasets[0].labels[clickedIndex]][0] }}
          </q-avatar>
          <div class="text-body2 text-center q-mt-md q-mb-sm">{{ chartData.datasets[0].labels[clickedIndex]
          }}</div>
          <div class="text-h3 text-on-surface text-weight-bolder text-center">{{
            parseFloat((chartData.datasets[0].data[clickedIndex] *
              100).toFixed(0)) + "%" }}
          </div>
        </div>

        <div class="text-body2 text-center q-my-sm" v-else>{{ props.toggleValue == 'satisfaction' ? 'Satisfiers' :
          (props.toggleValue == 'unsatisfaction' ?
            'Dissatisfiers' : 'Top needs') }}</div>
      </div>
    </div> -->


    <div v-if="!momentsStore || !momentsStore.uniqueDays || momentsStore.uniqueDays.length == 0"></div>
    <div v-else>
      <div v-for="( day, index ) in uniqueDaysFromDateRangeAndNeed" :key="day">

        <div :class="[
          'text-h6',
          'text-weight-medium',
          'q-pa-none',
          'q-mb-sm',
          (index === 0 ? 'q-mt-none' : 'q-mt-lg'),
          'text-on-background'
        ]" header>{{ momentsStore.getFormattedDay(day) }}</div>
        <q-card flat class="bg-surface q-mb-md q-px-none q-py-xs rounded-borders-14">
          <div v-for=" moment  in  getSortedMomentsOfTheDay(day) " :key="moment.id" clickable v-ripple
            class="q-px-none q-py-sm" style="min-height: 0px;" @click="openBottomSheet(moment.id)">

            <q-item class="q-px-xs" style="min-height: 0px;">
              <q-item-section avatar top class="q-px-none" style="min-width: 20px;">
                <moment-sync-icon :moment-id="moment.id" :expected-llm-call-duration="expectedLlmCallDuration" />
              </q-item-section>
              <q-item-section class="text-body2 q-pb-none q-pl-none q-pr-md">{{ moment.text
              }}</q-item-section>
            </q-item>
            <!-- <q-item v-if="moment.needs && (moment.needs.error || moment.needs.Oops)" class="q-px-xs q-pt-none q-pb-xs"
              style="min-height: 0px;">
            </q-item>
            <q-item v-else-if="moment.needs && Object.keys(moment.needs).length > 0"
              class="q-px-xs q-pt-none q-pb-xs chip-container" style="min-height: 0px; width:100%;">
              <div class="horizontal-scroll" :style="setChipsRowPadding(moment.id)"
                @scroll="onChipsRowScroll($event, moment.id)">
                <q-chip v-for="need in Object.entries(moment?.needs).sort(([, a], [, b]) => b.importance - a.importance)"
                  :key="need[0]" outline :color="momentsStore.getChipColor(need[1])"
                  :icon="momentsStore.needsMap[need[0]][0]" :label="need[0]" class="needs" />
              </div>
            </q-item> -->
          </div>
        </q-card>
      </div>
      <moment-bottom-sheet v-model="momPageOpened" :moment-id="bottomSheetMomentId"
        :expected-llm-call-duration="expectedLlmCallDuration" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { Timestamp } from 'firebase/firestore'
import momentSyncIcon from 'src/components/momentSyncIcon.vue';
import momentBottomSheet from 'src/components/momentBottomSheet.vue'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
ChartJS.register(ArcElement);
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
import { date } from 'quasar'
const { isSameDate } = date;

//STORE INITIALIZATION
const momentsStore = useMomentsStore()

const emits = defineEmits(['update:isDialogOpened'])

const needName = ref('')
const dateRange = ref('')

watch(
  () => route.params.needSlug,
  newNeedSlug => {
    needName.value = momentsStore.needSlugToStr(newNeedSlug)
  }, { immediate: true }
)

watch(
  () => route.query.dateRange,
  newDateRange => {
    dateRange.value = newDateRange
  }, { immediate: true }
)

const uniqueDaysFromDateRangeAndNeed = computed(() => {
  // console.log('in uniqueDays computed, dateRange.value:', dateRange.value, "needName.value:", needName.value, "momentsStore.getUniqueDaysFromDateRangeAndNeed(dateRange.value, needName.value):", momentsStore.getUniqueDaysFromDateRangeAndNeed(dateRange.value, needName.value))
  return momentsStore.getUniqueDaysFromDateRangeAndNeed(dateRange.value, needName.value)
})

// Using await with fetchMoments ensures the function completes its execution before the component is mounted, which can be useful if your component relies on the data fetched by fetchMoments to render correctly.
onMounted(async () => {
  try {
    if (!momentsStore.aggregateDataFetched) {
      await momentsStore.fetchAggregateData();
    }
    if (!momentsStore.momentsFetched) {
      await momentsStore.fetchMoments();
    }
  } catch (error) {
    console.error('In NeedPage > await momentsStore.fetchMoments() error:', error);
  }
})

// onActivated(() => {
//   if (newMomInputRef.value && newMomText.value.length > 0) newMomInputRef.value.focus()
//   momsWithScrolledNeeds.value = {};
// })

const errorDialogOpened = ref(false)
const momsWithScrolledNeeds = ref({}); // This object will store scrollLeft values for each moment

const expectedLlmCallDuration = ref(60);
const momPageOpened = ref(false)
const bottomSheetMomentId = ref("")
const openBottomSheet = (momentId) => {
  console.log('in openBottomSheet momentId:', momentId)
  bottomSheetMomentId.value = momentId
  momPageOpened.value = true
}

watch([errorDialogOpened, momPageOpened], ([newVal1, newVal2], [oldVal1, oldVal2]) => {
  if (newVal1 || newVal2) emits('update:isDialogOpened', true)
  else emits('update:isDialogOpened', false)
})

// DISPLAY PREVIOUS MOMENTS
const getSortedMomentsOfTheDay = (day) => { //TODO:1 this should be in momentssStore directly
  let dt;
  if (day instanceof Date) {
    dt = day;
  } else {
    dt = (new Timestamp(day, 0)).toDate()
  }
  const ul = momentsStore?.momentsColl?.filter(moment => isSameDate(moment.date.toDate(), dt, "day") && moment.needs[needName.value])
  // sort array ul per descending moments.value.date.seconds
  const ol = ul?.sort((a, b) => b.date.seconds - a.date.seconds);
  return ol;
}

// DISPLAY PREVIOUS MOMENTS NEEDS
const onChipsRowScroll = (event, id) => {
  momsWithScrolledNeeds.value[id] = event.target.scrollLeft;
};
const setChipsRowPadding = (id) => {
  // If the scrollLeft value for the given ID is 0 or undefined, return the desired padding. Otherwise, no padding.
  return momsWithScrolledNeeds.value[id] ? 'padding-left: 0;' : 'padding-left: 48px;';
};
</script>

<style lang="scss">
.q-linear-progress__track,
.q-linear-progress__model {
  border-radius: 4px;
}

/* Hide scrollbar for IE, Edge, and Firefox */
.chip-container {
  scrollbar-width: none;
  /* For Firefox */
  -ms-overflow-style: none;
  /* For Internet Explorer and Edge */
}

.horizontal-scroll {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  transition: padding-left 0.9s ease;
  // cursor: grab; //disabled bec. misleading since horizontal scroll doesn't work on desktop

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
}

.horizontal-scroll .q-chip:first-child {
  margin-left: 0;
}

.needs {
  font-size: 0.8rem;
  // max-width: 200px; //truncate
}

.q-chip__icon {
  margin-bottom: 2px;
}
</style>


