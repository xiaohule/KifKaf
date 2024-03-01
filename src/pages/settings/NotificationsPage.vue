<!-- src/pages/settings/NotificationsPage.vue -->
<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px;">

    <div class="text-h4 text-weight-bold q-mx-none q-mb-sm"> {{ t('notificationSettings') }}</div>

    <q-list>
      <q-item tag="label" class="q-px-none q-pt-xl q-pb-lg" v-ripple="false">
        <q-item-section>
          <q-item-label class="text-h5 text-weight-medium q-pb-sm">{{ t('journalNotifs') }}</q-item-label>
          <q-item-label class="text-outline text-subtitle1">{{ t('journalNotifsText') }}</q-item-label>
        </q-item-section>
        <q-item-section side style="align-items: flex-end;">
          <q-toggle color="scrim" size="lg" v-model="journalNotifs" val="battery" />
          <q-input v-model="journalNotifsTime" filled bg-color="black" type="time" color="transparent"
            input-class="text-surface text-body1 text-weight-medium" />
        </q-item-section>
      </q-item>

      <q-item tag="label" class="q-px-none" v-ripple="false">
        <q-item-section>
          <q-item-label class="text-h5 text-weight-medium  q-pb-sm">{{ t('insightsNotifs') }}</q-item-label>
          <q-item-label class="text-outline  text-subtitle1">{{ t('insightsNotifsText') }}</q-item-label>
        </q-item-section>
        <q-item-section side style="align-items: center;">
          <q-toggle color="scrim" size="lg" v-model="insightsNotifs" val="battery" />
        </q-item-section>
      </q-item>
    </q-list>

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
import { ref, onMounted, watch } from 'vue';
import { useMomentsStore } from 'src/stores/moments';
import { useI18n } from 'vue-i18n';
import { PushNotifications } from '@capacitor/push-notifications';
import { onBeforeRouteLeave } from 'vue-router';
import { useDateUtils } from "src/composables/dateUtils.js";

const ms = useMomentsStore();
const { t } = useI18n();
const {
  currentHHmmRoundedTo15,
} = useDateUtils();

const journalNotifs = ref(false);
const journalNotifsTime = ref(currentHHmmRoundedTo15.value);
const insightsNotifs = ref(false);
const refsInitialized = ref(false);
const errorDialogOpened = ref(false)
const errorDialogOpenedOnce = ref(false)

onMounted(async () => {
  if (!ms.userFetched) {
    await ms.fetchUser();
  }
})

watch(() => ms.userDoc, async (newVal) => {
  if (newVal) {
    if (ms.userDoc?.journalNotifs) {
      journalNotifs.value = ms.userDoc.journalNotifs;
    }
    if (ms.userDoc?.insightsNotifs) {
      insightsNotifs.value = ms.userDoc.insightsNotifs;
    }
    if (ms.userDoc?.journalNotifsTime) {
      journalNotifsTime.value = ms.userDoc.journalNotifsTime;
    }
    refsInitialized.value = true;
  }
}, { immediate: true })

watch(journalNotifsTime, (newVal) => {
  if (refsInitialized.value && newVal) {
    journalNotifs.value = true;
  }
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

onBeforeRouteLeave(async (to, from) => {
  if (journalNotifs.value || insightsNotifs.value) {
    try {
      await registerNotifications();
    } catch (error) {
      console.error('In NotificationsPage, registerNotifications error:', error);
      if (!errorDialogOpenedOnce.value) {
        errorDialogOpened.value = true;
        errorDialogOpenedOnce.value = true;
        return false;
      }
    }
  }
  await ms.setUserDocValue({ journalNotifs: journalNotifs.value, journalNotifsTime: journalNotifsTime.value, insightsNotifs: insightsNotifs.value });
})
</script>

<style  lang="scss">
.q-field--filled .q-field__control {
  border-radius: 440px;
  padding: 0 20px;
}
</style>

