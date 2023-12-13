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
            formatDayForMomList(moment.date?.seconds, true) }}</q-item-section>
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
            <div class="">{{ moment.text }}</div>
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

          <q-card-section v-if="moment.needs && (moment.needs.error || moment.needs.Oops)"
            class="q-px-none q-py-sm text-error" style="min-height: 0px;">
            {{ "Oops: " + (moment.needs.error ||
              moment.needs.Oops).replace(/[^a-zA-Z0-9!?,;.:]+$/, '') }}
            <!-- add the "+" for manually adding needs -->
          </q-card-section>
          <q-card-section v-else-if="moment.needs && Object.keys(moment.needs).length > 0"
            class="q-px-none q-pt-sm q-pb-xs chip-container" style="min-height: 0px;">
            <q-chip v-for="need in Object.entries(moment.needs).sort(([, a], [, b]) => b.importance - a.importance)"
              :key="need[0]" outline :color="getChipColor(need[1])" :icon="needsMap[need[0]][0]" :label="need[0]"
              class="needs" />
            <!-- add the "+" for manually adding needs -->

            <!-- <div class="q-chip row inline no-wrap items-center text-positive q-chip--colored q-chip--outline needs" style="background-color: negative;"> -->

            <div class="text-caption text-center q-mt-sm">
              <q-chip :ripple="false" outline color="positive" size="sm" label="Satisfied need" class="bg-error" />
              <q-chip :ripple="false" outline color="primary" size="sm" label="Neutral need" class="bg-scrim-dark" />
              <q-chip :ripple="false" outline color="negative" size="sm" label="Dissatisfied need"
                class="bg-transparent-red" />
            </div>


          </q-card-section>
          <q-card-section v-else class="q-px-none q-py-sm text-error" style="min-height: 0px;">
          </q-card-section>

        </q-card>

        <q-card class="bg-surface q-mb-md q-px-md q-py-md rounded-borders-14" flat clickable v-ripple
          @click="deleteDialogOpened = true">
          <q-item class="q-px-none q-py-none" style="min-height: 0px;">
            <q-item-section class="text-negative">
              <q-item-label>Delete moment</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </q-card>

    <q-dialog v-model="needsInfoOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background q-px-sm" flat v-touch-swipe.mouse.down="(event) => { needsInfoOpened = false }">

        <q-card-section class="text-h6 text-weight-medium">Moment's needs
        </q-card-section>

        <q-card-section class="q-py-xs text-outline">These are the needs related to your moment picked from our list of
          Universal Human Needs. <br><br>The full list is composed of:<br>

          <q-list>
            <q-expansion-item v-for="categ in Object.entries(needsCategories)" :key="categ[0]" group="needsCategories"
              header-class="q-px-none">
              <template v-slot:header>
                <q-item-section avatar>
                  <q-avatar :icon="categ[1][0]" :color="categ[1][1]" text-color="background">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  {{ categ[0] }} needs </q-item-section>
              </template>

              <q-card class="bg-background q-pa-none">
                <q-card-section class="q-pa-none">
                  <!-- [["Physical Well-Being", ["🛡️", "Physiological & Safety"]],
  ["Sustenance & Nourishment", ["🍎", "Physiological & Safety"]],
  // ... (and so on for each entry in the needsMap)] -->
                  <q-chip v-for="need in Object.entries(needsMap).filter(need => need[1][1] === categ[0])" :key="need[0]"
                    outline :icon="need[1][0]" color="outline" :label="need[0]" class="needs" />
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn rounded color="primary" padding="md md" @click="needsInfoOpened = false" class="text-body1 text-weight-medium
q-ma-sm q-mb-lg full-width" no-caps>Got it</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialogOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background q-px-sm q-pt-sm q-pb-lg" flat
        v-touch-swipe.mouse.down="(event) => { deleteDialogOpened = false }">
        <q-card-section>
          <div class="text-h6 text-weight-medium">Delete moment?</div>
        </q-card-section>
        <q-card-section class="q-pt-none text-outline">
          We will automatically recalculate your Insights.
        </q-card-section>
        <q-card-actions align="around">
          <q-btn class="text-body1 text-weight-medium q-ma-sm q-mb-lg" rounded label="Cancel" color="primary"
            padding="sm xl" v-close-popup no-caps />
          <q-btn class="text-body1 text-weight-medium q-ma-sm q-mb-lg" flat rounded label="Delete moment" color="primary"
            padding="sm xl" v-close-popup no-caps @click="deleteMoment" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMomentsStore } from './../stores/moments.js'
import momentSyncIcon from 'src/components/momentSyncIcon.vue';
import { needsMap, needsCategories, getChipColor } from "./../utils/needsUtils";
import { useDateUtils } from '../composables/dateUtils.js'

const ms = useMomentsStore()
const moment = ref(null)
const needsInfoOpened = ref(false)
const deleteDialogOpened = ref(false)
const { formatDayForMomList } = useDateUtils()

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
    type: Number,
    default: 60
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



