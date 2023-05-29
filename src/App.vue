<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue';
import { useMomentsStore } from './stores/moments.js';
import { getCurrentUser } from "vuefire";

const momentsStore = useMomentsStore()

onMounted(async () => {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    await momentsStore.fetchMoments();
  }

})

</script>
