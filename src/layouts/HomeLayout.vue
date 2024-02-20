<template>
  <q-layout view="hHh lpr fFf" class="bg-background">

    <q-header class="bg-transparent" :bordered="!isBackgroundDark">
      <q-toolbar :class="['q-mx-auto', 'q-pr-xs', isScrolled ? 'toolbar-blurred' : 'toolbar-blurred']"
        style="max-width: 600px; overflow: hidden;">
        <q-avatar size="sm" square @click="router.push('/')">
          <img :class="{ 'invert-color': isBackgroundDark }" src="~assets/icon-kifkaf-no-background.svg" />
        </q-avatar>
        <q-toolbar-title :class="[
          'text-center',
          'text-subtitle1',
          'text-weight-medium',
          isBackgroundDark ? 'text-on-primary' : 'text-on-surface'
        ]">{{ t(tab) }}</q-toolbar-title>
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
        <component :is="Component" @update:is-dialog-opened="onUpdateIsDialogOpened" />
      </router-view>
    </q-page-container>

    <q-footer class="bg-transparent footer-blurred" bordered>
      <q-tabs no-caps v-model="tab" align="justify" indicator-color="transparent" active-color="primary"
        class="text-secondary q-mx-auto" style="max-width: 600px;" :breakpoint="0">
        <q-route-tab name="home" icon="r_edit" :label="t('home')" to="/" class="q-pt-xs q-pb-lg" @click="handleHomeClick"
          data-cy="home-home-tab" :ripple="false" />
        <q-route-tab name="insights" icon="r_insights" :label="t('insights')" to="/insights" class="q-pt-xs q-pb-lg"
          data-cy="home-insights-tab" @click="() => {
            if (ms?.userDoc?.showInsightsBadge) ms.setUserDocValue({ showInsightsBadge: false })
          }" :ripple="false">
          <q-badge v-show="ms?.userDoc?.showInsightsBadge" color="red" rounded floating />
        </q-route-tab>
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
import { debounce } from 'lodash' // Assuming lodash is installed
import { useMomentsStore } from './../stores/moments.js'
import { useI18n } from "vue-i18n"
import { useRouter } from 'vue-router'

const ms = useMomentsStore()
const { t } = useI18n()
const router = useRouter()

const tab = ref('home')
// const content = ref(t('mykey4'))

const isBackgroundDark = ref(true) // assuming the default is dark
const isScrolled = ref(false) // assuming the default is dark
const isDialogOpen = ref(false)

const onUpdateIsDialogOpened = (value) => {
  console.log('In HomeLayout.vue >onUpdateIsDialogOpened() BEFORE , value:', value, 'isDialogOpen.value:', isDialogOpen.value)
  isDialogOpen.value = value
}

const handleScroll = debounce(() => {
  if (!isDialogOpen.value) {
    isScrolled.value = window.scrollY > 0;
    const threshold = window.innerHeight * 0.6 - 100; // 60vh - 100px
    isBackgroundDark.value = window.scrollY < threshold;
  }
  // console.log('In HomeLayout.vue >handleScroll() AFTER , window.scrollY:', window.scrollY, 'window.innerHeight:', window.innerHeight, 'isScrolled.value:', isScrolled.value, 'isBackgroundDark.value:', isBackgroundDark.value, 'isDialogOpen.value:', isDialogOpen.value)
}, 10)

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initialize the value on mount
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

//reset swiper position to latest month/year when clicking on insights tab
const handleHomeClick = () => {
  if (router.currentRoute.value.path === '/') {
    window.scrollTo(0, 0); // Scroll to the top of the page
  }
}
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

.q-tab .q-badge {
  top: 5px;
  right: 4px;
  min-height: 8px;
  padding: 2px 4px;
}
</style>


