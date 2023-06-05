<template>
  <!-- <transition appear enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight"> -->

  <q-layout view="hHh lpr fFf" class="bg-grey-4">

    <q-header class="bg-transparent" bordered reveal>
      <q-toolbar class="text-dark">
        <q-btn flat round icon="arrow_back" @click="goBack" />
        <q-toolbar-title class="absolute-center">Settings</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <!-- <keep-alive> -->
        <!-- mode="out-in" -->
        <!-- <transition appear enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight"> -->
        <!-- <transition name="slide-fade"> -->
        <component :is="Component" />
        <!-- </keep-alive> -->
        <!-- </transition> -->

      </router-view>
    </q-page-container>

    <q-footer class="bg-transparent" bordered>
    </q-footer>

  </q-layout>
  <!-- </transition> -->
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => {
  router.go(-1)
}

// onBeforeRouteLeave((to, from, next) => {
//   // if (from.name === 'settings') {
//   //   return false
//   // }
//   // Start the leaving transition
//   // startLeavingTransition()

//   // Wait for the transition to complete before navigating
//   setTimeout(() => {
//     next()
//   }, 300) // Adjust this value to match the duration of your transition
// })
</script>

<style lang="scss">
.q-header,
.q-footer {
  backdrop-filter: blur(25px);
}

// .slideInRight {
//   animation-duration: 1.3s;
// }

// .slideOutRight {
//   animation-duration: 1.3s;
// }

/*
  Enter and leave animations can use different
  durations and timing functions.
*/
// .slide-fade-enter-active {
//   transition: all 0.3s ease-out;
// }

// .slide-fade-leave-active {
//   transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
// }

// .slide-fade-enter-from,
// .slide-fade-leave-to {
//   transform: translateX(20px);
//   opacity: 0;
// }
</style>


