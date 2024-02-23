<!-- Here we handle date and data grouping selections -->
<template >
  <q-page class="q-mx-auto q-px-md q-pt-xs q-pb-md" style="max-width: 600px">

    <!-- SUMMARY -->
    <div v-if="ms.segDateId !== 'Yearly'" class="q-mt-xs q-mb-md">
      <div class="q-mb-xs text-h6 text-weight-medium text-on-background"> {{
        isDatePickerLabelCurrent(ms.getActiveDateRange)
        ?
        t('summaryTitleThisMonth') : t('summaryTitle',
          { date: getDatePickerLabel(ms.getActiveDateRange, t).toLowerCase() }) }}</div>

      <swiper-container v-if="swipersLoaded && ms.getDateRanges.length > 0" ref="swiperSummaryEl" :init="true"
        :virtual="{ enabled: true, addSlidesAfter: 3, addSlidesBefore: 3 }" :observer="true"
        :observe-slide-children="true" :grab-cursor="true" :pagination="{ dynamicBullets: true }"
        @swiperactiveindexchange="onActiveIndexChangeBySwiper" @swiperafterinit="swiperAfterInit(event, 'summary')"
        @swiperupdate="console.log('In InsightsTab > swiper update event fired')">
        <swiper-slide v-for="range in ms.getDateRanges" :key="range">
          <q-card v-intersection="intersectionOptions('summary', ms.getActiveDateRange)" flat :class="[
            'bg-surface',
            'q-px-md',
            'rounded-borders-14',
            'q-py-md',
            ms.getDateRanges.length < 2 ? '' : 'marginBottom32px',
          ]">
            <q-item class="q-px-none q-pt-none q-pb-md" style="min-height: 0px;">
              <q-item-section class="text-subtitle2
 text-outline text-weight-regular">{{ t('summarySubtitle') }}</q-item-section>
              <q-item-section side>
                <q-badge v-show="ms.aggDataInsights[ms.getActiveDateRange]?.isNew?.summary"
                  :class="{ 'fade-transition': true, 'fade-out': !ms.aggDataInsights[ms.getActiveDateRange]?.isNew?.summary }"
                  class="text-subtitle2 text-weight-medium q-px-sm q-py-none" rounded color="primary-container"
                  text-color="primary" :label="t('fresh')" />
              </q-item-section>
            </q-item>

            <div class="selectable-text">
              <!-- getDateRangeOkNeedsCounts prevents display to occur if user has deleted all moms -->
              <div v-if="ms.aggDataInsights?.[ms.getActiveDateRange]?.summary?.length > 0" style="min-height: 0px;"
                v-html="ms.aggDataInsights[ms.getActiveDateRange].summary">
              </div>
              <div v-else-if="!ms.userDoc?.hasNeeds" style="min-height: 0px;">{{ t('summaryEmpty') }}
              </div>
              <div v-else style="min-height: 0px;">
                {{ t('summaryEmptyCountdown', Math.max(0, 3 - ms.getDateRangeOkNeedsCounts?.[ms.getActiveDateRange])) }}
              </div>
            </div>
          </q-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <!-- QUOTE -->
    <div v-if="ms.segDateId !== 'Yearly'" class="q-my-xl">
      <div class="text-subtitle1
 text-outline text-weight-regular text-center">{{ t('quoteSubtitle') }}</div>
      <q-item class="q-pl-xs q-pr-none">
        <q-item-section class="selectable-text"
          v-if="ms.getDateRangeOkNeedsCounts?.[ms.getActiveDateRange] > 0 && ms.aggDataInsights?.[ms.getActiveDateRange]?.quote?.text?.length > 0"><span
            v-html="ms.aggDataInsights[ms.getActiveDateRange].quote.text"></span><span class="text-caption text-outline"
            v-html="ms.aggDataInsights[ms.getActiveDateRange].quote.author"></span>
        </q-item-section>
        <q-item-section class="selectable-text" v-else><span>{{ placeholderQuote }}</span>
          <span class="text-caption text-outline">{{
            placeholderQuoteAuthor }}</span></q-item-section>
        <q-item-section side>
          <q-btn class="text-primary text-weight-medium text-subtitle2"
            @click="whyModalSection = 'quote'; whyModalOpened = true" no-caps flat :ripple="false"
            padding="xs none xs sm">{{ t('why')
            }}</q-btn>
          <q-icon color="outline" name="r_format_quote" size="lg" />
          <!-- <q-avatar size="42px" font-size="28px" color="surface" text-color="on-background" icon="r_format_quote"> </q-avatar>-->
        </q-item-section>

      </q-item>
    </div>

    <!-- NEEDS -->
    <div class="q-my-md">
      <q-item class="q-px-none q-mb-xs">
        <q-item-section class="text-h6 text-weight-medium text-on-background">{{
          (isDatePickerLabelCurrent(ms.getActiveDateRange) &&
            ms.segDateId === 'Yearly') ?
          t('needsStats.titleThisYear') : (isDatePickerLabelCurrent(ms.getActiveDateRange) ?
            t('needsStats.titleThisMonth')
            :
            t('needsStats.title',
              { date: getDatePickerLabel(ms.getActiveDateRange, t).toLowerCase() })) }}</q-item-section>
        <q-btn side class="text-subtitle2 text-weight-medium text-primary"
          @click="learnMoreModalSection = 'needs'; learnMoreModalOpened = true" no-caps flat :ripple="false"
          padding="xs none xs sm">{{
            t('learnMore') }}
        </q-btn>
      </q-item>

      <swiper-container v-if="swipersLoaded && ms.getDateRanges.length > 0" ref="swiperNeedsEl" :init="true"
        :virtual="{ enabled: true, addSlidesAfter: 3, addSlidesBefore: 3 }" :observer="true"
        :observe-slide-children="true" :grab-cursor="true" :pagination="{ dynamicBullets: true }"
        @swiperactiveindexchange="onActiveIndexChangeBySwiper" @swiperafterinit="swiperAfterInit(event, 'needs')"
        @swiperupdate="console.log('In InsightsTab > swiper update event fired')">
        <swiper-slide v-for="range in ms.getDateRanges" :key="range">
          <q-card flat :class="[
            'bg-surface',
            'q-px-md',
            'rounded-borders-14',
            'q-pt-md',
            ms.needsToggleModel === 'top' ? 'q-pb-md' : '',
            ms.getDateRanges.length < 2 ? '' : 'marginBottom32px',
          ]">

            <q-item class="q-px-none q-pt-none q-pb-md" style="min-height: 0px;">
              <q-item-section class="text-subtitle2
 text-outline text-weight-regular">{{ t('needsStats.subtitle') }}</q-item-section>
            </q-item>

            <q-btn-toggle v-model="ms.needsToggleModel" class="q-gutter-xs q-mb-sm" color="transparent"
              text-color="outline" toggle-color="on-background" toggle-text-color="surface" unelevated no-caps
              :ripple="false" :options="[
                { label: t('tops'), value: 'top' },
                { label: t('satisfiers'), value: 'satisfaction' },
                { label: t('dissatisfiers'), value: 'unsatisfaction' },
                { label: t('all'), value: 'importance' }
              ]" />
            <div v-if="ms.needsToggleModel === 'top'">
              <top-item top-type="satisfier" />
              <top-item top-type="dissatisfier" />
              <top-item v-if="ms.getPrevDateRange" top-type="gainer" />
              <top-item v-if="ms.getPrevDateRange" top-type="loser" />
            </div>
            <div v-else>
              <donut-swiper-and-list v-if="ms.activeIndex !== undefined" :embedded="true" />
            </div>
          </q-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <!-- BOOK -->
    <div v-if="ms.segDateId !== 'Yearly'" class="q-my-xl">
      <div class="text-subtitle1
 text-outline text-weight-regular text-center">{{ t('bookSubtitle') }}</div>
      <q-item class="q-pl-xs q-pr-none">
        <q-item-section class="selectable-text"
          v-if="ms.aggDataInsights?.[ms.getActiveDateRange]?.book?.title?.length > 0">
          <span v-html="ms.aggDataInsights[ms.getActiveDateRange].book.title"></span>
          <span class="text-caption text-outline"
            v-html="t('by') + ' ' + ms.aggDataInsights[ms.getActiveDateRange].book.author"></span>
        </q-item-section>
        <q-item-section class="selectable-text" v-else-if="!ms.userDoc?.hasNeeds">
          <span>{{ t('bookEmpty') }}</span>
        </q-item-section>
        <q-item-section class="selectable-text" v-else>
          <span>{{ t('bookEmptyCountdown', Math.max(0, 3 - ms.getDateRangeOkNeedsCounts?.[ms.getActiveDateRange]))
          }}</span>
        </q-item-section>
        <q-item-section side>
          <q-btn v-if="ms.aggDataInsights?.[ms.getActiveDateRange]?.book.title"
            class="text-primary text-weight-medium text-subtitle2"
            @click="whyModalSection = 'book'; whyModalOpened = true" no-caps flat :ripple="false"
            padding="xs none xs sm">{{ t('why')
            }}</q-btn>
          <q-icon color="outline" name="local_library" size="md" class="q-pt-xs q-px-xs" />
        </q-item-section>
      </q-item>
    </div>

    <!-- SUGGESTIONS -->
    <div v-if="ms.segDateId !== 'Yearly'" class="q-my-md">
      <div class="q-mb-xs text-h6 text-weight-medium text-on-background"> {{
        isDatePickerLabelCurrent(ms.getActiveDateRange)
        ?
        t('suggestionsTitleThisMonth') : t('suggestionsTitle',
          { date: getDatePickerLabel(ms.getActiveDateRange, t).toLowerCase() }) }}</div>

      <swiper-container v-if="swipersLoaded && ms.getDateRanges.length > 0" ref="swiperSuggestionsEl" :init="true"
        :virtual="{ enabled: true, addSlidesAfter: 3, addSlidesBefore: 3 }" :observer="true"
        :observe-slide-children="true" :grab-cursor="true" :pagination="{ dynamicBullets: true }"
        @swiperactiveindexchange="onActiveIndexChangeBySwiper" @swiperafterinit="swiperAfterInit(event, 'suggestions')"
        @swiperupdate="console.log('In InsightsTab > swiper update event fired')">
        <swiper-slide v-for="range in ms.getDateRanges" :key="range">
          <q-card v-intersection="intersectionOptions('suggestions', ms.getActiveDateRange)" flat :class="[
            'bg-surface',
            'q-px-md',
            'rounded-borders-14',
            'q-py-md',
            ms.getDateRanges.length < 2 ? '' : 'marginBottom32px',
          ]">
            <q-item class="q-px-none q-pt-none q-pb-md" style="min-height: 0px;">
              <q-item-section class="text-subtitle2
 text-outline text-weight-regular">{{ t('suggestionsSubtitle') }}</q-item-section>
              <q-item-section side top class="q-px-none" style="padding-left: 0px;">
                <q-badge v-show="ms.aggDataInsights[ms.getActiveDateRange]?.isNew?.suggestions"
                  :class="{ 'fade-transition': true, 'fade-out': !ms.aggDataInsights[ms.getActiveDateRange]?.isNew?.suggestions }"
                  class="text-subtitle2 text-weight-medium q-px-sm q-py-none" rounded color="primary-container"
                  text-color="primary" :label="t('fresh')" />
              </q-item-section>
            </q-item>

            <q-list class="selectable-text"
              v-if="(ms.aggDataInsights?.[ms.getActiveDateRange]?.suggestions?.continue?.length > 0 || ms.aggDataInsights?.[ms.getActiveDateRange]?.suggestions?.start?.length > 0 || ms.aggDataInsights?.[ms.getActiveDateRange]?.suggestions?.stop?.length > 0)">
              <q-item-label class="text-subtitle2 text-weight-medium text-outline">{{ t('toContinue') }}</q-item-label>
              <q-item v-for="suggestion in ms.aggDataInsights?.[ms.getActiveDateRange]?.suggestions?.continue"
                :key="suggestion.id" class="q-py-sm" style="min-height: 0px;">
                <div v-html="suggestion"></div>
              </q-item>

              <q-item-label class="text-subtitle2 text-weight-medium text-outline q-pt-lg">{{ t('toStop')
              }}</q-item-label>
              <q-item v-for="suggestion in ms.aggDataInsights?.[ms.getActiveDateRange]?.suggestions?.stop"
                :key="suggestion.id" class="q-py-sm" style="min-height: 0px;">
                <div v-html="suggestion"></div>
              </q-item>

              <q-item-label class="text-subtitle2 text-weight-medium text-outline q-pt-lg">{{
                t('toStart') }}</q-item-label>
              <q-item v-for="suggestion in ms.aggDataInsights?.[ms.getActiveDateRange]?.suggestions?.start"
                :key="suggestion.id" class="q-py-sm" style="min-height: 0px;">
                <div v-html="suggestion"></div>
              </q-item>
            </q-list>
            <div v-else-if="!ms.userDoc?.hasNeeds" style="min-height: 0px;">
              {{ t('suggestionsEmpty') }}
            </div>
            <div v-else style="min-height: 0px;">
              {{ t('suggestionsEmptyCountdown', Math.max(0, 3 - ms.getDateRangeOkNeedsCounts?.[ms.getActiveDateRange])) }}
            </div>
          </q-card>
        </swiper-slide>
      </swiper-container>
    </div>

    <!-- MEMORY -->
    <div v-if="revisitMoment">
      <div class="q-mb-xs text-h6 text-weight-medium text-on-background"> {{ formatRevisitDay(revisitMoment.date, t) }}
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
                :key="need[0]" outline :color="getChipColor(need[1])" :icon="needsMap[need[0]][0]" :label="t('needsList.' + need[0])"
                class="needs" />
            </div>
          </q-item> -->
        </div>
      </q-card>
    </div>
    <br />

    <!-- <Vue3Lottie :animationData="lottie1" :width="300" :speed="0.5" :loop="true" :autoplay="true" /> -->
    <moment-modal v-model="momentModalOpened" :moment-id="momentModalId" />
    <why-modal v-model="whyModalOpened" :section="whyModalSection" />
    <learn-more-modal v-model="learnMoreModalOpened" :section="learnMoreModalSection" />
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch, nextTick, computed } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from "vue-i18n"
import donutSwiperAndList from "./../components/donutSwiperAndList.vue";
import topItem from 'src/components/topItem.vue'
// import { Vue3Lottie } from 'vue3-lottie'
// import lottie1 from './../assets/lottie1.json'
import momentModal from 'src/components/momentModal.vue'
import whyModal from 'src/components/whyModal.vue'
import learnMoreModal from 'src/components/learnMoreModal.vue'
import { useDateUtils } from '../composables/dateUtils.js'
import { logEvent } from 'src/boot/firebaseBoot';

const ms = useMomentsStore()
const { t } = useI18n()
const { currentYYYYdMM, formatRevisitDay, getDatePickerLabel, isDatePickerLabelCurrent } = useDateUtils()

//SWIPER
const swipersLoaded = ref(true)
const swiperSummaryEl = ref(null)
const swiperNeedsEl = ref(null)
const swiperSuggestionsEl = ref(null)
const revisitMomentId = ref("")
const revisitMoment = ref("")
const placeholderQuoteOfTheDayId = ref(0)
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
    if (!ms.aggDataInsightsFetched) {
      await ms.fetchAggDataInsights();
    }
    if (!ms.aggDataNeedsFetched) {
      await ms.fetchAggDataNeeds();
    }
  } catch (error) {
    console.error('await momentsStore fetching error:', error);
  }
})

watch(() => ms.userDoc, async (newVal) => {
  if (newVal) {
    revisitMomentId.value = await ms.getRandomMomentIdOfTheDay()
    placeholderQuoteOfTheDayId.value = await ms.getPlaceholderQuoteOfTheDayId()
  }
}, { immediate: true })

const placeholderQuote = computed(() =>
  t('inspirationalQuotes[' + placeholderQuoteOfTheDayId.value + '].quote') ?? "")
const placeholderQuoteAuthor = computed(() =>
  t('inspirationalQuotes[' + placeholderQuoteOfTheDayId.value + '].author') ?? "")

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
  console.log('In InsightsTab > onActiveIndexChangeBySwiper fired with ms.activeIndex', ms.activeIndex, 'ms.getActiveDateRange', ms.getActiveDateRange, 'ms.getDateRanges', ms.getDateRanges, 'swipersLoaded', swipersLoaded.value, 'swiperSummaryEl', swiperSummaryEl.value)
  console.log('In InsightsTab  > onActiveIndexChangeBySwiper fired from previousIndex', event.detail[0].previousIndex, 'to activeIndex', event.detail[0].activeIndex)

  ms.activeIndex = event.detail[0].activeIndex
}

//kill-restart swiper when dateRanges change
watch(() => ms.getDateRanges, (newVal, oldVal) => {
  console.log('In InsightsTab > ms.getDateRanges watcher, dateRanges changed from', oldVal, 'to', newVal, 'reloading swiper container')
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
        logEvent('insights_' + section + '_seen');
        if (YYYYdMM !== currentYYYYdMM) {
          await ms.fetchAggDataInsights(true);
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
  // padding: 4px 23px !important;
  padding: 6px 10px;
  min-width: 0px;
  min-height: 0px;
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
