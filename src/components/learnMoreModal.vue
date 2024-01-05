<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event.target)" position="bottom"
    style="max-width: 600px">
    <q-card class="bg-background q-px-sm" flat
      v-touch-swipe.mouse.down="(event) => { $emit('update:modelValue', false) }">

      <div>
        <q-card-section class="text-h6 text-weight-medium"> {{ modalTitle }}
        </q-card-section>
      </div>

      <q-card-section class="q-py-xs text-outline">
        <div v-if="props.section === 'momentNeeds'" class="q-pb-sm">These are the needs related to
          your moment picked from our list of
          Universal Human Needs. <br><br>The full list is composed of:</div>
        <div v-else-if="props.section === 'needs'" class="q-pb-sm">KifKaf analyzes each moment you log to update your
          needs' snapshot.<br><br> Our approach is grounded in a well-defined framework of key human needs:</div>

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
        <q-btn rounded color="primary" padding="md md" @click="(event) => { $emit('update:modelValue', false) }" class="text-body1 text-weight-medium
q-ma-sm q-mb-lg full-width" no-caps>Got it</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue';
import { useMomentsStore } from './../stores/moments.js'
import { needsMap, needsCategories } from "./../utils/needsUtils";


const ms = useMomentsStore()

const props = defineProps({
  modelValue: {
    required: true,
    type: Boolean,
    default: false,
  },
  section: {
    required: true,
    type: String,
    default: "quote",
  },
});
const emits = defineEmits(['update:modelValue']);

const modalTitle = computed(() => {
  switch (props.section) {
    case "needs":
      return "Needs";
    case "momentNeeds":
      return "Moment's needs";
    default:
      return "";
  }
});
</script>
<style lang="scss"></style>



