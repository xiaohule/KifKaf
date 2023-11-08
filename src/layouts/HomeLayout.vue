<template>
  <q-layout view="hHh lpr fFf" class="bg-background">

    <q-header class="bg-transparent" :bordered="!isBackgroundDark">
      <q-toolbar :class="['q-mx-auto', 'q-pr-xs', isScrolled ? 'toolbar-blurred' : '']"
        style="max-width: 600px; overflow: hidden;">
        <q-avatar size="sm" square>
          <img :class="{ 'invert-color': isBackgroundDark }" src="~assets/icon-kifkaf-no-background.svg" />
        </q-avatar>
        <q-toolbar-title :class="[
          'text-center',
          'text-subtitle1',
          'text-weight-medium',
          isBackgroundDark ? 'text-on-primary' : 'text-on-surface'
        ]">{{ tab }}</q-toolbar-title>
        <router-link to="/settings" style="text-decoration: none;">
          <q-btn flat round dense icon="account_circle" size="20px"
            :class="isBackgroundDark ? 'text-on-primary' : 'text-on-surface'">
          </q-btn>
        </router-link>
      </q-toolbar>
    </q-header>

    <!-- TODO:1 set max-width direclty here an not in pages -->
    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>

    <q-footer class="bg-transparent footer-blurred" bordered>
      <q-tabs no-caps v-model="tab" align="justify" indicator-color="transparent" active-color="primary"
        class="text-secondary q-mx-auto" style="max-width: 600px;" :breakpoint="0" :ripple="false">
        <q-route-tab name="Home" icon="home" label="Home" to="/" class="q-pt-xs q-pb-lg" />
        <q-route-tab name="Insights" icon="insights" label="Insights" to="/learn" class="q-pt-xs q-pb-lg" />
        <!-- ou stats ou needs ou learn -->
        <!-- re-add tabs when ready -->
        <!-- <q-route-tab name="timeline" icon="view_timeline" label="Timeline" to="/timeline" />
        <q-route-tab name="search" icon="search" label="Search" to="/search" /> -->
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
/*The reason why using {} allows you to call the ref function directly is because it is a named import.
When you use named imports, you can import only the specific functions or objects that you need from a module.
This makes your code more efficient and easier to read. The behavior of using named imports is called destructuring.*/
/*When you use “import { ref } from ‘vue’”, you can use the ref function directly in your code, like this: const count = ref(0).
 When you use “import ref from ‘vue’”, you need to call the function like this: const count = ref.ref(0)*/
import { ref, onMounted, onUnmounted } from 'vue'
import { debounce } from 'lodash-es' // Assuming lodash-es is installed

const tab = ref('Home')
const isBackgroundDark = ref(true) // assuming the default is dark
const isScrolled = ref(false) // assuming the default is dark

const handleScroll = debounce(() => {
  isScrolled.value = window.scrollY > 0;
  const threshold = window.innerHeight * 0.5 - 100; // 50vh - 70px
  isBackgroundDark.value = window.scrollY < threshold;
}, 10)

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initialize the value on mount
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss">
.toolbar-blurred,
.footer-blurred {
  backdrop-filter: blur(30px);
}

// .text-on-primary,
// .text-on-surface {
//   transition: color 0.05s;
// }

.invert-color {
  filter: invert(100%);
}
</style>


