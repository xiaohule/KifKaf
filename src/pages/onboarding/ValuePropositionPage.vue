<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px;">

    <div class="column justify-between" style="padding-top: 15vh; min-height: 50vh; ">
      <div class="col self-center q-pb-md">
        <img src="~assets/icon-logotype.webp" style="height: 150px;">
      </div>
      <div class="col self-start q-pt-xl q-px-md text-h4 text-outline-dark text-weight-regular"
        style="line-height: 1.3; letter-spacing: 0.01em;" v-html="t('valuePropHtml')">
      </div>
    </div>

    <div class="fixed-button pill-shape">
      <q-btn data-cy="next-button-1" rounded color="scrim" padding="md xl" :label="t('next')"
        @click="() => router.push('/onboarding/2')" class="text-subtitle1 text-weight-medium" no-caps />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { logEvent } from "src/boot/firebaseBoot.js";

const { t } = useI18n();
const router = useRouter();

onMounted(() => {
  logEvent("tutorial_begin", { tutorial_type: "onboarding" });
})

</script>
