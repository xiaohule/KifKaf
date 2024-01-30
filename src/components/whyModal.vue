<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event.target)" position="bottom"
    style="max-width: 600px">
    <q-card class="bg-background q-px-sm" flat
      v-touch-swipe.mouse.down="(event) => { $emit('update:modelValue', false) }">

      <div>
        <q-card-section class="text-h6 text-weight-medium"> {{ modalTitle }}
        </q-card-section>
      </div>

      <q-item>
        <q-item-section><span>{{ originalText
        }}</span><span class="text-caption text-outline">{{ props.section === 'book' ? 'by ' : '' }}{{ author
}}</span>
        </q-item-section>
        <q-item-section side top>

          <q-icon color="on-background" name="r_format_quote" size="lg" />
        </q-item-section>
      </q-item>

      <q-card-section class="q-pt-lg text-body1 text-weight-regular">
        <div v-html="whyText"></div>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn rounded color="primary" padding="md md" @click="(event) => { $emit('update:modelValue', false) }" class="text-body1 text-weight-medium
q-ma-sm q-mb-lg full-width" no-caps>{{ t('gotIt') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { watch, ref, watchEffect, computed } from 'vue';
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from "vue-i18n"

const ms = useMomentsStore()
const { t } = useI18n()
const originalText = ref("")
const author = ref("")
const whyText = ref("")
const placeholderQuoteOfTheDayId = ref("")

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
    case "quote":
      return t('quoteWhyTitle');
    case "book":
      return t('bookWhyTitle');
    default:
      return t('whyDefaultTitle');
  }
});

watch(() => ms.userDoc, async (newVal) => {
  if (newVal) {
    placeholderQuoteOfTheDayId.value = await ms.getPlaceholderQuoteOfTheDayId(11) // t('inspirationalQuotes').length
  }
}, { immediate: true })

function getOriginalTextBySection(section, insights) {
  switch (section) {
    case "quote":
      return insights.text;
    case "book":
      return insights.title;
    default:
      return "";
  }
}

watchEffect(() => {
  const insights = ms.aggDataInsights[ms.activeDateRange]?.[props.section];

  if ((insights?.text || insights?.title) && insights.author && insights.why) {
    originalText.value = getOriginalTextBySection(props.section, insights);
    author.value = insights.author ?? "";
    whyText.value = insights.why;
  }
  else if (props.section === "quote" && placeholderQuoteOfTheDayId.value !== "") {
    originalText.value = t('inspirationalQuotes[' + placeholderQuoteOfTheDayId.value + '].quote')
    author.value = t('inspirationalQuotes[' + placeholderQuoteOfTheDayId.value + '].author')
    whyText.value = t('randomQuoteCountdown', Math.max(0, 3 -
      ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange]));
  }
});

</script>
<style lang="scss"></style>



