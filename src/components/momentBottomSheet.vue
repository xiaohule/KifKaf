<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event.target)" position="bottom">
    <!-- full-width full-height style="height: 90vh !important;"> -->
    <q-card class="q-pa-md bg-background" flat style="height: 90vh;">
      <q-item class="q-px-none">
        <q-item-section class="text-body1 text-weight-medium">{{
          momentsStore.formatLikeUniqueDays(moment) }}</q-item-section>
        <q-item-section avatar top class="q-px-none" style="min-width: 20px;">
          <q-icon v-if="moment.needsSatisAndImp && Object.keys(moment.needsSatisAndImp).length > 0" size="20px"
            color="primary" name="check_circle" class="q-mx-none" />
          <!-- display stateful-circular-progress only if moment.date is less than expectedLlmCallDuration seconds ago -->
          <stateful-circular-progress :expected-duration="expectedLlmCallDuration"
            v-else-if="moment.date?.seconds && moment.date?.seconds > (currentTime - expectedLlmCallDuration)" />
          <q-icon v-else size="20px" color="error-dark" name="error" class="q-mx-none" />
        </q-item-section>
      </q-item>

      <q-card class="bg-surface q-mb-md q-px-md q-py-md" style="border-radius: 14px" flat>
        <q-card-section horizontal class="q-px-none">
          <div class="text-weight-medium text-outline col">Moment</div>
          <!-- <q-card-actions vertical class="col-auto q-pa-none">
            <q-btn flat color="primary" icon="edit" dense size="sm" />
          </q-card-actions>
          <div class="text-weight-medium text-primary col-auto">Edit</div> -->
        </q-card-section>
        <q-card-section class="q-px-none q-py-sm">
          <div class="">{{ moment.text }}</div>
        </q-card-section>
      </q-card>

      <q-card class="bg-surface q-mb-md q-px-md q-py-md" style="border-radius: 14px" flat>
        <q-card-section horizontal class="q-px-none">
          <div class="text-weight-medium text-outline col">Needs</div>
          <!-- <q-card-actions vertical class="col-auto q-pa-none">
            <q-btn flat color="primary" icon="edit" dense size="sm" />
          </q-card-actions>
          <div class="text-weight-medium text-primary col-auto">Edit</div> -->
        </q-card-section>

        <q-card-section v-if="moment.needsSatisAndImp && (moment.needsSatisAndImp.error || moment.needsSatisAndImp.oops)"
          class="q-px-none q-py-sm" style="min-height: 0px;">
          <!-- add the "+" for manually adding needs -->
        </q-card-section>
        <q-card-section v-else-if="moment.needsSatisAndImp && Object.keys(moment.needsSatisAndImp).length > 0"
          class="q-px-none q-py-sm chip-container" style="min-height: 0px;">
          <!-- removable v-model="vanilla" text-color="white" :title="vanillaLabel" -->
          <q-chip v-for="need in Object.entries(moment.needsSatisAndImp).sort(([, a], [, b]) => b[1] - a[1])"
            :key="need[0]" outline :color="getChipColor(need[1])" :icon="momentsStore.needsMap[need[0]]" :label="need[0]"
            class="needs" />
        </q-card-section>
        <q-card-section v-else-if="!moment.hideSpinner" class="q-px-none q-py-sm text-center" style="min-height: 0px;">
          <q-spinner-dots color="" size="2em" />
        </q-card-section>

      </q-card>
    </q-card>
  </q-dialog>
</template>

<script setup>
// import { ref, onMounted, nextTick } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import statefulCircularProgress from 'src/components/statefulCircularProgress.vue';

//STORE INITIALIZATION
// defineOptions({
//   preFetch() {
//     const momentsStore = useMomentsStore()
//     console.log('In momBottomSheet preFetch')
//     return momentsStore.fetchMoments();
//   }
// })
const momentsStore = useMomentsStore()
// onMounted(async () => {
//   console.log('In momBottomSheet onMounted')
//   nextTick(() => {
//     console.log('In momBottomSheet nextTick')
//   });
//   // try {
//   //   if (!momentsStore.momentsFetched) {
//   //     await momentsStore.fetchMoments();
//   //   }
//   // } catch (error) {
//   //   console.error('await momentsStore.fetchMoments() error:', error);
//   // }
// })

defineProps({
  modelValue: {
    required: true,
    type: Boolean,
    default: false,
  },
  moment: {
    required: true,
    type: Object
  },
});
defineEmits(['update:modelValue']);

const getChipColor = (needsStats) => {
  if (needsStats[0] < 0.4) return 'red'
  else if (needsStats[0] > 0.6) return 'green'
  else return 'primary'
}
</script>
<style lang="scss">
.needs {
  font-size: 0.8rem;
  // max-width: 200px; //truncate
}

.q-chip__icon {
  margin-bottom: 1.5px;
}

.q-dialog__inner>div {
  border-top-right-radius: 14px;
  border-top-left-radius: 14px;
}
</style>



