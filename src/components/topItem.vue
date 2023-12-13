<template>
  <q-item class="q-px-none" style="min-height: 0px;">
    <q-item-label class="text-subtitle2 text-weight-medium text-outline">{{ `Top ${topLabel}` }}</q-item-label>
  </q-item>

  <q-item v-if="topItem" class="q-pb-sm q-px-none" clickable
    @click="router.push({ path: `/insights/needs/${needsMap[topItem.needName][2]}`, query: { dateRange: ms.activeDateRange } });">
    <q-item-section avatar class="q-pr-none" style="min-width: 52px;">
      <q-avatar size="42px" font-size="28px" :color="needToColor()[topItem.needName]">
        {{ needsMap[topItem.needName][0] }}
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item class="q-pa-none" dense style="min-height: 0px;">
        <q-item-section class="text-subtitle2 text-weight-medium">{{ topItem.needName }}</q-item-section>
        <q-item-section side class="text-body2 text-on-surface">{{ parseFloat((topItem[props.topType ==
                  'satisfaction' ? 'satisfactionImpactLabelValue' : (props.topType == 'unsatisfaction'
                  ? 'unsatisfactionImpactLabelValue' : 'importanceValue')] * 100).toFixed(0)) + "%" }}
        </q-item-section>
      </q-item>
      <q-item class="q-pa-none" dense style="min-height: 0px;">
        <q-item-section class="text-caption text-outline">
          {{ topItem.occurrenceCount }}
          {{ topItem.occurrenceCount == 1 ? 'moment' : 'moments' }}
        </q-item-section>
        <q-item-section side class="text-caption text-outline">{{ props.topType == 'satisfaction' ?
                  'of all satisfaction' : (props.topType == 'unsatisfaction'
                  ? 'of all dissatisfaction' : 'of total importance') }}
        </q-item-section>
      </q-item>
    </q-item-section>
  </q-item>
  <q-item v-else class="q-pb-sm q-px-none">
    <q-item-section avatar class="q-pr-none" style="min-width: 52px;">
      <q-avatar size="42px" font-size="28px" color="background">
        ?
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <div v-if="props.topType == 'satisfaction'">
        No satisfied needs for this period.
      </div>
      <div v-else-if="props.topType == 'unsatisfaction'">
        No dissatisfied needs for this period.
      </div>
      <div v-else>
        No needs for this period.
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { useRouter } from 'vue-router'
import { needsMap, needToColor } from "./../utils/needsUtils";

const ms = useMomentsStore()
const router = useRouter()

const props = defineProps({
  topType: {
    required: true,
    type: String,
    default: "satisfier",
  }
});

const topLabel = computed(() => {
  return props.topType == "satisfaction" ? "satisfier" : (props.topType == "unsatisfaction" ? "dissatisfier" : "mover")
})

const topItem = computed(() => {
  console.log('In topItem > computed topItem for topType', props.topType, 'and activeDateRange', ms.activeDateRange)

  console.log('In topItem > computed topItem, ms.aggDataNeeds[ms.activeDateRange][props.topType]', ms.aggDataNeeds &&
    ms.aggDataNeeds[ms.activeDateRange] &&
    ms.aggDataNeeds[ms.activeDateRange][props.topType][0])
  return ms.aggDataNeeds &&
    ms.aggDataNeeds[ms.activeDateRange] &&
    ms.aggDataNeeds[ms.activeDateRange][props.topType][0]
})

</script>
<style lang="scss"></style>



