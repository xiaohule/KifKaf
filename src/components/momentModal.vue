<template>
  <q-dialog v-if="moment" :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event.target)"
    position="bottom" style="max-width: 600px">

    <q-card class="bg-background" flat style="height: 90vh;"
      v-touch-swipe.mouse.down="(event) => { $emit('update:modelValue', false) }">
      <q-toolbar class="q-pa-sm">
        <q-btn flat v-close-popup round dense icon="r_close" />
      </q-toolbar>

      <div class="q-px-md">
        <q-item class="q-px-none">
          <q-item-section class="text-h6 text-weight-medium">{{
            formatDayForMomList(moment.date?.seconds, true, t, d) }}</q-item-section>
          <q-item-section avatar class="q-px-none" style="min-width: 20px;">
            <moment-sync-icon :moment-id="momentId" />
          </q-item-section>
        </q-item>

        <q-card class="bg-surface q-mb-md q-px-md q-py-md" style="border-radius: 14px" flat>
          <q-card-section horizontal class="q-px-none">
            <div class="text-weight-medium text-outline col">{{ t('momentTitle') }}</div>
            <!-- <q-card-actions vertical class="col-auto q-pa-none">
            <q-btn flat color="primary" icon="edit" dense size="sm" />
          </q-card-actions>
          <div class="text-weight-medium text-primary col-auto">Edit</div> -->
          </q-card-section>
          <q-card-section class="q-px-none q-py-sm">
            <div class="selectable-text">{{ moment.text }}</div>
          </q-card-section>
        </q-card>

        <q-card class="bg-surface q-mb-md q-px-md q-py-md" style="border-radius: 14px" flat>
          <!-- <q-card-section horizontal class="q-px-none">
            <div class="text-weight-medium text-outline col">Needs<q-btn flat color="primary" icon="o_info" dense
                size="10px" @click="learnMoreModalSection = 'momentNeeds'; learnMoreModalOpened = true" /></div>
          </q-card-section> -->
          <q-item class="q-px-none q-py-none" style="min-height: 0px;">
            <q-item-section class="text-weight-medium text-outline">{{ t('relatedNeeds') }}</q-item-section>
            <q-btn side class="text-subtitle2 text-weight-medium text-primary"
              @click="learnMoreModalSection = 'momentNeeds'; learnMoreModalOpened = true" no-caps flat :ripple="false"
              padding="none none none sm">{{ t('learnMore') }}
            </q-btn>
          </q-item>

          <q-card-section v-if="moment.needs && (moment.needs.error || moment.needs.Oops)"
            class="selectable-text q-px-none q-py-sm text-negative" style="min-height: 0px;">
            {{ "Oops: " + (moment.needs.error ||
              moment.needs.Oops).replace(/[^a-zA-Z0-9!?,;.:]+$/, '') }}
            <!-- add the "+" for manually adding needs -->
          </q-card-section>
          <q-card-section v-else-if="moment.needs && Object.keys(moment.needs).length > 0"
            class="q-px-none q-pt-sm q-pb-xs chip-container" style="min-height: 0px;">
            <q-chip v-for="need in Object.entries(moment.needs).sort(([, a], [, b]) => b.importance - a.importance)"
              :key="need[0]" outline :color="getChipColor(need[1])" :icon="needsMap[need[0]][0]"
              :label="t('needsList.' + need[0])" class="needs" />
            <!-- add the "+" for manually adding needs -->

            <!-- <div class="q-chip row inline no-wrap items-center text-positive q-chip--colored q-chip--outline needs" style="background-color: negative;"> -->

            <div class="text-caption text-center q-mt-sm">
              <q-chip :ripple="false" outline color="positive" size="sm" :label="t('satisfiedNeed')" />
              <q-chip :ripple="false" outline color="primary" size="sm" :label="t('neutralNeed')" />
              <q-chip :ripple="false" outline color="negative" size="sm" :label="t('dissatisfiedNeed')" />
            </div>


          </q-card-section>
          <q-card-section v-else class="q-px-none q-py-sm" style="min-height: 0px;">
          </q-card-section>

        </q-card>

        <q-card class="bg-surface q-mb-md q-px-md q-py-md rounded-borders-14" flat clickable v-ripple
          @click="deleteDialogOpened = true">
          <q-item class="q-px-none q-py-none" style="min-height: 0px;">
            <q-item-section class="text-negative">
              <q-item-label>{{ t('deleteMoment') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </q-card>

    <q-dialog v-model="deleteDialogOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background q-px-sm q-pt-sm q-pb-lg" flat
        v-touch-swipe.mouse.down="(event) => { deleteDialogOpened = false }">
        <q-card-section>
          <div class="text-h6 text-weight-medium">{{ t('deleteMoment') + "?" }} </div>
        </q-card-section>
        <q-card-section class="q-pt-none text-outline">
          {{ t('deleteMomentText') }} </q-card-section>
        <q-card-actions align="around">
          <q-btn class="text-body1 text-weight-medium q-ma-sm q-mb-lg" rounded :label="t('cancel')" color="primary"
            padding="sm xl" v-close-popup no-caps />
          <q-btn class="text-body1 text-weight-medium q-ma-sm q-mb-lg" flat rounded :label="t('delete')" color="primary"
            padding="sm xl" v-close-popup no-caps @click="deleteMoment" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <learn-more-modal v-model="learnMoreModalOpened" :section="learnMoreModalSection" />
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from "vue-i18n"
import momentSyncIcon from 'src/components/momentSyncIcon.vue';
import { needsMap, getChipColor } from "./../utils/needsUtils";
import { useDateUtils } from '../composables/dateUtils.js'
import learnMoreModal from 'src/components/learnMoreModal.vue'

const ms = useMomentsStore()
const { t, d } = useI18n()
const { formatDayForMomList } = useDateUtils()

const moment = ref(null)
const deleteDialogOpened = ref(false)
const learnMoreModalOpened = ref(false)
const learnMoreModalSection = ref("")

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
});
const emits = defineEmits(['update:modelValue']);

watch(() => props.momentId, (newVal, oldVal) => {
  ms.getMomentById(newVal, moment);
  console.log('in momentModal watch props.momentId:', props.momentId, "moment:", moment);
})

const deleteMoment = () => {
  deleteDialogOpened.value = false
  emits('update:modelValue', false)
  console.log("In momentModal, deleting moment");
  ms.deleteMoment(props.momentId)
}

</script>
<style lang="scss">
.needs {
  font-size: 0.8rem;
  // max-width: 200px; //truncate
}

.q-chip__icon {
  margin-bottom: 2px;
}

.q-dialog__inner>div {
  border-top-right-radius: 14px;
  border-top-left-radius: 14px;
}

// .bg-transparent-red {
//   background-color: rgba(255, 0, 0, 0.15) !important;
// }

// .overlapping {
//   // border: 2px solid white;
//   position: absolute;
// }
</style>



