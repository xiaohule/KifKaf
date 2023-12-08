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
            <div style="min-height: 0px;">
              This month you have had a rich emotional life with a broad range of feelings and needs. You seem to be
              energized
              by physical activities, meaningful social interactions, and moments of self-reflection and gratitude.
              However,
              you
              also experienced stress and discomfort when your autonomy was challenged, when you faced uncertainty, or
              when
              you
              felt ineffective or disconnected from meaningful activities or people...
            </div>
          </q-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <div v-if="true" class="q-my-xl">
      <q-item>
        <q-item-section><span>Owning our story and loving ourselves through that process is the bravest thing that we will
            ever do.</span><span class="text-caption text-outline">Brené Brown</span>
        </q-item-section>
        <q-item-section side top>
          <q-item-label class="text-primary text-weight-medium text-subtitle2"
            @click="openWhyModal('quote')">Why</q-item-label>
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
        <q-item-section><span>The Gifts of Imperfection</span><span class="text-caption text-outline">by Brené
            Brown</span>
        </q-item-section>
        <q-item-section side top>
          <q-item-label class="text-primary text-weight-medium text-subtitle2"
            @click="openWhyModal('quote')">Why</q-item-label>
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
            <q-list>
              <q-item-label class="text-subtitle2 text-weight-medium text-outline">Continue</q-item-label>
              <q-item v-for="suggestion in ms.suggestions.continue" :key="suggestion.id" class="q-py-sm"
                style="min-height: 0px;">
                {{ suggestion }}
              </q-item>
              <q-item-label class="text-subtitle2 text-weight-medium text-outline q-pt-lg">Stop</q-item-label> <q-item
                v-for="suggestion in ms.suggestions.stop" :key="suggestion.id" class="q-py-sm" style="min-height: 0px;">
                {{ suggestion }}
              </q-item>
              <q-item-label class="text-subtitle2 text-weight-medium text-outline q-pt-lg">Start</q-item-label> <q-item
                v-for="suggestion in ms.suggestions.start" :key="suggestion.id" class="q-py-sm" style="min-height: 0px;">
                {{ suggestion }}
              </q-item>
            </q-list>
          </q-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <div v-if="true" class="q-my-xl">
      <q-item>
        <q-item-section><span>1 month ago...</span><span class="text-caption text-outline">Feeling so grateful to see John
            and spend some time with animals</span>
        </q-item-section>
        <q-item-section side top>
          <q-item-label class="text-primary text-weight-medium text-subtitle2"
            @click="openWhyModal('quote')">Why</q-item-label>
          <q-icon color="on-background" name="r_fast_rewind" size="lg" />
        </q-item-section>
      </q-item>
    </div>

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

const ms = useMomentsStore()

//SWIPER
const swipersLoaded = ref(true)
const swiperSummaryEl = ref(null)
const swiperNeedsEl = ref(null)
const swiperSuggestionsEl = ref(null)

onMounted(async () => {
  try {
    console.log('In InsightsTab onMounted')
    if (!ms.momentsFetched) {
      await ms.fetchMoments();
    }
    if (!ms.aggregateDataFetched) {
      await ms.fetchAggregateData();
    }
  } catch (error) {
    console.error('await ms.fetchAggregateData() error:', error);
  }
})

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
    swiperSummaryEl?.value.swiper.slideTo(newVal, 0)
    swiperNeedsEl?.value.swiper.slideTo(newVal, 0)
    swiperSuggestionsEl?.value.swiper.slideTo(newVal, 0)
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

const openWhyModal = (section) => {
  console.log('In InsightsTab > openWhyModal for section', section)
  whyDialogSection.value = section
  whyDialogOpened.value = true
}

</script>

<style lang="scss">
.q-btn-group>.q-btn-item {
  border-radius: 34px !important;
}
</style>
