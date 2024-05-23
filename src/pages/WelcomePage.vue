<template>
  <q-page>

    <StoriesSlider :swiper="Swiper" :enabled="false" :autoplay-duration="5000"
      @slidesIndexesChange="onSlidesIndexesChange" @storiesSlider="onStoriesSlider" @end="onEnd">
      <Stories v-for="(userStories, userStoriesIndex) in storiesData" :key="userStoriesIndex">
        <!-- close-button @closeButtonClick="onCloseButtonClick" -->
        <Story v-for="(story, storyIndex) in userStories.stories" :key="storyIndex" user-link="#"
          :name="t('welcomeToKifkaf')" close-button @closeButtonClick="onCloseButtonClick">
          <img :src="story.image" />
        </Story>
      </Stories>
    </StoriesSlider>

    <div class="fixed-login-button">
      <!-- max-width: 300px; -->
      <q-btn data-cy="log-in-button" rounded color="scrim" padding="md" :label="t('login')" @click="onClickedNext"
        class="text-body1 q-ml-md q-mr-sm" style="width: 100%; " no-caps />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Swiper from 'swiper'; //line that creates the error
import { StoriesSlider, Stories, Story } from 'src/components/stories-slider/stories-slider-vue.js';
import 'src/assets/stories-slider/stories-slider.scss';
import 'src/assets/stories-slider/main.scss';

const { t } = useI18n();
const router = useRouter();
const storiesData = [
  {
    stories: [
      {
        //   image: '~assets/screenshot1_en.webp',
        // image: '~assets/' + t('filepaths.screenshot1')
        image: new URL(`../assets/${t('filepaths.screenshot1')}`, import.meta.url).href,

      },
      {
        // image: '~assets' + t('filepaths.screenshot2'),
        image: new URL(`../assets/${t('filepaths.screenshot2')}`, import.meta.url).href,
        // image: `../assets/${t('filepaths.screenshot2')}`

      },
      {
        image: new URL(`../assets/${t('filepaths.screenshot3')}`, import.meta.url).href,
      },
      {
        // image: '../assets/screenshot4_en.webp',
        image: new URL(`../assets/${t('filepaths.screenshot4')}`, import.meta.url).href,

      },
      {
        // image: './../assets/screenshot5_en.webp',
        image: new URL(`../assets/${t('filepaths.screenshot5')}`, import.meta.url).href,

      },
    ],
  },
];

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

const onClickedNext = () => {
  router.push('/login');
  // disable slider as we don't need it autoplay stories while it is hidden
  storiesSlider.disable();
  // add "out" class (used in demo for animated disappearance)
  // storiesSlider.el.classList.add('stories-slider-out');
};

const onCloseButtonClick = () => {
  if (window.history.length > 1) {
    // console.log('In goBack, history.length:', window.history.length)
    router.go(-1) // Go back to the previous page if there's a history
  } else {
    // console.log('In goBack, history.length:', window.history.length, "going to home")
    router.push({ path: '/' }) // Redirect to root if there's no history
  }
  storiesSlider.disable();
}

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
