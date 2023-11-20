<template>
  <router-view v-slot="{ Component }">
    <!-- <router-view v-slot="{ Component, route }"> -->
    <!-- <transition :name="route.meta.transition"> -->
    <component :is="Component" />
    <!-- </transition> -->
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue';
import { useMomentsStore } from './stores/moments.js';

//TODO:5 is this needed to fetchUser here and more generally do stuff here?
const momentsStore = useMomentsStore()

onMounted(async () => {
  try {
    if (!momentsStore.userFetched) {
      await momentsStore.fetchUser();
    }
  } catch (error) {
    console.error('In App.vue momentsStore.fetchUser() error:', error);
  }
})
</script>

<!-- <style lang="scss">
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 1.5s;
}

.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(-100%);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style> -->
