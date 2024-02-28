<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px;">

    <div class="text-h4 text-weight-bold q-mx-none q-mb-sm"> {{ t('getRemindersToMake') }}</div>

    <q-list>
      <q-item tag="label" class="q-px-none q-pt-xl q-pb-lg" v-ripple="false">
        <q-item-section>
          <q-item-label class="text-h5 text-weight-medium q-pb-sm">{{ t('journalingNotif') }}</q-item-label>
          <q-item-label class="text-outline text-subtitle1">{{ t('journalingNotifText') }}</q-item-label>
        </q-item-section>
        <q-item-section side style="align-items: flex-end;">
          <q-toggle color="scrim" size="lg" v-model="journalNotifs" val="battery" />
          <q-input v-model="journalNotifsTime" filled bg-color="black" type="time" color="transparent"
            input-class="text-surface text-body1 text-weight-medium" />
        </q-item-section>
      </q-item>

      <q-item tag="label" class="q-px-none" v-ripple="false">
        <q-item-section>
          <q-item-label class="text-h5 text-weight-medium  q-pb-sm">{{ t('insightsNotif') }}</q-item-label>
          <q-item-label class="text-outline  text-subtitle1">{{ t('insightsNotifText') }}</q-item-label>
        </q-item-section>
        <q-item-section side style="align-items: center;">
          <q-toggle color="scrim" size="lg" v-model="insightsNotifs" val="battery" />
          <!-- <q-input v-model="insightsNotifsTime" filled bg-color="black" type="time" color="transparent"
            input-class="text-surface text-body1 text-weight-medium" /> -->
        </q-item-section>
      </q-item>
    </q-list>

    <div class="fixed-button column items-center">
      <div class="col pill-shape">
        <q-btn data-cy="next-button-3" :disable="!journalNotifs && !insightsNotifs" rounded color="scrim" padding="md xl"
          :label="t('next')" @click="clickedNext" class="text-subtitle1 text-weight-medium" no-caps />
      </div>
      <div class="col">
        <q-btn flat padding="lg xl" :label="t('maybeLater')"
          @click="() => { logEvent('tutorial_complete', { tutorial_type: 'onboarding' }); router.push('/welcome') }"
          class="text-outline " no-caps />
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { onUnmounted, ref } from 'vue';
import { useMomentsStore } from 'src/stores/moments';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { currentUser, logEvent } from "../boot/firebaseBoot.js";
import { useVerifiedUserRedirectUtils } from 'src/composables/verifiedUserRedirectUtils';
import { PushNotifications } from '@capacitor/push-notifications';
import { useDateUtils } from "../composables/dateUtils.js";
import { watch } from 'vue';

const ms = useMomentsStore();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { stopUserVerificationCheck } = useVerifiedUserRedirectUtils(currentUser, route.query.redirect || '/');
const {
  currentHHmmRoundedTo15
} = useDateUtils();

const journalNotifs = ref(true);
const insightsNotifs = ref(true);
const journalNotifsTime = ref(currentHHmmRoundedTo15.value);

watch(journalNotifsTime, (newVal) => {
  journalNotifs.value = true;
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
  console.log("In NotificationsSettingPage, clickedNext");

  ms.notifs = { journalNotifs: journalNotifs.value, journalNotifsTime: journalNotifsTime.value, insightsNotifs: insightsNotifs.value };

  await registerNotifications();

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

