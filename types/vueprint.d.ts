import type { BusPluginOptions } from '../plugins/bus'
import type { LocalStoragePluginOptions } from '../plugins/ls'
import type { VuetifyPluginOptions } from '../plugins/vuetify'
import type { ApiPluginOptions } from '../plugins/api'
import type { PushPluginOptions } from '../plugins/push'
import type { IdentityPluginOptions } from '../plugins/identity'
import type Webfont from 'webfontloader'

declare interface VueprintModuleOptions {
  bus?: BusPluginOptions
  ls?: LocalStoragePluginOptions
  vuetify?: VuetifyPluginOptions
  api?: ApiPluginOptions
  identity?: IdentityPluginOptions
  push?: PushPluginOptions
  sounds?: Record<string, string>
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

declare global {
  interface Window {
    _vueprint_loaded?: {
      localstorage?: boolean
      cron?: boolean
    }
    Webfont?: Webfont
    __modules__?: any
    __export__?: any
    __dynamic_import__?: any
  }
}

declare class TinyEmitter {
  public e: Record<string, any>
}

export {}
