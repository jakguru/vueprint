/// <reference types="./nuxt-types.d.ts" />
import VueMainBootstrap from '../vue/main'
import { defineNuxtPlugin, Plugin, useRuntimeConfig } from '#app'
import { getDebugger } from '../../'
import { defu } from 'defu'

const debug = getDebugger('Nuxt:Plugin:Server')

const plugin: Plugin = defineNuxtPlugin({
  name: 'vueprint:server',
  async setup(nuxtApp) {
    const {
      public: { vueprint: vueprintOptions },
    } = useRuntimeConfig()
    if (!process.client) {
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
