<!-- Here we handle date and data grouping selections -->
<template >
  <q-page class="q-mx-auto q-px-md q-pt-xs q-pb-md" style="max-width: 600px">

    <div v-if="true" class="q-mt-xs q-mb-md">
      <div class="q-mb-sm text-h6 text-weight-medium text-on-background"> {{ `${ms.dateRangeButtonLabel}'s
        summary` }}</div>

      <swiper-container v-if="swipersLoaded && ms.dateRanges.length > 0" ref="swiperSummaryEl" :init="true"
        :virtual="{ enabled: true, addSlidesAfter: 3, addSlidesBefore: 3 }" :observer="true"
        :observe-slide-children="true" :grab-cursor="true" :pagination="{ dynamicBullets: true }"
        @swiperactiveindexchange="onActiveIndexChangeBySwiper" @swiperafterinit="swiperAfterInit(event, 'summary')"
        @swiperupdate="console.log('In InsightsTab > swiper update event fired')">
        <swiper-slide v-for="range in ms.dateRanges" :key="range">
          <q-card flat class="bg-surface q-px-md q-py-lg rounded-borders-14" style="margin-bottom: 32px;">
            <div
              v-if="ms.aggDataInsights && ms.aggDataInsights[ms.activeDateRange] && ms.aggDataInsights[ms.activeDateRange].summary?.length > 0"
              style="min-height: 0px;">
              {{ ms.aggDataInsights[ms.activeDateRange].summary }}
            </div>
            <div v-else style="min-height: 0px;">
              No summary available for this period.
            </div>
          </q-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <div v-if="true" class="q-my-xl">
      <q-item>
        <q-item-section
          v-if="ms.aggDataInsights && ms.aggDataInsights[ms.activeDateRange] && ms.aggDataInsights[ms.activeDateRange].quote?.text?.length > 0"><span>{{
            ms.aggDataInsights[ms.activeDateRange].quote.text }}</span><span class="text-caption text-outline">{{
    ms.aggDataInsights[ms.activeDateRange].quote.author }}</span>
        </q-item-section>
        <q-item-section v-else><span>Oops no quote ready for this period.</span> </q-item-section>
        <q-item-section side top>
          <q-item-label class="text-primary text-weight-medium text-subtitle2"
            @click="whyModalSection = 'quote'; whyModalOpened = true">Why</q-item-label>
          <q-icon color="on-background" name="r_format_quote" size="lg" />
        </q-item-section>
      </q-item>
    </div>

    <div v-if="true" class="q-my-md">
      <div class="q-mb-sm text-h6 text-weight-medium text-on-background"> {{ `${ms.dateRangeButtonLabel}'s
        needs` }}</div>

      <swiper-container v-if="swipersLoaded && ms.dateRanges.length > 0" ref="swiperNeedsEl" :init="true"
        :virtual="{ enabled: true, addSlidesAfter: 3, addSlidesBefore: 3 }" :observer="true"
        :observe-slide-children="true" :grab-cursor="true" :pagination="{ dynamicBullets: true }"
        @swiperactiveindexchange="onActiveIndexChangeBySwiper" @swiperafterinit="swiperAfterInit(event, 'needs')"
        @swiperupdate="console.log('In InsightsTab > swiper update event fired')">
        <swiper-slide v-for="range in ms.dateRanges" :key="range">
          <q-card flat :class="[
            'bg-surface',
            'q-px-md',
            'rounded-borders-14',
            ms.needsToggleModel === 'top' ? 'q-py-lg' : 'q-pt-lg',
          ]" style="margin-bottom: 32px;">
            <q-btn-toggle v-model="ms.needsToggleModel" class="q-gutter-xs q-mb-sm" color="transparent"
              text-color="outline" toggle-color="on-background" toggle-text-color="surface" unelevated no-caps
              padding="xs md" :ripple="false" :options="[
                { label: 'Tops', value: 'top' },
                { label: 'Satisfiers', value: 'satisfaction' },
                { label: 'Dissatisfiers', value: 'unsatisfaction' },
                { label: 'All', value: 'importance' }
              ]" />
            <div v-if="ms.needsToggleModel === 'top'">
              <top-item top-type="satisfaction" />
              <top-item top-type="unsatisfaction" />
              <top-item top-type="importance" />
            </div>
            <div v-else>
              <donut-swiper-and-list v-if="ms.activeIndex !== undefined" :embedded="true" />
            </div>
          </q-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <div v-if="true" class="q-my-xl">
      <q-item>
        <q-item-section
          v-if="ms.aggDataInsights && ms.aggDataInsights[ms.activeDateRange] && ms.aggDataInsights[ms.activeDateRange].book?.title?.length > 0"><span>{{
            ms.aggDataInsights[ms.activeDateRange].book.title }}</span><span class="text-caption text-outline">by {{
    ms.aggDataInsights[ms.activeDateRange].book.author }}</span>
        </q-item-section>
        <q-item-section v-else><span>Oops no book ready for this period.</span> </q-item-section>
        <q-item-section side top>
          <q-item-label class="text-primary text-weight-medium text-subtitle2"
            @click="whyModalSection = 'book'; whyModalOpened = true">Why</q-item-label>
          <q-icon color="on-background" name="r_menu_book" size="lg" />
        </q-item-section>
      </q-item>
    </div>

    <div v-if="true" class="q-my-md">
      <div class="q-mb-sm text-h6 text-weight-medium text-on-background"> {{ `${ms.dateRangeButtonLabel}'s
        suggestions` }}</div>

      <swiper-container v-if="swipersLoaded && ms.dateRanges.length > 0" ref="swiperSuggestionsEl" :init="true"
        :virtual="{ enabled: true, addSlidesAfter: 3, addSlidesBefore: 3 }" :observer="true"
        :observe-slide-children="true" :grab-cursor="true" :pagination="{ dynamicBullets: true }"
        @swiperactiveindexchange="onActiveIndexChangeBySwiper" @swiperafterinit="swiperAfterInit(event, 'suggestions')"
        @swiperupdate="console.log('In InsightsTab > swiper update event fired')">
        <swiper-slide v-for="range in ms.dateRanges" :key="range">
          <q-card flat class="bg-surface q-px-md q-py-lg rounded-borders-14" style="margin-bottom: 32px;">
            <q-list
              v-if="ms.aggDataInsights && ms.aggDataInsights[ms.activeDateRange] && (ms.aggDataInsights[ms.activeDateRange].suggestions?.continue?.length > 0 || ms.aggDataInsights[ms.activeDateRange].suggestions?.stop?.length > 0 || ms.aggDataInsights[ms.activeDateRange].suggestions?.start?.length > 0)">
              <q-item-label class="text-subtitle2 text-weight-medium text-outline">Continue</q-item-label>
              <q-item v-for="suggestion in ms.aggDataInsights[ms.activeDateRange].suggestions.continue"
                :key="suggestion.id" class="q-py-sm" style="min-height: 0px;">
                {{ suggestion }}
              </q-item>
              <q-item-label class="text-subtitle2 text-weight-medium text-outline q-pt-lg">Stop</q-item-label> <q-item
                v-for="suggestion in ms.aggDataInsights[ms.activeDateRange].suggestions.stop" :key="suggestion.id"
                class="q-py-sm" style="min-height: 0px;">
                {{ suggestion }}
              </q-item>
              <q-item-label class="text-subtitle2 text-weight-medium text-outline q-pt-lg">Start</q-item-label> <q-item
                v-for="suggestion in ms.aggDataInsights[ms.activeDateRange].suggestions.start" :key="suggestion.id"
                class="q-py-sm" style="min-height: 0px;">
                {{ suggestion }}
              </q-item>
            </q-list>
            <div v-else style="min-height: 0px;">
              No suggestions available for this period.
            </div>
          </q-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <div v-if="revisitMoment" class="q-px-md">
      <div class="q-mb-sm text-h6 text-weight-medium text-on-background"> {{ formatRevisitDay(revisitMoment.date) }}...
      </div>

      <q-card flat class="bg-surface q-mb-md q-px-none q-py-xs rounded-borders-14">
        <div clickable v-ripple class="q-px-none q-py-sm" style="min-height: 0px;"
          @click="momentModalId = revisitMomentId; momentModalOpened = true">

          <q-item class="q-px-xs" style="min-height: 0px;">
            <q-item-section avatar top class="q-px-none" style="min-width: 20px;">
              <q-icon color="on-background" name="r_fast_rewind" size="lg" />
            </q-item-section>

            <q-item-section class="text-body2 q-pb-none q-pl-none q-pr-md">{{ revisitMoment.text
            }}</q-item-section>
          </q-item>
          <!-- <q-item class="q-px-none q-pt-none q-pb-xs chip-container" style="min-height: 0px; width:100%;">
            <div class="horizontal-scroll" :style="setChipsRowPadding(revisitMoment.id)"
              @scroll="onChipsRowScroll($event, revisitMoment.id)">
              <q-chip
                v-for="need in Object.entries(revisitMoment.needs).sort(([, a], [, b]) => b.importance - a.importance)"
                :key="need[0]" outline :color="getChipColor(need[1])" :icon="needsMap[need[0]][0]" :label="need[0]"
                class="needs" />
            </div>
          </q-item> -->
        </div>
      </q-card>
    </div>

    <moment-modal v-model="momentModalOpened" :moment-id="momentModalId" />
    <why-modal v-model="whyModalOpened" :section="whyModalSection" />

    <!-- <Vue3Lottie :animationData="lottie1" :width="300" :speed="0.5" :loop="true" :autoplay="true" /> -->
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch, nextTick } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import donutSwiperAndList from "./../components/donutSwiperAndList.vue";
import topItem from 'src/components/topItem.vue'
// import { Vue3Lottie } from 'vue3-lottie'
// import lottie1 from './../assets/lottie1.json'
import momentModal from 'src/components/momentModal.vue'
import whyModal from 'src/components/whyModal.vue'
import { useDateUtils } from './../composables/dateUtils.js'

const ms = useMomentsStore()
const { formatRevisitDay } = useDateUtils()

//SWIPER
const swipersLoaded = ref(true)
const swiperSummaryEl = ref(null)
const swiperNeedsEl = ref(null)
const swiperSuggestionsEl = ref(null)
const revisitMomentId = ref("")
const revisitMoment = ref("")
const momentModalOpened = ref(false)
const momentModalId = ref("")
const whyModalOpened = ref(false)
const whyModalSection = ref("")

onMounted(async () => {
  try {
    console.log('In InsightsTab onMounted')
    if (!ms.momentsFetched) {
      await ms.fetchMoments();
    }
    if (!ms.aggregateDataFetched) {
      await ms.fetchAggregateData();
    }
    revisitMomentId.value = await ms.getRandomMomentId()
  } catch (error) {
    console.error('await ms.fetchAggregateData() error:', error);
  }
})

watch(revisitMomentId, (newVal) => {
  if (newVal) {
    ms.getMomentById(newVal, revisitMoment)
  }
}, { immediate: true })

//SWIPER
const swiperAfterInit = (event, el) => {
  nextTick(() => {
    console.log('In InsightsTab > afterinit fired with event:', event, 'el', el, 'swiperSummaryEl', swiperSummaryEl.value)
    if (el === 'summary' && swiperSummaryEl.value) {
      swiperSummaryEl.value.swiper.slideTo(ms.activeIndex, 0)
      console.log('In InsightsTab > afterinit fired, sliding', el, 'swiper to ms.activeIndex', ms.activeIndex)
    } else if (el === 'needs' && swiperNeedsEl.value) {
      swiperNeedsEl.value.swiper.slideTo(ms.activeIndex, 0)
      console.log('In InsightsTab > afterinit fired, sliding', el, 'swiper to ms.activeIndex', ms.activeIndex)
    } else if (el === 'suggestions' && swiperSuggestionsEl.value) {
      swiperSuggestionsEl.value.swiper.slideTo(ms.activeIndex, 0)
      console.log('In InsightsTab > afterinit fired, sliding', el, 'swiper to ms.activeIndex', ms.activeIndex)
    }
  })
}

//set to immediate to react to activeIndex change from parent at initialization
watch(() => ms.activeIndex, (newVal, oldVal) => {
  nextTick(() => {
    console.log('In InsightsTab > ms.activeIndex watcher, activeIndex changed from', oldVal, 'to', newVal, 'swiperSummaryEl', swiperSummaryEl.value, 'trying to slide all to ', newVal)
    swiperSummaryEl?.value?.swiper.slideTo(newVal, 0)
    swiperNeedsEl?.value?.swiper.slideTo(newVal, 0)
    swiperSuggestionsEl?.value?.swiper.slideTo(newVal, 0)
  })
}, { immediate: true })

const onActiveIndexChangeBySwiper = (event) => {
  console.log('In InsightsTab > onActiveIndexChangeBySwiper fired with ms.activeIndex', ms.activeIndex, 'ms.activeDateRange', ms.activeDateRange, 'ms.dateRanges', ms.dateRanges, 'swipersLoaded', swipersLoaded.value, 'swiperSummaryEl', swiperSummaryEl.value)
  console.log('In InsightsTab  > onActiveIndexChangeBySwiper fired from previousIndex', event.detail[0].previousIndex, 'to activeIndex', event.detail[0].activeIndex)

  ms.activeIndex = event.detail[0].activeIndex
}

//kill-restart swiper when dateRanges change
watch(() => ms.dateRanges, (newVal, oldVal) => {
  console.log('In InsightsTab > ms.dateRanges watcher, dateRanges changed from', oldVal, 'to', newVal, 'reloading swiper container')
  swipersLoaded.value = false
  nextTick(() => {
    swipersLoaded.value = true
  })
})



</script>

<style lang="scss">
.q-btn-group>.q-btn-item {
  border-radius: 34px !important;
}
</style>
