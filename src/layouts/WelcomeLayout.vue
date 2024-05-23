<template>
  <q-layout view="hHh lpr fFf" class="bg-background">

    <q-page-container>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </q-page-container>

  </q-layout>
</template>


