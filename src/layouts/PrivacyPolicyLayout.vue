<template>
  <q-layout view="hHh lpr fFf" class="bg-background">

    <q-header class="bg-transparent" bordered reveal>
      <q-toolbar class="text-on-surface">
        <q-btn flat round icon="arrow_back" @click="goBack" />
        <q-toolbar-title class="absolute-center">Privacy Policy</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </q-page-container>

    <q-footer class="bg-transparent" bordered>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => {
  router.go(-1)
}
</script>

<style lang="scss">
.q-header,
.q-footer {
  backdrop-filter: blur(25px);
}
</style>


