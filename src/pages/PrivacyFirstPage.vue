<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px;">

    <div class="column justify-between" style="padding-top: 6vh; min-height: 50vh; ">
      <div class="col self-center q-pb-md">
        <img src="~assets/kifkaf_shield.svg" style="width: 150px;">
      </div>
      <div class="col self-start q-pt-lg q-px-md">
        <div class="text-h4 text-weight-bold q-py-sm"> {{ t('privacyFirst') }}</div>
        <div class="text-body1 text-outline q-py-sm" v-html="t('privacyFirstText')"></div>
        <q-checkbox data-cy="privacy-checkbox" v-model="ms.privacyCheckboxState" color="primary" class="q-py-md">
          <div class="q-pl-sm" @click.stop style="cursor:default;"> {{
            t('iAgreeToThe') }}
            <a data-cy="privacy-policy-link" href="/#/privacy-policy" class="text-primary"
              style="text-decoration: none;">{{ t('privacyPolicy') }}</a>
            {{ " " + t('andThe') + " " }}
            <a data-cy="terms-link" href="/#/terms" class="text-primary" style="text-decoration: none">{{
              t('tos') }}</a>.
          </div>
        </q-checkbox>

      </div>
    </div>

    <div class="fixed-button pill-shape">
      <q-btn data-cy="next-button-2" :disable="!ms.privacyCheckboxState" rounded color="scrim" padding="md xl"
        :label="t('next')" @click="clickedNext" class="text-subtitle1 text-weight-medium" no-caps />
    </div>
  </q-page>
</template>

<script setup>
import { onUnmounted, ref } from 'vue';
import { useMomentsStore } from 'src/stores/moments';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { currentUser } from "../boot/firebaseBoot.js";
import { useVerifiedUserRedirectUtils } from 'src/composables/verifiedUserRedirectUtils';

const ms = useMomentsStore();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { stopUserVerificationCheck } = useVerifiedUserRedirectUtils(currentUser, route.query.redirect || '/');

const clickedNext = () => {
  console.log("clickedNext");
  // Define consent details for privacy policy and terms of service
  const privacyPolicyConsent = {
    type: "privacyPolicy",
    version: process.env.__APP_VERSION__,
    method: "checkboxInOnboarding",
  };
  const termsOfServiceConsent = {
    type: "termsOfService",
    version: process.env.__APP_VERSION__,
    method: "checkboxInOnboarding",
  };
  ms.privacyPolicyConsent = privacyPolicyConsent;
  ms.termsOfServiceConsent = termsOfServiceConsent;

  router.push('/onboarding/3')
}

onUnmounted(() => {
  stopUserVerificationCheck();
});
</script>
