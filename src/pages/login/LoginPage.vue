<template>
  <q-page class="q-mx-auto q-px-md" style="max-width: 600px">
    <div class="column justify-around q-pt-md q-pb-xl" style="min-height: 30vh; ">
      <div class="col self-center q-pb-xl">
        <img src="/icon-logotype.png" style="width: 150px;">
      </div>
      <!-- style="padding-left: 15vw;" -->
      <div class="col self-center q-px-md text-h5 text-outline-dark text-weight-regular text-center"
        v-html="t('valuePropHtml')" style="line-height: 1.3; letter-spacing: 0.01em;"></div>
    </div>

    <!-- <div class="text-caption text-outline q-mx-sm q-my-md">{{ t('byContinuingText') }}
      <a data-cy="terms-link" href="/#/terms" class="text-primary" style="text-decoration: none">{{ t('tos') }}</a> {{ " "
        + t('and') + " " }}
      <a data-cy="privacy-policy-link" href="/#/privacy-policy" class="text-primary" style="text-decoration: none;">{{
        t('privacyPolicy') }}</a>.
    </div> -->

    <q-footer class="q-mx-auto bg-transparent q-px-md q-pb-xl" style="max-width: 600px">
      <div class="col self-center q-pt-xl">
        <q-btn rounded unelevated color="on-primary" text-color="scrim" :label="t('continueWithApple')"
          @click="continueWithApple()" class="text-subtitle1 text-weight-medium full-width q-ma-sm" style="height: 56px;"
          no-caps icon="fa-brands fa-apple" />

        <q-btn rounded unelevated color="on-primary" text-color="scrim" @click="continueWithGoogle()"
          class="text-subtitle1 text-weight-medium full-width q-ma-sm" style="height: 56px;" no-caps>
          <template v-slot:default>
            <img style="width: 24px; height: 24px; margin-right: 12px;" src="~assets/sign_in_icon_google_light_normal.svg"
              alt="Google">
            {{ t('continueWithGoogle') }} </template>
        </q-btn>

        <q-btn data-cy="continue-email-button" rounded unelevated color="on-primary" text-color="scrim"
          :label="t('continueWithEmail')" @click="() => router.push('/login/email')"
          class="text-subtitle1 text-weight-medium full-width q-ma-sm" style="height: 56px;" no-caps icon="r_mail" />

        <div class="text-caption text-outline q-mx-sm q-my-md">{{ t('byContinuingText') }}
          <a data-cy="terms-link" href="/#/terms" class="text-primary" style="text-decoration: none">{{ t('tos') }}</a> {{
            " "
            + t('and') + " " }}
          <a data-cy="privacy-policy-link" href="/#/privacy-policy" class="text-primary" style="text-decoration: none;">{{
            t('privacyPolicy') }}</a>.
        </div>

        <div class="or-separator q-my-md">
          <div class="line"></div>
          <div class="or-text text-subtitle2 text-outline q-px-sm">{{ t('or') }}</div>
          <div class="line"></div>
        </div>

        <div data-cy="contact-link" class="q-ma-sm text-center"><a class="text-subtitle2 text-outline" href="/#/contact"
            style="text-decoration: none">{{ t('contactUs') }}</a>
        </div>

      </div>

    </q-footer>


    <q-dialog v-model="errorDialogOpened" position="bottom" style="max-width: 600px">
      <q-card class="bg-background q-pa-lg text-center" flat
        v-touch-swipe.mouse.down="(event) => { errorDialogOpened = false }">
        <q-icon name="error_outline" size="10vh" color="error" class="q-py-md" />
        <q-card-section class="text-h5 text-weight-medium q-py-md">{{ errorDialogText }}
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useMomentsStore } from '../../stores/moments.js'
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { currentUser } from "../../boot/firebaseBoot.js";
import { useVerifiedUserRedirectUtils } from 'src/composables/verifiedUserRedirectUtils';
import { signInWithGoogle, signInWithApple } from '../../composables/signInWith.js';

const ms = useMomentsStore()
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { stopUserVerificationCheck } = useVerifiedUserRedirectUtils(currentUser, route.query.redirect || '/');

const errorDialogOpened = ref(false)
const errorDialogText = ref('')

const isOffline = () => {
  if (!navigator?.onLine) {
    errorDialogText.value = `You are offline. Please connect to the internet to sign in.`
    errorDialogOpened.value = true
    return true
  }
  else return false
}

const continueWithGoogle = async () => {
  if (isOffline()) return
  try {
    await signInWithGoogle();
  } catch (error) {
    console.error(error);
  }
}

const continueWithApple = async () => {
  if (isOffline()) return
  try {
    const authorizationCode = await signInWithApple();
    await ms.setUserDocValue({ authorizationCode })
  } catch (error) {
    console.error(error);
  }
}

onUnmounted(() => {
  stopUserVerificationCheck();
});
</script>
