<!-- src/pages/onboarding/OnboardingNotificationsPage.vue -->
<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px;">

    <div class="text-h4 text-weight-bold q-mx-none q-mb-sm"> {{ t('getRemindersToMake') }}</div>

    <q-list>
      <q-item tag="label" class="q-px-none q-pt-xl q-pb-lg" v-ripple="false">
        <q-item-section>
          <q-item-label class="text-h5 text-weight-medium q-pb-sm">{{ t('journalNotifs') }}</q-item-label>
          <q-item-label class="text-outline text-subtitle1">{{ t('journalNotifsText') }}</q-item-label>
        </q-item-section>
        <q-item-section side style="align-items: flex-end;">
          <q-toggle color="scrim" size="lg" v-model="ms.tmpNotifs.journalNotifs" val="battery" />
          <q-input v-model="ms.tmpNotifs.journalNotifsTime" filled bg-color="black" type="time" color="transparent"
            input-class="text-surface text-body1 text-weight-medium" />
        </q-item-section>
      </q-item>

      <q-item tag="label" class="q-px-none" v-ripple="false">
        <q-item-section>
          <q-item-label class="text-h5 text-weight-medium  q-pb-sm">{{ t('insightsNotifs') }}</q-item-label>
          <q-item-label class="text-outline  text-subtitle1">{{ t('insightsNotifsText') }}</q-item-label>
        </q-item-section>
        <q-item-section side style="align-items: center;">
          <q-toggle color="scrim" size="lg" v-model="ms.tmpNotifs.insightsNotifs" val="battery" />
        </q-item-section>
      </q-item>
    </q-list>

    <div class="fixed-button column items-center">
      <div class="col pill-shape">
        <!-- :disable="!journalNotifs && !insightsNotifs" -->
        <q-btn data-cy="next-button-3" rounded color="scrim" padding="md xl" :label="t('next')" @click="clickedNext"
          class="text-subtitle1 text-weight-medium" no-caps />
      </div>
      <!-- <div class="col">
        <q-btn flat padding="lg xl" :label="t('maybeLater')"
          @click="() => { logEvent('tutorial_complete', { tutorial_type: 'onboarding' }); router.push('/welcome') }"
          class="text-outline " no-caps />
      </div> -->
    </div>

    <q-dialog v-model="errorDialogOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background q-pa-lg text-center" flat>
        <q-icon name="error_outline" size="10vh" color="error" class="q-py-md" />
        <q-card-section class="text-h6 text-weight-medium q-py-md text-left	">
          <div v-html="t('error.notificationsPermissionDeniedHtml')"></div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { onUnmounted, watch, ref } from 'vue';
import { useMomentsStore } from 'src/stores/moments';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { currentUser, logEvent } from "src/boot/firebaseBoot.js";
import { useVerifiedUserRedirectUtils } from 'src/composables/verifiedUserRedirectUtils';
import { PushNotifications } from '@capacitor/push-notifications';

const ms = useMomentsStore();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { stopUserVerificationCheck } = useVerifiedUserRedirectUtils(currentUser, route.query.redirect || '/');

const errorDialogOpened = ref(false)
const errorDialogOpenedOnce = ref(false)

watch(() => ms.tmpNotifs.journalNotifsTime, (newVal) => {
  ms.tmpNotifs.journalNotifs = true;
});

//PUSH NOTIFICATIONS
const registerNotifications = async () => {
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('User denied permissions!');
  }

  await PushNotifications.register();
}

const clickedNext = async () => {
  console.log("In OnboardingNotificationsPage, clickedNext");

  if (ms.tmpNotifs.journalNotifs || ms.tmpNotifs.insightsNotifs) {
    try {
      await registerNotifications();
    } catch (error) {
      console.error('In OnboardingNotificationsPage, registerNotifications error:', error);
      if (!errorDialogOpenedOnce.value) {
        errorDialogOpened.value = true;
        errorDialogOpenedOnce.value = true;
        return false;
      }
    }
  }
  ms.tmpNotifsUpdated = true;

  logEvent("tutorial_complete", { tutorial_type: "onboarding" });
  router.push('/welcome')
}

onUnmounted(() => {
  stopUserVerificationCheck();
});
</script>

<style  lang="scss">
.q-field--filled .q-field__control {
  border-radius: 440px;
  padding: 0 20px;
}
</style>

