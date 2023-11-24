<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue';
import { useMomentsStore } from './stores/moments.js';

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

<style lang="scss">
.slide-in-enter-active,
.slide-in-leave-active,
.slide-out-enter-active {
  // transition: transform 0.5s ease-out;
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  position: absolute;
  // top: 0;
  // left: 0;
  // width: 100%;
}

.slide-out-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  position: absolute;
  z-index: 100 !important;
}

.slide-in-enter-from {
  transform: translateX(100%);
}

// .slide-in-enter-to {
// }

// .slide-in-leave-from {
// }

.slide-in-leave-to {
  transform: translateX(-20%);
}

// .slide-out-leave-from {
// }

.slide-out-leave-to {
  transform: translateX(100%);

}

.slide-out-enter-from {
  transform: translateX(-20%);
}

// .slide-out-enter-to {
// }
</style>
