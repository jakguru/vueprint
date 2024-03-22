# Getting Started with VuePrint

## Installation

You can install VuePrint with your favorite javascript package manager.

::: code-group

```bash [npm]
npm i @jakguru/vueprint
```

```bash [yarn]
yarn add @jakguru/vueprint
```

:::

## Integration

VuePrint can be included as a simple plugin in a Vue project, or as a Module in a Nuxt Project.

### Vue Integration

VuePrint has 2 plugins for use in a standard Vue project:

* The [Vue Main Plugin](/api/interfaces/jakguru_vueprint_plugins_main.VueMainBootstrapOptions) which provides services which can be loaded in both server and client environments
* The [Vue Client Plugin](/api/interfaces/jakguru_vueprint_plugins_client.VueClientBootstrapOptions) which provides services which can only be loaded in a client environment

```typescript [src/main.ts]
import { createApp } from 'vue'
import VueMainBootstrap from '@jakguru/vueprint/plugins/main'
import VueClientBootstrap from '@jakguru/vueprint/plugins/client'
import '@jakguru/vueprint/vueprint.css'
import App from './App.vue'

import type {
  VueMainBootstrapOptions,
  VueClientBootstrapOptions,
} from '@jakguru/vueprint/plugins'

const vueprintMainPluginOptions: VueMainBootstrapOptions = {
  // Configuration for the Main plugin
}

const vueprintClientPluginOptions: VueClientBootstrapOptions = {
  // Configuration for the Client plugin
}

const app = createApp(App)
app.use(VueMainBootstrap, vueprintMainPluginOptions)
app.use(VueClientBootstrap, vueprintClientPluginOptions)
app.mount('#app')
```

#### Read More for Vue Integration

* [VueMainBootstrapOptions Interface](/api/interfaces/jakguru_vueprint_plugins_main.VueMainBootstrapOptions)
* [VueClientBootstrapOptions Inteface](/api/interfaces/jakguru_vueprint_plugins_client.VueClientBootstrapOptions)

### Nuxt Integration

VuePrint Provides an easy to use Nuxt Module which automatically installs the appropriate plugins in a way that is safe and compatible with SSR & Pre-rendered applications.

```typescript [nuxt.config.ts]
// https://nuxt.com/docs/api/configuration/nuxt-config
import type { VueprintModuleOptions } from '@jakguru/vueprint/nuxt'

export const vueprintModuleOptions: VueprintModuleOptions = {
  // Configuration for the Nuxt Module
}

export default defineNuxtConfig({
  ...
  modules: ['@jakguru/vueprint/nuxt'],
  vueprint: vueprintModuleOptions,
  build: {
    transpile: ['@jakguru/vueprint'],
  },
  css: ['@jakguru/vueprint/vueprint.css'],
})

```

#### Read More for Nuxt Integration

* [VueprintModuleOptions Interface](/api/interfaces/jakguru_vueprint._jakguru_vueprint_nuxt.VueprintModuleOptions)

## Initialization

Once installed and integrated, VuePrint needs to be initialized. The best way to do this is to use the [useVueprint](/api/modules/jakguru_vueprint._jakguru_vueprint_utilities#usevueprint) function from within the `setup` function of the main application component.

For example:

::: code-group

```vue [With Setup Script]
<template>
 ...
</template>

<script setup lang="ts">
import { useVueprint } from '@jakguru/vueprint/utilities'
const { mounted, booted, ready } = useVueprint()
</script>
```

```vue [With Setup Function]
<template>
 ...
</template>

<script lang="ts">
import { useVueprint } from '@jakguru/vueprint/utilities'
...
export default defineComponent({
    setup() {
        const { mounted, booted, ready } = useVueprint()
        return { mounted, booted, ready }
    }
})
</script>
```

:::

The `useVueprint` function returns a [ApplicationVueprintState](/api/interfaces/jakguru_vueprint._jakguru_vueprint_utilities.ApplicationVueprintState) object which contains information which can be used to ensure that the state / statuses of references and computed references are not updated until after the application has booted & mounted correctly, in order to prevent hydration mismatches.

```typescript [App.vue]

const authenticated = computed(() => {
  if (!mounted.value || !ready.value || !identity) {
    return null
  }
  if (!identity.authenticated.value) {
    return false
  }
  return identity.authenticated.value
})
const pushPermissions = computed(() => {
  if (!mounted.value || !ready.value || !push) {
    return null
  }
  if (!push.canPush.value && push.canRequestPermission.value) {
    return null
  }
  return push.canPush.value
})
const canRequestPush = computed(() => {
  if (!mounted.value || !ready.value || !push) {
    return false
  }
  return push.canRequestPermission.value
})
const canPush = computed(() => {
  if (!mounted.value || !ready.value || !push) {
    return false
  }
  return push.canPush.value
})
const active = computed(() => mounted.value && bus && bus.active.value)
```
