<template>
  <div v-if="moment">
    <q-icon v-if="iconToDisplay === 'needsAnalyzedWithOops'" size="20px" color="error-dark" name="error"
      class="q-mx-md" />

    <!--TODO:2 could be main needs emoji or r_arrow_circle_up cloud_done ou cloud_upload-->
    <q-icon v-else-if="iconToDisplay === 'needsAnalyzedWithSuccess'" size="20px" color="primary" name="check_circle"
      class="q-mx-md" />

    <q-icon v-else-if="iconToDisplay === 'needsNonAnalyzedAndOffline'" size="20px" color="outline-variant"
      name="cloud_off" class="q-mx-md" />

    <q-icon v-else-if="iconToDisplay === 'analyzingNeeds'" size="20px" class="q-mx-md">
      <q-circular-progress :value="timeSinceLastTouch * (100 / props.expectedLlmCallDuration)" size="20px" color="primary"
        track-color="primary-container" rounded class="position-absolute centered" />
      <q-spinner-puff color="primary" size="20px" class="position-absolute centered" />
    </q-icon>

    <q-icon v-else size="20px" color="error-dark" name="error" class="q-mx-md" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, computed, watch, onMounted } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { useMomentsStore } from './../stores/moments.js'

const ms = useMomentsStore()

const props = defineProps({
  momentId: {
    required: true,
    type: String
  },
  expectedLlmCallDuration: {
    required: false,
    type: Number,
    default: 30
  },
});

const moment = ref(null)
const isOnline = ref(navigator.onLine);
const timeInterval = ref(null);
const timeSinceLastTouch = ref(0);

ms.getMomentById(props.momentId, moment);

// Update the isOnline ref when the network status changes
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

const clearTimeInterval = () => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value);
    timeInterval.value = null;
  }
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

watch(() => moment.value, (newVal, oldVal) => {
  clearTimeInterval();
  if (newVal && !(Object.keys(newVal.needs).length > 0) && (newVal.lastTouch?.seconds !== oldVal?.lastTouch?.seconds)) {
    timeSinceLastTouch.value = Timestamp.now().seconds - newVal.lastTouch.seconds;
    timeInterval.value = setInterval(() => {
      timeSinceLastTouch.value = Timestamp.now().seconds - newVal.lastTouch.seconds;
      console.log('in momentSyncIcon setInterval,  timeSinceLastTouch:', timeSinceLastTouch.value);
    }, 1000);
  }
})

const iconToDisplay = computed(() => {
  if (Object.keys(moment.value?.needs).length > 0) {
    if (Object.keys(moment.value.needs).every(key => key === 'Oops' || key === 'error')) {
      return 'needsAnalyzedWithOops'
    }
    else {
      return 'needsAnalyzedWithSuccess'
    }
  }
  else if (!isOnline.value) return 'needsNonAnalyzedAndOffline'
  else if (timeSinceLastTouch.value < props.expectedLlmCallDuration) return 'analyzingNeeds'
  else return 'needsNonAnalyzedAndOffline'
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
  clearTimeInterval();
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
