<!-- Here we handle date and data grouping selections -->
<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px" @click="clickedLearnPage = true">
    <!-- TODO:4 add nice instructive empty state, animation prompting user to come back after adding moments or showing an example of this screen -->
    <q-item class="q-px-none q-pt-none">
      <q-item-section class=" col-auto">
        <q-btn unelevated rounded class="text-subtitle1 bg-button-on-background text-on-background"
          icon="r_calendar_today" no-caps @click="openFilterDialog('date')">{{ dateRangeButtonLabel }}</q-btn>
      </q-item-section>
    </q-item>

    <q-btn-toggle v-model="toggleModel" class="q-gutter-sm q-mb-sm" color="transparent" text-color="outline"
      toggle-color="surface" toggle-text-color="on-surface" unelevated no-caps :options="[
        { label: 'Satisfiers', value: 'satisfaction' },
        { label: 'Dissatisfiers', value: 'unsatisfaction' },
        { label: 'All', value: 'importance' }
      ]" />

    <donut-swiper-and-list :date-ranges="segDateId === 'Monthly' ? dateRangesMonths : dateRangesYears"
      :active-index="activeIndex" :toggle-value="toggleModel" :clicked-learn-page="clickedLearnPage"
      @update:active-index="onActiveIndexChangeBySwiper"
      @reset:clickedLearnPage="clickedLearnPage = false"></donut-swiper-and-list>

    <q-dialog v-model="filterDialogOpened" position="bottom">
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
          <q-date v-if="segDateId === 'Monthly'" v-model="pickedDateYYYYsMMsDD" :options="optionsFn"
            :navigation-min-year-month="oldestMomentDateYYYYsMM" :navigation-max-year-month="currentDateYYYYsMM"
            default-view="Months" class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal
            years-in-month-view emit-immediately @update:model-value="onUpdatePickedDate" :key="monthsKey"></q-date>
          <q-date v-else-if="segDateId === 'Yearly'" v-model="pickedDateYYYYsMMsDD" :options="optionsFn"
            :navigation-min-year-month="oldestMomentDateYYYYsMM" :navigation-max-year-month="currentDateYYYYsMM"
            default-view="Years" class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal
            emit-immediately @update:model-value="onUpdatePickedDate" :key="yearsKey"></q-date>
        </div>

        <q-card-actions align="center">
          <q-btn rounded color="primary" padding="md md" @click="filterDialogOpened = false" class="text-body1
q-ma-sm q-mb-lg full-width" no-caps>Done</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";
import donutSwiperAndList from "./../components/donutSwiperAndList.vue";
import { date } from 'quasar'
const { formatDate, getDateDiff, startOfDate, addToDate, getMaxDate } = date;

defineOptions({
  preFetch() {
    const momentsStore = useMomentsStore()
    console.log('In LearnTab > preFetch')
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

const dateRangeButtonLabel = ref('This month')
const toggleModel = ref('satisfaction')
const clickedLearnPage = ref(false)

//SWIPER
const activeIndex = ref(0)
//when user tap on the Insights tab while already in the Insights tab, set activeIndex to the last index
watch(() => momentsStore.shouldResetSwiper, (newVal) => {
  if (newVal && swiperInitialized.value) {
    if (segDateId.value === 'Monthly') {
      activeIndex.value = dateRangesMonths.value.length - 1;
      updateDateButtonLabel()
    }
    else if (segDateId.value === 'Yearly') {
      activeIndex.value = dateRangesYears.value.length - 1;
      updateDateButtonLabel()
    }
    momentsStore.shouldResetSwiper = false
  }
})

//DATES MANAGEMENT
const currentDate = computed(() => {
  return new Date()
})
const currentDateYYYYsMM = computed(() => {
  return formatDate(currentDate.value, "YYYY/MM")
})
const currentYYYYdMM = computed(() => {
  return `${currentDate.value.getFullYear()}-${(currentDate.value.getMonth() + 1).toString().padStart(2, '0')}`
})

const oldestMomentDate = computed(() => {
  return momentsStore.oldestMomentDate ?? currentDate.value;
})
const oldestMomentDateYYYYsMM = computed(() => {
  return formatDate(oldestMomentDate.value, "YYYY/MM")
})

const segDate = ref([{ title: "Monthly", id: "Monthly" }, { title: "Yearly", id: "Yearly" }])
const segDateId = ref("Monthly")
const dateRangesYears = computed(() => {
  const dateRanges = [];
  const yearsSinceOldestMoment = getDateDiff(currentDate.value, oldestMomentDate.value, 'years')
  for (let i = yearsSinceOldestMoment; i >= 0; i--) {
    dateRanges.push((currentDate.value.getFullYear() - i).toString());
  }
  console.log('In LearnTab > computed dateRangesYears, dateRanges is', dateRanges)
  return dateRanges;
});
watch(dateRangesYears, (newValue) => {
  activeIndex.value = newValue.length - 1;
  console.log('In LearnTab > watch dateRangesYears updated activeIndex to', activeIndex.value)
}, { immediate: true }
);

const dateRangesMonths = computed(() => {
  const dateRanges = [];
  const monthsSinceOldestMoment = getDateDiff(currentDate.value, oldestMomentDate.value, 'months')
  let trackingDate = startOfDate(oldestMomentDate.value, 'month');
  for (let i = 0; i <= monthsSinceOldestMoment; i++) {
    dateRanges.push(`${trackingDate.getFullYear()}-${(trackingDate.getMonth() + 1).toString().padStart(2, '0')}`);
    trackingDate = addToDate(trackingDate, { months: 1 });
  }
  console.log('In LearnTab > computed dateRangesMonths, dateRanges is', dateRanges)
  return dateRanges;
});
watch(dateRangesMonths, (newValue) => {
  activeIndex.value = newValue.length - 1;
  console.log('In LearnTab > watch dateRangesMonths updated activeIndex to', activeIndex.value)
}, { immediate: true }
);
const dateRangesMonthsIdxToDate = (idx) => {
  console.log('In LearnTab > dateRangesMonthsIdxToDate, idx', idx, 'dateRangesMonths.value[idx]', dateRangesMonths.value[idx])
  const [yearStr, monthStr] = dateRangesMonths.value[idx].split('-');
  return new Date(Number(yearStr), Number(monthStr) - 1);
}

//DATE FILTER DIALOG
const filterDialogOpened = ref(false)
const tappedFilter = ref('date')
const openFilterDialog = (filter) => {
  tappedFilter.value = filter
  filterDialogOpened.value = true
}

//before pickedDateYYYYsMMsDD was initialized as the first day of the current year with format YYYY/MM/DD
const pickedDateYYYYsMMsDD = ref(formatDate(currentDate.value, "YYYY/MM/DD"))
const monthsKey = ref(Date.now())
const yearsKey = ref(Date.now())
const optionsFn = (date) => {
  return date >= oldestMomentDate.value;
}

const updateDateButtonLabel = () => {
  console.log('In LearnTab > updateDateButtonLabel, activeIndex.value', activeIndex.value)
  if (segDateId.value === 'Yearly') {
    dateRangeButtonLabel.value = (currentDate.value.getFullYear() == dateRangesYears.value[activeIndex.value]) ? 'This year' : dateRangesYears.value[activeIndex.value].toString();
  }
  else if (segDateId.value === 'Monthly') {
    if (currentYYYYdMM.value == dateRangesMonths.value[activeIndex.value]) {
      dateRangeButtonLabel.value = 'This month';
    } else {
      dateRangeButtonLabel.value = (dateRangesMonthsIdxToDate(activeIndex.value).getFullYear() === currentDate.value.getFullYear())
        ? formatDate(dateRangesMonthsIdxToDate(activeIndex.value), 'MMMM')
        : formatDate(dateRangesMonthsIdxToDate(activeIndex.value), 'MMMM YYYY');
    }
  }
}

//EVENTS
const onUpdatePickedDate = (newVal) => { //newVal is a string YYYYsMMsDD //TODO:1 pourrait etre un watch?
  console.log('In LearnTab > onUpdatePickedDate newVal', newVal)
  if (newVal) {
    if (segDateId.value === 'Monthly') {
      monthsKey.value = Date.now()
      activeIndex.value = getDateDiff(newVal, oldestMomentDate.value, 'months');
    } else if (segDateId.value === 'Yearly') {
      yearsKey.value = Date.now()
      activeIndex.value = getDateDiff(newVal, oldestMomentDate.value, 'years');
    }
    console.log('In LearnTab > onUpdatePickedDate triggered currentSlide update to', activeIndex.value, "because newVal", newVal, "and oldestMomentDate.value", oldestMomentDate.value, "and segDateId.value", segDateId.value)
    updateDateButtonLabel()
  }
}

//i.e. onSegmentControlChange
watch(segDateId, (newVal) => {
  console.log('In LearnTab > watch(segDateId) triggered with newVal', newVal, "pickedDateYYYYsMMsDD.value", pickedDateYYYYsMMsDD.value, "oldestMomentDate.value", oldestMomentDate.value)
  if (newVal) {
    let max = getMaxDate(pickedDateYYYYsMMsDD.value, oldestMomentDate.value)
    pickedDateYYYYsMMsDD.value = formatDate(max, "YYYY/MM/DD")
    console.log('watch(segDateId) changed pickedDateYYYYsMMsDD.value to', pickedDateYYYYsMMsDD.value)
    onUpdatePickedDate(pickedDateYYYYsMMsDD.value)
  }
});

const onActiveIndexChangeBySwiper = (event) => {
  console.log('In LearnTab > onActiveIndexChangeBySwiper fired from previousIndex', event.detail[0].previousIndex, 'to activeIndex', event.detail[0].activeIndex)

  activeIndex.value = event.detail[0].activeIndex

  updateDateButtonLabel()
  if (segDateId.value === 'Monthly') {
    pickedDateYYYYsMMsDD.value = formatDate(dateRangesMonthsIdxToDate(activeIndex.value), "YYYY/MM/DD")
  } else if (segDateId.value === 'Yearly') {
    pickedDateYYYYsMMsDD.value = formatDate(dateRangesYears.value[activeIndex.value], "YYYY/MM/DD")
  }
}

</script>

<style lang="scss">
.bg-button-on-background .q-icon {
  margin-right: 8px;
}

.q-btn-group>.q-btn-item {
  border-radius: 34px !important;
}
</style>
