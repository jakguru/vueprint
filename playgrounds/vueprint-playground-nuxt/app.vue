<template>
  <div>
    <NuxtWelcome />
  </div>
</template>

<script setup lang="ts">
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