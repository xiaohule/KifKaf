<!-- here we build the correct swiper based on the periodicity and data grouping picked in parent component. We display it at the correct position and next to the correct needs list based on the date range picked in parent component -->
<!-- init="false" auto-height="true" -->
<template >
  <swiper-container ref="swiperElChart" observer="true" observe-slide-children="true" grab-cursor="true"
    pagination-dynamic-bullets="true" @activeindexchange="onActiveIndexChangeBySwiper" virtual="true">
    <!-- TODO:2 for performance, we should move to append slides when many of them instead of pre-creating all of them and using v-for -->
    <!-- @update:chartData="   nextTick(() => {swiperElChart.swiper.updateAutoHeight(300);})" -->
    <swiper-slide v-for="range in props.dateRanges" :key="range">
      <donut-chart :date-range="range" :toggle-value="props.toggleValue" :percentage-threshold="percentageThreshold"
        :clicked-outside="props.clickedLearnPage" @click:segment="donutSegmentClicked" class="q-pt-none q-pt-xs"
        style="padding-bottom: 40px;" />
      <!-- <div class="swiper-lazy-preloader"></div> -->
    </swiper-slide>
  </swiper-container>

  <q-card class="bg-surface q-px-sm q-pt-md q-pb-sm q-mb-lg rounded-borders-14" flat>
    <div
      v-if="momentsStore.aggregateData && momentsStore.aggregateData[props.dateRanges[props.activeIndex]] && momentsStore.aggregateData[props.dateRanges[props.activeIndex]][props.toggleValue]?.length > 0">
      <q-list class="q-mt-xs">
        <transition-group appear enter-active-class="meala" leave-active-class="meala la" move-class="meala"
          enter-from-class="eflt" leave-to-class="eflt">

          <q-item v-for="item in itemsToDisplay" :key="item.needName" class="q-pt-sm q-pb-sm q-px-xs" clickable>

            <q-item-section avatar class="q-pr-none" style="min-width: 52px;">
              <q-avatar size="42px" font-size="28px" :color="momentsStore.needsMap[item.needName][2]">
                {{ momentsStore.needsMap[item.needName][0] }}
              </q-avatar>
            </q-item-section>

            <q-item-section>

              <q-item class="q-pa-none" dense style="min-height: 0px;">
                <q-item-section class="text-subtitle2 text-weight-medium">{{ item.needName }}</q-item-section>
                <q-item-section side class="text-body2 text-on-surface">{{ parseFloat((item[props.toggleValue ==
                  'satisfaction' ? 'satisfactionImpactLabelValue' : (props.toggleValue == 'unsatisfaction'
                    ? 'unsatisfactionImpactLabelValue' : 'importanceValue')] * 100).toFixed(0)) + "%" }}
                </q-item-section>
              </q-item>

              <q-item class="q-pa-none" dense style="min-height: 0px;">
                <q-item-section class="text-caption text-outline">
                  {{ item.occurrenceCount }}
                  {{ item.occurrenceCount == 1 ? 'moment' : 'moments' }}
                </q-item-section>
                <q-item-section side class="text-caption text-outline">{{ props.toggleValue == 'satisfaction' ?
                  'of all satisfaction' : (props.toggleValue == 'unsatisfaction'
                    ? 'of all dissatisfaction' : 'of total importance') }}
                </q-item-section>
              </q-item>
            </q-item-section>
          </q-item>

        </transition-group>
      </q-list>
    </div>

    <div v-else class="bg-surface q-px-md q-py-md rounded-borders-14" flat>
      <!-- system not ready or no need ever recorded -->
      <div v-if="!momentsStore || !momentsStore.hasNeeds">
        Add Moments in the Home tab to learn more about your needs!
      </div>
      <!-- system ready but no need recorded for the period-->
      <div v-else>
        <div v-if="props.toggleValue == 'satisfaction'">
          No satisfied needs for this period.
        </div>
        <div v-else-if="props.toggleValue == 'unsatisfaction'">
          No dissatisfied needs for this period.
        </div>
        <div v-else>
          No needs for this period.
        </div>
      </div>
    </div>

  </q-card>
</template>

<script setup>
import { watch, ref, onActivated, nextTick, computed } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import donutChart from "./../components/donutChart.vue";

const momentsStore = useMomentsStore()

const props = defineProps({
  dateRanges: {
    type: Array,
    default: () => [],
  },
  toggleValue: {
    type: String,
    default: "satisfaction",
  },
  activeIndex: {
    type: Number,
    default: 0,
  },
  clickedLearnPage: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['update:activeIndex', 'reset:clickedLearnPage'])

//SWIPER
//TODO:2 for performance, we should move to append slides when many of them instead of pre-creating all of them and using v-for
const swiperElChart = ref(null)
// const swiperInitialized = ref(false)
const displayOnlyOneNeed = ref(null)
const percentageThreshold = ref(0.05)

onActivated(() => {
  console.log('In donutSwiperAndList > ONACTIVATED')
  // if (!swiperInitialized.value) {
  if (swiperElChart.value && swiperElChart.value.swiper) {
    // swiperElChart.value.initialize();
    swiperElChart.value.swiper.activeIndex = props.activeIndex
    swiperElChart.value.swiper.slideTo(props.activeIndex, 0)
    // swiperInitialized.value = true
  }
});

// onDeactivated(() => {
//   console.log('In donutSwiperAndList > ONDEACTIVATED')
//   // swiperInitialized.value = false
// });

const onActiveIndexChangeBySwiper = (event) => {
  console.log('In donutSwiperAndList > > onActiveIndexChangeBySwiper fired from previousIndex', event.detail[0].previousIndex, 'to activeIndex', event.detail[0].activeIndex)

  emits('update:activeIndex', event)
}

const valueToDisplay = computed(() => {
  if (props.toggleValue == 'satisfaction') {
    return 'satisfactionImpactLabelValue'
  }
  else if (props.toggleValue == 'unsatisfaction') {
    return 'unsatisfactionImpactLabelValue'
  }
  else {
    return 'importanceValue'
  }
})

const itemsToDisplay = computed(() => {
  console.log('In donutSwiperAndList > itemsToDisplay', props.dateRanges[props.activeIndex], props.toggleValue, percentageThreshold.value, displayOnlyOneNeed.value)
  return momentsStore.aggregateData &&
    momentsStore.aggregateData[props.dateRanges[props.activeIndex]] &&
    momentsStore.aggregateData[props.dateRanges[props.activeIndex]][props.toggleValue]?.filter(item => {
      switch (displayOnlyOneNeed.value) {
        case null:
          return item[valueToDisplay.value] > percentageThreshold.value;
        case "Others":
          return item[valueToDisplay.value] <= percentageThreshold.value;
        default:
          return item.needName == displayOnlyOneNeed.value;
      }
    });

})

watch(() => props.activeIndex, (newVal, oldVal) => {
  // if (swiperInitialized.value) {
  if (swiperElChart.value && swiperElChart.value.swiper) {

    // console.log('In donutSwiperAndList > props.activeIndex watcher, a 1 sec delay')
    setTimeout(function () { //This weird hack seems to fix issue home>learn>2022>monthly>[was getting oct 2021, now gets jan 2022]
      // nextTick(() => {
      swiperElChart.value.swiper.activeIndex = newVal
      swiperElChart.value.swiper.slideTo(newVal, 300)
      console.log('In donutSwiperAndList > props.activeIndex watcher, activeIndex changed from', oldVal, 'to', newVal)
      // console.log('In donutSwiperAndList > props.activeIndex watcher, swiperElChart.value.swiper', swiperElChart.value.swiper)
      // })
    }, 1);
  }
})

watch(() => props.toggleValue, () => {
  displayOnlyOneNeed.value = null
})

// watch(() => momentsStore.aggregateData && momentsStore.aggregateData[props.dateRanges[props.activeIndex]] && momentsStore.aggregateData[props.dateRanges[props.activeIndex]][props.toggleValue], (newVal) => {
//   // console.log('In donutSwiperAndList, watch XXX55', newVal, ", replaced:", oldVal);
//   if (newVal && newVal.length > 0 && swiperElChart.value && swiperElChart.value.swiper) {

//     nextTick(() => {
//       swiperElChart.value.swiper.updateAutoHeight(300);
//     })
//   }
// }, { immediate: true })

const donutSegmentClicked = ({ needName }) => {
  console.log('In donutSwiperAndList > donutSegmentClicked for:', needName)
  displayOnlyOneNeed.value = needName
  emits('reset:clickedLearnPage')
}
</script>

<style lang="scss">
.meala {
  transition: all 0.5s ease;
}

.eflt {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.la {
  position: absolute;
}

swiper-container {
  // width: 100%;
  // height: 100%;
  // height: 100vh; // This will make the container fill the entire height of the screen
  --swiper-pagination-color: #{$primary};
  // --swiper-pagination-left: auto;
  // --swiper-pagination-right: 8px;
  // --swiper-pagination-bottom: 15px;
  // --swiper-pagination-top: auto;
  // --swiper-pagination-fraction-color: inherit;
  // --swiper-pagination-progressbar-bg-color: rgba(0, 0, 0, 0.25);
  // --swiper-pagination-progressbar-size: 4px;
  // --swiper-pagination-bullet-size: 12px;
  // --swiper-pagination-bullet-width: 8px;
  // --swiper-pagination-bullet-height: 8px;
  // --swiper-pagination-bullet-inactive-color: #000;
  // --swiper-pagination-bullet-inactive-opacity: 0.2;
  // --swiper-pagination-bullet-opacity: 1;
  // --swiper-pagination-bullet-horizontal-gap: 4px;
  // --swiper-pagination-bullet-vertical-gap: 6px;
}
</style>