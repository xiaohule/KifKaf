<template>
  <q-item class="q-px-none q-pb-none" style="min-height: 0px;">
    <q-item-label class="text-subtitle2 text-weight-medium text-outline">{{ `Top ${props.topType}` }}</q-item-label>
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
        <q-item-section v-if="isSatDissatTopItem" side class="text-body2 text-on-surface">{{
          parseFloat((topItem[props.topType ===
            'satisfier' ? 'satisfactionImpactLabelValue' : 'unsatisfactionImpactLabelValue'] * 100).toFixed(0)) + "%" }}
        </q-item-section>
        <q-item-section v-else side class="text-body2 text-on-surface">
          <div class="col"><q-icon size="md" :name="props.topType === 'gainer' ? 'r_arrow_drop_up' : 'r_arrow_drop_down'"
              :color="props.topType === 'gainer' ? 'positive' : 'negative'" style="width: 0.7em; height:0.7em;" />
            {{ parseFloat((Math.abs(topItem.difference) * 100).toFixed(0)) + "%" }}
          </div>
        </q-item-section>

      </q-item>
      <q-item class="q-pa-none" dense style="min-height: 0px;">
        <q-item-section class="text-caption text-outline">
          {{ topItem.occurrenceCount }}
          {{ topItem.occurrenceCount == 1 ? 'moment' : 'moments' }}
        </q-item-section>
        <q-item-section v-if="isSatDissatTopItem" side class="text-caption text-outline">{{ props.topType === 'satisfier'
          ? 'of all satisfaction' : 'of all dissatisfaction' }}
        </q-item-section>
        <q-item-section v-else side class="text-caption text-outline">satisfaction vs. last month
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
      <div v-if="props.topType == 'satisfier'">
        No satisfied needs yet for this period.
      </div>
      <div v-else-if="props.topType == 'dissatisfier'">
        No dissatisfied needs yet for this period.
      </div>
      <div v-else>
        No needs yet for this period.
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

const isSatDissatTopItem = computed(() => props.topType === 'satisfier' || props.topType === 'dissatisfier');

// Function to get the top item for satisfaction/dissatisfaction
const getTopSatisfierOrDissatisfierItem = () => {

  const type2key = {
    satisfier: "satisfaction",
    dissatisfier: "unsatisfaction",
  };
  return ms.aggDataNeeds &&
    ms.aggDataNeeds[ms.activeDateRange] &&
    ms.aggDataNeeds[ms.activeDateRange][type2key[props.topType]] &&
    ms.aggDataNeeds[ms.activeDateRange][type2key[props.topType]][0];
}

// Function to calculate the top gainer/loser array
const getTopGainerOrLoserItem = () => {
  if (!ms.aggDataNeeds || !ms.aggDataNeeds[ms.activeDateRange] || !ms.aggDataNeeds[ms.prevDateRange]) {
    return null;
  }
  let topGainerArrayNow = ms.aggDataNeeds[ms.activeDateRange].importance.map(item => ({
    needName: item.needName,
    occurrenceCountNow: item.occurrenceCount,
    differenceNow: item.satisfactionImpactLabelValue - item.unsatisfactionImpactLabelValue
  }));

  let topGainerArrayPrev = ms.aggDataNeeds[ms.prevDateRange].importance.map(item => ({
    needName: item.needName,
    occurrenceCountPrev: item.occurrenceCount,
    differencePrev: item.satisfactionImpactLabelValue - item.unsatisfactionImpactLabelValue
  }));

  let topGainerArray = topGainerArrayNow.map(nowItem => {
    let prevItem = topGainerArrayPrev.find(prev => prev.needName === nowItem.needName);
    return {
      needName: nowItem.needName,
      occurrenceCount: nowItem.occurrenceCountNow,
      occurrenceCountPrev: prevItem ? prevItem.occurrenceCountPrev : 0,
      difference: nowItem.differenceNow - (prevItem ? prevItem.differencePrev : 0)
    };
  });

  // Sort by the difference
  topGainerArray.sort((a, b) => b.difference - a.difference);

  if (topGainerArray.length > 0) {
    if (props.topType === 'gainer' && topGainerArray[0].difference > 0) {
      return topGainerArray[0];
    } else if (props.topType === 'loser' && topGainerArray[topGainerArray.length - 1].difference < 0) {
      return topGainerArray[topGainerArray.length - 1];
    }
  }
  return null;
}

// Computed property to get the top item
const topItem = computed(() => {
  if (isSatDissatTopItem.value) {
    return getTopSatisfierOrDissatisfierItem();
  } else {
    return getTopGainerOrLoserItem();
  }
});
</script >

<style lang="scss"></style>



