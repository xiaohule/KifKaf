<template>
  <q-layout view="hHh lpr fFf" class="bg-primary">

    <q-page-container>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </q-page-container>

  </q-layout>
</template>

<script setup>
</script>

<style scoped lang="scss">
.q-page-container {
  padding-top: 0px !important;
}
</style>


