<template>
  <q-layout view="hHh lpr fFf" class="bg-grey-4">

    <q-header class="bg-transparent" bordered reveal>
      <q-toolbar class="text-dark">
        <q-toolbar-title>KifKaf</q-toolbar-title>
        <!-- <router-link to="/profile">
          <q-avatar><img src="https://cdn.quasar.dev/img/avatar.png"></q-avatar>
        </router-link> -->
      </q-toolbar>
    </q-header>

    <!-- class="column items-center justify-center  " -->
    <q-page-container>
      <!-- ROUTING -->
      <router-view />
      <!-- IMPORT -->
      <!--  <HomeTab /> -->
    </q-page-container>

    <q-footer class="bg-transparent" bordered>
      <!-- <q-tabs v-model="tab" align="justify" indicator-color="transparent" active-color="primary" class="text-grey-8"
        :breakpoint="0">
        <q-route-tab name="home" icon="home" label="Home" to="/" />
        <q-route-tab name="learn" icon="insights" label="Learn" to="/learn" />
        <q-route-tab name="timeline" icon="view_timeline" label="Timeline" to="/timeline" />
        <q-route-tab name="search" icon="search" label="Search" to="/search" />
      </q-tabs> -->
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


