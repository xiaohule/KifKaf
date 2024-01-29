<!-- here we build the correct swiper based on the periodicity and data grouping picked in parent component. We display it at the correct position and next to the correct needs list based on the date range picked in parent component -->
<template >
  <!-- TODO:2 for performance, we could move to append slides when many of them instead of pre-creating all of them and using v-for -->
  <div v-if="!props.embedded">
    <!-- && ms.activeIndex !== undefined -->
    <swiper-container v-if="swiperLoaded && ms.dateRanges.length > 0" ref="swiperDonutEl" :init="true"
      :virtual="{ enabled: true, addSlidesAfter: 3, addSlidesBefore: 3 }" :observer="true" :observe-slide-children="true"
      :grab-cursor="true" :pagination="{ dynamicBullets: true }" @swiperactiveindexchange="onActiveIndexChangeBySwiper"
      @swiperafterinit="swiperAfterInit" @swiperupdate="console.log('In donutSwiperAndList > swiper update event fired')">
      <swiper-slide v-for="range in ms.dateRanges" :key="range">
        <donut-chart :percentage-threshold="percentageThreshold" :is-active="ms.activeDateRange === range"
          :clicked-outside="(ms.activeDateRange === range) ? props.deselectSegment : false"
          @click:segment="donutSegmentClicked" class="q-pt-xs" style="padding-bottom: 40px;" />
      </swiper-slide>
    </swiper-container>
  </div>
  <div v-else>
    <donut-chart :percentage-threshold="percentageThreshold" :embedded="true" class="q-pt-xs"
      style="padding-bottom: 10px;" />
  </div>

  <!-- because messes with siwper when in NeedsPageLayout -->
  <q-card class="bg-surface q-px-sm q-py-sm rounded-borders-14" flat v-touch-swipe.mouse.right="(event) => { goBack() }">
    <div
      v-if="ms.aggDataNeeds && ms.aggDataNeeds[ms.activeDateRange] && ms.aggDataNeeds[ms.activeDateRange][ms.needsToggleModel]?.length > 0">
      <q-list class="q-mt-xs">
        <transition-group appear enter-active-class="meala" leave-active-class="meala la" move-class="meala"
          enter-from-class="eflt" leave-to-class="eflt">

          <q-item v-for="item in itemsToDisplay" :key="item.needName" class="q-pt-sm q-pb-sm q-px-xs" clickable
            @click="ms.donutSegmentClicked = donutChartClickedSegmentIndex; router.push({ path: `/insights/needs/${needsMap[item.needName][2]}`, query: { dateRange: ms.activeDateRange } });">

            <q-item-section avatar class="q-pr-none" style="min-width: 52px;">
              <q-avatar size="42px" font-size="28px" :color="needToColor()[item.needName]">
                {{ needsMap[item.needName][0] }}
              </q-avatar>
            </q-item-section>

            <q-item-section>

              <q-item class="q-pa-none" dense style="min-height: 0px;">
                <q-item-section class="text-subtitle2 text-weight-medium">{{ t('needsList.' + item.needName)
                }}</q-item-section>
                <q-item-section side class="text-body2 text-on-surface">{{ parseFloat((item[ms.needsToggleModel ==
                  'satisfaction' ? 'satisfactionImpactLabelValue' : (ms.needsToggleModel == 'unsatisfaction'
                    ? 'unsatisfactionImpactLabelValue' : 'importanceValue')] * 100).toFixed(0)) + "%" }}
                </q-item-section>
              </q-item>

              <q-item class="q-pa-none" dense style="min-height: 0px;">
                <q-item-section class="text-caption text-outline">
                  {{ item.occurrenceCount }}
                  {{ item.occurrenceCount == 1 ? 'moment' : 'moments' }}
                </q-item-section>
                <q-item-section side class="text-caption text-outline">{{ ms.needsToggleModel == 'satisfaction' ?
                  t('ofAllSat') : (ms.needsToggleModel == 'unsatisfaction'
                    ? t('ofAllDissat') : t('ofTotalImp')) }}
                </q-item-section>
              </q-item>
            </q-item-section>
          </q-item>

        </transition-group>
      </q-list>

    </div>

    <div v-else class="bg-surface q-px-sm q-py-sm rounded-borders-14" flat>
      <!-- system not ready or no need ever recorded -->
      <div v-if="!ms || !ms.userDoc?.hasNeeds">
        <!-- Add Moments in the Home tab to learn more about your needs! -->
        <div v-if="ms.needsToggleModel == 'satisfaction'">
          Log Moments to discover the needs from which you get the most satisfaction!
        </div>
        <div v-else-if="ms.needsToggleModel == 'unsatisfaction'">Log Moments to discover the
          needs that cause you the most dissatisfaction.</div>
        <div v-else>
          Log Moments to discover what needs bear the most importance to you!</div>
      </div>
      <div v-else-if="ms.activeIndex === ms.dateRanges.length - 1">
        <!-- Add Moments in the Home tab to learn more about your needs! -->
        <div v-if="ms.needsToggleModel == 'satisfaction'">
          Keep logging Moments to discover the needs from which you get the most satisfaction!
        </div>
        <div v-else-if="ms.needsToggleModel == 'unsatisfaction'">Keep logging Moments to discover the
          needs that cause you the most dissatisfaction.</div>
        <div v-else>
          Keep logging your Moments to discover what needs bear the most importance to you!</div>
      </div>
      <!-- system ready but no need recorded for the period-->
      <div v-else>
        <div v-if="ms.needsToggleModel == 'satisfaction'">
          No satisfied needs for this period.
        </div>
        <div v-else-if="ms.needsToggleModel == 'unsatisfaction'">
          No dissatisfied needs for this period.
        </div>
        <div v-else>
          No needs for this period.
        </div>
      </div>
    </div>

    <q-card-actions
      v-if="props.embedded && ms.aggDataNeeds && ms.aggDataNeeds[ms.activeDateRange] && ms.aggDataNeeds[ms.activeDateRange][ms.needsToggleModel].length > 0 && itemsToDisplay.length > 0"
      align="center" class="">
      <q-btn color="primary" @click="router.push('/insights/needs')" class="q-mx-sm q-mt-sm full-width" no-caps flat>{{
        t('showMore') }}</q-btn>
    </q-card-actions>

  </q-card>
</template>

<script setup>
import { watch, ref, nextTick, computed } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'
import donutChart from "./../components/donutChart.vue";
import { needsMap, needToColor } from "./../utils/needsUtils";

const ms = useMomentsStore()
const { t } = useI18n()
const router = useRouter()

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  deselectSegment: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['reset:deselectSegment'])

//SWIPER
const swiperDonutEl = ref(null)
const swiperLoaded = ref(true)

//LIST
const displayOnlyOneNeed = ref(null)
const donutChartClickedSegmentIndex = ref(null)
const percentageThreshold = ref(0.05)
const needsToggleModelDataKey = computed(() => {
  if (ms.needsToggleModel == 'satisfaction') {
    return 'satisfactionImpactLabelValue'
  }
  else if (ms.needsToggleModel == 'unsatisfaction') {
    return 'unsatisfactionImpactLabelValue'
  }
  else {
    return 'importanceValue'
  }
})

//SWIPER
const swiperAfterInit = (event) => {
  nextTick(() => {
    console.log('In donutSwiperAndList with embedded:', props.embedded, ' > afterinit fired with event:', event)
    console.log('In donutSwiperAndList with embedded:', props.embedded, ' > afterinit fired,  sliding to ms.activeIndex', ms.activeIndex)
    swiperDonutEl.value?.swiper.slideTo(ms.activeIndex, 0)
  })
}

//set to immediate to react to activeIndex change from parent at initialization
watch(() => ms.activeIndex, (newVal, oldVal) => {
  if (props.embedded) return
  nextTick(() => {

    console.log('In donutSwiperAndList with embedded:', props.embedded, ' > ms.activeIndex watcher, activeIndex changed from', oldVal, 'to', newVal, "sliding swiper to new activeIndex:", newVal)
    if (swiperDonutEl.value && swiperDonutEl.value.swiper) {
      swiperDonutEl.value.swiper.slideTo(newVal, 0)
    }
  })
}, { immediate: true })

const onActiveIndexChangeBySwiper = (event) => {
  console.log('In donutSwiperAndList with embedded:', props.embedded, ' > onActiveIndexChangeBySwiper fired with ms.activeIndex', ms.activeIndex, 'ms.activeDateRange', ms.activeDateRange, 'ms.dateRanges', ms.dateRanges, 'swiperLoaded', swiperLoaded.value, 'swiperDonutEl', swiperDonutEl.value)
  // console.log('In donutSwiperAndList with embedded:', props.embedded, ' > onActiveIndexChangeBySwiper fired with event:', event)
  console.log('In donutSwiperAndList with embedded:', props.embedded, ' > onActiveIndexChangeBySwiper fired from previousIndex', event.detail[0].previousIndex, 'to activeIndex', event.detail[0].activeIndex)
  displayOnlyOneNeed.value = null
  ms.activeIndex = event.detail[0].activeIndex
}

//kill-restart swiper when dateRanges change
watch(() => ms.dateRanges, (newVal, oldVal) => {
  if (props.embedded) return
  console.log('In donutSwiperAndList with embedded:', props.embedded, ' > ms.dateRanges watcher, dateRanges changed from', oldVal, 'to', newVal, 'reloading swiper container')
  swiperLoaded.value = false
  nextTick(() => {
    swiperLoaded.value = true
  })
})

//LIST
const itemsToDisplay = computed(() => {
  console.log('In donutSwiperAndList with embedded:', props.embedded, ' > itemsToDisplay', ms.activeDateRange, ms.needsToggleModel, percentageThreshold.value, displayOnlyOneNeed.value)
  let filteredItems = ms.aggDataNeeds &&
    ms.aggDataNeeds[ms.activeDateRange] &&
    ms.aggDataNeeds[ms.activeDateRange][ms.needsToggleModel]?.filter(item => {
      switch (displayOnlyOneNeed.value) {
        case null:
          return item[needsToggleModelDataKey.value] > percentageThreshold.value;
        case "Others":
          return item[needsToggleModelDataKey.value] <= percentageThreshold.value;
        default:
          return item.needName == displayOnlyOneNeed.value;
      }
    })

  // If props.embedded is true, return only the first 3 items
  return props.embedded ? filteredItems.slice(0, 3) : filteredItems;
})

watch(() => ms.needsToggleModel, () => {
  if (props.embedded) return
  displayOnlyOneNeed.value = null
})

const donutSegmentClicked = ({ needName, clickedSegmentIndex }) => {
  console.log('In donutSwiperAndList with embedded:', props.embedded, ' > donutSegmentClicked for:', needName, 'clickedSegmentIndex:', clickedSegmentIndex)
  displayOnlyOneNeed.value = needName
  donutChartClickedSegmentIndex.value = clickedSegmentIndex
  emits('reset:deselectSegment')
}

const goBack = () => {
  if (window.history.length > 1) {
    // console.log('In goBack, history.length:', window.history.length)
    router.go(-1) // Go back to the previous page if there's a history
  } else {
    // console.log('In goBack, history.length:', window.history.length, "going to home")
    router.push({ path: '/' }) // Redirect to root if there's no history
  }
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
  --swiper-pagination-color: #{$primary};
}
</style>
