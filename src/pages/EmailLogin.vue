<template>
  <q-page class="q-mx-auto q-px-md q-pt-none" style="max-width: 600px">
    <div class="text-h4 text-weight-medium q-mx-sm">Log in to KifKaf</div>

    <q-form @submit="onSubmit">
      <q-input ref="emailInputRef" v-model="userEmail" label="Enter your email" type='email' class="q-my-md" outlined
        bg-color="surface-variant" color="transparent" clearable>
      </q-input>


      <q-input v-if="onSubmitWasPressed" ref="pwdInputRef" v-model="userPassword" label="Enter your password"
        type='password' class="q-my-md" outlined bg-color="surface-variant" color="transparent" clearable>
      </q-input>

      <div>
        <q-btn v-if="!onSubmitWasPressed" rounded label="Continue" type="submit" color="primary"
          class="q-ma-md full-width" padding="sm" :disable="!isValidEmail" no-caps />
        <q-btn v-else rounded label="Sign in" type="submit" color="primary" class="q-ma-md full-width" padding="sm"
          :disable="!isValidPassword" no-caps />
      </div>

    </q-form>

    <div class="or-separator q-my-md">
      <div class="line"></div>
      <div class="or-text text-caption text-outline q-px-sm">or</div>
      <div class="line"></div>
    </div>

    <div>
      <!-- <q-btn rounded unelevated color="on-primary" text-color="scrim" label="Continue with email"
        @click="() => router.push('/login/email')" class="text-subtitle2 full-width q-ma-sm" style="height: 40px;" no-caps
        icon="mail" /> -->
      <q-btn rounded unelevated color="on-primary" text-color="scrim" @click="() => router.push('/login/google')"
        class="text-subtitle2 full-width q-ma-sm" style="height: 40px;" no-caps>
        <template v-slot:default>
          <img style="width: 24px; height: 24px; margin-right: 12px;" src="~assets/sign_in_icon_google_light_normal.svg"
            alt="Google">
          Continue with Google
        </template>
      </q-btn>
      <q-btn rounded unelevated color="on-primary" text-color="scrim" padding="none"
        @click="() => router.push('/login/apple')" class="text-subtitle2 full-width q-ma-sm" style="height: 40px;"
        no-caps>
        <template v-slot:default>
          <img style="width: 40px; height: 40px; margin-right: 0px;" src="~assets/sign_in_icon_apple_black.svg"
            alt="Apple">
          Continue with Apple
        </template>
      </q-btn>
    </div>


    <q-separator class="q-my-md" />

    <div class="q-ma-sm text-center"><a class="text-caption text-outline" href="/#/contact"
        style="text-decoration: none">Contact us</a>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute(); //TODO:3 remove?
const router = useRouter();
const to =
  route.query.redirect && typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/'

const emailInputRef = ref(null)
const userEmail = ref('')
const userPassword = ref('')
const onSubmitWasPressed = ref(false)

const onSubmit = (event) => {
  if (!onSubmitWasPressed.value) {
    onSubmitWasPressed.value = true
  }
  else {
  }
  // event.preventDefault()
  // emailInputRef.value.validate()
  // if (emailInputRef.value.hasError) {
  //   emailInputRef.value.focus()
  //   return
  // }
  // text: userEmail.value.trim(),
}


const isValidEmail = computed(() => {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(userEmail.value)
  // /.+@.+\..+/.test(userEmail.value)
})

const isValidPassword = computed(() => {
  return userPassword.value?.length > 6
})


</script>

<style lang="scss">
.or-separator {
  display: flex;
  align-items: center;

  .line {
    flex-grow: 1;
    height: 1px;
    background-color: #ccc; // you can adjust this color as per your design
  }
}

.q-field__control {
  border-radius: 14px !important;
}

.q-field--outlined .q-field__control:before {
  border: none;
}
</style>

