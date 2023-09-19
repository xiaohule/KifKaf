<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event.target)" position="bottom"
    full-width>

    <q-card class="bg-background" flat style="height: 90vh;">
      <q-toolbar class="q-pa-sm">
        <q-btn flat v-close-popup round dense icon="close" />
      </q-toolbar>

      <div class="q-px-md">
        <q-item class="q-px-none">
          <q-item-section class="text-h6 text-weight-medium">{{
            momentsStore.getFormattedDate(moment?.date?.seconds, true) }}</q-item-section>
          <q-item-section avatar class="q-px-none" style="min-width: 20px;">
            <moment-sync-icon :moment-id="momentId" :expected-llm-call-duration="expectedLlmCallDuration" />
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
            <div class="">{{ moment?.text }}</div>
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

          <q-card-section
            v-if="moment?.needsSatisAndImp && (moment?.needsSatisAndImp.error || moment?.needsSatisAndImp.oops)"
            class="q-px-none q-py-sm text-error" style="min-height: 0px;">
            {{ "Oops: " + (moment?.needsSatisAndImp.error ||
              moment?.needsSatisAndImp.oops).replace(/[^a-zA-Z0-9!?,;.:]+$/, '') }}
            <!-- add the "+" for manually adding needs -->
          </q-card-section>
          <q-card-section v-else-if="moment?.needsSatisAndImp && Object.keys(moment?.needsSatisAndImp).length > 0"
            class="q-px-none q-py-sm chip-container" style="min-height: 0px;">
            <!-- removable v-model="vanilla" text-color="white" :title="vanillaLabel" -->
            <q-chip v-for="need in Object.entries(moment?.needsSatisAndImp).sort(([, a], [, b]) => b[1] - a[1])"
              :key="need[0]" outline :color="getChipColor(need[1])" :icon="momentsStore.needsMap[need[0]]"
              :label="need[0]" class="needs" />
            <!-- add the "+" for manually adding needs -->
          </q-card-section>
          <q-card-section v-else class="q-px-none q-py-sm text-error" style="min-height: 0px;">
          </q-card-section>

        </q-card>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMomentsStore } from './../stores/moments.js'
import momentSyncIcon from 'src/components/momentSyncIcon.vue';

const props = defineProps({
  modelValue: {
    required: true,
    type: Boolean,
    default: false,
  },
  momentId: {
    required: true,
    type: String,
  },
  expectedLlmCallDuration: {
    required: true,
    type: Number,
    default: 40
  },
});
defineEmits(['update:modelValue']);

const momentsStore = useMomentsStore()
const moment = ref(null)

watch(() => props.momentId, (newVal, oldVal) => {
  momentsStore.getMomentById(newVal, moment);
  console.log('in momentBottomSheet watch props.momentId:', props.momentId, "moment:", moment);
})

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



