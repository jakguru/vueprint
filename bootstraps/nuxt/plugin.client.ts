/// <reference types="./nuxt-types.d.ts" />
import VueMainBootstrap from '../vue/main'
import VueClientBootstrap from '../vue/client'
import { defineNuxtPlugin, Plugin, useRuntimeConfig } from '#app'
import { getDebugger } from '../../'

const debug = getDebugger('Nuxt:Plugin:Client')

const plugin: Plugin = defineNuxtPlugin({
  name: 'vueprint:client',
  async setup(nuxtApp) {
    const {
      public: { vueprint: vueprintOptions },
    } = useRuntimeConfig()
    if (process.client) {
      nuxtApp.vueApp.use(VueMainBootstrap, vueprintOptions)
      nuxtApp.vueApp.use(VueClientBootstrap, vueprintOptions)
      debug('Setup Complete')
    } else {
      debug('Skipping setup, not client')
    }
  },
})
export default plugin
