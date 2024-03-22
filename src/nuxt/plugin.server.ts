/**
 * @module @jakguru/vueprint/nuxt/plugin.server
 */

import VueMainBootstrap from '../plugins/main'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { getDebugger } from '../utilities/debug'
import { defu } from 'defu'

const debug = getDebugger('Nuxt:Plugin:Server')

const plugin = defineNuxtPlugin({
  name: 'vueprint:server',
  async setup(nuxtApp) {
    const {
      public: { vueprint: vueprintOptions },
    } = useRuntimeConfig()
    if (process.server) {
      nuxtApp.vueApp.use(
        VueMainBootstrap,
        defu(vueprintOptions, {
          vuetify: {
            options: {
              ssr: true,
            },
          },
        })
      )
      debug('Setup Complete')
    } else {
      debug('Skipping setup, not server')
    }
  },
})
export default plugin
