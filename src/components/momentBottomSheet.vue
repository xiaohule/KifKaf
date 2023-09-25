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
            <div class="text-weight-medium text-outline col">Needs<q-btn flat color="primary" icon="o_info" dense
                size="10px" @click="needsInfoOpened = true" /></div>

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
            class="q-px-none q-pt-sm q-pb-xs chip-container" style="min-height: 0px;">
            <!-- removable v-model="vanilla" text-color="white" :title="vanillaLabel" -->
            <q-chip v-for="need in Object.entries(moment?.needsSatisAndImp).sort(([, a], [, b]) => b[1] - a[1])"
              :key="need[0]" outline :color="getChipColor(need[1])" :icon="momentsStore.needsMap[need[0]][0]"
              :label="need[0]" class="needs" />
            <!-- add the "+" for manually adding needs -->

            <div class="text-caption text-center q-mt-sm">
              <q-icon name="r_crop_square" color="green" size="15px" class="" />&nbsp;Satisfied &nbsp; &nbsp;
              <q-icon name="r_crop_square" color="primary" size="15px" class="" />&nbsp;Neutral &nbsp; &nbsp;
              <q-icon name="r_crop_square" color="red" size="15px" class="" />&nbsp;Unsatisfied &nbsp; &nbsp;
            </div>
          </q-card-section>
          <q-card-section v-else class="q-px-none q-py-sm text-error" style="min-height: 0px;">
          </q-card-section>

        </q-card>
      </div>
    </q-card>
    <q-dialog v-model="needsInfoOpened" position="bottom" full-width>
      <q-card class="bg-background q-px-sm" flat>
        <!-- <div style="width: 40px; height: 3px; border-radius: 2.5px; margin: 12px auto 0;  " class="bg-grey">
        </div> -->

        <q-card-section class="text-h6 text-weight-medium">Moment's needs
        </q-card-section>

        <q-card-section class="q-pt-xs text-outline">These are the needs related to your moment picked from our list of
          Universal Human Needs. <br><br>The full list is composed of:<br>

          <q-list>
            <q-expansion-item v-for="categ in Object.entries(momentsStore.needsCategories)" :key="categ[0]"
              group="needsCategories" header-class="q-px-none">
              <template v-slot:header>
                <!-- <q-item-section avatar>
                  <q-avatar square
                    v-for="(need, index) in Object.entries(momentsStore.needsMap).filter(need => need[1][1] === categ).slice(0, 3)"
                    :key="index" size="20px" class="overlapping" :style="`left: ${index * 16}px`">
                    <div style="font-size: 15px;">{{ need[1][0] }}</div>
                  </q-avatar>
                  <q-avatar size="16px" class="overlapping" :style="`left: ${3 * 16}px`">
                    <div style="font-size: 15px;">...</div>
                  </q-avatar>
                </q-item-section> -->
                <q-item-section avatar>
                  <q-icon :name="categ[1]" />
                </q-item-section>
                <q-item-section>
                  {{ categ[0] }} needs </q-item-section>
              </template>

              <q-card class="bg-background q-pa-none">
                <q-card-section class="q-pa-none">
                  <!-- [["Physical Well-Being", ["🛡️", "Physiological & Safety"]],
  ["Sustenance & Nourishment", ["🍎", "Physiological & Safety"]],
  // ... (and so on for each entry in the needsMap)] -->
                  <q-chip v-for="need in Object.entries(momentsStore.needsMap).filter(need => need[1][1] === categ[0])"
                    :key="need[0]" outline :icon="need[1][0]" color="outline" :label="need[0]" class="needs" />
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn rounded color="primary" padding="md md" @click="needsInfoOpened = false" class="text-body1
q-ma-sm q-mb-lg full-width" no-caps>Got it</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
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

const needsInfoOpened = ref(false)
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

// .overlapping {
//   // border: 2px solid white;
//   position: absolute;
// }
</style>



