<!-- src/layouts/GoBackTitleLayout.vue -->
<template>
  <q-layout view="hHh lpr fFf" class="bg-background">
    <q-header class="bg-transparent">
      <!-- reveal :reveal-offset="150" -->
      <q-toolbar class="text-on-surface q-pl-xs q-mx-auto toolbar-blurred" style="max-width: 600px;overflow: hidden;">
        <q-btn data-cy="go-back-button" flat round icon="r_arrow_back" @click="goBack" />
        <!-- <q-toolbar-title class="absolute-center">{{ title }}</q-toolbar-title> -->
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <component :is="Component" v-touch-swipe.mouse.right="(event) => { goBack() }" />
      </router-view>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'

// const props = defineProps({
//   title: {
//     type: String,
//     default: '',
//   }
// });
const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    // console.log('In goBack, history.length:', window.history.length)
    router.go(-1) // Go back to the previous page if there's a history
  } else {
    // console.log('In goBack, history.length:', window.history.length, "going to home")
    router.push({ path: '/' }) // Redirect to root if there's no history
  }
}

</script>

<style lang="scss">
.toolbar-blurred {
  backdrop-filter: blur(30px);
}
</style>
