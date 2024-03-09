/// <reference types="./nuxt-types.d.ts" />
import VueMainBootstrap from '../vue/main'
import VueClientBootstrap from '../vue/client'
import { defineNuxtPlugin, Plugin, useRuntimeConfig } from '#app'
import { getDebugger } from '../../'
import { defu } from 'defu'

const debug = getDebugger('Nuxt:Plugin:Client')

const plugin: Plugin = defineNuxtPlugin({
  name: 'vueprint:client',
  async setup(nuxtApp) {
    const {
      public: { vueprint: vueprintOptions },
    } = useRuntimeConfig()
    if (process.client) {
      const opts = defu(vueprintOptions, {
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
