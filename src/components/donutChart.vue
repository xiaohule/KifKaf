<!-- here we display the correct donut chart for the requested date range -->
<template>
  <div style="position: relative;" :class="props.embedded ? 'smallDoughnut' : 'bigDoughnut'" @click="handleClick">

    <Doughnut v-if="loaded" ref="chartRef" :data="chartData" :options="chartOptions" class="q-mx-auto" />

    <div class="overlay-content" style="position: absolute; top: 44%; left: 50%; transform: translate(-50%, -50%);">
      <!-- Your HTML content here -->
      <div v-if="isSegmentClicked">
        <q-avatar v-if="chartData.datasets[0].labels[clickedIndex] !== 'Others'" size="84px" font-size="56px"
          style="align-items: center; justify-content: center; display: flex; margin: 0 auto 8px;"
          :color="needToColor()[chartData.datasets[0].labels[clickedIndex]]">
          {{ needsMap[chartData.datasets[0].labels[clickedIndex]][0] }}
        </q-avatar>
        <div class="text-body2 text-center q-mt-md q-mb-sm">
          {{ t('needsList.' + chartData.datasets[0].labels[clickedIndex])
                    }}</div>
        <div class="text-h3 text-on-surface text-weight-bolder text-center">{{
                  parseFloat((chartData.datasets[0].data[clickedIndex] *
                  100).toFixed(0)) + "%" }}
        </div>
      </div>

      <div class="text-body2 text-center q-my-sm" v-else>{{ ms.needsToggleModel == 'satisfaction' ? t('satisfiers') :
              (ms.needsToggleModel == 'unsatisfaction' ?
              t('dissatisfiers') : t('all')) }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watchEffect, watch } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { needsMap, needToColor } from "./../utils/needsUtils";
ChartJS.register(ArcElement);

const ms = useMomentsStore()
const { t } = useI18n()
const router = useRouter()

const loaded = ref(false)
const chartRef = ref(null)
const isSegmentClicked = ref(false)
const clickedIndex = ref(null)
const chartData = ref({
  datasets: [
    {
      data: [1],
      labels: ['No data'],
      hoverBackgroundColor: ['#c0c6dc'],
      backgroundColor: ['#c0c6dc'],
    }
  ]
}
)

const props = defineProps({
  percentageThreshold: {
    type: Number,
    default: 0.05,
  },
  clickedOutside: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  embedded: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['click:segment', 'update:chartData'])

const handleClick = (evt, item, chart) => {
  console.log('In donutChart props.embedded', props.embedded, " for ", ms.getActiveDateRange, ' > handleClick evt:', evt, "item:", item, "chart:", chart);

  if (props.embedded) {
    router.push('/insights/needs')
  } else {
    // Check if any segment is clicked
    if (chartData.value.datasets[0].labels[0] === 'No data' || !item) return

    else if (item.length > 0 && clickedIndex.value !== item[0].index) {
      isSegmentClicked.value = true;
      clickedIndex.value = item[0].index;

      console.log('In donutChart ', ms.getActiveDateRange, ' > handleClick emits click:segment with', { needName: chartData.value.datasets[0].labels[clickedIndex.value] });

      emits('click:segment', { needName: chartData.value.datasets[0].labels[clickedIndex.value], clickedSegmentIndex: clickedIndex.value })
      chartData.value.datasets[0].backgroundColor.forEach((color, index, colors) => {
        // If the segment is clicked, ensure it's coloured, for other segments, ensure they are greyed out
        colors[index] = index === clickedIndex.value ? chartData.value.datasets[0].hoverBackgroundColor[index] : '#c0c6dc';
      });
    }

    else {
      isSegmentClicked.value = false;
      clickedIndex.value = null;

      console.log('In donutChart ', ms.getActiveDateRange, ' > handleClick emits click:segment with null');

      emits('click:segment', { needName: null, clickedSegmentIndex: null })
      chartData.value.datasets[0].backgroundColor.forEach((color, index, colors) => {
        // Reset to original color when clicking outside
        colors[index] = chartData.value.datasets[0].hoverBackgroundColor[index];
      });
    }
    chart.update();
  }
}
const chartOptions = ref({
  cutout: props.embedded ? '82%' : '82%',
  spacing: props.embedded ? 25 : 30,
  borderRadius: 14,
  borderWidth: 0,
  responsive: true,
  maintainAspectRatio: true,
  animation: {
    duration: 500,
    animateScale: false,
    animateRotate: true
  },
  // animation: false,
  onClick: props.embedded ? null : handleClick,
})

watchEffect(() => {
  if (props.isActive && ms.getActiveDateRange && ms.needsToggleModel) {
    console.log('In donutChart for ', ms.needsToggleModel, ' ', ms.getActiveDateRange, 'with props.isActive ', props.isActive, ' > watchEffect called');
    if (ms.aggDataNeeds) {
      if (
        ms.aggDataNeeds[ms.getActiveDateRange] &&
        ms.aggDataNeeds[ms.getActiveDateRange][ms.needsToggleModel]) {
        loaded.value = false
        const needsData = ms?.aggDataNeeds[ms.getActiveDateRange][ms.needsToggleModel]
          .filter(item => item[ms.needsToggleModel == 'satisfaction' ? 'satisfactionImpactLabelValue' : (ms.needsToggleModel == 'unsatisfaction' ? 'unsatisfactionImpactLabelValue' : 'importanceValue')] > props.percentageThreshold)
          .map(item => {
            return {
              needName: item.needName,
              data: item[ms.needsToggleModel == 'satisfaction' ? 'satisfactionImpactLabelValue' : (ms.needsToggleModel == 'unsatisfaction' ? 'unsatisfactionImpactLabelValue' : 'importanceValue')],
            }
          })

        // Update the chart data
        chartData.value.datasets[0].data = needsData.map(item => item.data);
        chartData.value.datasets[0].labels = needsData.map(item => item.needName);
        chartData.value.datasets[0].hoverBackgroundColor = needsData.map(item =>
          getComputedStyle(document.documentElement)
            .getPropertyValue(`--${needToColor()[item.needName]}-color`));

        const otherData = 1 - needsData.reduce((acc, item) => acc + item.data, 0)
        if (otherData > 0) {
          chartData.value.datasets[0].data.push(otherData)
          chartData.value.datasets[0].labels.push('Others');
          chartData.value.datasets[0].hoverBackgroundColor.push(getComputedStyle(document.documentElement).getPropertyValue('--outline-color'))
        }

        chartData.value.datasets[0].backgroundColor = chartData.value.datasets[0].hoverBackgroundColor.slice();

        nextTick(() => {
          loaded.value = true
          console.log('In donutChart ', ms.needsToggleModel, ' ', ms.getActiveDateRange, ' > watchEffect, chartData updated, chartRef', chartRef.value);
        })

      } else {
        //if no data ready but legit activeDateRange and needsToggleModel generate an empty chart
        loaded.value = false
        nextTick(() => {
          console.log('In donutChart ', ms.needsToggleModel, ' ', ms.getActiveDateRange, ' > watchEffect, data not ready for this activeDateRange and needsToggleModel');
          loaded.value = true
        })
      }
    }
    else {
      console.log('In donutChart for ', ms.needsToggleModel, ' ', ms.getActiveDateRange, 'with props.isActive ', props.isActive, ' > watchEffect ,ms.aggDataNeeds not ready');
    }
  } else {
    //reset clicked segment to null when chart is not active
    isSegmentClicked.value = false;
    clickedIndex.value = null;
  }
})

watch(loaded, (newValue, oldValue) => {
  console.log('In donutChart > watch loaded newValue:', newValue, "oldValue:", oldValue, 'chartRef', chartRef.value, 'ms.donutSegmentClicked:', ms.donutSegmentClicked, 'clickedIndex.value:', clickedIndex.value, 'isSegmentClicked.value:', isSegmentClicked.value, 'props.isActive:', props.isActive, 'ms.getActiveDateRange:', ms.getActiveDateRange, 'ms.needsToggleModel:', ms.needsToggleModel, 'props.clickedOutside:', props.clickedOutside);

  if (newValue && ms.donutSegmentClicked !== null && props.isActive && ms.aggDataNeeds[ms.getActiveDateRange] && ms.aggDataNeeds[ms.getActiveDateRange][ms.needsToggleModel]
  ) {
    console.log('In donutChart > watch loaded Before, ms.donutSegmentClicked:', ms.donutSegmentClicked, 'clickedIndex.value:', clickedIndex.value, 'isSegmentClicked.value:', isSegmentClicked.value);

    nextTick(() => {
      handleClick(null, [{ index: ms.donutSegmentClicked }], chartRef.value.chart)
      ms.donutSegmentClicked = null

      console.log('In donutChart > watch loaded After, ms.donutSegmentClicked:', ms.donutSegmentClicked, 'clickedIndex.value:', clickedIndex.value, 'isSegmentClicked.value:', isSegmentClicked.value);
    })
  }
})

watch(() => props.clickedOutside, (newValue, oldValue) => {
  if (props.isActive && newValue && chartRef.value) {
    console.log('In donutChart ', ms.needsToggleModel, ' ', ms.getActiveDateRange, 'with props.isActive ', props.isActive, ' > watch clickedOutside, newValue:', newValue, "oldValue:", oldValue);
    handleClick(null, [], chartRef.value.chart)
  }
})

</script>

<style lang="scss">
.overlay-content {
  pointer-events: none;
  /* This allows clicks to pass through to the chart */

  >div {
    pointer-events: auto;
    /* Enable pointer events for the actual content */
  }
}

.smallDoughnut {
  height: 22vh;
}

.bigDoughnut {
  height: 30vh;
}
</style>
