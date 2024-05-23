<template>
  <!-- v-model="filterDialogOpened" -->
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event.target)" position="bottom"
    style="max-width: 600px">
    <q-card class="bg-background q-px-sm" v-touch-swipe.mouse.down="(event) => { $emit('update:modelValue', false) }">

      <q-card-section class="text-h5 text-weight-medium">{{ t('filterPeriod') }}</q-card-section>
      <q-card-section class="q-pt-xs text-outline">{{ t('filterPeriodText') }} </q-card-section>
      <div class="q-px-md">
        <segmented-control v-model="ms.segDateId" :segments="segDate" element-name='LearnTabSegDate' />
      </div>
      <q-date v-if="ms.segDateId === 'Monthly'" v-model="ms.pickedDateYYYYsMMsDD"
        :options="(date) => { date >= ms.getOldestMomentDate }" :navigation-min-year-month="ms.getOldestMomentDateYYYYsMM"
        :navigation-max-year-month="currentDateYYYYsMM" default-view="Months"
        class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal years-in-month-view
        emit-immediately @update:model-value="onUpdatePickedDate" :key="monthsKey"></q-date>
      <q-date v-else-if="ms.segDateId === 'Yearly'" v-model="ms.pickedDateYYYYsMMsDD"
        :options="(date) => { date >= ms.getOldestMomentDate }" :navigation-min-year-month="ms.getOldestMomentDateYYYYsMM"
        :navigation-max-year-month="currentDateYYYYsMM" default-view="Years"
        class="full-width q-mt-sm q-mx-lg q-px-xl bg-surface text-on-surface" flat minimal emit-immediately
        @update:model-value="onUpdatePickedDate" :key="yearsKey"></q-date>

      <q-card-actions align="center">
        <q-btn rounded color="primary" padding="md md" @click="$emit('update:modelValue', false)" class="text-body1
q-ma-sm q-mb-lg full-width" no-caps>{{ t('done') }}</q-btn>
      </q-card-actions>
    </q-card>

  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMomentsStore } from 'src/stores/moments.js'
import { useI18n } from 'vue-i18n';
import { useDateUtils } from 'src/composables/dateUtils.js'
import SegmentedControl from "src/components/SegmentedControl.vue";
import { date } from 'quasar'
const { formatDate, getDateDiff, getMaxDate } = date;

const ms = useMomentsStore()
const { t } = useI18n()
const { currentDateYYYYsMM } = useDateUtils()

const props = defineProps({
  modelValue: {
    required: true,
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:modelValue']);

const segDate = ref([{ title: t('monthly'), id: "Monthly" }, { title: t('yearly'), id: "Yearly" }])

const monthsKey = ref(Date.now())
const yearsKey = ref(Date.now())

//EVENTS
const onUpdatePickedDate = (newVal) => { //newVal is a string YYYYsMMsDD //TODO:1 pourrait etre un watch?
  console.log('In datePickerModal > onUpdatePickedDate newVal', newVal)
  if (newVal) {
    if (ms.segDateId === 'Monthly') {
      monthsKey.value = Date.now()
      ms.activeIndex = getDateDiff(newVal, ms.getOldestMomentDate, 'months');
    } else if (ms.segDateId === 'Yearly') {
      yearsKey.value = Date.now()
      ms.activeIndex = getDateDiff(newVal, ms.getOldestMomentDate, 'years');
    }
    console.log('In datePickerModal > onUpdatePickedDate triggered currentSlide update to', ms.activeIndex, "because newVal", newVal, "and ms.getOldestMomentDate", ms.getOldestMomentDate, "and segDateId", ms.segDateId)
  }
}

//i.e. onSegmentControlChange
watch(() => ms.segDateId, (newVal) => {
  console.log('In datePickerModal > watch(segDateId) triggered with newVal', newVal, "pickedDateYYYYsMMsDD", ms.pickedDateYYYYsMMsDD, "ms.getOldestMomentDate", ms.getOldestMomentDate)
  if (newVal) {
    let max = getMaxDate(ms.pickedDateYYYYsMMsDD, ms.getOldestMomentDate)
    ms.pickedDateYYYYsMMsDD = formatDate(max, "YYYY/MM/DD")
    console.log('watch(segDateId) changed pickedDateYYYYsMMsDD to', ms.pickedDateYYYYsMMsDD)
    onUpdatePickedDate(ms.pickedDateYYYYsMMsDD)
  }
});

</script>
<style lang="scss">
.q-btn-group>.q-btn-item {
  border-radius: 34px !important;
}
</style>



