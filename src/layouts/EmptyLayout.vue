<template>
  <q-layout view="hHh lpr fFf" class="bg-grey-4">

    <q-header class="bg-transparent" bordered reveal>
      <q-toolbar class="text-dark">
        <q-toolbar-title>KifKaf</q-toolbar-title>
        <!-- TODO: faire back button -->
        <!-- <router-link to="/profile">
          <q-avatar><img src="https://cdn.quasar.dev/img/avatar.png"></q-avatar>
        </router-link> -->
      </q-toolbar>
    </q-header>

    <q-page-container>
      <!-- ROUTING -->
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
.q-header {
  backdrop-filter: blur(25px);
}
</style>


