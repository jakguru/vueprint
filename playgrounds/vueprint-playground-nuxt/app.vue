<template>
  <v-app>
    <v-app-bar app flat color="primary">
      <v-toolbar-title>VuePrint Nuxt Playground</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        Welcome to the VuePrint Nuxt Playground
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { getDebugger } from '@jakguru/vueprint'
import { useVueprint } from '@jakguru/vueprint/composables/useVueprint'
const debug = getDebugger('App')
export default defineComponent({
  name: 'App',
  setup() {
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
    return {
    }
  },
})
</script>