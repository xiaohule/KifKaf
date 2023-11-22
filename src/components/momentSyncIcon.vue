<template>
  <q-icon v-if="iconToDisplay === 'needsAnalyzedWithOops'" size="20px" color="error-dark" name="error" class="q-mx-md" />

  <!--TODO:2 could be main needs emoji or r_arrow_circle_up cloud_done ou cloud_upload-->
  <q-icon v-else-if="iconToDisplay === 'needsAnalyzedWithSuccess'" size="20px" color="primary" name="check_circle"
    class="q-mx-md" />

  <q-icon v-else-if="iconToDisplay === 'needsNonAnalyzedAndOffline'" size="20px" color="outline-variant" name="cloud_off"
    class="q-mx-md" />

  <q-icon v-else-if="iconToDisplay === 'analyzingNeeds'" size="20px" class="q-mx-md">
    <q-circular-progress :value="(currentTime - moment?.date?.seconds) * (100 / expectedLlmCallDuration)" size="20px"
      color="primary" track-color="primary-container" rounded class="position-absolute centered" />
    <q-spinner-puff color="primary" size="20px" class="position-absolute centered" />
  </q-icon>

  <q-icon v-else size="20px" color="outline-variant" name="cloud_off" class="q-mx-md" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
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
    default: 60
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

const iconToDisplay = computed(() => {
  // if (navigator.onLine) {
  if (moment.value?.needs && Object.keys(moment.value?.needs).length > 0) {
    if (Object.keys(moment.value?.needs).every(key => key === 'Oops' || key === 'error')) {
      return 'needsAnalyzedWithOops'
    }
    else {
      return 'needsAnalyzedWithSuccess'
    }
  } else if (!navigator?.onLine) return 'needsNonAnalyzedAndOffline'
  else if (moment.value?.date?.seconds && (moment.value?.date?.seconds > (currentTime.value - props.expectedLlmCallDuration))) return 'analyzingNeeds'
  else return 'unknownError'
})

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
