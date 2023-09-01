<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">
    <!-- TODO:1 add animation prompting user to come back after adding moments or showing an example of this screen -->
    <q-item class="q-px-none q-pt-none">
      <q-item-section class=" col-auto">
        <q-btn unelevated rounded class="text-subtitle1 bg-button-on-background text-on-background" icon="calendar_today"
          no-caps @click="openFilterDialog('date')">{{ dateRangeButtonLabel }}</q-btn>
      </q-item-section>
    </q-item>

    <div>
      <q-item-label class="text-body1 text-weight-medium q-my-sm">Needs Satisfaction</q-item-label>
      <swiper-container ref="swiperElSatisfaction" init="false" auto-height="true" observer="true"
        observe-slide-children="true" grab-cursor="true" pagination-dynamic-bullets="true"
        @activeindexchange="(event) => onSliding(event, 'satisfaction')">
        <swiper-slide v-for="range in (segDateId === 'Yearly' ? dateRangesYears : dateRangesMonths) " :key="range">
          <learn-card-needs flag="satisfaction" :date-range="range" :second-seg-selected="secondSegSelectedSatisfaction"
            :learn-card-expanded="learnCardExpandedSatisfaction" seg-control
            @click:segmented-control="segmentedControlClicked" @click:show-button="showButtonClicked"
            @ready:periodFilteredSortedNeeds="periodFilteredSortedNeedsReady"></learn-card-needs>
        </swiper-slide>
      </swiper-container>
    </div>
    <div>
      <q-item-label class="text-body1 text-weight-medium q-my-sm">Needs Importance</q-item-label>
      <swiper-container ref="swiperElImportance" init="false" auto-height="true" observer="true"
        observe-slide-children="true" grab-cursor="true" pagination-dynamic-bullets="true"
        @activeindexchange="(event) => onSliding(event, 'importance')"
        @observerUpdate="console.log('SWIPER observerUpdate fired')" @update="console.log('SWIPER update fired')"
        @beforeDestroy="console.log('SWIPER beforeDestroy fired')" @destroy="console.log('SWIPER destroy fired')"
        @init="console.log('SWIPER init fired')">
        <swiper-slide v-for="range in (segDateId === 'Yearly' ? dateRangesYears : dateRangesMonths) " :key="range">
          <learn-card-needs flag="importance" :date-range="range" :learn-card-expanded="learnCardExpandedImportance"
            @click:show-button="showButtonClicked"
            @ready:periodFilteredSortedNeeds="periodFilteredSortedNeedsReady"></learn-card-needs>
        </swiper-slide>
      </swiper-container>
    </div>

    <q-dialog v-model="filterDialogOpen" position="bottom">
      <q-card class="bg-background q-px-sm">

        <div v-if="tappedFilter === 'date'">
          <q-card-section class="text-h5 text-weight-medium">Filter period
          </q-card-section>
          <q-card-section class="q-pt-xs text-outline">Filtering the period will take into account only the
            moments that happened
            during the selected period. </q-card-section>
          <div class="q-px-md">
            <segmented-control v-model="segDateId" :segments="segDate" element-name='LearnTabSegDate' />
          </div>
          <q-date v-if="segDateId === 'Monthly'" v-model="pickedDate" :options="optionsFn"
            :navigation-min-year-month="oldestMomentDateFormatted" :navigation-max-year-month="currentDateFormatted"
            default-view="Months" class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal
            years-in-month-view emit-immediately @update:model-value="onUpdatePickedDate" :key="monthsKey"></q-date>
          <q-date v-else-if="segDateId === 'Yearly'" v-model="pickedDate" :options="optionsFn"
            :navigation-min-year-month="oldestMomentDateFormatted" :navigation-max-year-month="currentDateFormatted"
            default-view="Years" class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal
            emit-immediately @update:model-value="onUpdatePickedDate" :key="yearsKey"></q-date>
        </div>

        <q-card-actions align="center">
          <q-btn rounded color="primary" @click="filterDialogOpen = false" padding="10px"
            class="text-body1 q-ma-sm full-width" no-caps>Done</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, nextTick, onActivated, onDeactivated, onMounted } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";
import LearnCardNeeds from "./../components/LearnCardNeeds.vue";
import { date } from "quasar";
// destructuring to keep only what is needed in date
const { formatDate, getDateDiff, startOfDate, addToDate } = date;
// import styles bundle //import 'swiper/css/bundle';

defineOptions({
  preFetch() {
    const momentsStore = useMomentsStore()
    console.log('In LearnTab preFetch')
    return momentsStore.fetchAggregateData();
  }
})

const momentsStore = useMomentsStore()
// onMounted(async () => {
//   try {
//     console.log('In LearnTab onMounted!!')

//     if (!momentsStore.aggregateDataFetched) {
//       await momentsStore.fetchAggregateData();
//     }
//     console.log('In LearnTab onMounted, await momentsStore.fetchAggregateData() done')
//   } catch (error) {
//     console.error('await momentsStore.fetchAggregateData() error:', error);
//   }
// })

const dateRangeButtonLabel = ref('This year')

//SWIPER
//TODO:2 for performance, we should move to append slides when many of them instead of pre-creating all of them and using v-for
const swiperElSatisfaction = ref(null)
const swiperElImportance = ref(null)

const swiperInitialized = ref(false)
const activeIndex = ref(0)

onActivated(() => {
  console.log('ONACTIVATED')
  if (!swiperInitialized.value) {
    swiperElSatisfaction.value.initialize();
    swiperElImportance.value.initialize();
    swiperElSatisfaction.value.swiper.activeIndex = activeIndex.value
    swiperElImportance.value.swiper.activeIndex = activeIndex.value
    swiperInitialized.value = true
  }
});
onDeactivated(() => {
  console.log('ONDEACTIVATED')
  swiperInitialized.value = false
});
watch(activeIndex, (newVal, oldVal) => {
  if (swiperInitialized.value) {
    console.log('in activeIndex watcher, activeIndex changed from', oldVal, 'to', newVal)

    swiperElSatisfaction.value.swiper.slideTo(newVal, 300)
    swiperElImportance.value.swiper.slideTo(newVal, 300)
    console.log('in activeIndex watcher2, swiperElImportance.value.swiper.activeIndex', swiperElImportance.value.swiper.activeIndex)

    swiperElSatisfaction.value.swiper.activeIndex = newVal
    swiperElImportance.value.swiper.activeIndex = newVal
    console.log('in activeIndex watcher3, swiperElImportance.value.swiper.activeIndex', swiperElImportance.value.swiper.activeIndex)

    console.log('CHECK IMPORTANCE', swiperElImportance.value.swiper)
    // console.log('CHECK SATISFACTION', swiperElSatisfaction.value.swiper)
  }
})

const secondSegSelectedSatisfaction = ref(false)
const segmentedControlClicked = ({ value, flag }) => {
  if (flag === 'satisfaction') secondSegSelectedSatisfaction.value = value
}
const learnCardExpandedSatisfaction = ref(false)
const learnCardExpandedImportance = ref(false)
const showButtonClicked = ({ value, flag }) => {
  if (flag === 'satisfaction') {
    learnCardExpandedSatisfaction.value = value
    nextTick(() => {
      swiperElSatisfaction.value.swiper.updateAutoHeight(300);
    })
  } else {
    learnCardExpandedImportance.value = value
    nextTick(() => {
      swiperElImportance.value.swiper.updateAutoHeight(300);
    })
  }
}

const periodFilteredSortedNeedsReady = ({ flag }) => {
  if (flag === 'satisfaction') {
    nextTick(() => {
      swiperElSatisfaction.value.swiper.updateAutoHeight(300);
    })
  } else {
    nextTick(() => {
      swiperElImportance.value.swiper.updateAutoHeight(300);
    })
  }
}

//DATES MANAGEMENT
const currentDate = computed(() => {
  return new Date()
})
const currentYYYYMM = computed(() => {
  return `${currentDate.value.getFullYear()}-${(currentDate.value.getMonth() + 1).toString().padStart(2, '0')}`
})

const oldestMomentDate = computed(() => {
  const days = momentsStore.uniqueDays;
  return days[days.length - 1] ?? currentDate.value;
})
const oldestMomentDateFormatted = computed(() => {
  return date.formatDate(oldestMomentDate.value, "YYYY/MM")
})
const currentDateFormatted = computed(() => {
  return date.formatDate(currentDate.value, "YYYY/MM")
})
const monthsSinceOldestMoment = computed(() => {
  return Math.max(1, date.getDateDiff(currentDate.value, oldestMomentDate.value, 'months'))
})
const yearsSinceOldestMoment = computed(() => {
  console.log('in yearsSinceOldestMoment computed, yearsSinceOldestMoment=', date.getDateDiff(currentDate.value, oldestMomentDate.value, 'years'))
  return date.getDateDiff(currentDate.value, oldestMomentDate.value, 'years')
})

const dateRangesYears = computed(() => {
  const dateRanges = [];
  for (let i = yearsSinceOldestMoment.value; i >= 0; i--) {
    dateRanges.push((currentDate.value.getFullYear() - i).toString());
  }
  console.log('in computed dateRangesYears, dateRanges is', dateRanges)
  return dateRanges;
});
const dateRangesMonths = computed(() => { //TODO:1 could be optimized
  const dateRanges = [];
  let trackingDate = new Date(oldestMomentDate.value);
  for (let i = 0; i <= monthsSinceOldestMoment.value; i++) {
    let month = trackingDate.getMonth() + 1; // +1 since getMonth returns 0-11
    let year = trackingDate.getFullYear();
    dateRanges.push(`${year}-${month.toString().padStart(2, '0')}`);
    trackingDate = date.addToDate(trackingDate, { months: 1 });
  }
  console.log('in computed dateRangesMonths, dateRanges is', dateRanges)
  return dateRanges;
});
const dateRangesMonthsToDate = (idx) => {
  const [yearStr, monthStr] = dateRangesMonths.value[idx].split('-');
  return new Date(Number(yearStr), Number(monthStr) - 1);
}

watch(dateRangesYears, (newValue) => {
  activeIndex.value = newValue.length - 1;
  console.log('in watch dateRangesYears updated activeIndex to', activeIndex.value)
}, { immediate: true }
);

//DIALOG
const filterDialogOpen = ref(false)
const tappedFilter = ref('date')
const openFilterDialog = (filter) => {
  tappedFilter.value = filter
  filterDialogOpen.value = true
}

const segDate = ref([{ title: "Monthly", id: "Monthly" }, { title: "Yearly", id: "Yearly" }])
const segDateId = ref("Yearly")

// initialize pickedDate as the first day of the current year with format YYYY/MM/DD
const pickedDate = ref(date.formatDate(date.startOfDate(currentDate.value, 'year'), "YYYY/MM/DD"))
const monthsKey = ref(Date.now()) //TODO:1 reduce to only one of those keys?
const yearsKey = ref(Date.now())
const optionsFn = (date) => {
  return date >= oldestMomentDate.value;
}

const updateDateButtonLabel = () => {
  switch (segDateId.value) {
    case 'Yearly':
      dateRangeButtonLabel.value = (currentDate.value.getFullYear() == dateRangesYears.value[activeIndex.value]) ? 'This year' : dateRangesYears.value[activeIndex.value].toString();
      break;

    case 'Monthly':
      if (currentYYYYMM.value == dateRangesMonths.value[activeIndex.value]) {
        dateRangeButtonLabel.value = 'This month';
      } else {
        dateRangeButtonLabel.value = (dateRangesMonthsToDate(activeIndex.value).getFullYear() == currentDate.value.getFullYear())
          ? date.formatDate(dateRangesMonthsToDate(activeIndex.value), 'MMMM')
          : date.formatDate(dateRangesMonthsToDate(activeIndex.value), 'MMMM YYYY');
      }
      break;

    default:
      break;
  }
}

//EVENTS
const onUpdatePickedDate = (newVal) => {
  console.log('onUpdatePickedDate newVal', newVal)
  if (newVal) {
    const year = newVal.split('/')[0]
    if (segDateId.value === 'Monthly') {
      monthsKey.value = Date.now()
      const month = newVal.split('/')[1]
      let nextMonthFirstDay = new Date(year, parseInt(month), 1);
      nextMonthFirstDay.setDate(nextMonthFirstDay.getDate() - 1);
      let currentMonthFirstDay = new Date(year, parseInt(month) - 1, 1);
      // Update currentSlide to the correct index in dateRangesMonths
      activeIndex.value = date.getDateDiff(currentMonthFirstDay, oldestMomentDate.value, 'months');
      console.log('currentMonthFirstDay', currentMonthFirstDay)
      console.log('oldestMomentDate.value', oldestMomentDate.value)
    } else if (segDateId.value === 'Yearly') {
      yearsKey.value = Date.now()
      activeIndex.value = date.getDateDiff(year, oldestMomentDate.value, 'years');
    }
    console.log('onUpdatePickedDate triggered currentSlide update to', activeIndex.value)
    updateDateButtonLabel()
  }
}

//i.e. onSegmentControlChange
watch(segDateId, (newVal, oldVal) => {
  console.log('watch(segDateId) triggered with newVal', newVal)
  if (newVal) {
    let max = date.getMaxDate(new Date(pickedDate.value), new Date(oldestMomentDate.value))
    pickedDate.value = date.formatDate(max, "YYYY/MM/DD")
    console.log('watch(segDateId) pickedDate.value', pickedDate.value)
    onUpdatePickedDate(pickedDate.value)
  }
  //TODO:1 ensure that when yearly (2023) > monthly selecting May (2023) > yearly (2023) > monthly the carousel has kept May and is not showing Jan as current
  //TODO:2 ensure that when yearly (2023) > monthly, the carousel is showing current month and not Jan
});

const onSliding = (event, flag) => {
  console.log('in onSliding, swiperElImportance.value.swiper.activeIndex', swiperElImportance.value.swiper.activeIndex)
  activeIndex.value = (flag === 'importance') ? swiperElImportance.value.swiper.activeIndex : swiperElSatisfaction.value.swiper.activeIndex
  console.log('In onSliding with flag', flag, ' activeIndex updated to ', activeIndex.value)
  updateDateButtonLabel()
  if (segDateId.value === 'Monthly') {
    pickedDate.value = date.formatDate(dateRangesMonthsToDate(activeIndex.value), "YYYY/MM/DD")
  } else if (segDateId.value === 'Yearly') {
    pickedDate.value = date.formatDate(new Date(dateRangesYears.value[activeIndex.value]), "YYYY/MM/DD")
  }
}

</script>

<style lang="scss">
.bg-button-on-background .q-icon {
  margin-right: 8px;
}
</style>
