<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event.target)" position="bottom"
    style="max-width: 600px">
    <q-card class="bg-background q-px-sm" flat v-touch-swipe.mouse.down="(event) => { needsInfoOpened = false }">

      <q-card-section><span>{{ originalText
      }}</span> </q-card-section>
      <q-card-section><span class="text-caption text-outline">by {{
        author }}</span>
      </q-card-section>

      <q-card-section class="text-h6 text-weight-medium">{{ modalTitle }}</q-card-section>

      <q-card-section class="q-py-xs text-outline">{{ whyText }}</q-card-section>

      <q-card-actions align="center">
        <q-btn rounded color="primary" padding="md md" @click="(event) => { $emit('update:modelValue', false) }" class="text-body1 text-weight-medium
q-ma-sm q-mb-lg full-width" no-caps>Got it</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { watch, ref } from 'vue';
import { useMomentsStore } from './../stores/moments.js'

const ms = useMomentsStore()
const whyText = ref("")
const modalTitle = ref("")
const originalText = ref("")
const author = ref("")

const props = defineProps({
  modelValue: {
    required: true,
    type: Boolean,
    default: false,
  },
  section: {
    required: true,
    type: String,
  },
});
const emits = defineEmits(['update:modelValue']);

watch(() => props.section, (newVal) => {
  if (newVal) {
    whyText.value = ms.aggDataInsights[ms.activeDateRange][newVal].why;
    author.value = ms.aggDataInsights[ms.activeDateRange][newVal].author;

    if (newVal === "quote") {
      modalTitle.value = "Why did we pick this quote?";
      originalText.value = ms.aggDataInsights[ms.activeDateRange][newVal].text
    } else if (newVal === "book") {
      modalTitle.value = "Why did we pick this book?";
      originalText.value = ms.aggDataInsights[ms.activeDateRange][newVal].title
    }
  }

}, { immediate: true })

</script>
<style lang="scss"></style>



