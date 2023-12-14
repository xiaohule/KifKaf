<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event.target)" position="bottom"
    style="max-width: 600px">
    <q-card class="bg-background q-px-sm" flat v-touch-swipe.mouse.down="(event) => { needsInfoOpened = false }">

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

      <q-card-section class="q-pt-lg text-body1 text-weight-regular">{{ whyText }}</q-card-section>

      <q-card-actions align="center">
        <q-btn rounded color="primary" padding="md md" @click="(event) => { $emit('update:modelValue', false) }" class="text-body1 text-weight-medium
q-ma-sm q-mb-lg full-width" no-caps>Got it</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { watch, ref, watchEffect, computed } from 'vue';
import { useMomentsStore } from './../stores/moments.js'
import { inspirationalQuotes } from "../utils/quoteUtils.js";

const ms = useMomentsStore()
// const modalTitle = ref("")
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
      return "Why am I seeing this quote?";
    case "book":
      return "Why am I seeing this book recommendation?";
    default:
      return "Why am I seeing this?";
  }
});

watch(() => ms.userDoc, async (newVal) => {
  if (newVal) {
    placeholderQuoteOfTheDayId.value = await ms.getPlaceholderQuoteOfTheDayId()
  }
}, { immediate: true })

function getOriginalTextBySection(section, insight) {
  switch (section) {
    case "quote":
      return insight.text;
    case "book":
      return insight.title;
    default:
      return "";
  }
}

watchEffect(() => {
  const insight = ms.aggDataInsights[ms.activeDateRange]?.[props.section];

  if (insight) {
    originalText.value = getOriginalTextBySection(props.section, insight);
    author.value = insight.author ?? "";
    whyText.value = insight.why;
  }
  else if (props.section === "quote" && placeholderQuoteOfTheDayId.value !== "") {
    originalText.value = inspirationalQuotes[placeholderQuoteOfTheDayId.value]?.quote
    author.value = inspirationalQuotes[placeholderQuoteOfTheDayId.value]?.author
    whyText.value = "👉 This was a random quote, log 3 more Moments to see personalized quotes inspired by your Moments.";
  }
});

</script>
<style lang="scss"></style>



