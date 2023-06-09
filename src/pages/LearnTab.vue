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

      <!-- height="500px" -->
      <!-- TODO: need a better carousel that allow for more programmaticity for previous slides and auto height? -->
      <q-carousel v-model="slide" transition-prev="slide-right" transition-next="slide-left" swipeable animated
        control-color="button-on-background" navigation padding class="bg-transparent" height="480px">

        <q-carousel-slide :name="8" class="column no-wrap">
          test 8
        </q-carousel-slide>
        <q-carousel-slide :name="9" class="column no-wrap">
          test 9
        </q-carousel-slide>

        <q-carousel-slide :name="10" class="column no-wrap">

          <q-card class="bg-surface q-mb-lg q-px-xs q-pt-md q-pb-none rounded-borders-14" flat>
            <q-btn-group spread rounded unelevated style="border-radius: 28px" class="q-mx-sm">
              <q-btn class="text-subtitle1 bg-button-on-background text-on-background" label="Intensity avg" no-caps
                dense />
              <q-btn class="text-subtitle1 bg-button-on-background text-on-background" label="%" no-caps dense />
            </q-btn-group>

            <q-list>
              <q-card-section class="q-pt-xs q-pb-xs" clickable v-for="tag in momentsStore.uniqueTags.slice(0, 5)"
                :key="tag">
                <q-item class="q-px-none q-pb-none">
                  <q-item-section class="col-auto"> {{ tag }} </q-item-section>
                  <q-item-section side>
                    <!-- <vue-slider v-model="tag.avg(period)" :process="trackProcess" :min="-5" :max="5" :interval="1"
                  disabled></vue-slider> -->
                    <vue-slider v-model="avgPh" :process="trackProcess" :min="-5" :max="5" :interval="1"
                      disabled></vue-slider>
                  </q-item-section>
                </q-item>

                <!-- <q-item class="q-py-none" style="min-height: 0px;" dense>{{ moment.text }}</q-item>
            <q-item v-if="moment.tags && moment.tags.length > 0" class="tags q-py-none" style="min-height: 0px;" dense>{{
              moment.tags.map(tag =>
                '#' +
                tag).join(' ') }}</q-item> -->
              </q-card-section>

              <q-card-actions align="center">
                <q-btn color="primary" @click="updateSetting" class="q-ma-sm full-width" no-caps flat>Show
                  more</q-btn>
                <!-- TODO:for email should be "verify" instead of save and we should have a verifying flow -->
              </q-card-actions>
            </q-list>

          </q-card>
        </q-carousel-slide>

      </q-carousel>


      <q-dialog v-model="filterDialogOpen" position="bottom">
        <q-card class="bg-background">

          <div v-if="tappedFilter === 'date'">
            <q-card-section class="text-h6">Filter period
            </q-card-section>
            <q-card-section>Filtering the period will take into account only the moments that happened during the selected
              period. </q-card-section>

            <q-btn-group spread rounded unelevated class="q-mx-lg q-mt-md q-mb-sm">
              <!-- <q-btn class="text-subtitle1 bg-button-on-background text-on-background" label="Weekly" no-caps dense
                @click="selectedDateFilter = 'Calendar'" /> -->
              <q-btn class="text-subtitle1 bg-button-on-background text-on-background" label="Monthly" no-caps dense
                @click="selectedDateFilter = 'Months'" />
              <q-btn class="text-subtitle1 bg-button-on-background text-on-background" label="Yearly" no-caps dense
                @click="selectedDateFilter = 'Years'" />
            </q-btn-group>

            <iOS13SegmentedControl v-model="value" :segments="segments" />


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
import { ref, onMounted, onDeactivated, onBeforeUnmount, computed } from 'vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import { useMomentsStore } from './../stores/moments.js'
import iOS13SegmentedControl from "./../components/vue-ios13-segmented-control.vue";

const value = ref("1")
const segments = ref([
  {
    title: "Apple Music",
    id: "0"
  },
  {
    title: "Spotify",
    id: "1"
  },
  {
    title: "Deezer",
    id: "2"
  },
])

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
const avgPh = ref(3.8)
const slide = ref(10)
const filterDialogOpen = ref(false)
const tappedFilter = ref('')
const selectedDateFilter = ref('Months')
// The default model mask is YYYY/MM/DD, however you can use custom ones too.
// const pickedRange = ref({ from: '2023/04/08', to: '2023/06/03' })

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
.tags {
  font-size: 0.9rem;
  color: color(primary);
}

.bg-button-on-background .q-icon {
  margin-right: 8px;
  /* adjust the value as needed */
}

// .myDate>.row~.row {
//   display: none !important;
// }
</style>



