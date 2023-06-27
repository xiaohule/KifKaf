<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">

    <!-- TODO:1 add animation prompting user to come back after adding moments or showing an example of this screen -->
    <!-- <div v-if="!momentsStore || !computedUniqueTags || computedUniqueTags.length === 0">
    </div> -->

    <div>
      <q-item class="q-px-none q-pt-none">
        <!-- <q-item-section class="col-auto">
          <q-btn unelevated rounded class="text-subtitle1 bg-button-on-background text-on-background" icon="tag" no-caps
            @click="openFilterDialog('tags')">{{ tagsButtonLabel }}</q-btn>
        </q-item-section> -->
        <q-item-section class=" col-auto">
          <q-btn unelevated rounded class="text-subtitle1 bg-button-on-background text-on-background"
            icon="calendar_today" no-caps @click="openFilterDialog('date')">{{ dateRangeButtonLabel }}</q-btn>
        </q-item-section>
      </q-item>

      <q-item-label class="text-body1 text-weight-medium q-my-sm">Kifs</q-item-label>

      <carousel ref="myCarousel" v-model="currentSlide" :items-to-show="1">
        <slide v-for="range in (periodicity === 'years' ? dateRangesYears : dateRangesMonths) " :key="range">
          <!-- Index:{{ index }}, range: {{ range }} -->
          <!-- TODO2: fix time zone issue -->
          <div>
            <learn-card flag="positive" :dateRange="range"></learn-card>
          </div>
        </slide>

        <template #addons="{ slidesCount }">
          <!-- <navigation /> -->
          <pagination v-if="slidesCount > 1" />
        </template>

      </carousel>

      <div>
        <q-item-label class="text-body1 text-weight-medium q-my-sm">Kafs</q-item-label>
        <learn-card flag="negative" :dateRange="pickedDateRange"></learn-card>
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

            <!-- TODO:1 replace by smthg more inline with rvlt -->
            <!-- minimal  mask="MM"  mask="MM-DD-YYYY"  -->
            <q-date v-if="segIdDate === 'Monthly'" v-model="pickedMonth" :options="optionsFn"
              :navigation-min-year-month="oldestMomentDateFormatted" :navigation-max-year-month="currentDateFormatted"
              default-view="Months" class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal
              years-in-month-view emit-immediately @update:model-value="onUpdateMv" :key="monthsKey"
              @navigation="onNavigationMv"></q-date>

            <!-- <q-date v-model="date" years-in-month-view default-view="Months" emit-immediately
              @update:model-value="onUpdateMv" :key="dpKey" minimal mask="MM" class="myDate"></q-date> -->

            <q-date v-else-if="segIdDate === 'Yearly'" v-model="pickedYear" :options="optionsFn"
              :navigation-min-year-month="oldestMomentDateFormatted" :navigation-max-year-month="currentDateFormatted"
              default-view="Years" class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal
              emit-immediately @update:model-value="onUpdateYv" :key="yearsKey" @navigation="onNavigationYv"></q-date>
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
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";
import LearnCard from "./../components/LearnCard.vue";
import { date } from "quasar";
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination } from 'vue3-carousel'

const momentsStore = useMomentsStore()
const dateRangeButtonLabel = ref('This year')
// const tagsButtonLabel = ref('All tags')
const myCarousel = ref(null)
const currentSlide = ref(0)

const computedUniqueDays = computed(() => {
  return momentsStore.uniqueDays || []
})
const oldestMomentDate = computed(() => {
  return computedUniqueDays.value[computedUniqueDays.value.length - 1] ?? new Date();
})

const countMonths = computed(() => {
  return Math.max(1, date.getDateDiff(new Date(), oldestMomentDate.value, 'months'))
})
const countYears = computed(() => {
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
  for (let i = countMonths.value; i >= 0; i--) {
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
  for (let i = countYears.value; i >= 0; i--) {
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

watch(currentSlide, (newValue, oldValue) => {
  myCarousel.value.slideTo(newValue) //TODO:2 to keep or useless?
  console.log('currentSlide updated from', oldValue, 'to', newValue)
  if (periodicity.value === 'years') {
    if (date.isBetweenDates(new Date(), dateRangesYears.value[newValue][0], dateRangesYears.value[newValue][1], { inclusiveFrom: true, inclusiveTo: true, onlyDate: true })) {
      dateRangeButtonLabel.value = 'This year'
    } else {
      dateRangeButtonLabel.value = dateRangesYears.value[newValue][0].getFullYear().toString()
    }
  }
  else {
    //dateRangeButtonLabel should be the month name if in current year and the month name + year if not
    if (date.isBetweenDates(new Date(), dateRangesMonths.value[newValue][0], dateRangesMonths.value[newValue][1], { inclusiveFrom: true, inclusiveTo: true, onlyDate: true })) {
      dateRangeButtonLabel.value = 'This month'
    } else if (dateRangesMonths.value[newValue][0].getFullYear() === new Date().getFullYear()) {
      dateRangeButtonLabel.value = date.formatDate(dateRangesMonths.value[newValue][0], 'MMMM')
    } else {
      dateRangeButtonLabel.value = date.formatDate(dateRangesMonths.value[newValue][0], 'MMMM YYYY')
    }
  }
});

const filterDialogOpen = ref(false)
const tappedFilter = ref('')
const openFilterDialog = (filter) => {
  tappedFilter.value = filter
  filterDialogOpen.value = true
}

const segDate = ref([{ title: "Monthly", id: "Monthly" }, { title: "Yearly", id: "Yearly" }])
const segIdDate = ref("Yearly")

const formattedToday = date.formatDate(new Date(), "YYYY/MM/DD");
const periodicity = ref("years")
const pickedMonth = ref(formattedToday) //ref("")
const pickedYear = ref(formattedToday)
const monthsKey = ref(Date.now())
const yearsKey = ref(Date.now())
const pickedDateRange = ref([new Date(new Date().getFullYear(), 0, 1), new Date(new Date().getFullYear(), 11, 31)]) //TODO:2 to delete when carouselized

const oldestMomentDateFormatted = computed(() => {
  return date.formatDate(oldestMomentDate.value, "YYYY/MM")
})
// const newestMomentDateFormatted = computed(() => {
//   return date.formatDate(computedUniqueDays.value[0] ?? new Date(), "YYYY/MM")
// })
const currentDateFormatted = computed(() => {
  return date.formatDate(new Date(), "YYYY/MM")
})
const optionsFn = (date) => {
  return date >= oldestMomentDate.value; //TODO:2 make selecting a date with no kifs nor kafs impossible
}

function onUpdateMv(v) {
  monthsKey.value = Date.now()
  // hideYearRow()
}
function onUpdateYv(v) {
  yearsKey.value = Date.now()
}
function onNavigationMv(v) {
  console.log("view", v)
  console.log("pickedMonth", pickedMonth.value)
}
function onNavigationYv(v) {
  console.log("view", v)
  console.log("pickedYear", pickedYear.value)
}

watch(pickedMonth, (newVal, oldVal) => {
  if (newVal) {
    const year = newVal.split('/')[0]
    const month = newVal.split('/')[1]
    let nextMonthFirstDay = new Date(year, parseInt(month), 1);
    nextMonthFirstDay.setDate(nextMonthFirstDay.getDate() - 1);
    let currentMonthFirstDay = new Date(year, parseInt(month) - 1, 1);
    pickedDateRange.value = [currentMonthFirstDay, nextMonthFirstDay];
    periodicity.value = 'months'
    //dateRangeButtonLabel should be the month name if in current year and the month name + year if not
    if (year === new Date().getFullYear().toString()) {
      if (month === (new Date().getMonth() + 1).toString()) {
        dateRangeButtonLabel.value = 'This month'
      } else {
        dateRangeButtonLabel.value = date.formatDate(pickedDateRange.value[0], 'MMMM')
      }
    } else {
      dateRangeButtonLabel.value = date.formatDate(pickedDateRange.value[0], 'MMMM') + ' ' + year
    }
    // Update currentSlide to the correct index in dateRangesMonths
    currentSlide.value = date.getDateDiff(currentMonthFirstDay, oldestMomentDate.value, 'months');
    console.log('in watch pickedMonth updated currentSlide to', currentSlide.value)
  }
})

//watch pickedYear and whenever it changes make pickedDateRange be the whole year. Note that pickedYear is formatted as YYYY/MM/DD
watch(pickedYear, (newVal, oldVal) => {
  if (newVal) {
    const year = newVal.split('/')[0]
    pickedDateRange.value = [new Date(year, 0, 1), new Date(year, 11, 31)]
    periodicity.value = 'years'
    //dateRangeButtonLabel should be the 'This year' if in current year and the year if not
    if (year === new Date().getFullYear().toString()) {
      dateRangeButtonLabel.value = 'This year'
    } else {
      dateRangeButtonLabel.value = year
    }
    // Update currentSlide
    currentSlide.value = date.getDateDiff(year, oldestMomentDate.value, 'years');
    console.log('in watch pickedYear updated currentSlide to', currentSlide.value)
  }
})

watch(segIdDate, (newValue, oldValue) => {
  if (newValue === 'Monthly') {
    periodicity.value = 'months'
    currentSlide.value = dateRangesMonths.value.length - 1
  } else if (newValue === 'Yearly') {
    periodicity.value = 'years'
    currentSlide.value = dateRangesYears.value.length - 1
  }
  myCarousel.value.restartCarousel()
  console.log('in watch segIdDate updated currentSlide to', currentSlide.value)
});

// const computedUniqueTags = computed(() => {
//   return momentsStore.uniqueTags || []
// })
</script>

<style lang="scss">
.bg-button-on-background .q-icon {
  margin-right: 8px;
  /* adjust the value as needed */
}

// .myDate>.row~.row {
//   display: none !important;
// }
</style>



