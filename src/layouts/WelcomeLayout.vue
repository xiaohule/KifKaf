<template>
  <q-layout view="hHh lpr fFf" class="bg-background">

    <q-page-container>
      <router-view v-slot="{ Component }">
        <!-- <keep-alive> -->
        <component :is="Component" />
        <!-- </keep-alive> -->
      </router-view>
    </q-page-container>

  </q-layout>
</template>

<script setup>
</script>

<style lang="scss">
.q-page-container {
  padding-top: 0px !important;
}
</style>


