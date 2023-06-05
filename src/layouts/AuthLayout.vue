<template>
  <q-layout view="hHh lpr fFf" class="bg-grey-4">

    <q-header class="bg-transparent" bordered reveal>
      <q-toolbar class="text-dark">
        <q-toolbar-title class="absolute-center">KifKaf</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <!-- <keep-alive> -->
        <component :is="Component" />
        <!-- </keep-alive> -->
      </router-view>
    </q-page-container>

    <q-footer class="bg-transparent" bordered>
    </q-footer>

  </q-layout>
</template>

<script setup>
</script>

<style lang="scss">
.q-header,
.q-footer {
  backdrop-filter: blur(25px);
}
</style>


