<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px;">

    <div class="text-h4 text-weight-bold q-mx-none q-mb-sm"> {{ t('whatsOnYourMind') }}</div>

    <div class="text-h6 text-weight-regular text-outline q-px-lg q-py-sm text-center"> {{ t('iWantTo') }}</div>

    <q-list v-for="option in  options " :key="option.value">
      <!-- style="border: .5px solid #757780" -->
      <q-item data-cy="user-intention-item" clickable v-ripple
        class="q-my-sm q-py-md text-body1 text-weight-medium bg-surface pill-shape text-center" :class="{
          'bg-scrim': ms.userIntentionsGroup.some(item => item.startsWith(option.value))
          , 'text-surface': ms.userIntentionsGroup.some(item => item.startsWith(option.value))
        }" @click="toggleSelection(option.value)">
        <q-item-section>{{ option.label }}</q-item-section>
      </q-item>
    </q-list>
    <!-- <q-option-group v-model="group" :options="options" color="yellow" type="toggle" /> -->

    <div class="text-caption text-outline q-px-lg q-py-sm text-center"> {{ t('yourChoicesWont') }}
    </div>

    <div class="fixed-button pill-shape">
      <q-btn data-cy="next-button-3" :disable="ms.userIntentionsGroup.length === 0" rounded color="scrim" padding="md xl"
        :label="t('next')" @click="clickedNext" class="text-subtitle1 text-weight-medium" no-caps />
    </div>

    <q-dialog v-model="somethingElseDialogOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background q-pb-xl" flat v-touch-swipe.mouse.down="() => { somethingElseDialogOpened = false; }">

        <q-toolbar class="q-pa-sm"><q-btn flat v-close-popup round dense icon="r_close" /></q-toolbar>

        <div>
          <q-card-section class="text-h6 text-weight-medium q-py-none"> {{ t('somethingElse') }}
          </q-card-section>
          <q-card-section>
            <q-input ref="somethingElseInputRef" class="" color="transparent" clearable rounded outlined
              v-model="somethingElseValue" type="text" autogrow bg-color="surface-variant"
              :placeholder="t('whatDoYouHope')" />
          </q-card-section>
        </div>

        <q-card-actions align="center" class="q-mx-sm">
          <q-btn rounded :label="t('save')" color="primary" @click="updateSomethingElse" class="full-width" padding="md"
            no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>


  </q-page>
</template>

<script setup>
import { onUnmounted, ref } from 'vue';
import { useMomentsStore } from 'src/stores/moments';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { currentUser, logEvent } from "../boot/firebaseBoot.js";
import { useVerifiedUserRedirectUtils } from 'src/composables/verifiedUserRedirectUtils';

const ms = useMomentsStore();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { stopUserVerificationCheck } = useVerifiedUserRedirectUtils(currentUser, route.query.redirect || '/');

const options = [//TODO:3 //make it fully depenendent on i18n files?
  { label: t('beMoreFulFilled'), value: 'beMoreFulFilled' },
  { label: t('understandMyNeeds'), value: 'understandMyNeeds' },
  { label: t('improveRelationships'), value: 'improveRelationships' },
  { label: t('manageEmotions'), value: 'manageEmotions' },
  { label: t('keepTrackEmotions'), value: 'keepTrackEmotions' },
  { label: t('somethingElse'), value: 'somethingElse' },
];
const somethingElseDialogOpened = ref(false);
const somethingElseInputRef = ref(null);
const somethingElseValue = ref('');

const toggleSelection = (value) => {
  if (value !== 'somethingElse') {

    const index = ms.userIntentionsGroup.indexOf(value);
    if (index === -1) {
      ms.userIntentionsGroup.push(value); // Add value if not present
    } else {
      ms.userIntentionsGroup.splice(index, 1); // Remove value if present
    }
  }
  else {
    somethingElseDialogOpened.value = true;
  }

};

const updateSomethingElse = () => {
  console.log('In UserIntentionsPage > updateSomethingElse:', somethingElseValue.value);
  //if (somethingElseValue.value), remove any element in ms.userIntentionsGroup that startsWith somethingElse and push 'somethingElse:'+somethingElseValue.value
  if (somethingElseValue.value) {
    ms.userIntentionsGroup = ms.userIntentionsGroup.filter(item => !item.startsWith('somethingElse'));
    ms.userIntentionsGroup.push('somethingElse:' + somethingElseValue.value);
  }
  //else,  remove any element in ms.userIntentionsGroup that startsWith somethingElse
  else {
    ms.userIntentionsGroup = ms.userIntentionsGroup.filter(item => !item.startsWith('somethingElse'));
  }
  somethingElseDialogOpened.value = false;
};

const clickedNext = () => {
  console.log("In userIntentionPage, clickedNext");
  logEvent("tutorial_complete", { tutorial_type: "onboarding" });

  router.push('/welcome')
}

onUnmounted(() => {
  stopUserVerificationCheck();
});
</script>
