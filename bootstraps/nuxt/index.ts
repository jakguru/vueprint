import {
  defineNuxtModule,
  createResolver,
  addImports,
  addTypeTemplate,
  addPlugin,
  resolveModule,
} from '@nuxt/kit'
import { defu } from 'defu'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import type {
  BusPluginOptions,
  LocalStoragePluginOptions,
  VuetifyPluginOptions,
  ApiPluginOptions,
  PushPluginOptions,
  IdentityPluginOptions,
} from '../../plugins'

interface VueprintModuleOptions {
  bus?: BusPluginOptions
  ls?: LocalStoragePluginOptions
  vuetify?: VuetifyPluginOptions
  api?: ApiPluginOptions
  identity?: IdentityPluginOptions
  push?: PushPluginOptions
  sounds?: Record<string, string>
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
  setup(vueprintOptions, nuxt) {
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
      config.plugins.push(vuetify({ autoImport: true }))
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
    nuxt.options.alias.vueprint =
      nuxt.options.alias.vueprint ||
      // FIXME: remove this deprecated call. Ensure it works in Nuxt 2 to 3
      resolveModule('@jakguru/vueprint/dist/bootstraps/nuxt/index.mjs', {
        paths: [nuxt.options.rootDir, import.meta.url],
      })
    nuxt.options.runtimeConfig.public.vueprint = defu(
      nuxt.options.runtimeConfig.public.vueprint as VueprintModuleOptions,
      vueprintOptions
    )
    const resolver = createResolver(import.meta.url)
    addTypeTemplate({
      filename: 'types/vueprint.d.ts',
      getContents: () => `// Generated by vueprint
          import type {
            BusPluginOptions,
            LocalStoragePluginOptions,
            VuetifyPluginOptions,
            ApiPluginOptions,
            PushPluginOptions,
            IdentityPluginOptions,
          } from '@jakguru/vueprint'

          interface VueprintModuleOptions {
            bus?: BusPluginOptions
            ls?: LocalStoragePluginOptions
            vuetify?: VuetifyPluginOptions
            api?: ApiPluginOptions
            identity?: IdentityPluginOptions
            push?: PushPluginOptions
            sounds?: Record<string, string>
          }

          declare module '@nuxt/schema' {
            interface NuxtConfig { ['vueprint']?: Partial<VueprintModuleOptions> }
            interface NuxtOptions { ['vueprint']?: VueprintModuleOptions }
            interface PublicRuntimeConfig { ['vueprint']?: VueprintModuleOptions }
          }
          `,
    })
    addImports({
      name: 'useVueprint',
      as: 'useVueprint',
      from: resolver.resolve('/composables/useVueprint'),
    })
    addPlugin(resolver.resolve('./plugin.server.mjs'))
    addPlugin(resolver.resolve('./plugin.client.mjs'))
  },
})