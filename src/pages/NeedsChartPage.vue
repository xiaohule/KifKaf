<template >
  <q-page class="q-mx-auto q-px-md q-pb-lg" style="max-width: 600px" @click="handlePageClick">

    <q-btn-toggle v-model="ms.needsToggleModel" class="q-gutter-sm q-mb-sm" color="transparent" text-color="outline"
      toggle-color="surface" toggle-text-color="on-surface" unelevated no-caps :ripple="false" :options="[
        { label: 'Satisfiers', value: 'satisfaction' },
        { label: 'Dissatisfiers', value: 'unsatisfaction' },
        { label: 'All', value: 'importance' }
      ]" />

    <donut-swiper-and-list v-if="ms.activeIndex !== undefined" :embedded="false" :deselect-segment="deselectSegment"
      @reset:deselectSegment="deselectSegment = false"></donut-swiper-and-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import donutSwiperAndList from "./../components/donutSwiperAndList.vue";

// INITIALIZATION
const ms = useMomentsStore()

const deselectSegment = ref(false)

onMounted(async () => {
  try {
    if (!ms.aggregateDataFetched) {
      await ms.fetchAggregateData();
    }
    if (!ms.momentsFetched) {
      await ms.fetchMoments();
    }
    if (ms.needsToggleModel === "top") ms.needsToggleModel = 'satisfaction'
  } catch (error) {
    console.error('In NeedsChartPage > await ms.fetchMoments() error:', error);
  }
})

const handlePageClick = (event) => {
  console.log('In NeedsChartPage > handlePageClick, event.target', event.target)

  if (event.target.nodeName === 'CANVAS') {
    // Click is inside the donut swiper, do nothing
    console.log('In NeedsChartPage > handlePageClick, event.target is of canvas type, do nothing')
    return;
  }

  const classList = Array.from(event.target.classList);
  const shouldIgnoreClick = classList.some(className =>
    className.includes('q-item') || className.includes('q-avatar'));

  if (shouldIgnoreClick) {
    console.log('In NeedsChartPage > handlePageClick, clicked on a specified class, do nothing');
    return;
  }
  console.log('In NeedsChartPage > handlePageClick, event.target is not canva or needs list, set deselectSegment to true')
  deselectSegment.value = true
}

</script>

<style lang="scss">
.q-btn-group>.q-btn-item {
  border-radius: 34px !important;
}
</style>


