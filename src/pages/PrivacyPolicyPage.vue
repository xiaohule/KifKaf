<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">
    <div class="text-h4 text-weight-bold q-mx-none q-mb-sm">{{ t('privacyPolicyPage.title') }}</div>

    <q-card class="bg-surface q-pa-md rounded-borders-14" flat>
      <div v-html="t('privacyPolicyPage.contentHtml')"></div>
    </q-card>
  </q-page>
</template>

<script setup>
import { useI18n } from "vue-i18n"
const { t } = useI18n()
</script>

<style lang="scss">
h4,
h5,
h6 {
  line-height: 1.2em;
  color: #757575;
  margin: 25px 0px 10px 0px;
}

h4 {
  font-size: 1.5rem;
  margin: 15px 0px 10px 0px;
}

h5 {
  font-size: 1.25rem;
}

h6 {
  font-size: 1rem;
  // font-weight: 500;
}
</style>
