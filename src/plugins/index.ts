/**
 * @module @jakguru/vueprint/plugins
 */
import './augmentations'
export * as api from './api'
export * as bus from './bus'
export * as cron from './cron'
export * as identity from './identity'
export * as ls from './ls'
export * as push from './push'
export * as ui from './ui'
export * as vuetify from './vuetify'
export * as main from './main'
export * as client from './client'
import type { ApiPluginOptions } from './api'
import type { BusPluginOptions } from './bus'
import type { VueClientBootstrapOptions } from './client'
import type { IdentityPluginOptions } from './identity'
import type { LocalStoragePluginOptions } from './ls'
import type { VueMainBootstrapOptions } from './main'
import type { PushPluginOptions } from './push'
import type { UiPluginOptions } from './ui'
import type {
  VuetifiableColors,
  VuetifiableTheme,
  VuetifiableThemes,
  VuetifyPluginOptions,
} from './vuetify'
export {
  ApiPluginOptions,
  BusPluginOptions,
  VueClientBootstrapOptions,
  IdentityPluginOptions,
  LocalStoragePluginOptions,
  VueMainBootstrapOptions,
  PushPluginOptions,
  UiPluginOptions,
  VuetifiableColors,
  VuetifiableTheme,
  VuetifiableThemes,
  VuetifyPluginOptions,
}
