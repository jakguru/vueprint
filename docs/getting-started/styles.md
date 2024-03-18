# Styling a VuePrint Project

Since VuePrint is based on Vuetify, it comes with all of Vuetify's components pre-bundled and ready to work with. VuePrint also comes with 2 built-in style-sheets:

* `@jakguru/vueprint/dist/vueprint.css` - All VuePrint related styles including Vuetify, pre-bundled
* `@jakguru/vueprint/dist/vueprint-no-vuetify.css` - All VuePrint related styles *except* for Vuetify, pre-bundled
* `@jakguru/vueprint/dist/vueprint.scss` - All VuePrint related styles including Vuetify, unbundled
* `@jakguru/vueprint/dist/vueprint-no-vuetify.scss` - All VuePrint related styles *except* for Vuetify, unbundled

The best way to approach both is to ask the question: Does my project require [changing the Vuetify SASS variables](https://vuetifyjs.com/en/features/sass-variables/#basic-usage)? If no, then it is safe to use `vueprint`. Otherwise, you should use `vueprint-no-vuetify`.

## Examples with Vuetify Styles Bundled

::: code-group

```typescript [Vue Integration]
// src/main.ts
import { createApp } from 'vue'
import VueMainBootstrap from '@jakguru/vueprint/plugins/main'
import VueClientBootstrap from '@jakguru/vueprint/plugins/client'
import '@jakguru/vueprint/dist/vueprint.css'
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

```typescript [Nuxt Integration]
// nuxt.config.ts
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
  css: ['@jakguru/vueprint/dist/vueprint.css'],
})

```

:::

## Examples with Vuetify Styles Not Bundled

### Vue Integration

::: code-group

```typescript [src/main.ts]
import { createApp } from 'vue'
import VueMainBootstrap from '@jakguru/vueprint/plugins/main'
import VueClientBootstrap from '@jakguru/vueprint/plugins/client'
import '@jakguru/vueprint/dist/vueprint-no-vuetify.css'
import './assets/main.scss'
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

```scss [assets/main.scss]
$family: "Inter var", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
  "Noto Color Emoji";

@use "vuetify" with (
  $body-font-family: $family,
  $heading-font-family: $family
);
```

:::

### Nuxt Integration

::: code-group

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
  css: ['@jakguru/vueprint/dist/vueprint-no-vuetify.css', '@/assets/main.scss'],
})

```

```scss [assets/main.scss]
$family: "Inter var", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
  "Noto Color Emoji";

@use "vuetify" with (
  $body-font-family: $family,
  $heading-font-family: $family
);
```

:::
