<template >
  <!-- <div class="position-relative"> -->
  <q-icon size="20px" class="q-mx-md">
    <q-circular-progress :value="progressValue" size="20px" color="primary" track-color="primary-container" rounded
      class="position-absolute centered" />
    <q-spinner-puff color="primary" size="20px" class="position-absolute centered" />
  </q-icon>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  expectedDuration: {
    type: Number,
    default: 40,
  },
})
const progressValue = ref(0);
let progressInterval;

onMounted(() => {
  progressInterval = setInterval(() => {
    if (progressValue.value < 100) {
      progressValue.value += 100 / props.expectedDuration; // Increment to reach 100 in props.expectedDuration seconds
    } else {
      clearInterval(progressInterval); // Stop the interval once 100 is reached
    }
  }, 1000); // Runs every second
})

onBeforeUnmount(() => {
  // Clear progress interval
  if (progressInterval) {
    clearInterval(progressInterval);
  }
});

</script>

<style scoped>
.position-relative {
  position: relative;
  width: 20px;
  height: 20px;
}

.position-absolute {
  position: absolute;
  top: 0;
  left: 0;
}

.centered {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
