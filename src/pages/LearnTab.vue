<template >
  <q-page class="q-mx-auto q-pa-md" style="max-width: 600px">

    <div v-if="!momentsStore || !computedUniqueTags || computedUniqueTags.length === 0">
      <!-- TODO: add animation prompting user to come back after adding moments or showing an example of this screen -->
    </div>

    <div v-else>
      <q-item class="q-px-none q-pt-none">
        <q-item-section class="col-auto">
          <q-btn unelevated rounded class="text-subtitle1 bg-button-on-background text-on-background" icon="tag" no-caps
            @click="openFilterDialog('tags')">{{ tagsButtonLabel }}</q-btn>
        </q-item-section>
        <q-item-section class=" col-auto">
          <q-btn unelevated rounded class="text-subtitle1 bg-button-on-background text-on-background"
            icon="calendar_today" no-caps @click="openFilterDialog('date')">{{ dateRangeButtonLabel }}</q-btn>
        </q-item-section>
      </q-item>

      <q-item-label class="text-body1 text-weight-medium q-my-sm">Kifs</q-item-label>
      <learn-card></learn-card>

      <q-dialog v-model="filterDialogOpen" position="bottom">
        <q-card class="bg-background">

          <div v-if="tappedFilter === 'date'">
            <q-card-section class="text-h6">Filter period
            </q-card-section>
            <q-card-section>Filtering the period will take into account only the moments that happened during the selected
              period. </q-card-section>

            <segmented-control v-model="segIdDate" :segments="segDate" element-name='LearnTabSegDate'
              class="q-mx-lg q-mt-md q-mb-sm" />

            <!-- <q-date v-if="selectedDateFilter === 'Calendar'" v-model="pickedRange" :options="optionsFn"
              navigation-min-year-month="2023/01" navigation-max-year-month="2023/06" :default-view="selectedDateFilter"
              class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" today-btn flat range /> -->

            <!-- TODO: replace by smthg more inline with rvlt -->
            <!-- minimal  mask="MM"  mask="MM-DD-YYYY"  -->
            <q-date v-if="selectedDateFilter === 'Months'" v-model="pickedMonth" :options="optionsFn"
              navigation-min-year-month="2023/01" navigation-max-year-month="2023/06" :default-view="selectedDateFilter"
              class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal years-in-month-view
              emit-immediately @update:model-value="onUpdateMv" :key="monthsKey"></q-date>

            <q-date v-else-if="selectedDateFilter === 'Years'" v-model="pickedYear" :options="optionsFn"
              navigation-min-year-month="2023/01" navigation-max-year-month="2023/06" :default-view="'Years'"
              class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal emit-immediately
              @update:model-value="onUpdateYv" :key="yearsKey"></q-date>
          </div>

          <div v-else-if="tappedFilter === 'tags'">
            <q-card-section class="text-h6">Filter period
            </q-card-section>
            <q-card-section>Filtering the period will take into account only the moments that happened during the selected
              period. </q-card-section>
          </div>

          <q-card-actions align="center">
            <q-btn rounded color="primary" @click="updateSetting" class="q-ma-sm full-width" no-caps>Done</q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import SegmentedControl from "./../components/SegmentedControl.vue";
import LearnCard from "./../components/LearnCard.vue";

// import { Timestamp } from 'firebase/firestore'
// import { date } from "quasar";
// // destructuring to keep only what is needed in date
// const { formatDate } = date;

//STORE INITIALIZATION
const momentsStore = useMomentsStore()
// onMounted(async () => {
//   if (!momentsStore.initialized) {
//     await momentsStore.fetchMoments();
//   }
// })

const dateRangeButtonLabel = ref('This month')
const tagsButtonLabel = ref('All tags')
// const slide = ref(10)

const filterDialogOpen = ref(false)
const tappedFilter = ref('')
const selectedDateFilter = ref('Months')
// The default model mask is YYYY/MM/DD, however you can use custom ones too.
// const pickedRange = ref({ from: '2023/04/08', to: '2023/06/03' })

const segDate = ref([{ title: "Monthly", id: "segDate-0" }, { title: "Yearly", id: "segDate-1" }])
const segIdDate = ref("segDate-0")

const pickedMonth = ref('06')
const pickedYear = ref('2023')
const monthsKey = ref(Date.now())
const yearsKey = ref(Date.now())
function onUpdateMv(v) {
  monthsKey.value = Date.now()
  // hideYearRow()
}
function onUpdateYv(v) {
  yearsKey.value = Date.now()
}
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
  return date >= '2023/01/13'
}

const computedUniqueTags = computed(() => {
  return momentsStore.uniqueTags || []
})

const openFilterDialog = (filter) => {
  tappedFilter.value = filter
  filterDialogOpen.value = true
}

const updateSetting = async () => {
  // try {
  //   if (oldPwdInputRef.value) {
  //     oldPwdInputRef.value.validate()
  //     if (oldPwdInputRef.value.hasError) {
  //       // form has error
  //       console.log('oldPwdInputRef.value.hasError')
  //       return
  //     }
  //   }
  //   mainInputRef.value.validate()
  //   if (mainInputRef.value.hasError) {
  //     // form has error
  //     console.log('mainInputRef.value.hasError')
  //     return
  //   }
  //   await momentsStore.updateUser({ [currentSetting.value]: newSettingValue.value, oldPassword: oldPassword.value })
  //   editDialogOpen.value = false
  //   $q.notify({
  //     icon: 'done',
  //     color: 'positive',
  //     message: currentSetting.value === 'displayName' ? 'Name updated' : currentSetting.value === 'email' ? 'Email updated' : 'Password updated'
  //   })
  // } catch (error) {
  //   // Handle authentication error
  //   console.log(error)
  //   if (error.code === 'auth/wrong-password') {
  //     isPwdOld.value = false
  //     oldPwdInputRef.value.$el.querySelector('input').focus();
  //     $q.notify({
  //       icon: 'error',
  //       color: 'negative',
  //       message: 'Wrong password'
  //     })
  //   } else if (error.code === 'auth/weak-password') {
  //     isPwd.value = false
  //     mainInputRef.value.$el.querySelector('input').focus();
  //     $q.notify({
  //       icon: 'error',
  //       color: 'negative',
  //       message: 'Password should be at least 6 characters'
  //     })
  //   } else {
  //     $q.notify({
  //       icon: 'error',
  //       color: 'negative',
  //       message: error.message
  //     })
  //   }
  // }
  filterDialogOpen.value = false

}

function trackProcess(dotsPos) {
  //The position is expressed as a percentage, with 0 representing the start point and 100 representing the end point.
  // cf. https://nightcatsama.github.io/vue-slider-component/#/basics/process
  return [[50, dotsPos[0]]]
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



