/**
 * @module @jakguru/vueprint/nuxt/plugin.client
 */

import VueMainBootstrap from '../plugins/main'
import VueClientBootstrap from '../plugins/client'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { getDebugger } from '../utilities/debug'
import { defu } from 'defu'
import type { VueprintModuleOptions } from '.'

const debug = getDebugger('Nuxt:Plugin:Client')

const plugin = defineNuxtPlugin({
  name: 'vueprint:client',
  async setup(nuxtApp) {
    const {
      public: { vueprint: vueprintOptions },
    } = useRuntimeConfig()
    if (window && window.document && document) {
      const opts = defu(vueprintOptions as VueprintModuleOptions, {
        vuetify: {
          options: {
            ssr: true,
          },
        },
      })
      nuxtApp.vueApp.use(VueMainBootstrap, opts)
      nuxtApp.vueApp.use(VueClientBootstrap, opts)
      debug('Setup Complete')
    } else {
      debug('Skipping setup, not client')
    }
  },
})
export default plugin
