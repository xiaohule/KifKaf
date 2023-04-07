<template>
  <q-layout view="hHh lpr fFf" class="bg-grey-4">

    <q-header class="bg-transparent" bordered reveal>
      <q-toolbar class="text-dark">
        <q-toolbar-title>KifKaf</q-toolbar-title>
        <q-avatar><img src="https://cdn.quasar.dev/img/avatar.png"></q-avatar>
      </q-toolbar>
    </q-header>

    <!-- TODO set a smaller max-width for this for use on desktop app -->
    <!-- class="column items-center justify-center  " -->
    <q-page-container>
      <!-- ROUTING -->
      <router-view />
      <!-- IMPORT -->
      <!--  <HomeTab /> -->
    </q-page-container>

    <q-footer class="bg-transparent" bordered>
      <q-tabs v-model="tab" align="justify" indicator-color="transparent" active-color="primary" class="text-grey-8"
        :breakpoint="0">
        <q-route-tab name="home" icon="home" label="Home" to="/" />
        <q-route-tab name="learn" icon="insights" label="Learn" to="/learn" />
        <q-route-tab name="timeline" icon="view_timeline" label="Timeline" to="/timeline" />
        <q-route-tab name="search" icon="search" label="Search" to="/search" />
      </q-tabs>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
/* IF IMPORT*/
//import HomeTab from 'src/pages/HomeTab.vue';

const tab = ref('home')
</script>

<style lang="scss">
.q-header,
.q-footer {
  backdrop-filter: blur(25px);
}
</style>


