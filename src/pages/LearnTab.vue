<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">
    <!-- TODO:1 add animation prompting user to come back after adding moments or showing an example of this screen -->
    <!-- <div v-if="!momentsStore || !computedUniqueTags || computedUniqueTags.length === 0">
    </div> -->
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


    <!-- <div>Here is openai2 result: {{ respChatLangchain1 }}</div> -->
    <!-- <div>Here is respLearnOpenai1 result: {{ respLearnOpenai1 }}</div>
    <div>Here is respLearnOpenai12 result: {{ respLearnOpenai12 }}</div>
    <div>Here is respLearnOpenai1NoEmoji result: {{ respLearnOpenai1NoEmoji }}</div>
    <div>Here is respLearnOpenai2 result: {{ respLearnOpenai2 }}</div>
    the good one:
    <div>Here is respLearnOpenai2NoEmoji result: {{ respLearnOpenai2NoEmoji }}</div>
    <div>Here is respLearnDummy result: {{ respLearnDummy }}</div> -->


    <!--  @slidechange="console.log('SWIPER slidechange fired', $event)"
        @slidechangetransitionend="console.log('SWIPER slidechangetransitionend fired', $event)"-->
    <div>
      <q-item-label class="text-body1 text-weight-medium q-my-sm">Kifs</q-item-label>
      <swiper-container ref="swiperElPositive" init="false" auto-height="true" observer="true"
        observe-slide-children="true" grab-cursor="true" pagination-dynamic-bullets="true"
        @activeindexchange="(event) => onSliding(event, 'positive')"
        @observerUpdate="console.log('SWIPER observerUpdate fired')" @update="console.log('SWIPER update fired')"
        @beforeDestroy="console.log('SWIPER beforeDestroy fired')" @destroy="console.log('SWIPER destroy fired')"
        @init="console.log('SWIPER init fired')">
        <swiper-slide v-for="range in (segDateId === 'Yearly' ? dateRangesYears : dateRangesMonths) " :key="range">
          <learn-card flag="positive" :date-range="range" :frequency-selected="frequencySelectedPositive"
            @click:segmented-control="segmentedControlClicked" :learn-card-expanded="learnCardExpandedPositive"
            @click:show-button="showButtonClicked"></learn-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <div>
      <q-item-label class="text-body1 text-weight-medium q-my-sm">Kafs</q-item-label>
      <swiper-container ref="swiperElNegative" init="false" auto-height="true" observer="true"
        observe-slide-children="true" grab-cursor="true" pagination-dynamic-bullets="true"
        @activeindexchange="(event) => onSliding(event, 'negative')">
        <swiper-slide v-for="range in (segDateId === 'Yearly' ? dateRangesYears : dateRangesMonths) " :key="range">
          <learn-card flag="negative" :date-range="range" :frequency-selected="frequencySelectedNegative"
            @click:segmented-control="segmentedControlClicked" :learn-card-expanded="learnCardExpandedNegative"
            @click:show-button="showButtonClicked"></learn-card>
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

        <!-- <div v-else-if="tappedFilter === 'tags'">
          <q-card-section class="text-h6">Filter period
          </q-card-section>
          <q-card-section>Filtering the period will take into account only the moments that happened during the
            selected
            period. </q-card-section>
        </div> -->

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
import LearnCard from "./../components/LearnCard.vue";
import { date } from "quasar";
// destructuring to keep only what is needed in date
const { formatDate, getDateDiff, startOfDate, endOfDate, subtractFromDate, isBetweenDates } = date; //TODO:3 fix this import destructuring if unused

import axios from 'axios';
// const respChatLangchain1 = ref(null)
// axios.get('/api/chat/langchain1')
//   .then(response => {
//     respChatLangchain1.value = response.data;
//   })
//   .catch(error => {
//     console.error(error);
//   });
// const respLearnOpenai1 = ref(null)
// axios.get('/api/learn/openai1')
//   .then(response => {
//     respLearnOpenai1.value = response.data;
//   })
//   .catch(error => {
//     console.error(error);
//   });
// const respLearnOpenai12 = ref(null)
// axios.get('/api/learn/openai1_2')
//   .then(response => {
//     respLearnOpenai12.value = response.data;
//   })
//   .catch(error => {
//     console.error(error);
//   });
// const respLearnOpenai1NoEmoji = ref(null)
// axios.get('/api/learn/openai1_no_emoji')
//   .then(response => {
//     respLearnOpenai1NoEmoji.value = response.data;
//   })
//   .catch(error => {
//     console.error(error);
//   });
// const respLearnOpenai2 = ref(null)
// axios.get('/api/learn/openai2')
//   .then(response => {
//     respLearnOpenai2.value = response.data;
//   })
//   .catch(error => {
//     console.error(error);
//   });
// const respLearnOpenai2NoEmoji = ref(null)
// axios.get('/api/learn/openai2_no_emoji')
//   .then(response => {
//     respLearnOpenai2NoEmoji.value = response.data;
//   })
//   .catch(error => {
//     console.error(error);
//   });
// const respLearnDummy = ref(null)
// axios.get('/api/learn/dummy')
//   .then(response => {
//     respLearnDummy.value = response.data;
//   })
//   .catch(error => {
//     console.error(error);
//   });

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
// onMounted(() => { //TODO:1 keep only activated?
//   console.log('ONMOUNTED')
//   swiperEl.value.initialize();
//   swiperEl.value.swiper.activeIndex = activeIndex.value
//   swiperInitialized.value = true
// });
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
const computedUniqueDays = computed(() => {
  return momentsStore.uniqueDays || []
})
const oldestMomentDate = computed(() => {
  return computedUniqueDays.value[computedUniqueDays.value.length - 1] ?? new Date();
})
const oldestMomentDateFormatted = computed(() => {
  return date.formatDate(oldestMomentDate.value, "YYYY/MM")
})
const currentDateFormatted = computed(() => {
  return date.formatDate(new Date(), "YYYY/MM")
})
const monthsSinceOldestMoment = computed(() => {
  return Math.max(1, date.getDateDiff(new Date(), oldestMomentDate.value, 'months'))
})
const yearsSinceOldestMoment = computed(() => {
  console.log('in yearsSinceOldestMoment computed, yearsSinceOldestMoment=', date.getDateDiff(new Date(), oldestMomentDate.value, 'years'))
  return date.getDateDiff(new Date(), oldestMomentDate.value, 'years')
})
const currentMonthFirstDay = computed(() => {
  return date.startOfDate(new Date(), 'month')
})
const currentMonthLastDay = computed(() => {
  return date.endOfDate(new Date(), 'month')
})
const currentYearFirstDay = computed(() => {
  return date.startOfDate(new Date(), 'year')
})
const currentYearLastDay = computed(() => {
  return date.endOfDate(new Date(), 'year')
})

const dateRangesMonths = computed(() => {
  //return an array made of all the subarrays [beginningOfMonth date, endOfMonth date] between oldestMomentDate and today
  const dateRanges = [];
  for (let i = monthsSinceOldestMoment.value; i >= 0; i--) {
    dateRanges.push([
      date.subtractFromDate(new Date(currentMonthFirstDay.value), { months: i }),
      date.subtractFromDate(new Date(currentMonthLastDay.value), { months: i })
    ]);
  }
  return dateRanges;
});
const dateRangesYears = computed(() => {
  //return an array made of all the subarrays [beginningOfMonth date, endOfMonth date] between oldestMomentDate and today
  const dateRanges = [];
  for (let i = yearsSinceOldestMoment.value; i >= 0; i--) {
    dateRanges.push([
      date.subtractFromDate(new Date(currentYearFirstDay.value), { years: i }),
      date.subtractFromDate(new Date(currentYearLastDay.value), { years: i })
    ]);
  }
  console.log('in computed dateRangesYears, dateRanges is', dateRanges)
  return dateRanges;
});

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
const pickedDate = ref(date.formatDate(date.startOfDate(new Date(), 'year'), "YYYY/MM/DD"))
const monthsKey = ref(Date.now()) //TODO:1 reduce to only one of those keys?
const yearsKey = ref(Date.now())
const optionsFn = (date) => {
  return date >= oldestMomentDate.value;
}

const updateDateButtonLabel = () => {
  if (segDateId.value === 'Yearly') {
    if (date.isBetweenDates(new Date(), dateRangesYears.value[activeIndex.value][0], dateRangesYears.value[activeIndex.value][1], { inclusiveFrom: true, inclusiveTo: true, onlyDate: true })) {
      dateRangeButtonLabel.value = 'This year'
    } else {
      dateRangeButtonLabel.value = dateRangesYears.value[activeIndex.value][0].getFullYear().toString()
    }
  }
  else if (segDateId.value === 'Monthly') {
    //dateRangeButtonLabel should be the month name if in current year and the month name + year if not
    if (date.isBetweenDates(new Date(), dateRangesMonths.value[activeIndex.value][0], dateRangesMonths.value[activeIndex.value][1], { inclusiveFrom: true, inclusiveTo: true, onlyDate: true })) {
      dateRangeButtonLabel.value = 'This month'
    } else if (dateRangesMonths.value[activeIndex.value][0].getFullYear() === new Date().getFullYear()) {
      dateRangeButtonLabel.value = date.formatDate(dateRangesMonths.value[activeIndex.value][0], 'MMMM')
    } else {
      dateRangeButtonLabel.value = date.formatDate(dateRangesMonths.value[activeIndex.value][0], 'MMMM YYYY')
    }
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
    pickedDate.value = date.formatDate(dateRangesMonths.value[activeIndex.value][0], "YYYY/MM/DD")
  } else if (segDateId.value === 'Yearly') {
    pickedDate.value = date.formatDate(dateRangesYears.value[activeIndex.value][0], "YYYY/MM/DD")
  }
}

</script>

<style lang="scss">
.bg-button-on-background .q-icon {
  margin-right: 8px;
}
</style>
