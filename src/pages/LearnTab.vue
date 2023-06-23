<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">

    <!-- TODO: add animation prompting user to come back after adding moments or showing an example of this screen -->
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
      <learn-card flag="positive" :dateRange="pickedDateRange"></learn-card>

      <q-item-label class="text-body1 text-weight-medium q-my-sm">Kafs</q-item-label>
      <learn-card flag="negative" :dateRange="pickedDateRange"></learn-card>

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

            <!-- TODO: replace by smthg more inline with rvlt -->
            <!-- minimal  mask="MM"  mask="MM-DD-YYYY"  -->
            <q-date v-if="segIdDate === 'Monthly'" v-model="pickedMonth" :options="optionsFn"
              :navigation-min-year-month="oldestMomentDateFormatted"
              :navigation-max-year-month="newestMomentDateFormatted" default-view="Months"
              class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal years-in-month-view
              emit-immediately @update:model-value="onUpdateMv" :key="monthsKey"></q-date>

            <q-date v-else-if="segIdDate === 'Yearly'" v-model="pickedYear" :options="optionsFn"
              :navigation-min-year-month="oldestMomentDateFormatted"
              :navigation-max-year-month="newestMomentDateFormatted" default-view="Years"
              class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal emit-immediately
              @update:model-value="onUpdateYv" :key="yearsKey"></q-date>
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
const { formatDate } = date;

//STORE INITIALIZATION
const momentsStore = useMomentsStore()
// onMounted(async () => {
//   if (!momentsStore.initialized) {
//     await momentsStore.fetchMoments();
//   }
// })

const dateRangeButtonLabel = ref('This year')
// const tagsButtonLabel = ref('All tags')
// const slide = ref(10)

const filterDialogOpen = ref(false)
const tappedFilter = ref('')
// The default model mask is YYYY/MM/DD, however you can use custom ones too.
// const pickedRange = ref({ from: '2023/04/08', to: '2023/06/03' })

const segDate = ref([{ title: "Monthly", id: "Monthly" }, { title: "Yearly", id: "Yearly" }])
const segIdDate = ref("Yearly")

const pickedMonth = ref("")
const pickedYear = ref("")
const monthsKey = ref(Date.now())
const yearsKey = ref(Date.now())
const pickedDateRange = ref([new Date(new Date().getFullYear(), 0, 1), new Date()])
function onUpdateMv(v) {
  monthsKey.value = Date.now()
  // hideYearRow()
}
function onUpdateYv(v) {
  yearsKey.value = Date.now()
}

watch(pickedMonth, (newVal, oldVal) => {
  if (newVal) {
    const year = newVal.split('/')[0]
    const month = newVal.split('/')[1]
    // pickedDateRange.value = [new Date(year, month, 1), new Date(year, month + 1, 0)]
    let nextMonthFirstDay = new Date(year, parseInt(month), 1);
    nextMonthFirstDay.setDate(nextMonthFirstDay.getDate() - 1);
    pickedDateRange.value = [new Date(year, parseInt(month) - 1, 1), nextMonthFirstDay];
    //dateRangeButtonLabel should be the month name if in current year and the month name + year if not
    if (year === new Date().getFullYear().toString()) {
      if (month === (new Date().getMonth() + 1).toString()) {
        dateRangeButtonLabel.value = 'This month'
      } else {
        dateRangeButtonLabel.value = formatDate(pickedDateRange.value[0], 'MMMM')
      }
    } else {
      dateRangeButtonLabel.value = formatDate(pickedDateRange.value[0], 'MMMM') + ' ' + year
    }
  }
})

//watch pickedYear and whenever it changes make pickedDateRange be the whole year. Note that pickedYear is formatted as YYYY/MM/DD
watch(pickedYear, (newVal, oldVal) => {
  if (newVal) {
    const year = newVal.split('/')[0]
    pickedDateRange.value = [new Date(year, 0, 1), new Date(year, 11, 31)]
    //dateRangeButtonLabel should be the 'This year' if in current year and the year if not
    if (year === new Date().getFullYear().toString()) {
      dateRangeButtonLabel.value = 'This year'
    } else {
      dateRangeButtonLabel.value = year
    }
  }
})

// onMounted(() => {
//   hideYearRow()
// })
// async function hideYearRow() {
//   await nextTick()
//   const yearRow = document.querySelector('.myDate .row')
//   console.log(yearRow)
//   yearRow.style.display = 'none'
// }
const optionsFn = (date) => {
  return date >= computedUniqueDays.value[computedUniqueDays.value.length - 1]; //TODO: make selecting a date with no kifs nor kafs impossible
}

const oldestMomentDateFormatted = computed(() => {
  const oldestMomentDate = computedUniqueDays.value[computedUniqueDays.value.length - 1]
  return date.formatDate(oldestMomentDate, "YYYY/MM")
})

const newestMomentDateFormatted = computed(() => {
  return date.formatDate(computedUniqueDays.value[0], "YYYY/MM")
})

const computedUniqueTags = computed(() => {
  return momentsStore.uniqueTags || []
})

const computedUniqueDays = computed(() => {
  return momentsStore.uniqueDays || []
})

const openFilterDialog = (filter) => {
  tappedFilter.value = filter
  filterDialogOpen.value = true
}
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



