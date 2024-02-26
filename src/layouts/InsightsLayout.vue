<template>
  <q-layout view="hHh lpr fFf" class="bg-background">

    <!-- bg-transparent bordered reveal :reveal-offset="150" -->
    <q-header class="bg-background">
      <!-- toolbar-blurred -->
      <q-toolbar class="q-mx-auto q-pr-xs" style="max-width: 600px">
        <q-avatar size="sm" square @click="router.push('/')">
          <img src="~assets/icon-kifkaf-no-background.svg" />
        </q-avatar>
        <q-toolbar-title class="text-on-surface text-center text-subtitle1 text-weight-medium
">{{ t(tab) }}</q-toolbar-title>
        <router-link to="/settings" style="text-decoration: none;">
          <q-btn flat round dense icon="account_circle" size="20px" class="text-on-surface">
          </q-btn>
        </router-link>

      </q-toolbar>
      <q-toolbar v-if="getDatePickerLabel(ms.getActiveDateRange, t)" class="q-mx-auto q-pb-sm"
        style="max-width: 600px; min-height:0px;">

        <q-btn unelevated rounded no-caps class="q-py-none text-subtitle2 bg-surface text-on-surface"
          icon-right="r_expand_more" @click="filterDialogOpened = true">{{ getDatePickerLabel(ms.getActiveDateRange, t)
          }}</q-btn>
      </q-toolbar>
    </q-header>

    <!-- TODO:1 set max-width direclty here an not in pages -->
    <q-page-container>
      <router-view v-slot="{ Component }">
        <!-- <keep-alive :include="['InsightsLayout', 'InsightsTab']"> -->
        <component :is="Component" />
        <!-- </keep-alive> -->
      </router-view>
    </q-page-container>

    <q-footer class="bg-transparent footer-blurred" bordered>
      <q-tabs no-caps v-model="tab" align="justify" indicator-color="transparent" active-color="primary"
        class="text-secondary q-mx-auto" style="max-width: 600px;" :breakpoint="0">
        <q-route-tab name="home" icon="r_edit" :label="t('home')" to="/" class="q-pt-xs q-pb-lg"
          data-cy="insights-home-tab" :ripple="false" />
        <q-route-tab name="insights" icon="r_insights" :label="t('insights')" to="/insights" class="q-pt-xs q-pb-lg"
          @click="handleInsightsClick" data-cy="insights-insights-tab" :ripple="false">
          <q-badge v-show="ms?.userDoc?.showInsightsBadge" color="red" rounded floating />
        </q-route-tab>
      </q-tabs>
    </q-footer>

    <date-picker-modal v-model="filterDialogOpened" />
  </q-layout>
</template>

<script setup>
/*The reason why using {} allows you to call the ref function directly is because it is a named import.
When you use named imports, you can import only the specific functions or objects that you need from a module.
This makes your code more efficient and easier to read. The behavior of using named imports is called destructuring.*/
/*When you use “import { ref } from ‘vue’”, you can use the ref function directly in your code, like this: const count = ref(0).
 When you use “import ref from ‘vue’”, you need to call the function like this: const count = ref.ref(0)*/
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from "vue-i18n"
import datePickerModal from "./../components/datePickerModal.vue";
import { useDateUtils } from '../composables/dateUtils.js'

const router = useRouter()
const ms = useMomentsStore()
const { t } = useI18n()
const { getDatePickerLabel } = useDateUtils()

const tab = ref('insights')
const filterDialogOpened = ref(false)

//reset swiper position to latest month/year when clicking on insights tab
const handleInsightsClick = () => {
  if (router.currentRoute.value.path === '/insights') {
    ms.resetToCurrentMonth()
    if (ms.userDoc?.showInsightsBadge) {
      //wait few seconds and hide badge
      setTimeout(() => {
        ms.setUserDocValue({ showInsightsBadge: false })
      }, 1500)
    }
  }
}
</script>

<style lang="scss">
.toolbar-blurred,
.footer-blurred {
  backdrop-filter: blur(30px);
}
</style>


