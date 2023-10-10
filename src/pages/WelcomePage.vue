<template>
  <q-page class="q-mx-auto" style="max-width: 600px; position: relative;">

    <q-header class="bg-transparent overlay-header">
      <q-toolbar>
        <q-avatar size="sm" square>
          <img src="icon-kifkaf-no-background.svg" />
        </q-avatar>
        <q-toolbar-title class="text-on-surface text-subtitle1 text-weight-medium
">Welcome to KifKaf</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- pagination-clickable="true"  class="mySwiper" navigation="true" space-between="30"-->
    <swiper-container pagination="true" centered-slides="true" autoplay-delay="2500"
      autoplay-disable-on-interaction="false">
      <!-- <swiper-slide> <img src="../assets/ios_6_1_home.png" /></swiper-slide> -->
      <swiper-slide> <img src="https://swiperjs.com/demos/images/nature-2.jpg" /></swiper-slide>
      <swiper-slide> <img src="https://swiperjs.com/demos/images/nature-3.jpg" /></swiper-slide>
      <swiper-slide>
        <img src="https://swiperjs.com/demos/images/nature-1.jpg" />
      </swiper-slide>
    </swiper-container>

    <div class="fixed-buttons">
      <!-- max-width: 300px; -->
      <q-btn rounded color="scrim" padding="md" label="Log in" @click="() => router.push('/login')"
        class="text-body1 q-ml-md q-mr-sm" style="width: 100%; " no-caps />
      <!-- <q-btn rounded color="on-primary" text-color="scrim" padding="sm" label="Sign up"
        @click="() => router.push('/signup')" class="text-body1 q-ml-sm q-mr-md" style="width: 100%; max-width: 300px;"
        no-caps /> -->
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { currentUser } from "../boot/firebaseBoot.js";

const route = useRoute(); //TODO:3 remove?
const router = useRouter();
const to =
  route.query.redirect && typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/'
let checkEmailVerifiedInterval; // Declare variable to store the interval ID

onMounted(() => {
  watch(currentUser, (newVal, oldVal) => {
    console.log('In Login page, watch currentUser:', newVal, ", replaced:", oldVal);

    if (newVal) {
      // User is signed in.
      if (newVal.emailVerified) {
        // User's email is already verified. Redirect to expected page.
        console.log("User's email is already verified. Redirecting to", to);
        router.push(to);
      }
      else {
        checkEmailVerifiedInterval = setInterval(async () => {
          await newVal.reload();
          console.log("user reload completed.");
          if (newVal.emailVerified) {
            console.log("User's email is now verified. Redirecting to", to);
            clearInterval(checkEmailVerifiedInterval); // Clear the interval
            router.push(to);
          }
        }
          , 300)
      }
    }
  }, { immediate: true });
})

onUnmounted(() => {
  console.log("Unmounting Login page...");
  if (checkEmailVerifiedInterval) {
    clearInterval(checkEmailVerifiedInterval);
  }
});
</script>

<style lang="scss">
swiper-container {
  width: 100%;
  // height: 100%;
  height: 100vh; // This will make the container fill the entire height of the screen
  // --swiper-pagination-color: var(--swiper-theme-color);
  // --swiper-pagination-left: auto;
  // --swiper-pagination-right: 8px;
  // --swiper-pagination-bottom: 8px;
  // --swiper-pagination-top: auto;
  // --swiper-pagination-fraction-color: inherit;
  // --swiper-pagination-progressbar-bg-color: rgba(0, 0, 0, 0.25);
  // --swiper-pagination-progressbar-size: 4px;
  --swiper-pagination-bullet-size: 12px;
  // --swiper-pagination-bullet-width: 8px;
  // --swiper-pagination-bullet-height: 8px;
  // --swiper-pagination-bullet-inactive-color: #000;
  // --swiper-pagination-bullet-inactive-opacity: 0.2;
  // --swiper-pagination-bullet-opacity: 1;
  // --swiper-pagination-bullet-horizontal-gap: 4px;
  // --swiper-pagination-bullet-vertical-gap: 6px;
}

swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; // This will make the slide fill the container's height
}

swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-header {
  position: absolute; // Set the header to an absolute position
  top: 0; // Position it at the top
  left: 0; // Position it on the left
  right: 0; // Stretch it to the right, making it full width
  z-index: 2; // Optional: make sure the header overlays the swiper content
}

.fixed-buttons {
  position: fixed;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  display: flex;
  z-index: 2; // to ensure it's above other content if needed
  // justify-content: space-around; // evenly space the buttons
  // bottom: 0; // position at the bottom of the page
  // padding: 6vh 0;
}
</style>

