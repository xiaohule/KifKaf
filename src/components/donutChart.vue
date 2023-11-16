<!-- here we display the correct donut chart for the requested date range -->
<template>
  <div class="doughnut-container" style="position: relative;">

    <!-- :plugins="[plugin]" -->
    <Doughnut v-if="loaded" ref="doughnut" :data="chartData" :options="chartOptions" style="min-height: 40px;" />

    <div class="overlay-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <!-- Your HTML content here -->
      <div v-if="isSegmentClicked">
        <!-- align-items: center;  -->
        <q-avatar size="84px" font-size="56px"
          style="align-items: center; justify-content: center; display: flex; margin: 0 auto 8px;"
          :color="momentsStore.needsMap[chartData.datasets[0].labels[clickedIndex]][2]">
          {{ momentsStore.needsMap[chartData.datasets[0].labels[clickedIndex]][0] }}
        </q-avatar>
        <div class="text-body2 text-center q-my-sm">{{ chartData.datasets[0].labels[clickedIndex]
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
import { ref, nextTick, watchEffect } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
ChartJS.register(ArcElement);

// defineOptions({
//   preFetch() {
//     const momentsStore = useMomentsStore()
//     console.log('In LearnTab > preFetch')
//     return momentsStore.fetchAggregateData();
//   }
// })

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
});

const emits = defineEmits(['click:segment', 'update:chartData'])

const loaded = ref(false)

const chartData = ref({
  datasets: [
    {
      data: [1],
      labels: ['No data'],
      originalBackgroundColor: ['#c0c6dc'],
      backgroundColor: ['#c0c6dc'],
    }
  ]
}
)

const isSegmentClicked = ref(false)
const clickedIndex = ref(null)

const handleClick = (evt, item, chart) => {
  // console.log('In donutChart ', props.dateRange, ' > handleClick evt:', evt, "item:", item, "chart:", chart);
  // Check if any segment is clicked
  isSegmentClicked.value = item.length > 0;
  clickedIndex.value = isSegmentClicked.value ? item[0].index : null;

  if (isSegmentClicked.value) {
    emits('click:segment', { needName: chartData.value.datasets[0].labels[clickedIndex.value] })
    chartData.value.datasets[0].backgroundColor.forEach((color, index, colors) => {
      // If the segment is clicked, ensure it's coloured, for other segments, ensure they are greyed out
      colors[index] = index === clickedIndex.value ? chartData.value.datasets[0].originalBackgroundColor[index] : '#c0c6dc';
    });
    // chartOptions.value.plugins.centertextplugin.emoji = momentsStore.needsMap[chartData.value.datasets[0].labels[clickedIndex.value]][0]
    // chartOptions.value.plugins.centertextplugin.text = chartData.value.datasets[0].labels[clickedIndex.value]
    // chartOptions.value.plugins.centertextplugin.percentage = (chartData.value.datasets[0].data[clickedIndex.value] * 100).toFixed(0) + "%"

  }
  else {
    emits('click:segment', { needName: null })
    chartData.value.datasets[0].backgroundColor.forEach((color, index, colors) => {
      // Reset to original color when clicking outside
      colors[index] = chartData.value.datasets[0].originalBackgroundColor[index];
    });
    // chartOptions.value.plugins.centertextplugin.emoji = null
    // chartOptions.value.plugins.centertextplugin.text = props.toggleValue == 'satisfaction' ? 'Satisfiers' : (props.toggleValue == 'unsatisfaction' ? 'Dissatisfiers' : 'Top needs')
    // chartOptions.value.plugins.centertextplugin.percentage = null
  }
  chart.update();
}

// const plugin = {
//   id: 'centertextplugin',
//   afterDraw(chart, args, options) {
//     // console.log('In donutChart ', props.dateRange, ' > centerTextPlugin ');
//     let width = chart.width,
//       height = chart.height,
//       ctx = chart.ctx;
//     // console.log('In donutChart ', props.dateRange, ' > centerTextPlugin width:', width, "height:", height, "ctx:", ctx);

//     ctx.restore();
//     const fontSize = (height / 250).toFixed(2);
//     ctx.font = fontSize + "em sans-serif";
//     ctx.textBaseline = "middle";

//     const emoji = options.emoji,
//       emojiX = Math.round((width - ctx.measureText(emoji).width) / 2),
//       emojiY = height / 2 - 20;
//     if (emoji) ctx.fillText(emoji, emojiX, emojiY);

//     const text = options.text,
//       textX = Math.round((width - ctx.measureText(text).width) / 2),
//       textY = height / 2;
//     ctx.fillText(text, textX, textY);

//     const percentage = options.percentage,
//       percentageX = Math.round((width - ctx.measureText(percentage).width) / 2),
//       percentageY = height / 2;
//     if (percentage) ctx.fillText(percentage, percentageX, percentageY + 20);

//     ctx.save();
//   }
// };

const chartOptions = ref({
  cutout: '90%',
  spacing: 15,
  borderRadius: 14,
  borderColor: 'rgba(0, 0, 0, 0)',
  responsive: true,
  maintainAspectRatio: true,
  animation: {
    duration: 700,
    //   animateScale: true,
    //   animateRotate: true
  },
  onClick: handleClick,
  // plugins: {
  //   // legend: {
  //   //   display: false,
  //   // },
  //   // tooltip: {
  //   //   enabled: false,
  //   // },
  //   // centertextplugin: {
  //   //   emoji: null,
  //   //   text: 'No satisfiers',
  //   //   percentage: null,
  //     // color: '#000000',
  //     // font: {
  //     //   size: '18',
  //     //   weight: 'bold',
  //     //   family: 'sans-serif',
  //     // },
  //   },
  // },
})

watchEffect(() => {
  console.log('In donutChart ', props.toggleValue, ' ', props.dateRange, ' > watchEffect called');

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
      chartData.value.datasets[0].originalBackgroundColor = needsData.map(item =>
        getComputedStyle(document.documentElement)
          .getPropertyValue(`--${momentsStore.needsMap[item.needName][2]}-color`)
          .trim());
      chartData.value.datasets[0].backgroundColor = chartData.value.datasets[0].originalBackgroundColor
        .slice();
      // chartOptions.value.plugins.centertextplugin.text = props.toggleValue == 'satisfaction' ? 'Satisfiers' : (props.toggleValue == 'unsatisfaction' ? 'Dissatisfiers' : 'Top needs')

      nextTick(() => {
        console.log('In donutChart ', props.toggleValue, ' ', props.dateRange, ' > watchEffect, chartData updated');
        loaded.value = true
        // emits('update:chartData')

      })

    } else if (props.dateRange && props.toggleValue) {
      loaded.value = false
      // chartOptions.value.plugins.centertextplugin.text = props.toggleValue == 'satisfaction' ? 'Satisfiers' : (props.toggleValue == 'unsatisfaction' ? 'Dissatisfiers' : 'Top needs')
      nextTick(() => {
        console.log('In donutChart ', props.toggleValue, ' ', props.dateRange, ' > watchEffect, no data (ready) for this dateRange and toggleValue');
        loaded.value = true
        // emits('update:chartData')

      })
    }
    else {
      console.log('In donutChart ', props.toggleValue, ' ', props.dateRange, ' > watchEffect, Data not ready or in invalid format type 1');
    }
  }
  else {
    console.log('In donutChart ', props.toggleValue, ' ', props.dateRange, ' > watchEffect, Data not ready or in invalid format type 2');
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
