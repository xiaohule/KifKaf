<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">
    <!-- TODO:1 add animation prompting user to come back after adding moments or showing an example of this screen -->
    <!-- <div v-if="!momentsStore || !computedUniqueTags || computedUniqueTags.length === 0"></div> -->
    <q-item class="q-px-none q-pt-none">
      <!-- <q-item-section class="col-auto">
          <q-btn unelevated rounded class="text-subtitle1 bg-button-on-background text-on-background" icon="tag" no-caps
            @click="openFilterDialog('tags')">{{ tagsButtonLabel }}</q-btn>
        </q-item-section> -->
      <q-item-section class=" col-auto">
        <q-btn unelevated rounded class="text-subtitle1 bg-button-on-background text-on-background" icon="calendar_today"
          no-caps @click="openFilterDialog('date')">{{ dateRangeButtonLabel }}</q-btn>
      </q-item-section>
    </q-item>

    <div>
      <q-item-label class="text-body1 text-weight-medium q-my-sm">Unsatisfied Needs</q-item-label>
      <swiper-container ref="swiperElNegative" init="false" auto-height="true" observer="true"
        observe-slide-children="true" grab-cursor="true" pagination-dynamic-bullets="true"
        @activeindexchange="(event) => onSliding(event, 'negative')">
        <swiper-slide v-for="range in (segDateId === 'Yearly' ? dateRangesYears : dateRangesMonths) " :key="range">
          <learn-card-needs flag="negative" :date-range="range" :frequency-selected="frequencySelectedNegative"
            @click:segmented-control="segmentedControlClicked" :learn-card-expanded="learnCardExpandedNegative"
            @click:show-button="showButtonClicked"></learn-card-needs>
        </swiper-slide>
      </swiper-container>
    </div>

    <!--  @slidechange="console.log('SWIPER slidechange fired', $event)"
        @slidechangetransitionend="console.log('SWIPER slidechangetransitionend fired', $event)"-->
    <div>
      <q-item-label class="text-body1 text-weight-medium q-my-sm">Satisfied Needs</q-item-label>
      <swiper-container ref="swiperElPositive" init="false" auto-height="true" observer="true"
        observe-slide-children="true" grab-cursor="true" pagination-dynamic-bullets="true"
        @activeindexchange="(event) => onSliding(event, 'positive')"
        @observerUpdate="console.log('SWIPER observerUpdate fired')" @update="console.log('SWIPER update fired')"
        @beforeDestroy="console.log('SWIPER beforeDestroy fired')" @destroy="console.log('SWIPER destroy fired')"
        @init="console.log('SWIPER init fired')">
        <swiper-slide v-for="range in (segDateId === 'Yearly' ? dateRangesYears : dateRangesMonths) " :key="range">
          <learn-card-needs flag="positive" :date-range="range" :frequency-selected="frequencySelectedPositive"
            @click:segmented-control="segmentedControlClicked" :learn-card-expanded="learnCardExpandedPositive"
            @click:show-button="showButtonClicked"></learn-card-needs>
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
import { ref, computed, watch, nextTick, onActivated, onDeactivated } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";
import LearnCardNeeds from "./../components/LearnCardNeeds.vue";
import { date } from "quasar";
// destructuring to keep only what is needed in date
const { formatDate, getDateDiff, startOfDate } = date;
// import styles bundle
// import 'swiper/css/bundle';

const momentsStore = useMomentsStore()

const dateRangeButtonLabel = ref('This year')
// const tagsButtonLabel = ref('All tags')

//SWIPER
//TODO:2 for performance, we should move to append slides when many of them instead of pre-creating all of them and using v-for
const swiperElPositive = ref(null)
const swiperElNegative = ref(null)
const swiperInitialized = ref(false)
const activeIndex = ref(0)

onActivated(() => {
  console.log('ONACTIVATED')
  if (!swiperInitialized.value) {
    swiperElPositive.value.initialize();
    swiperElNegative.value.initialize();
    swiperElPositive.value.swiper.activeIndex = activeIndex.value
    swiperElNegative.value.swiper.activeIndex = activeIndex.value
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

    swiperElPositive.value.swiper.slideTo(newVal, 300)
    console.log('in activeIndex watcher2, swiperElPositive.value.swiper.activeIndex', swiperElPositive.value.swiper.activeIndex)
    swiperElNegative.value.swiper.slideTo(newVal, 300)

    swiperElPositive.value.swiper.activeIndex = newVal
    console.log('in activeIndex watcher3, swiperElPositive.value.swiper.activeIndex', swiperElPositive.value.swiper.activeIndex)
    swiperElNegative.value.swiper.activeIndex = newVal

    console.log('CHECK POSITIVE', swiperElPositive.value.swiper)
    // console.log('CHECK NEGATIVE', swiperElNegative.value.swiper)
  }
})

const frequencySelectedPositive = ref(false)
const frequencySelectedNegative = ref(false)
const segmentedControlClicked = ({ value, flag }) => {
  flag === 'positive' ? frequencySelectedPositive.value = value : frequencySelectedNegative.value = value
}
const learnCardExpandedPositive = ref(false)
const learnCardExpandedNegative = ref(false)
const showButtonClicked = ({ value, flag }) => {
  if (flag === 'positive') {
    learnCardExpandedPositive.value = value
    nextTick(() => {
      swiperElPositive.value.swiper.updateAutoHeight(300);
    })
  } else {
    learnCardExpandedNegative.value = value
    nextTick(() => {
      swiperElNegative.value.swiper.updateAutoHeight(300);
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

const computedUniqueDays = computed(() => {
  return momentsStore.uniqueDays || []
})
const oldestMomentDate = computed(() => {
  return computedUniqueDays.value[computedUniqueDays.value.length - 1] ?? currentDate.value;
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
    dateRanges.push(currentDate.value.getFullYear() - i);
  }
  console.log('in computed dateRangesYears, dateRanges is', dateRanges)
  return dateRanges;
});
const dateRangesMonths = computed(() => {
  let trackingDate = new Date(currentDate.value);
  const dateRanges = [];
  for (let i = monthsSinceOldestMoment.value; i >= 0; i--) {
    let month = trackingDate.getMonth() + 1; // +1 since getMonth returns 0-11
    let year = trackingDate.getFullYear();
    dateRanges.push(`${year}-${month.toString().padStart(2, '0')}`);
    trackingDate.setMonth(trackingDate.getMonth() - 1); // Decrease month by 1
  }
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
      dateRangeButtonLabel.value = (currentDate.value.getFullYear() === dateRangesYears.value[activeIndex.value]) ? 'This year' : dateRangesYears.value[activeIndex.value].toString();
      break;

    case 'Monthly':
      if (currentYYYYMM.value === dateRangesMonths.value[activeIndex.value]) {
        dateRangeButtonLabel.value = 'This month';
      } else {
        dateRangeButtonLabel.value = (yearStr === currentDate.value.getFullYear().toString())
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
  console.log('in onSliding 4, swiperElPositive.value.swiper.activeIndex', swiperElPositive.value.swiper.activeIndex)
  activeIndex.value = (flag === 'positive') ? swiperElPositive.value.swiper.activeIndex : swiperElNegative.value.swiper.activeIndex
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
