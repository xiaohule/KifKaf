<template>
  <q-page>

    <StoriesSlider :swiper="Swiper" :enabled="false" :autoplay-duration="5000"
      @slidesIndexesChange="onSlidesIndexesChange" @storiesSlider="onStoriesSlider" @end="onEnd">
      <Stories v-for="(userStories, userStoriesIndex) in storiesData" :key="userStoriesIndex">
        <Story v-for="(story, storyIndex) in userStories.stories" :key="storyIndex" user-link="#"
          :name="t('welcomeToKifkaf')" close-button @closeButtonClick="onCloseButtonClick">
          <img :src="story.image" />
        </Story>
      </Stories>
    </StoriesSlider>

    <div class="fixed-login-button">
      <!-- max-width: 300px; -->
      <q-btn data-cy="log-in-button" rounded color="scrim" padding="md" :label="t('login')" @click="onCloseButtonClick"
        class="text-body1 q-ml-md q-mr-sm" style="width: 100%; " no-caps />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { currentUser } from "../boot/firebaseBoot.js";
import { useVerifiedUserRedirectUtils } from 'src/composables/verifiedUserRedirectUtils';
import Swiper from 'swiper'; //line that creates the error
import { StoriesSlider, Stories, Story } from 'src/components/stories-slider/stories-slider-vue.js';
import 'src/assets/stories-slider/stories-slider.scss';
import 'src/assets/stories-slider/main.scss';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { stopUserVerificationCheck } = useVerifiedUserRedirectUtils(currentUser, route.query.redirect || '/');
const storiesData = [
  {
    stories: [
      {
        image: "src/assets" + t('filepaths.screenshot1'),
      },
      {
        image: "src/assets" + t('filepaths.screenshot2'),
      },
      {
        image: "src/assets" + t('filepaths.screenshot3'),
      },
      {
        image: "src/assets" + t('filepaths.screenshot4'),
      },
      {
        image: "src/assets" + t('filepaths.screenshot5'),
      },
    ],
  },
];
// [
//   {
//     stories: [
//       {
//         image: "src/assets/screenshot1_en.webp"
//       },
//       {
//         image: "src/assets/screenshot2_en.webp"
//       },
//       {
//         image: "src/assets/screenshot3_en.webp"
//       },
//       {
//         image: "src/assets/screenshot4_en.webp"
//       },
//       {
//         image: "src/assets/screenshot5_en.webp"
//       },
//     ],
//   },
// ];

onMounted(() => {
  openUserStories(0);
  if (storiesSlider) {
    // when slider became hidden we need to remove "in" and "out" class to return it initial state
    storiesSlider.el.addEventListener('animationend', () => {
      if (storiesSlider.el.classList.contains('stories-slider-out')) {
        storiesSlider.el.classList.remove('stories-slider-in');
        storiesSlider.el.classList.remove('stories-slider-out');
      }
    });
  }
})

onUnmounted(() => {
  stopUserVerificationCheck();
});

let storiesSlider = null;

const openUserStories = (userIndex) => {
  // console.log("In WelcomePage.vue openUserStorie, userIndex: ", userIndex, "storiesSlider: ", storiesSlider);
  // add "in" class (used in demo for animated appearance)
  storiesSlider.el.classList.add('stories-slider-in');
  // enable slider (as we passed enabled: false initially)
  storiesSlider.enable();
  // slide to specific user's stories
  storiesSlider.slideTo(userIndex, 0);
};

const onCloseButtonClick = () => {
  // disable slider as we don't need it autoplay stories while it is hidden
  storiesSlider.disable();
  // add "out" class (used in demo for animated disappearance)
  storiesSlider.el.classList.add('stories-slider-out');
  router.push('/login');
};

const onStoriesSlider = (instance) => {
  storiesSlider = instance;
};

const onSlidesIndexesChange = (mainIndex, subIndex) => {
  console.log({ mainIndex, subIndex });
};

const onEnd = () => {
  // slide to the first story when the last story ended
  storiesSlider.slideTo(0, 0);
};

</script>

<style scoped lang="scss">
.fixed-login-button {
  position: fixed;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  display: flex;
  z-index: 1500; // to ensure it's above other content if needed
}
</style>

