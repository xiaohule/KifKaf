<template >
  <q-page class="q-mx-auto q-px-md q-pb-lg" style="max-width: 600px">

    <div v-if="ms.aggDataNeeds && ms.aggDataNeeds[dateRange] && ms.aggDataNeeds[dateRange].importance.length > 0">

      <q-item class="q-pt-none q-pl-none q-pr-xs q-mx-none q-pb-xs">
        <q-item-section class="text-h4 text-weight-bold">{{ t('needsList.' + needName) }}</q-item-section>
        <q-item-section avatar class="q-pr-none" style="min-width: 52px;">
          <q-avatar size="42px" font-size="28px" :color="needToColor()[needName]">
            {{ needsMap[needName][0] }}
          </q-avatar>
        </q-item-section>
      </q-item>
      <q-item class="q-pa-none q-mb-md" dense style="min-height: 0px;">
        <span class="q-pa-none text-body2">
          {{
            t('moment', ms.aggDataNeeds[dateRange].importance.find(item => item.needName ==
              needName).occurrenceCount)
          }}&nbsp;</span>
        <span class="q-pa-auto" style="font-size:0.4em;line-height:4;">●</span>
        <span class="text-body2 text-outline">&nbsp;{{ getDatePickerLabel(dateRange, t) }}</span>
      </q-item>
    </div>

    <!-- <div style="position: relative; height:15vh;">
      <Doughnut v-if="chartLoaded" ref="chartRef" :data="chartData" :options="chartOptions" :plugins="[plugin]"
        class="q-mx-auto" />

      <div class="overlay-content"
        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width:13vh;">
        <div v-if="isSegmentClicked">
          <div class="text-body2 text-center">{{ chartData.datasets[0].labels[clickedIndex]
          }}</div>
          <div class="text-h4 text-on-surface text-weight-bolder text-center">{{
            parseFloat((chartData.datasets[0].data[clickedIndex] / (chartData.datasets[0].data[0] +
              chartData.datasets[0].data[1])
              *
              100).toFixed(0)) + "%" }}
          </div>
        </div>
        <div v-else class="text-body2 text-center">{{ satisfactionAssessmentMessage }}</div>
      </div>
    </div> -->

    <div v-if="!ms || !ms.getUniqueDaysTs || ms.getUniqueDaysTs.length == 0"></div>
    <div v-else class="q-mt-md">
      <div v-for="( day, index ) in ms.getUniqueDaysDateFromDateRangeAndNeed(dateRange, needName)" :key="day">

        <div :class="[
          'text-h6',
          'text-weight-medium',
          'q-pa-none',
          'q-mb-sm',
          (index === 0 ? 'q-mt-none' : 'q-mt-lg'),
          'text-on-background'
        ]">{{ formatDayForMomList(day, false, t, d) }}</div>
        <q-card flat class="bg-surface q-mb-md q-px-none q-py-xs rounded-borders-14">
          <div v-for=" moment  in  ms.getSortedMomsFromDayAndNeed(day, needName) " :key="moment.id" clickable v-ripple
            class="q-px-none q-py-sm" style="min-height: 0px;"
            @click="momentModalId = moment.id; momentModalOpened = true">

            <q-item class="q-px-xs" style="min-height: 0px;">
              <q-item-section avatar top class="q-px-none" style="min-width: 20px;">
                <moment-sync-icon :moment-id="moment.id" />
              </q-item-section>
              <q-item-section class="text-body2 q-pb-none q-pl-none q-pr-md">{{ moment.text
              }}</q-item-section>
            </q-item>
            <!-- <q-item v-if="moment.needs && (moment.needs.error || moment.needs.Oops)" class="q-px-xs q-pt-none q-pb-xs"
              style="min-height: 0px;">
            </q-item>
            <q-item v-else-if="moment.needs && Object.keys(moment.needs).length > 0"
              class="q-px-xs q-pt-none q-pb-xs chip-container" style="min-height: 0px; width:100%;">
              <div class="horizontal-scroll" :style="setChipsRowPadding(moment.id)"
                @scroll="onChipsRowScroll($event, moment.id)">
                <q-chip v-for="need in Object.entries(moment?.needs).sort(([, a], [, b]) => b.importance - a.importance)"
                  :key="need[0]" outline :color="getChipColor(need[1])"
                  :icon="needsMap[need[0]][0]" :label="t('needsList.' + need[0])" class="needs" />
              </div>
            </q-item> -->
          </div>
        </q-card>
      </div>
    </div>
    <moment-modal v-model="momentModalOpened" :moment-id="momentModalId" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from "vue-i18n"
import { useRoute } from 'vue-router'
import momentSyncIcon from 'src/components/momentSyncIcon.vue';
import momentModal from 'src/components/momentModal.vue'
import { useDateUtils } from '../composables/dateUtils.js'
import { needsMap, needToColor, needSlugToStr } from "./../utils/needsUtils";
// import { Chart as ChartJS, ArcElement, DoughnutController } from 'chart.js'
// import { Doughnut } from 'vue-chartjs'

// INITIALIZATION
const ms = useMomentsStore()
const { t, d } = useI18n()
const route = useRoute()
const { currentYYYYdMM, getDatePickerLabel, formatDayForMomList } = useDateUtils()
// ChartJS.register(ArcElement, DoughnutController);

// TITLES
const needName = ref('')
const dateRange = ref(currentYYYYdMM.value)
//MOM PAGE
const momentModalOpened = ref(false);
const momentModalId = ref("");

onMounted(async () => {
  try {
    if (!ms.momentsFetched) {
      await ms.fetchMoments();
    }
    if (!ms.aggDataNeedsFetched) {
      await ms.fetchAggDataNeeds();
    }
  } catch (error) {
    console.error('In NeedPage > await ms.fetchMoments() error:', error);
  }
})

watch(
  () => route.params.needSlug,
  newNeedSlug => {
    needName.value = needSlugToStr(newNeedSlug)
  }, { immediate: true }
)
watch(
  () => route.query.dateRange,
  newDateRange => {
    if (newDateRange) dateRange.value = newDateRange
  }, { immediate: true }
)

// //DONUT CHART
// const chartLoaded = ref(false)
// const chartRef = ref(null)
// const isSegmentClicked = ref(false)
// const clickedIndex = ref(null)
// const chartData = ref({
//   datasets: [
//     {
//       data: [1],
//       backgroundColor: ['#c0c6dc'],
//     }
//   ]
// }
// )

// //TODO:0 define elsewhere, outside of your component's setup function. This ensures the plugin is defined once and not re-created on each component re-render.
// const plugin = {
//   id: 'doughnut_chart_background',
//   beforeDraw: (chart) => {
//     // TODO:0 understand why this plugin is called multiple times on opening of need page does it has a performance impact?
//     // console.log('In NeedPage donutChart > plugin beforeDraw chart:', chart);
//     const { ctx, width, height } = chart
//     const { innerRadius } = chart.getDatasetMeta(chart.data.datasets.length - 1).controller
//     const { outerRadius } = chart.getDatasetMeta(0).controller
//     const radiusLength = outerRadius - innerRadius
//     const x = width / 2,
//       y = height / 2

//     ctx.beginPath()
//     ctx.arc(x, y, outerRadius - radiusLength / 2, 0, 2 * Math.PI)
//     ctx.lineWidth = radiusLength
//     ctx.strokeStyle = '#c0c6dc'
//     ctx.stroke()
//   }
// }

// const chartOptions = ref({
//   cutout: '84%',
//   spacing: 0,
//   borderRadius: 14,
//   borderWidth: 0,
//   backgroundColor: '#c0c6dc',
//   responsive: true,
//   maintainAspectRatio: true,
//   animation: {
//     duration: 500,
//     animateScale: false,
//     animateRotate: true
//   },
// })


// watchEffect(() => {
//   if (needName.value && dateRange.value) {
//     console.log('In NeedPage donutChart for ', needName.value, ' ', dateRange.value, ' > watchEffect called');
//     if (ms.aggDataNeeds) {
//       if (
//         ms.aggDataNeeds[dateRange.value] &&
//         ms.aggDataNeeds[dateRange.value].importance.length > 0) {
//         chartLoaded.value = false
//         const needsData = ms?.aggDataNeeds[dateRange.value].importance.find(item => item.needName == needName.value)
//         console.log('In NeedPage donutChart for ', needName.value, ' ', dateRange.value, ' needsData:', needsData);

//         chartData.value.datasets[0].data = [needsData.satisfactionImpactLabelValue, needsData.unsatisfactionImpactLabelValue]
//         chartData.value.datasets[0].backgroundColor = [getComputedStyle(document.documentElement).getPropertyValue(`--positive-color`), 'transparent']
//         //full circle if full satisfaction
//         if (needsData.unsatisfactionImpactLabelValue === 0) chartData.value.datasets[0].borderRadius = 0

//         nextTick(() => {
//           chartLoaded.value = true
//           console.log('In NeedPage donutChart for ', needName.value, ' ', dateRange.value, ' > watchEffect, chartData updated, chartRef', chartRef.value);

//         })


//       } else {
//         //if no data ready but legit dateRange and needName generate an empty chart
//         chartLoaded.value = false
//         nextTick(() => {
//           console.log('In NeedPage donutChart for ', needName.value, ' ', dateRange.value, '  > watchEffect, data not ready for this activeDateRange and needsToggleModel');
//           chartLoaded.value = true
//         })
//       }
//     }
//     else {
//       console.log('In NeedPage donutChart for ', needName.value, ' ', dateRange.value, ' > watchEffect ,ms.aggDataNeeds not ready');
//     }
//   }
// })

// const satisfactionAssessmentMessage = computed(() => {
//   if (chartData.value.datasets[0].data.length > 1) {

//     const sat = chartData.value.datasets[0].data[0] / (chartData.value.datasets[0].data[0] + chartData.value.datasets[0].data[1]);
//     if (sat < 0.15) {
//       return "Highly dissatisfied";
//     } else if (sat < 0.3) {
//       return "Mostly dissatisfied";
//     } else if (sat < 0.45) {
//       return "Somewhat dissatisfied";
//     } else if (sat < 0.6) {
//       return "Moderately satisfied";
//     } else if (sat < 0.75) {
//       return "Fairly satisfied";
//     } else if (sat < 1) {
//       return "Well satisfied";
//     } else {
//       return "Fully satisfied";
//     }
//   } else {
//     return "No data"
//   }
// })



// DISPLAY PREVIOUS MOMENTS NEEDS
// const momsWithScrolledNeeds = ref({}); // This object will store scrollLeft values for each moment
// const onChipsRowScroll = (event, id) => {
//   momsWithScrolledNeeds.value[id] = event.target.scrollLeft;
// };
// const setChipsRowPadding = (id) => {
//   // If the scrollLeft value for the given ID is 0 or undefined, return the desired padding. Otherwise, no padding.
//   return momsWithScrolledNeeds.value[id] ? 'padding-left: 0;' : 'padding-left: 48px;';
// };
</script>

<style lang="scss">
// .overlay-content {
//   pointer-events: none;
//   /* This allows clicks to pass through to the chart */

//   >div {
//     pointer-events: auto;
//     /* Enable pointer events for the actual content */
//   }
// }

// /* Hide scrollbar for IE, Edge, and Firefox */
// .chip-container {
//   scrollbar-width: none;
//   /* For Firefox */
//   -ms-overflow-style: none;
//   /* For Internet Explorer and Edge */
// }

// .horizontal-scroll {
//   display: flex;
//   overflow-x: auto;
//   white-space: nowrap;
//   width: 100%;
//   -webkit-overflow-scrolling: touch;
//   transition: padding-left 0.9s ease;
//   // cursor: grab; //disabled bec. misleading since horizontal scroll doesn't work on desktop

//   /* Hide scrollbar for Chrome, Safari and Opera */
//   &::-webkit-scrollbar {
//     display: none;
//   }
// }

// .horizontal-scroll .q-chip:first-child {
//   margin-left: 0;
// }

// .needs {
//   font-size: 0.8rem;
//   // max-width: 200px; //truncate
// }

// .q-chip__icon {
//   margin-bottom: 2px;
// }
</style>


