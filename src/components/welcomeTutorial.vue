<template>
  <div v-if="momentsStore.getShowWelcomeTutorial" class="q-px-md negative-margin-welcome-tutorial">
    <q-list>

      <q-item class="q-px-xs q-py-none margin-top-if-height-sm">
        <q-item-section class="text-body1 text-weight-medium text-on-primary">Welcome to
          KifKaf</q-item-section>
        <q-item-section side>
          <q-btn flat dense icon="r_close" color="background" size="12px"
            @click="momentsStore.setShowWelcomeTutorial(false)" padding="none" />
        </q-item-section>
      </q-item>

      <q-item class="q-pl-xs q-pr-sm q-pt-xs q-pb-xs" style="min-height: 0px;">
        <q-item-section class="text-subtitle2 text-weight-medium">
          <q-linear-progress :value="momentsStore.getWelcomeTutorialStep / 3" color="surface" track-color="grey" rounded
            animation-speed="500" />
        </q-item-section>
        <q-item-section side class="text-caption
text-on-primary">{{ momentsStore.getWelcomeTutorialStep +
  "/3 complete" }}
        </q-item-section>
      </q-item>

      <q-item class="q-px-none q-py-xs">
        <!-- ref="swiperWelcomeTutorial"  init="false"  auto-height="true" pagination-dynamic-bullets="true" slides-per-view="1.05"-->
        <keep-alive>
          <swiper-container ref="swiperTuto" pagination="true" grab-cursor="true" space-between="10" style="width: 100%;">
            <swiper-slide>
              <q-card v-if="momentsStore?.getWelcomeTutorialStep < 0.5"
                class="bg-surface q-py-md q-px-xs rounded-borders-14" style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label>
                      Capture life's ups and downs with micro-journaling. Your moments are private, only you can see them.
                    </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <img src="~assets/tuto1.svg"
                      style="max-height: 100%; width: auto; object-fit: contain; margin-right:16px;" />
                  </q-item-section>
                </q-item>
                <q-card-actions class="q-py-none" align="center">
                  <q-btn class="text-subtitle1 text-weight-medium q-mx-xs" rounded color="primary" padding="xs"
                    label="Log a Moment" @click="tutoLogMoment" :disable="newMomText.length !== 0" style="width: 100%; "
                    no-caps />
                </q-card-actions>
              </q-card>
              <q-card v-else class="bg-surface q-py-md q-px-xs rounded-borders-14" style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-subtitle1 text-on-surface text-weight-medium q-pb-sm">
                      First Moment logged
                    </q-item-label>
                    <q-item-label>
                      Emotions are your body's language. Embrace the habit of noting them down and you're halfway there!
                    </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <q-icon size="50px" color="positive" name="r_check_circle" class="q-mx-md" />
                  </q-item-section>
                </q-item>
              </q-card>
            </swiper-slide>
            <swiper-slide>
              <q-card v-if="momentsStore?.getWelcomeTutorialStep < 2"
                class="bg-surface q-py-md q-px-xs rounded-borders-14" style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label>
                      For each moment, KifKaf surfaces the related needs and how well they're being met. </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <img src="~assets/tuto2.svg"
                      style="max-height: 100%; width: auto; object-fit: contain; margin-right:8px;" />
                  </q-item-section>
                </q-item>
                <q-card-actions class="q-py-none" align="center">
                  <q-btn class="text-subtitle1 text-weight-medium q-mx-xs" rounded color="primary" padding="xs"
                    label="View needs" @click="tutoViewNeeds" :disable="!momentsStore.getLatestMomentId"
                    style="width: 100%; " no-caps />
                </q-card-actions>
              </q-card>
              <q-card v-else class="bg-surface q-py-md q-px-xs rounded-borders-14" style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-subtitle1 text-on-surface text-weight-medium q-pb-sm">
                      Needs Revealed
                    </q-item-label>
                    <q-item-label>
                      Understanding the deeper needs behind your feelings paves the way to fulfillment.
                    </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <q-icon size="50px" color="positive" name="r_check_circle" class="q-mx-md" />
                  </q-item-section>
                </q-item>
              </q-card>
            </swiper-slide>
            <swiper-slide>
              <q-card v-if="momentsStore?.getWelcomeTutorialStep < 3"
                class="bg-surface q-py-md q-px-xs rounded-borders-14" style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label>
                      Your emotions tell a story. After 5 Moments, patterns start emerging.
                    </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <img src="~assets/tuto3_1.png"
                      style="max-height: 100%; width: auto; object-fit: contain; margin-right:8px;" />
                  </q-item-section>
                </q-item>
                <q-card-actions class="q-py-none" align="center">
                  <q-btn class="text-subtitle1 text-weight-medium q-mx-xs" rounded color="primary" padding="xs"
                    label="Explore Insights" @click="tutoExploreInsights" :disable="!momentsStore.getLatestMomentId"
                    style="width: 100%; " no-caps />
                </q-card-actions>
              </q-card>
              <q-card v-else class="bg-surface q-py-md q-px-xs rounded-borders-14" style="margin-bottom: 32px;" flat>
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-subtitle1 text-on-surface text-weight-medium q-pb-sm">
                      You’re all set!
                    </q-item-label>
                    <q-item-label>
                      Keep logging Moments to fine-tune KifKaf and get the most out of it.
                    </q-item-label>
                  </q-item-section>
                  <q-item-section thumbnail>
                    <q-icon size="50px" color="positive" name="r_check_circle" class="q-mx-md" />
                  </q-item-section>
                </q-item>
              </q-card>
            </swiper-slide>
          </swiper-container>
        </keep-alive>

      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref, nextTick, onActivated, onMounted } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  newMomText: {
    required: true,
    type: String,
    default: "",
  },
  newMomInputRef: {
    required: true,
    default: null,
  },
});
const emits = defineEmits(['update:newMomText', 'click:viewNeeds']);

const momentsStore = useMomentsStore()
const router = useRouter()

// const swiperInitialized = ref(false)
const swiperTuto = ref(null)
onMounted(() => {
  console.log('ONMOUNTED TUTO')
  if (swiperTuto.value && swiperTuto.value.swiper && momentsStore?.getWelcomeTutorialStep)
    swiperTuto.value.swiper.slideTo(momentsStore.getWelcomeTutorialStep, 0, false)
});
// onActivated(() => {
//   console.log('ONACTIVATED TUTO')
//   if (swiperTuto.value && swiperTuto.value.swiper && momentsStore?.getWelcomeTutorialStep)
//     swiperTuto.value.swiper.slideTo(momentsStore.getWelcomeTutorialStep)
// });
// onDeactivated(() => {
//   console.log('ONDEACTIVATED')
//   swiperInitialized.value = false
// });

// watch(() => momentsStore.getWelcomeTutorialStep, (newVal, oldVal) => {
//   console.log('in welcomeTutorial watch momentsStore.getWelcomeTutorialStep:', momentsStore.getWelcomeTutorialStep)
//   swiperTuto.value.swiper.slideTo(momentsStore.getWelcomeTutorialStep)
// })

//WELCOME TUTORIAL
const tutoLogMoment = () => {
  emits('update:newMomText', 'Feeling excited to get to know me better with KifKaf!');
  nextTick(() => {
    // newMomInputRef.value.$el.querySelector('textarea').select()
    props.newMomInputRef.$el.querySelector('textarea').select()
  })
}
const tutoViewNeeds = async () => {
  // openBottomSheet(momentsStore.getLatestMomentId);
  emits('click:viewNeeds', momentsStore.getLatestMomentId);
  await momentsStore.setWelcomeTutorialStep(2);
}
const tutoExploreInsights = async () => {
  await router.push('/learn')
  await momentsStore.setWelcomeTutorialStep(3);
}

</script>
<style lang="scss">
.margin-top-if-height-sm {
  min-height: 0px;
  margin-top: 0px;
  transition: margin-top 0.5s ease;
}

@media (max-height: 650px) {
  .margin-top-if-height-sm {
    margin-top: 25px;
  }
}
</style>



