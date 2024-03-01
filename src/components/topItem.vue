<template>
  <div v-if="isSatDissatTopItem || (!isSatDissatTopItem && topItem)">
    <q-item class="q-px-none q-pb-none" style="min-height: 0px;">
      <q-item-label class="text-subtitle2 text-weight-medium text-outline">{{ t('top' + capitalize(props.topType))
      }}</q-item-label>
    </q-item>

    <q-item v-if="topItem" class="q-pb-sm q-px-none" clickable
      @click="router.push({ path: `/insights/needs/${needsMap[topItem.needName][2]}`, query: { dateRange: ms.getActiveDateRange } });">
      <q-item-section avatar class="q-pr-none" style="min-width: 52px;">
        <q-avatar size="42px" font-size="28px" :color="needToColor()[topItem.needName]">
          {{ needsMap[topItem.needName][0] }}
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item class="q-pa-none" dense style="min-height: 0px;">
          <q-item-section class="text-subtitle2 text-weight-medium">{{ t('needsList.' + topItem.needName)
          }}</q-item-section>
          <q-item-section v-if="isSatDissatTopItem" side class="text-body2 text-on-surface">{{
            parseFloat((topItem[props.topType ===
              'satisfier' ? 'satisfactionImpactLabelValue' : 'unsatisfactionImpactLabelValue'] * 100).toFixed(0)) + "%" }}
          </q-item-section>
          <q-item-section v-else side class="text-body2 text-on-surface">
            <div class="col"><q-icon size="md"
                :name="props.topType === 'gainer' ? 'r_arrow_drop_up' : 'r_arrow_drop_down'"
                :color="props.topType === 'gainer' ? 'positive' : 'negative'" style="width: 0.7em; height:0.7em;" />
              {{ parseFloat((Math.abs(topItem.difference) * 100).toFixed(0)) + "%" }}
            </div>
          </q-item-section>

        </q-item>
        <q-item class="q-pa-none" dense style="min-height: 0px;">
          <q-item-section class="text-caption text-outline">
            {{ t('moment', topItem.occurrenceCount) }}
          </q-item-section>
          <q-item-section v-if="isSatDissatTopItem" side class="text-caption text-outline">{{ props.topType ===
            'satisfier'
            ? t('ofAllSat') : t('ofAllDissat') }}
          </q-item-section>
          <q-item-section v-else side class="text-caption text-outline">{{ ms.segDateId === 'Monthly' ?
            t('satVsLastMonth') : t('satVsLastYear') }}
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
          {{ t('topSatEmpty', ms.getDateRanges.length - ms.activeIndex) }} </div>
        <div v-else-if="props.topType == 'dissatisfier'">
          {{ t('topDissatEmpty', ms.getDateRanges.length - ms.activeIndex) }} </div>
        <div v-if="props.topType == 'gainer'">
          {{ t('topGainerEmpty', ms.getDateRanges.length - ms.activeIndex) }} </div>
        <div v-else-if="props.topType == 'loser'">
          {{ t('topLoserEmpty', ms.getDateRanges.length - ms.activeIndex) }} </div>
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'
import { needsMap, needToColor } from "./../utils/needsUtils";
import { format } from 'quasar'
const { capitalize } = format

const ms = useMomentsStore()
const { t } = useI18n()
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
    ms.aggDataNeeds[ms.getActiveDateRange] &&
    ms.aggDataNeeds[ms.getActiveDateRange][type2key[props.topType]] &&
    ms.aggDataNeeds[ms.getActiveDateRange][type2key[props.topType]][0];
}

// Function to calculate the top gainer/loser array
const getTopGainerOrLoserItem = () => {
  if (!ms.aggDataNeeds || !ms.aggDataNeeds[ms.getActiveDateRange] || !ms.aggDataNeeds[ms.getPrevDateRange]) {
    return null;
  }

  // Creating a map for quick look-up of previous data by needName
  const prevDataMap = new Map(
    ms.aggDataNeeds[ms.getPrevDateRange].importance.map(item => [
      item.needName,
      {
        occurrenceCountPrev: item.occurrenceCount,
        differencePrev: item.satisfactionImpactLabelValue - item.unsatisfactionImpactLabelValue
      }
    ])
  );

  // Mapping current data and merging with previous data
  const topGainerArray = ms.aggDataNeeds[ms.getActiveDateRange].importance
    .map(item => {
      const prevData = prevDataMap.get(item.needName);
      if (!prevData) return undefined; // Skip if no previous data is found

      return {
        needName: item.needName,
        occurrenceCount: item.occurrenceCount,
        occurrenceCountPrev: prevData.occurrenceCountPrev,
        difference: (item.satisfactionImpactLabelValue - item.unsatisfactionImpactLabelValue) - prevData.differencePrev
      };
    })
    .filter(item => item) // Remove undefined entries
    .sort((a, b) => b.difference - a.difference); // Sort by the calculated difference

  if (topGainerArray.length === 0) {
    return null;
  }

  // Return the top gainer or loser based on the topType
  const topItem = props.topType === 'gainer' ? topGainerArray[0] : topGainerArray[topGainerArray.length - 1];
  // Ensure that the difference is positive for gainers and negative for losers
  if ((props.topType === 'gainer' && topItem.difference > 0.095) || (props.topType === 'loser' && topItem.difference < -0.095)) {
    return topItem;
  }

  return null;
};


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



