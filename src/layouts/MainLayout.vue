<template>
  <q-layout view="hHh lpr fFf" class="bg-grey-4">

    <q-header class="bg-transparent" bordered reveal>
      <q-toolbar class="text-dark">
        <q-toolbar-title>KifKaf</q-toolbar-title>
        <router-link to="/profile">
          <q-avatar icon="account_circle" size="32px" font-size="32px" color="" text-color="grey-8">
            <!-- <img src="https://cdn.quasar.dev/img/avatar.png"> -->
            <!-- or put initials like JD? -->
          </q-avatar>
        </router-link>
      </q-toolbar>
    </q-header>

    <!-- TODO: set max-width direclty here an not in pages -->
    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>

    <!-- TODO: v-show="isKeyboardHidden" -->
    <q-footer class="bg-transparent" bordered>
      <q-tabs v-model="tab" align="justify" indicator-color="transparent" active-color="primary" class="text-grey-8"
        :breakpoint="0">
        <q-route-tab name="home" icon="home" label="Home" to="/" />
        <q-route-tab name="learn" icon="insights" label="Learn" to="/learn" />
        <q-route-tab name="timeline" icon="view_timeline" label="Timeline" to="/timeline" />
        <q-route-tab name="search" icon="search" label="Search" to="/search" />
      </q-tabs>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref('home')
/*The reason why using {} allows you to call the ref function directly is because it is a named import.
When you use named imports, you can import only the specific functions or objects that you need from a module.
This makes your code more efficient and easier to read. The behavior of using named imports is called destructuring.*/
/*When you use “import { ref } from ‘vue’”, you can use the ref function directly in your code, like this: const count = ref(0).
 When you use “import ref from ‘vue’”, you need to call the function like this: const count = ref.ref(0)*/
</script>

<style lang="scss">
.q-header,
.q-footer {
  backdrop-filter: blur(25px);
}
</style>


