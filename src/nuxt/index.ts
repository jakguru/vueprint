import { defineNuxtModule, createResolver, addPlugin } from '@nuxt/kit'
import { defu } from 'defu'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import type { BusPluginOptions } from '../plugins/bus'
import type { LocalStoragePluginOptions } from '../plugins/ls'
import type { VuetifyPluginOptions } from '../plugins/vuetify'
import type { ApiPluginOptions } from '../plugins/api'
import type { PushPluginOptions } from '../plugins/push'
import type { IdentityPluginOptions } from '../plugins/identity'
import type { UiPluginOptions } from '../plugins/ui'
import type { WebfontloaderPluginOptions } from '../plugins/webfontloader'

export interface VueprintModuleOptions {
  bus?: BusPluginOptions
  ls?: LocalStoragePluginOptions
  vuetify?: VuetifyPluginOptions
  api?: ApiPluginOptions
  identity?: IdentityPluginOptions
  push?: PushPluginOptions
  ui?: UiPluginOptions
  webfontloader?: WebfontloaderPluginOptions
}

declare module '@nuxt/schema' {
  export interface NuxtConfig {
    ['vueprint']?: Partial<VueprintModuleOptions>
  }
  export interface NuxtOptions {
    ['vueprint']?: VueprintModuleOptions
  }
  export interface PublicRuntimeConfig {
    ['vueprint']?: VueprintModuleOptions
  }
}

export default defineNuxtModule({
  meta: {
    name: 'vueprint',
    configKey: 'vueprint',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  // Default configuration options for your module, can also be a function returning those
  defaults: {},
  // Shorthand sugar to register Nuxt hooks
  hooks: {},
  // The function holding your module logic, it can be asynchronous
  setup(vueprintOptions: VueprintModuleOptions, nuxt) {
    const vuetifyModuleOptions = vueprintOptions.vuetify?.moduleOptions || {}
    nuxt.hooks.hook('vite:extendConfig', (config) => {
      // @ts-expect-error
      config.plugins.push(
        nodePolyfills({
          include: ['buffer', 'events'],
          globals: {
            Buffer: true,
          },
        })
      )
      // @ts-expect-error
      config.plugins.push(vuetify({ ...vuetifyModuleOptions, autoImport: true }))
      // @ts-expect-error
      config.resolve.alias = {
        // @ts-expect-error
        ...config.resolve.alias,
        joi: 'joi/lib',
      }
      config.vue = defu(config.vue, {
        template: {
          transformAssetUrls,
        },
      })
    })
    nuxt.options.build.transpile.push('vuetify')
    nuxt.options.runtimeConfig.public.vueprint = defu(
      nuxt.options.runtimeConfig.public.vueprint as VueprintModuleOptions,
      vueprintOptions
    )
    if (
      vuetifyModuleOptions &&
      vuetifyModuleOptions.styles &&
      // @ts-expect-error - the configFile exists in real life, but the type defintion is wrong
      vuetifyModuleOptions.styles.configFile
    ) {
      nuxt.options.sourcemap = {
        client: false,
        server: false,
      }
    }
    const resolver = createResolver(import.meta.url)
    addPlugin({
      src: resolver.resolve('./plugin.server'),
      mode: 'server',
    })
    addPlugin({
      src: resolver.resolve('./plugin.client'),
      mode: 'client',
    })
  },
})
