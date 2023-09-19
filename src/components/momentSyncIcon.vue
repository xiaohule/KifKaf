<template >
  <q-icon v-if="moment?.needsSatisAndImp && Object.keys(moment?.needsSatisAndImp).length > 0" size="20px" color="primary"
    name="check_circle" class="q-mx-md" />

  <q-icon v-else-if="moment?.date?.seconds && (moment?.date?.seconds > (currentTime - expectedLlmCallDuration))"
    size="20px" class="q-mx-md">
    <q-circular-progress :value="(currentTime - moment?.date?.seconds) * (100 / expectedLlmCallDuration)" size="20px"
      color="primary" track-color="primary-container" rounded class="position-absolute centered" />
    <q-spinner-puff color="primary" size="20px" class="position-absolute centered" />
  </q-icon>

  <q-icon v-else size="20px" color="error-dark" name="error" class="q-mx-md" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { useMomentsStore } from './../stores/moments.js'

const props = defineProps({
  momentId: {
    required: true,
    type: String
  },
  expectedLlmCallDuration: {
    required: true,
    type: Number,
    default: 40
  },
});

const momentsStore = useMomentsStore()
const moment = ref(null)
const currentTime = ref(Timestamp.now().seconds);
let timeInterval;

onMounted(async () => {
  momentsStore.getMomentById(props.momentId, moment);
});

onMounted(() => {
  // Update the currentTime every second
  timeInterval = setInterval(() => {
    currentTime.value = Timestamp.now().seconds;
  }, 1000);
});

onBeforeUnmount(() => {
  if (timeInterval) clearInterval(timeInterval);
});

</script>

<style scoped>
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
