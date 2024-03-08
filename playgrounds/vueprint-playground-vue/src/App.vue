<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import { getDebugger } from '@jakguru/vueprint'
import { useVueprint } from '@jakguru/vueprint/composables/useVueprint'
const debug = getDebugger('App')
useVueprint({
  onBooted: {
    onTrue: () => debug('Booted is true'),
    onFalse: () => debug('Booted is false'),
  },
  onReady: {
    onTrue: () => debug('Ready is true'),
    onFalse: () => debug('Ready is false'),
  },
  onAuthenticated: {
    onTrue: () => debug('Authenticated is true'),
    onFalse: () => debug('Authenticated is false'),
  },
  onPushPermissions: {
    onTrue: () => debug('PushPermissions is true'),
    onFalse: () => debug('PushPermissions is false'),
  },
})
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
