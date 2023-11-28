<!-- here we display the correct donut chart for the requested date range -->
<template>
  <div style="position: relative; height:30vh;">

    <Doughnut v-if="loaded" ref="chartRef" :data="chartData" :options="chartOptions" class="q-mx-auto" />

    <div class="overlay-content" style="position: absolute; top: 44%; left: 50%; transform: translate(-50%, -50%);">
      <!-- Your HTML content here -->
      <div v-if="isSegmentClicked">
        <q-avatar v-if="chartData.datasets[0].labels[clickedIndex] !== 'Others'" size="84px" font-size="56px"
          style="align-items: center; justify-content: center; display: flex; margin: 0 auto 8px;"
          :color="momentsStore.needToColor[chartData.datasets[0].labels[clickedIndex]]">
          {{ momentsStore.needsMap[chartData.datasets[0].labels[clickedIndex]][0] }}
        </q-avatar>
        <div class="text-body2 text-center q-mt-md q-mb-sm">{{ chartData.datasets[0].labels[clickedIndex]
        }}</div>
        <div class="text-h3 text-on-surface text-weight-bolder text-center">{{
          parseFloat((chartData.datasets[0].data[clickedIndex] *
            100).toFixed(0)) + "%" }}
        </div>
      </div>

      <div class="text-body2 text-center q-my-sm" v-else>{{ props.toggleValue == 'satisfaction' ? 'Satisfiers' :
        (props.toggleValue == 'unsatisfaction' ?
          'Dissatisfiers' : 'Top needs') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watchEffect, watch } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
ChartJS.register(ArcElement);

const momentsStore = useMomentsStore()

const props = defineProps({
  dateRange: {
    type: String,
    default: () => { new Date().getFullYear().toString() }, //TODO:3 replace by current month as 2023-11
  },
  toggleValue: {
    type: String,
    default: "satisfaction",
  },
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
});

const emits = defineEmits(['click:segment', 'update:chartData'])

const loaded = ref(false)

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

const isSegmentClicked = ref(false)
const clickedIndex = ref(null)
const chartRef = ref(null)

const handleClick = (evt, item, chart) => {
  console.log('In donutChart ', props.dateRange, ' > handleClick evt:', evt, "item:", item, "chart:", chart);
  // Check if any segment is clicked
  if (chartData.value.datasets[0].labels[0] === 'No data') return

  else if (item.length > 0 && clickedIndex.value !== item[0].index) {
    isSegmentClicked.value = true;
    clickedIndex.value = item[0].index;

    console.log('In donutChart ', props.dateRange, ' > handleClick emits click:segment with', { needName: chartData.value.datasets[0].labels[clickedIndex.value] });

    emits('click:segment', { needName: chartData.value.datasets[0].labels[clickedIndex.value] })
    chartData.value.datasets[0].backgroundColor.forEach((color, index, colors) => {
      // If the segment is clicked, ensure it's coloured, for other segments, ensure they are greyed out
      colors[index] = index === clickedIndex.value ? chartData.value.datasets[0].hoverBackgroundColor[index] : '#c0c6dc';
    });
  }

  else {
    isSegmentClicked.value = false;
    clickedIndex.value = null;

    console.log('In donutChart ', props.dateRange, ' > handleClick emits click:segment with null');

    emits('click:segment', { needName: null })
    chartData.value.datasets[0].backgroundColor.forEach((color, index, colors) => {
      // Reset to original color when clicking outside
      colors[index] = chartData.value.datasets[0].hoverBackgroundColor[index];
    });
  }
  chart.update();
}

const chartOptions = ref({
  cutout: '88%',
  spacing: 30,
  borderRadius: 14,
  // borderColor: 'rgba(20, 32, 43, 12)',
  borderWidth: 0,
  // borderAlign: 'inner',
  responsive: true,
  maintainAspectRatio: true,
  animation: {
    duration: 500,
    animateScale: false,
    animateRotate: true
  },
  // animations: {
  //   colors: false,
  // },
  // hover: {
  //   mode: 'nearest',
  //   intersect: true,
  //   animationDuration: 0,

  // },
  // animation: false,
  onClick: handleClick,
})

watchEffect(() => {
  if (props.isActive && props.dateRange && props.toggleValue) {
    console.log('In donutChart for ', props.toggleValue, ' ', props.dateRange, 'with props.isActive ', props.isActive, ' > watchEffect called');
    if (momentsStore.aggregateData) {
      if (
        momentsStore.aggregateData[props.dateRange] &&
        momentsStore.aggregateData[props.dateRange][props.toggleValue]) {
        loaded.value = false
        const needsData = momentsStore?.aggregateData[props.dateRange][props.toggleValue]
          .filter(item => item[props.toggleValue == 'satisfaction' ? 'satisfactionImpactLabelValue' : (props.toggleValue == 'unsatisfaction' ? 'unsatisfactionImpactLabelValue' : 'importanceValue')] > props.percentageThreshold)
          .map(item => {
            return {
              needName: item.needName,
              data: item[props.toggleValue == 'satisfaction' ? 'satisfactionImpactLabelValue' : (props.toggleValue == 'unsatisfaction' ? 'unsatisfactionImpactLabelValue' : 'importanceValue')],
            }
          })

        // Update the chart data
        chartData.value.datasets[0].data = needsData.map(item => item.data);
        chartData.value.datasets[0].labels = needsData.map(item => item.needName);
        chartData.value.datasets[0].hoverBackgroundColor = needsData.map(item =>
          getComputedStyle(document.documentElement)
            .getPropertyValue(`--${momentsStore.needToColor[item.needName]}-color`));

        const otherData = 1 - needsData.reduce((acc, item) => acc + item.data, 0)
        if (otherData > 0) {
          chartData.value.datasets[0].data.push(otherData)
          chartData.value.datasets[0].labels.push('Others');
          chartData.value.datasets[0].hoverBackgroundColor.push(getComputedStyle(document.documentElement).getPropertyValue('--outline-color'))
        }

        chartData.value.datasets[0].backgroundColor = chartData.value.datasets[0].hoverBackgroundColor
          .slice();

        nextTick(() => {
          loaded.value = true
          console.log('In donutChart ', props.toggleValue, ' ', props.dateRange, ' > watchEffect, chartData updated, chartRef', chartRef.value);

        })

      } else {
        //if no data ready but legit dateRange and toggleValue generate an empty chart
        loaded.value = false
        nextTick(() => {
          console.log('In donutChart ', props.toggleValue, ' ', props.dateRange, ' > watchEffect, data not ready for this dateRange and toggleValue');
          loaded.value = true
          // emits('update:chartData')

        })
      }
    }
    else {
      console.log('In donutChart for ', props.toggleValue, ' ', props.dateRange, 'with props.isActive ', props.isActive, ' > watchEffect ,momentsStore.aggregateData not ready');
    }
  }
})

watch(() => props.clickedOutside, (newValue, oldValue) => {

  if (props.isActive && newValue && chartRef.value) {
    console.log('In donutChart ', props.toggleValue, ' ', props.dateRange, 'with props.isActive ', props.isActive, ' > watch clickedOutside, newValue:', newValue, "oldValue:", oldValue);
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
</style>
