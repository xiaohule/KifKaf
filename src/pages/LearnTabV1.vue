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
        @activeindexchange="(event) => onActiveIndexChangeBySwiper(event, 'satisfaction')">
        <swiper-slide v-for="range in (segDateId === 'Monthly' ? dateRangesMonths : dateRangesYears)" :key="range">
          <learn-card-needs flag="satisfaction" :date-range="range" :second-seg-selected="secondSegSelectedSatisfaction"
            :learn-card-expanded="learnCardExpandedSatisfaction" seg-control
            @click:segmented-control="segmentedControlClicked" @click:show-button="showButtonClicked"
            @ready:aggregateData="aggregateDataReady"></learn-card-needs>
        </swiper-slide>
      </swiper-container>
    </div>
    <div>
      <q-item-label class="text-body1 text-weight-medium q-my-sm">Needs Importance</q-item-label>
      <swiper-container ref="swiperElImportance" init="false" auto-height="true" observer="true"
        observe-slide-children="true" grab-cursor="true" pagination-dynamic-bullets="true"
        @activeindexchange="(event) => onActiveIndexChangeBySwiper(event, 'importance')"
        @observerupdate="console.log('SWIPER observerUpdate fired')" @update="console.log('SWIPER update fired')"
        @beforedestroy="console.log('SWIPER beforeDestroy fired')" @destroy="console.log('SWIPER destroy fired')"
        @init="console.log('SWIPER init fired')">
        <swiper-slide v-for="range in (segDateId === 'Monthly' ? dateRangesMonths : dateRangesYears)" :key="range">
          <learn-card-needs flag="importance" :date-range="range" :learn-card-expanded="learnCardExpandedImportance"
            @click:show-button="showButtonClicked" @ready:aggregateData="aggregateDataReady"></learn-card-needs>
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

const dateRangeButtonLabel = ref('This month')

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
    swiperElSatisfaction.value.swiper.slideTo(activeIndex.value, 0)
    swiperElImportance.value.swiper.slideTo(activeIndex.value, 0)
    swiperInitialized.value = true
  }
});
onDeactivated(() => {
  console.log('ONDEACTIVATED')
  swiperInitialized.value = false
});
watch(activeIndex, (newVal, oldVal) => {
  if (swiperInitialized.value) {
    console.log('in activeIndex watcher, a 1 sec delay')
    setTimeout(function () { //This weird hack seems to fix issue home>learn>2022>monthly>[was getting oct 2021, now gets jan 2022]
      // nextTick(() => {
      swiperElSatisfaction.value.swiper.activeIndex = newVal
      swiperElImportance.value.swiper.activeIndex = newVal
      swiperElSatisfaction.value.swiper.slideTo(newVal, 300)
      swiperElImportance.value.swiper.slideTo(newVal, 300)
      console.log('in activeIndex watcher, activeIndex changed from', oldVal, 'to', newVal)
      console.log('CHECK IMPORTANCE', swiperElImportance.value.swiper)
      // })
    }, 1);
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
const aggregateDataReady = ({ flag }) => {
  if (swiperInitialized.value) {
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
}

//DATES MANAGEMENT
const currentDate = computed(() => {
  return new Date()
})
const currentDateYYYYsMM = computed(() => {
  return date.formatDate(currentDate.value, "YYYY/MM")
})
const currentYYYYdMM = computed(() => {
  return `${currentDate.value.getFullYear()}-${(currentDate.value.getMonth() + 1).toString().padStart(2, '0')}`
})

const oldestMomentDate = computed(() => {
  return momentsStore.oldestMomentDate ?? currentDate.value;
})
const oldestMomentDateYYYYsMM = computed(() => {
  return date.formatDate(oldestMomentDate.value, "YYYY/MM")
})

const segDate = ref([{ title: "Monthly", id: "Monthly" }, { title: "Yearly", id: "Yearly" }])
const segDateId = ref("Monthly")
const dateRangesYears = computed(() => {
  const dateRanges = [];
  const yearsSinceOldestMoment = date.getDateDiff(currentDate.value, oldestMomentDate.value, 'years')
  for (let i = yearsSinceOldestMoment; i >= 0; i--) {
    dateRanges.push((currentDate.value.getFullYear() - i).toString());
  }
  console.log('in computed dateRangesYears, dateRanges is', dateRanges)
  return dateRanges;
});
watch(dateRangesYears, (newValue) => {
  activeIndex.value = newValue.length - 1;
  console.log('in watch dateRangesYears updated activeIndex to', activeIndex.value)
}, { immediate: true }
);

const dateRangesMonths = computed(() => {
  const dateRanges = [];
  const monthsSinceOldestMoment = date.getDateDiff(currentDate.value, oldestMomentDate.value, 'months')
  let trackingDate = date.startOfDate(oldestMomentDate.value, 'month');
  for (let i = 0; i <= monthsSinceOldestMoment; i++) {
    dateRanges.push(`${trackingDate.getFullYear()}-${(trackingDate.getMonth() + 1).toString().padStart(2, '0')}`);
    trackingDate = date.addToDate(trackingDate, { months: 1 });
  }
  console.log('in computed dateRangesMonths, dateRanges is', dateRanges)
  return dateRanges;
});
watch(dateRangesMonths, (newValue) => {
  activeIndex.value = newValue.length - 1;
  console.log('in watch dateRangesMonths updated activeIndex to', activeIndex.value)
}, { immediate: true }
);
const dateRangesMonthsIdxToDate = (idx) => {
  console.log('in dateRangesMonthsIdxToDate, idx', idx, 'dateRangesMonths.value[idx]', dateRangesMonths.value[idx])
  const [yearStr, monthStr] = dateRangesMonths.value[idx].split('-');
  return new Date(Number(yearStr), Number(monthStr) - 1);
}

//DATE FILTER DIALOG
const filterDialogOpen = ref(false)
const tappedFilter = ref('date')
const openFilterDialog = (filter) => {
  tappedFilter.value = filter
  filterDialogOpen.value = true
}

//before pickedDateYYYYsMMsDD was initialized as the first day of the current year with format YYYY/MM/DD
const pickedDateYYYYsMMsDD = ref(date.formatDate(currentDate.value, "YYYY/MM/DD"))
const monthsKey = ref(Date.now())
const yearsKey = ref(Date.now())
const optionsFn = (date) => {
  return date >= oldestMomentDate.value;
}

const updateDateButtonLabel = () => {
  console.log('in updateDateButtonLabel, activeIndex.value', activeIndex.value)
  if (segDateId.value === 'Yearly') {
    dateRangeButtonLabel.value = (currentDate.value.getFullYear() == dateRangesYears.value[activeIndex.value]) ? 'This year' : dateRangesYears.value[activeIndex.value].toString();
  }
  else if (segDateId.value === 'Monthly') {
    if (currentYYYYdMM.value == dateRangesMonths.value[activeIndex.value]) {
      dateRangeButtonLabel.value = 'This month';
    } else {
      dateRangeButtonLabel.value = (dateRangesMonthsIdxToDate(activeIndex.value).getFullYear() === currentDate.value.getFullYear())
        ? date.formatDate(dateRangesMonthsIdxToDate(activeIndex.value), 'MMMM')
        : date.formatDate(dateRangesMonthsIdxToDate(activeIndex.value), 'MMMM YYYY');
    }
  }
}

//EVENTS
const onUpdatePickedDate = (newVal) => { //newVal is a string YYYYsMMsDD //TODO:1 pourrait etre un watch?
  console.log('onUpdatePickedDate newVal', newVal)
  if (newVal) {
    if (segDateId.value === 'Monthly') {
      monthsKey.value = Date.now()
      activeIndex.value = date.getDateDiff(newVal, oldestMomentDate.value, 'months');
    } else if (segDateId.value === 'Yearly') {
      yearsKey.value = Date.now()
      activeIndex.value = date.getDateDiff(newVal, oldestMomentDate.value, 'years');
    }
    console.log('onUpdatePickedDate triggered currentSlide update to', activeIndex.value, "because newVal", newVal, "and oldestMomentDate.value", oldestMomentDate.value, "and segDateId.value", segDateId.value)
    updateDateButtonLabel()
  }
}

//i.e. onSegmentControlChange
watch(segDateId, (newVal, oldVal) => {
  console.log('watch(segDateId) triggered with newVal', newVal, "pickedDateYYYYsMMsDD.value", pickedDateYYYYsMMsDD.value, "oldestMomentDate.value", oldestMomentDate.value)
  if (newVal) {
    let max = date.getMaxDate(pickedDateYYYYsMMsDD.value, oldestMomentDate.value)
    pickedDateYYYYsMMsDD.value = date.formatDate(max, "YYYY/MM/DD")
    console.log('watch(segDateId) changed pickedDateYYYYsMMsDD.value to', pickedDateYYYYsMMsDD.value)
    onUpdatePickedDate(pickedDateYYYYsMMsDD.value)
  }
});

const onActiveIndexChangeBySwiper = (event, flag) => {
  console.log('SWIPER activeIndexChange fired with flag', flag, ', from previousIndex', event.detail[0].previousIndex, 'to activeIndex', event.detail[0].activeIndex)

  activeIndex.value = (flag === 'importance') ? swiperElImportance.value.swiper.activeIndex : swiperElSatisfaction.value.swiper.activeIndex

  console.log('In onActiveIndexChangeBySwiper with flag', flag, ' activeIndex updated to ', activeIndex.value)

  updateDateButtonLabel()
  if (segDateId.value === 'Monthly') {
    pickedDateYYYYsMMsDD.value = date.formatDate(dateRangesMonthsIdxToDate(activeIndex.value), "YYYY/MM/DD")
  } else if (segDateId.value === 'Yearly') {
    pickedDateYYYYsMMsDD.value = date.formatDate(dateRangesYears.value[activeIndex.value], "YYYY/MM/DD")
  }
}

</script>

<style lang="scss">
.bg-button-on-background .q-icon {
  margin-right: 8px;
}
</style>
