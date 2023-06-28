<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">
    <!-- TODO:1 add animation prompting user to come back after adding moments or showing an example of this screen -->
    <!-- <div v-if="!momentsStore || !computedUniqueTags || computedUniqueTags.length === 0">
    </div> -->
    <!-- <div> -->
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

    <q-item-label class="text-body1 text-weight-medium q-my-sm">Kifs</q-item-label>

    <!-- <carousel ref="myCarousel" v-model="currentSlide" :items-to-show="1" @slide-end="onSliding">
      <slide v-for="range in (segIdDate === 'Yearly' ? dateRangesYears : dateRangesMonths) " :key="range"
        :style="{ height: 'fit-content' }">
        <div>
          <learn-card flag="positive" :dateRange="range"></learn-card>
        </div>
      </slide>
      <template #addons="{ slidesCount }">
        <pagination v-if="slidesCount > 1" />
      </template>
    </carousel> -->

    <!-- css-mode="true" virtual="true" :space-between="spaceBetween"
      :centered-slides="true" pagination-clickable="true" init="false" @slidechange="onSliding" slides-per-view="1" pagination="true" auto-height="true"-->
    <swiper-container auto-height="true">
      <swiper-slide v-for="range in (segIdDate === 'Yearly' ? dateRangesYears : dateRangesMonths) " :key="range">
        <learn-card flag="positive" :dateRange="range"></learn-card>
        <!-- <swiper-slide>
        <learn-card flag="negative" :dateRange="dateRangesYears[2]"></learn-card>
      </swiper-slide>
      <swiper-slide>
        <learn-card flag="negative" :dateRange="dateRangesYears[2]"></learn-card> -->
      </swiper-slide>
    </swiper-container>

    <!-- <swiper-container class="mySwiper">
      <swiper-slide>Slide 1</swiper-slide>
      <swiper-slide>Slide 2</swiper-slide>
      <swiper-slide>Slide 3</swiper-slide>
      <swiper-slide>Slide 4</swiper-slide>
      <swiper-slide>Slide 5</swiper-slide>
      <swiper-slide>Slide 6</swiper-slide>
      <swiper-slide>Slide 7</swiper-slide>
      <swiper-slide>Slide 8</swiper-slide>
      <swiper-slide>Slide 9</swiper-slide>
    </swiper-container> -->

    <!-- TODO:3 add when ready -->
    <div>
      <q-item-label class="text-body1 text-weight-medium q-my-sm">Kafs</q-item-label>
      <learn-card flag="negative" :dateRange="dateRangesYears[2]"></learn-card>
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
            <segmented-control v-model="segIdDate" :segments="segDate" element-name='LearnTabSegDate' />
          </div>

          <!-- minimal  mask="MM"  mask="MM-DD-YYYY"  -->
          <!-- <q-date v-model="date" years-in-month-view default-view="Months" emit-immediately
              @update:model-value="onUpdateMv" :key="dpKey" minimal mask="MM" class="myDate"></q-date> -->
          <q-date v-if="segIdDate === 'Monthly'" v-model="pickedDate" :options="optionsFn"
            :navigation-min-year-month="oldestMomentDateFormatted" :navigation-max-year-month="currentDateFormatted"
            default-view="Months" class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal
            years-in-month-view emit-immediately @update:model-value="onUpdatePickedDate" :key="monthsKey"></q-date>
          <!-- @navigation="onNavigationMv" -->

          <q-date v-else-if="segIdDate === 'Yearly'" v-model="pickedDate" :options="optionsFn"
            :navigation-min-year-month="oldestMomentDateFormatted" :navigation-max-year-month="currentDateFormatted"
            default-view="Years" class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal
            emit-immediately @update:model-value="onUpdatePickedDate" :key="yearsKey"></q-date>
          <!-- @navigation="onNavigationYv" -->
        </div>

        <div v-else-if="tappedFilter === 'tags'">
          <q-card-section class="text-h6">Filter period
          </q-card-section>
          <q-card-section>Filtering the period will take into account only the moments that happened during the
            selected
            period. </q-card-section>
        </div>

        <q-card-actions align="center">
          <q-btn rounded color="primary" @click="filterDialogOpen = false" padding="10px"
            class="text-body1 q-ma-sm full-width" no-caps>Done</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- </div> -->
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";
import LearnCard from "./../components/LearnCard.vue";
import { date } from "quasar";
// import 'vue3-carousel/dist/carousel.css'
// import { Carousel, Slide, Pagination } from 'vue3-carousel'
// import function to register Swiper custom elements
// import { register, SwiperContainer, SwiperSlide } from "swiper/element/bundle";
// // // register Swiper custom elements
// register();
// import styles bundle
// import 'swiper/css/bundle';
// import Swiper core and required modules
//  import SwiperCore, { Pagination } from 'swiper';
// import Swiper Vue 3 components
// import { Swiper, SwiperSlide } from 'swiper/vue';
// // import Swiper styles
// import 'swiper/swiper-bundle.css';
// import swiper-slide and swiper-container from swiper element bundle
// import { SwiperSlide, Swiper } from 'swiper/element';

// // import { Swiper, SwiperSlide } from 'swiper/vue';
// // import Swiper bundle with all modules installed

// // import Swiper from 'swiper/bundle';
// const swiper = new Swiper('.swiper', {
//   // Optional parameters
//   direction: 'horizontal',
//   loop: false,

//   // If we need pagination
//   pagination: {
//     el: '.swiper-pagination',
//   },
// });
// // const SwiperContainer = new SwiperContainer();

// const swiperC = ref(null);
// onMounted(() => {
//   swiperC.value = new SwiperContainer({});
// });

const momentsStore = useMomentsStore()
const dateRangeButtonLabel = ref('This year')
// const tagsButtonLabel = ref('All tags')
// const myCarousel = ref(null)
const currentSlide = ref(0)

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
  return Math.max(1, date.getDateDiff(new Date(), oldestMomentDate.value, 'years'))
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
  return dateRanges;
});

//initialization of currentSlide
watch(dateRangesYears, (newValue) => {
  currentSlide.value = newValue.length - 1;
  console.log('in watch dateRangesYears updated currentSlide to', currentSlide.value)
}, { immediate: true });

const filterDialogOpen = ref(false)
const tappedFilter = ref('date')
const openFilterDialog = (filter) => {
  tappedFilter.value = filter
  filterDialogOpen.value = true
}

const segDate = ref([{ title: "Monthly", id: "Monthly" }, { title: "Yearly", id: "Yearly" }])
const segIdDate = ref("Yearly")

// initialize pickedDate as the first day of the current year with format YYYY/MM/DD
const pickedDate = ref(date.formatDate(date.startOfDate(new Date(), 'year'), "YYYY/MM/DD"))
const monthsKey = ref(Date.now()) //TODO:1 reduce to only one of those keys?
const yearsKey = ref(Date.now())
const optionsFn = (date) => {
  return date >= oldestMomentDate.value;
}

const updateDateButtonLabel = () => {
  if (segIdDate.value === 'Yearly') {
    if (date.isBetweenDates(new Date(), dateRangesYears.value[currentSlide.value][0], dateRangesYears.value[currentSlide.value][1], { inclusiveFrom: true, inclusiveTo: true, onlyDate: true })) {
      dateRangeButtonLabel.value = 'This year'
    } else {
      dateRangeButtonLabel.value = dateRangesYears.value[currentSlide.value][0].getFullYear().toString()
    }
  }
  else if (segIdDate.value === 'Monthly') {
    //dateRangeButtonLabel should be the month name if in current year and the month name + year if not
    if (date.isBetweenDates(new Date(), dateRangesMonths.value[currentSlide.value][0], dateRangesMonths.value[currentSlide.value][1], { inclusiveFrom: true, inclusiveTo: true, onlyDate: true })) {
      dateRangeButtonLabel.value = 'This month'
    } else if (dateRangesMonths.value[currentSlide.value][0].getFullYear() === new Date().getFullYear()) {
      dateRangeButtonLabel.value = date.formatDate(dateRangesMonths.value[currentSlide.value][0], 'MMMM')
    } else {
      dateRangeButtonLabel.value = date.formatDate(dateRangesMonths.value[currentSlide.value][0], 'MMMM YYYY')
    }
  }
}

const onUpdatePickedDate = (newVal) => {
  console.log('onUpdatePickedDate newVal', newVal)
  if (newVal) {
    const year = newVal.split('/')[0]
    if (segIdDate.value === 'Monthly') {
      monthsKey.value = Date.now()
      const month = newVal.split('/')[1]
      let nextMonthFirstDay = new Date(year, parseInt(month), 1);
      nextMonthFirstDay.setDate(nextMonthFirstDay.getDate() - 1);
      let currentMonthFirstDay = new Date(year, parseInt(month) - 1, 1);
      // Update currentSlide to the correct index in dateRangesMonths
      currentSlide.value = date.getDateDiff(currentMonthFirstDay, oldestMomentDate.value, 'months');
      console.log('currentMonthFirstDay', currentMonthFirstDay)
      console.log('oldestMomentDate.value', oldestMomentDate.value)
    } else if (segIdDate.value === 'Yearly') {
      yearsKey.value = Date.now()
      currentSlide.value = date.getDateDiff(year, oldestMomentDate.value, 'years');
    }
    console.log('onUpdatePickedDate triggered currentSlide update to', currentSlide.value)
    updateDateButtonLabel()
  }
}

//i.e. onSegmentControlChange
watch(segIdDate, (newVal, oldVal) => {
  console.log('watch(segIdDate) triggered with newVal', newVal)
  if (newVal) {
    let max = date.getMaxDate(new Date(pickedDate.value), new Date(oldestMomentDate.value))
    pickedDate.value = date.formatDate(max, "YYYY/MM/DD")
    console.log('watch(segIdDate) pickedDate.value', pickedDate.value)
    onUpdatePickedDate(pickedDate.value)
  }
  //TODO:1 ensure that when yearly (2023) > monthly selecting May (2023) > yearly (2023) > monthly the carousel has kept May and is not showing Jan as current
  //TODO:2 ensure that when yearly (2023) > monthly, the carousel is showing current month and not Jan
});

const onSliding = ({ currentSlideIndex, prevSlideIndex }) => {
  console.log('In onSliding, currentSlide updated from', prevSlideIndex, 'to', currentSlideIndex)
  updateDateButtonLabel()
  if (segIdDate.value === 'Monthly') {
    pickedDate.value = date.formatDate(dateRangesMonths.value[currentSlideIndex][0], "YYYY/MM/DD")
  } else if (segIdDate.value === 'Yearly') {
    pickedDate.value = date.formatDate(dateRangesYears.value[currentSlideIndex][0], "YYYY/MM/DD")
  }
}
</script>

<style lang="scss">
.bg-button-on-background .q-icon {
  margin-right: 8px;
  /* adjust the value as needed */
}

.carousel__slide {
  align-items: flex-start
}

.carousel__pagination {
  margin: 0;
  padding: 0;
}

// .myDate>.row~.row {
//   display: none !important;
// }
</style>
