<template>
  <div v-if="ms?.userDoc?.showWelcomeTutorial" class="q-px-md negative-margin-welcome-tutorial">
    <q-list>

      <q-item class="q-px-xs q-py-none margin-top-if-height-sm">
        <q-item-section class="text-body1 text-weight-medium text-on-primary">{{
          t('welcomeTutorial.title') }}</q-item-section>
        <q-item-section side>
          <q-btn flat dense icon="r_close" color="background" size="10px"
            @click="ms.setUserDocValue({ showWelcomeTutorial: false })" padding="none" />
        </q-item-section>
      </q-item>

      <q-item class="q-pl-xs q-pr-sm q-pt-xs q-pb-xs" style="min-height: 0px;">
        <q-item-section class="text-subtitle2 text-weight-medium">
          <q-linear-progress :value="ms.userDoc?.welcomeTutorialStep / 3" color="surface" track-color="grey" rounded
            animation-speed="500" />
        </q-item-section>
        <q-item-section side class="text-caption
text-on-primary">{{ ms.userDoc?.welcomeTutorialStep +
  "/3 " + t('welcomeTutorial.complete', ms.userDoc?.welcomeTutorialStep) }}
        </q-item-section>
      </q-item>

      <q-item class="q-px-none q-py-xs">
        <!-- ref="swiperWelcomeTutorial"  init="false"  auto-height="true" pagination-dynamic-bullets="true" slides-per-view="1.05"-->
        <swiper-container ref="swiperTuto" :pagination="true" :grab-cursor="true" space-between="10" style="width: 100%;">
          <swiper-slide>
            <q-card v-if="ms.userDoc?.welcomeTutorialStep < 0.5" class="bg-surface q-py-md q-px-xs rounded-borders-14"
              style="margin-bottom: 32px;" flat>
              <q-item>
                <q-item-section>
                  <q-item-section class="text-body2">
                    {{ t('welcomeTutorial.step1') }}
                  </q-item-section>
                </q-item-section>
                <q-item-section thumbnail>
                  <img v-cloak src="~assets/tuto1.svg"
                    style="max-height: 100%; width: auto; object-fit: contain; margin-right:16px;" />
                </q-item-section>
              </q-item>
              <q-card-actions class="q-py-none" align="center">
                <q-btn class="text-subtitle1 text-weight-medium q-mx-xs" rounded color="primary" padding="xs"
                  :label="t('welcomeTutorial.step1Action')" @click="tutoLogMoment" :disable="newMomText.length !== 0"
                  style="width: 100%; " no-caps />
              </q-card-actions>
            </q-card>
            <q-card v-else class="bg-surface q-py-md q-px-xs rounded-borders-14" style="margin-bottom: 32px;" flat>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-subtitle1 text-on-surface text-weight-medium q-pb-sm">
                    {{ t('welcomeTutorial.step1DoneTitle') }} </q-item-label>
                  <q-item-section class="text-body2 text-secondary">
                    {{ t('welcomeTutorial.step1DoneText') }} </q-item-section>
                </q-item-section>
                <q-item-section thumbnail>
                  <q-icon size="50px" color="positive" name="r_check_circle" class="q-mx-md" />
                </q-item-section>
              </q-item>
            </q-card>
          </swiper-slide>
          <swiper-slide>
            <q-card v-if="ms.userDoc?.welcomeTutorialStep < 2" class="bg-surface q-py-md q-px-xs rounded-borders-14"
              style="margin-bottom: 32px;" flat>
              <q-item>
                <q-item-section>
                  <q-item-section class="text-body2">
                    {{ t('welcomeTutorial.step2') }} </q-item-section>
                </q-item-section>
                <q-item-section thumbnail>
                  <img v-cloak src="~assets/tuto2.svg"
                    style="max-height: 100%; width: auto; object-fit: contain; margin-right:8px;" />
                </q-item-section>
              </q-item>
              <q-card-actions class="q-py-none" align="center">
                <q-btn class="text-subtitle1 text-weight-medium q-mx-xs" rounded color="primary" padding="xs"
                  :label="t('welcomeTutorial.step2Action')" @click="tutoViewNeeds" :disable="!ms.getLatestMomWithNeedsId"
                  style="width: 100%; " no-caps />
              </q-card-actions>
            </q-card>
            <q-card v-else class="bg-surface q-py-md q-px-xs rounded-borders-14" style="margin-bottom: 32px;" flat>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-subtitle1 text-on-surface text-weight-medium q-pb-sm">
                    {{ t('welcomeTutorial.step2DoneTitle') }} </q-item-label>
                  <q-item-section class="text-body2 text-secondary">
                    {{ t('welcomeTutorial.step2DoneText') }} </q-item-section>
                </q-item-section>
                <q-item-section thumbnail>
                  <q-icon size="50px" color="positive" name="r_check_circle" class="q-mx-md" />
                </q-item-section>
              </q-item>
            </q-card>
          </swiper-slide>
          <swiper-slide>
            <q-card v-if="ms.userDoc?.welcomeTutorialStep < 3" class="bg-surface q-py-md q-px-xs rounded-borders-14"
              style="margin-bottom: 32px;" flat>
              <q-item>
                <q-item-section>
                  <q-item-section v-if="ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange] === 0" class="text-body2"> {{
                    t('welcomeTutorial.step3Empty') }}
                  </q-item-section>
                  <q-item-section v-else-if="ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange] < 3" class="text-body2">
                    {{ t('welcomeTutorial.step3EmptyCountdown', 3 - ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange]) }}
                  </q-item-section>
                  <q-item-section v-else-if="!ms.aggDataInsights?.[ms.activeDateRange]?.summary?.length"
                    class="text-body1">
                    {{ t('welcomeTutorial.step3EmptyCountdown', 0) }} </q-item-section>
                  <q-item-section v-else class="text-body1">
                    {{ t('welcomeTutorial.step3Ready') }} </q-item-section>
                </q-item-section>
                <q-item-section thumbnail>
                  <img v-cloak src="~assets/tuto3_1.png"
                    style="max-height: 100%; width: auto; object-fit: contain; margin-right:8px;" />
                </q-item-section>
              </q-item>
              <q-card-actions class="q-py-none" align="center">
                <q-btn class="text-subtitle1 text-weight-medium q-mx-xs" rounded color="primary" padding="xs"
                  :label="t('welcomeTutorial.step3Action')" @click="tutoExploreInsights"
                  :disable="ms.getDateRangeOkNeedsCounts?.[ms.activeDateRange] < 3" style="width: 100%; " no-caps />
              </q-card-actions>
            </q-card>
            <q-card v-else class="bg-surface q-py-md q-px-xs rounded-borders-14" style="margin-bottom: 32px;" flat>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-subtitle1 text-on-surface text-weight-medium q-pb-sm">
                    {{ t('welcomeTutorial.step3DoneTitle') }} </q-item-label>
                  <q-item-section class="text-body2 text-secondary">
                    {{ t('welcomeTutorial.step3DoneText') }}
                  </q-item-section>
                </q-item-section>
                <q-item-section thumbnail>
                  <q-icon size="50px" color="positive" name="r_check_circle" class="q-mx-md" />
                </q-item-section>
              </q-item>
            </q-card>
          </swiper-slide>
        </swiper-container>

      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from "vue-i18n"
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

const ms = useMomentsStore()
const { t } = useI18n()
const router = useRouter()

// const swiperInitialized = ref(false)
const swiperTuto = ref(null)

onMounted(() => {
  console.log('ONMOUNTED TUTO')
  if (swiperTuto.value && swiperTuto.value.swiper && ms.userDoc?.welcomeTutorialStep)
    swiperTuto.value.swiper.slideTo(ms.userDoc?.welcomeTutorialStep, 0, false)
});

//WELCOME TUTORIAL
const tutoLogMoment = () => {
  emits('update:newMomText', 'Feeling excited to get to know me better with KifKaf!');
  nextTick(() => {
    // newMomInputRef.value.$el.querySelector('textarea').select()
    props.newMomInputRef.$el.querySelector('textarea').select()
  })
}
const tutoViewNeeds = async () => {
  emits('click:viewNeeds', ms.getLatestMomWithNeedsId);
  await ms.setUserDocValue({ welcomeTutorialStep: 2 });;
}
const tutoExploreInsights = async () => {
  await router.push('/insights')
  await ms.setUserDocValue({ welcomeTutorialStep: 3 });;
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

[v-cloak] {
  display: none;
}
</style>



