<template>
  <q-layout view="hHh lpr fFf" class="bg-background">
    <q-header class="bg-background">
      <!-- reveal :reveal-offset="150" -->
      <q-toolbar class="text-on-surface q-pl-xs q-mx-auto" style="max-width: 600px">
        <q-btn data-cy="go-back-button" flat round icon="r_arrow_back" @click="goBack" />
        <!-- <q-toolbar-title class="absolute-center">{{ title }}</q-toolbar-title> -->
      </q-toolbar>
      <q-toolbar v-if="ms.dateRangeButtonLabel" class="q-mx-auto q-pb-sm q-pl-md"
        style="max-width: 600px; min-height:0px;">
        <q-btn unelevated rounded no-caps class="q-py-none text-subtitle2 bg-surface text-on-surface"
          icon-right="r_expand_more" @click="filterDialogOpened = true">{{ ms.dateRangeButtonLabel }}</q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <!-- v-touch-swipe.mouse.right="(event) => { goBack() }" -->
        <component :is="Component" />
      </router-view>
    </q-page-container>

    <date-picker-modal v-model="filterDialogOpened" />

  </q-layout>
</template>

<script setup>
import { useMomentsStore } from './../stores/moments.js'
import { useRouter } from 'vue-router'
import datePickerModal from "./../components/datePickerModal.vue";
import { ref } from 'vue'

// const props = defineProps({
//   title: {
//     type: String,
//     default: '',
//   }
// });
const ms = useMomentsStore()
const router = useRouter()

const filterDialogOpened = ref(false)

const goBack = async () => {
  if (window.history.length > 1) {
    // console.log('In goBack, history.length:', window.history.length)
    router.go(-1) // Go back to the previous page if there's a history
  } else {
    // console.log('In goBack, history.length:', window.history.length, "going to home")
    router.push({ path: '/' }) // Redirect to root if there's no history
  }
}

</script>

<style lang="scss"></style>
