<!-- Here we handle date and data grouping selections -->
<template >
  <q-page class="q-mx-auto q-px-md q-pt-xs q-pb-md" style="max-width: 600px">

    <div v-if="ms.segDateId !== 'Yearly'" class="q-mt-xs q-mb-md">
      <div class="q-mb-xs text-h6 text-weight-medium text-on-background"> {{ `${ms.dateRangeButtonLabel}'s
        summary` }}</div>

      <swiper-container v-if="swipersLoaded && ms.dateRanges.length > 0" ref="swiperSummaryEl" :init="true"
        :virtual="{ enabled: true, addSlidesAfter: 3, addSlidesBefore: 3 }" :observer="true"
        :observe-slide-children="true" :grab-cursor="true" :pagination="{ dynamicBullets: true }"
        @swiperactiveindexchange="onActiveIndexChangeBySwiper" @swiperafterinit="swiperAfterInit(event, 'summary')"
        @swiperupdate="console.log('In InsightsTab > swiper update event fired')">
        <swiper-slide v-for="range in ms.dateRanges" :key="range">
          <q-card v-intersection="intersectionOptions('summary', ms.activeDateRange)" flat :class="[
            'bg-surface',
            'q-px-md',
            'rounded-borders-14',
            'q-py-md',
            ms.dateRanges.length < 2 ? '' : 'marginBottom32px',
          ]">
            <q-item class="q-px-none q-pt-none q-pb-md" style="min-height: 0px;">
              <q-item-section class="text-subtitle2
 text-outline text-weight-regular">A quick peek at someone amazing</q-item-section>
              <q-item-section side>
                <q-badge v-show="ms.aggDataInsights[ms.activeDateRange]?.isNew?.summary"
                  :class="{ 'fade-transition': true, 'fade-out': !ms.aggDataInsights[ms.activeDateRange]?.isNew?.summary }"
                  class="text-subtitle2 text-weight-medium q-px-sm q-py-none" rounded color="primary-container"
                  text-color="primary" label="Fresh" />
              </q-item-section>
            </q-item>

            <div class="selectable-text">
              <!-- getDateRangeOkNeedsCounts prevents display to occur if user has deleted all moms -->
              <div
                v-if="ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange] > 0 && ms.aggDataInsights?.[ms.activeDateRange]?.summary?.length > 0"
                style="min-height: 0px;" v-html="ms.aggDataInsights[ms.activeDateRange].summary">
              </div>
              <div v-else-if="!ms.userDoc?.hasNeeds" style="min-height: 0px;">
                <!-- No summary available for this period. -->
                👉 3 Moments a month will bring your summary to life.
              </div>
              <div v-else-if="ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange] < 3" style="min-height: 0px;">
                {{ `👉 ${Math.max(0, 3 - ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange])} more Moment${Math.max(0, 3 -
                  ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange]) > 0 ? 's' : ''} to go this month to bring your summary
                to life.` }}
              </div>
              <div v-else style="min-height: 0px;">
                Preparing your summary...
              </div>
            </div>
          </q-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <div v-if="ms.segDateId !== 'Yearly'" class="q-my-xl">
      <div class="text-subtitle1
 text-outline text-weight-regular text-center">Daily inspiration drawn from your Moments</div>
      <q-item class="q-pl-xs q-pr-none">
        <q-item-section class="selectable-text"
          v-if="ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange] > 0 && ms.aggDataInsights?.[ms.activeDateRange]?.quote?.text?.length > 0"><span>{{
            ms.aggDataInsights[ms.activeDateRange].quote.text }}</span><span class="text-caption text-outline">{{
    ms.aggDataInsights[ms.activeDateRange].quote.author }}</span>
        </q-item-section>
        <q-item-section class="selectable-text" v-else><span>{{ placeholderQuote }}</span> <span
            class="text-caption text-outline">{{
              placeholderQuoteAuthor }}</span></q-item-section>
        <q-item-section side>
          <q-item-label class="text-primary text-weight-medium text-subtitle2"
            @click="whyModalSection = 'quote'; whyModalOpened = true">Why?</q-item-label>
          <q-icon color="outline" name="r_format_quote" size="lg" />
          <!-- <q-avatar size="42px" font-size="28px" color="surface" text-color="on-background" icon="r_format_quote"> </q-avatar>-->
        </q-item-section>

      </q-item>
    </div>

    <div class="q-my-md">
      <q-item class="q-px-none q-mb-xs">
        <q-item-section class="text-h6 text-weight-medium text-on-background">{{ `${ms.dateRangeButtonLabel}'s
          needs` }}</q-item-section>
        <q-item-section side class="text-subtitle2 text-weight-medium text-primary"
          @click="learnMoreModalSection = 'needs'; learnMoreModalOpened = true">
          Learn more
        </q-item-section>
      </q-item>

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
            'q-pt-md',
            ms.needsToggleModel === 'top' ? 'q-pb-md' : '',
            ms.dateRanges.length < 2 ? '' : 'marginBottom32px',
          ]">

            <q-item class="q-px-none q-pt-none q-pb-md" style="min-height: 0px;">
              <q-item-section class="text-subtitle2
 text-outline text-weight-regular">Your needs weather report</q-item-section>
            </q-item>

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

    <div v-if="ms.segDateId !== 'Yearly'" class="q-my-xl">
      <div class="text-subtitle1
 text-outline text-weight-regular text-center">The Right Book for Right Now?</div>
      <q-item class="q-pl-xs q-pr-none">
        <q-item-section class="selectable-text"
          v-if="ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange] > 0 && ms.aggDataInsights?.[ms.activeDateRange]?.book?.title?.length > 0"><span>{{
            ms.aggDataInsights[ms.activeDateRange].book.title }}</span><span class="text-caption text-outline">by {{
    ms.aggDataInsights[ms.activeDateRange].book.author }}</span>
        </q-item-section>
        <q-item-section class="selectable-text" v-else-if="!ms.userDoc?.hasNeeds"><span>👉 Log 3 Moments to start getting
            reading recommendations
            curated for your growth.
          </span>
        </q-item-section>
        <q-item-section class="selectable-text" v-else-if="ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange] < 3"><span>
            {{ `👉 ${Math.max(0, 3 -
              ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange])} more Moment${Math.max(0, 3 -
                ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange]) > 0 ? 's' : ''} to go this month to bring your reading
            recommendations to
            life.` }}
          </span>
        </q-item-section>
        <q-item-section class="selectable-text" v-else><span> Prearing your reading recommendations...
          </span>
        </q-item-section>
        <q-item-section side>
          <q-item-label v-if="ms.aggDataInsights?.[ms.activeDateRange]?.book"
            class="text-primary text-weight-medium text-subtitle2"
            @click="whyModalSection = 'book'; whyModalOpened = true">Why?</q-item-label>
          <q-icon color="outline" name="local_library" size="md" class="q-pt-xs q-px-xs" />
        </q-item-section>
      </q-item>
    </div>

    <div v-if="ms.segDateId !== 'Yearly'" class="q-my-md">
      <div class="q-mb-xs text-h6 text-weight-medium text-on-background"> {{ `${ms.dateRangeButtonLabel}'s
        suggestions` }}</div>

      <swiper-container v-if="swipersLoaded && ms.dateRanges.length > 0" ref="swiperSuggestionsEl" :init="true"
        :virtual="{ enabled: true, addSlidesAfter: 3, addSlidesBefore: 3 }" :observer="true"
        :observe-slide-children="true" :grab-cursor="true" :pagination="{ dynamicBullets: true }"
        @swiperactiveindexchange="onActiveIndexChangeBySwiper" @swiperafterinit="swiperAfterInit(event, 'suggestions')"
        @swiperupdate="console.log('In InsightsTab > swiper update event fired')">
        <swiper-slide v-for="range in ms.dateRanges" :key="range">
          <q-card v-intersection="intersectionOptions('suggestions', ms.activeDateRange)" flat :class="[
            'bg-surface',
            'q-px-md',
            'rounded-borders-14',
            'q-py-md',
            ms.dateRanges.length < 2 ? '' : 'marginBottom32px',
          ]">
            <q-item class="q-px-none q-pt-none q-pb-md" style="min-height: 0px;">
              <q-item-section class="text-subtitle2
 text-outline text-weight-regular">Take it or leave it: custom tweaks for life’s peaks</q-item-section>
              <q-item-section side top class="q-px-none" style="padding-left: 0px;">
                <q-badge v-show="ms.aggDataInsights[ms.activeDateRange]?.isNew?.suggestions"
                  :class="{ 'fade-transition': true, 'fade-out': !ms.aggDataInsights[ms.activeDateRange]?.isNew?.suggestions }"
                  class="text-subtitle2 text-weight-medium q-px-sm q-py-none" rounded color="primary-container"
                  text-color="primary" label="Fresh" />
              </q-item-section>
            </q-item>

            <q-list class="selectable-text"
              v-if="ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange] > 0 && ms.aggDataInsights?.[ms.activeDateRange]?.suggestions">
              <q-item-label class="text-subtitle2 text-weight-medium text-outline">Continue</q-item-label>

              <q-item v-for="suggestion in ms.aggDataInsights?.[ms.activeDateRange]?.suggestions?.continue"
                :key="suggestion.id" class="q-py-sm" style="min-height: 0px;">
                {{ suggestion }}
              </q-item>
              <q-item-label class="text-subtitle2 text-weight-medium text-outline q-pt-lg">Stop</q-item-label>

              <q-item v-for="suggestion in ms.aggDataInsights?.[ms.activeDateRange]?.suggestions?.stop"
                :key="suggestion.id" class="q-py-sm" style="min-height: 0px;">
                {{ suggestion }}
              </q-item>

              <q-item-label class="text-subtitle2 text-weight-medium text-outline q-pt-lg">Start?</q-item-label>

              <q-item v-for="suggestion in ms.aggDataInsights?.[ms.activeDateRange]?.suggestions?.start"
                :key="suggestion.id" class="q-py-sm" style="min-height: 0px;">
                {{ suggestion }}
              </q-item>
            </q-list>
            <div v-else-if="!ms.userDoc?.hasNeeds" style="min-height: 0px;">
              <!-- No summary available for this period. -->
              👉 3 Moments a month will bring your suggestions to life.
            </div>
            <div v-else-if="ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange] < 3" style="min-height: 0px;">
              {{ `👉 ${Math.max(0, 3 - ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange])} more Moment${Math.max(0, 3 -
                ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange]) > 0 ? 's' : ''} to go this month to bring your
              suggestions to life.` }}
            </div>
            <div v-else style="min-height: 0px;">
              Preparing your suggestions...
            </div>
          </q-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <div v-if="revisitMoment">
      <div class="q-mb-xs text-h6 text-weight-medium text-on-background"> {{ formatRevisitDay(revisitMoment.date) }}...
      </div>

      <q-card flat class="bg-surface q-px-md rounded-borders-14 q-py-md">
        <div clickable v-ripple class="q-px-none" style="min-height: 0px;"
          @click="momentModalId = revisitMomentId; momentModalOpened = true">

          <q-item class="q-px-none q-py-none" style="min-height: 0px;">
            <q-item-section avatar top class="q-px-none" style="min-width: 20px;">
              <!-- <q-icon color="on-background" name="r_fast_rewind" size="lg" /> -->
              <q-avatar size="42px" font-size="28px" color="background" icon="r_fast_rewind">

              </q-avatar>
            </q-item-section>

            <q-item-section class="text-body2 q-pb-none q-pl-md">{{ revisitMoment.text
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

    <!-- <Vue3Lottie :animationData="lottie1" :width="300" :speed="0.5" :loop="true" :autoplay="true" /> -->
    <moment-modal v-model="momentModalOpened" :moment-id="momentModalId" />
    <why-modal v-model="whyModalOpened" :section="whyModalSection" />
    <learn-more-modal v-model="learnMoreModalOpened" :section="learnMoreModalSection" />
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch, nextTick, computed } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import donutSwiperAndList from "./../components/donutSwiperAndList.vue";
import topItem from 'src/components/topItem.vue'
// import { Vue3Lottie } from 'vue3-lottie'
// import lottie1 from './../assets/lottie1.json'
import momentModal from 'src/components/momentModal.vue'
import whyModal from 'src/components/whyModal.vue'
import learnMoreModal from 'src/components/learnMoreModal.vue'
import { useDateUtils } from '../composables/dateUtils.js'
import { inspirationalQuotes } from "../utils/quoteUtils.js";

const ms = useMomentsStore()
const { currentYYYYdMM, formatRevisitDay } = useDateUtils()

//SWIPER
const swipersLoaded = ref(true)
const swiperSummaryEl = ref(null)
const swiperNeedsEl = ref(null)
const swiperSuggestionsEl = ref(null)
const revisitMomentId = ref("")
const revisitMoment = ref("")
const placeholderQuoteOfTheDayId = ref("")
const momentModalOpened = ref(false)
const momentModalId = ref("")
const whyModalOpened = ref(false)
const whyModalSection = ref("")
const learnMoreModalOpened = ref(false)
const learnMoreModalSection = ref("")

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

watch(() => ms.userDoc, async (newVal) => {
  if (newVal) {
    revisitMomentId.value = await ms.getRandomMomentIdOfTheDay()
    placeholderQuoteOfTheDayId.value = await ms.getPlaceholderQuoteOfTheDayId()
  }
}, { immediate: true })

const placeholderQuote = computed(() =>
  inspirationalQuotes[placeholderQuoteOfTheDayId.value]?.quote ?? "")
const placeholderQuoteAuthor = computed(() =>
  inspirationalQuotes[placeholderQuoteOfTheDayId.value]?.author ?? "")

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

const onIntersection = (section, YYYYdMM) => {
  return async (entry) => {
    console.log('In InsightsTab > onIntersection fired for section', section, 'YYYYdMM', YYYYdMM)
    if (entry.isIntersecting
      && ms.aggDataInsights?.[YYYYdMM]?.isNew?.[section] === true) {
      console.log('In InsightsTab > onIntersection > entry.isIntersecting TRUE for section', section, 'YYYYdMM', YYYYdMM)
      // Add a slight delay for smoother transition
      setTimeout(async () => {
        await ms.setAggDataInsightsValue(YYYYdMM, { isNew: { [section]: false } });
        if (YYYYdMM !== currentYYYYdMM) {
          await ms.fetchAggregateData(true);
        }
      }, 3000); // Adjust delay as needed
    }
  }
}

const intersectionOptions = (section, YYYYdMM = null) => {
  if (ms.aggDataInsights[YYYYdMM]?.isNew?.[section]) {
    return {
      handler: onIntersection(section, YYYYdMM),
      cfg: {
        root: null,
        rootMargin: '0px',
        threshold: 0.9,// Trigger when 50% of the target is visible
      }
    }
  }
  else {
    // Return a no-op handler when the condition is not met
    return {
      handler: () => { },
      cfg: {
        root: null,
        rootMargin: '0px',
        threshold: 0.9, // Adjust as necessary
      }
    }
  }
}


</script>

<style lang="scss">
.q-btn-group>.q-btn-item {
  border-radius: 34px !important;
}

.marginBottom32px {
  margin-bottom: 32px;
}

.fade-transition {
  transition: opacity 1.0s ease-in-out; //TODO:2 why not working?
  opacity: 1;
}

.fade-out {
  opacity: 0;
}
</style>
