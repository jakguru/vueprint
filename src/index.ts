/**
 * @module @jakguru/vueprint
 */
export * as utilities from './utilities'
export * as services from './services'
export * as plugins from './plugins'
export * as libs from './libs'
export * as nuxt from './nuxt'
import type { ApplicationHook, ApplicationHooks } from './utilities'
import type {
  ApiService,
  BusEventCallbackSignatures,
  BusEvent,
  BusEventCallback,
  BusEventAlreadyTriggered,
  BusEventListenOptions,
  BusEventEmitOptions,
  BusService,
  IdentityService,
  LocalStorageService,
  PushedEvent,
  FirebaseTokenAuthenticationCallback,
  PushService,
  SwalService,
  ToastService,
  NotyfService,
  SoundsService,
  VuetifyInstance,
  VuetifiableColors,
  VuetifiableTheme,
  VuetifiableThemes,
  CronService,
  TokenRefreshCallback,
} from './services'
import type {
  ApiPluginOptions,
  BusPluginOptions,
  VueClientBootstrapOptions,
  IdentityPluginOptions,
  LocalStoragePluginOptions,
  VueMainBootstrapOptions,
  PushPluginOptions,
  UiPluginOptions,
  VuetifyPluginOptions,
} from './plugins'
import type { MiliCron, EventCallback } from './libs'
import type { VueprintModuleOptions } from './nuxt'

export {
  ApplicationHook,
  ApplicationHooks,
  ApiService,
  BusEventCallbackSignatures,
  BusEvent,
  BusEventCallback,
  BusEventAlreadyTriggered,
  BusEventListenOptions,
  BusEventEmitOptions,
  BusService,
  LocalStorageService,
  PushedEvent,
  FirebaseTokenAuthenticationCallback,
  PushService,
  SwalService,
  ToastService,
  NotyfService,
  SoundsService,
  VuetifyInstance,
  VuetifiableColors,
  VuetifiableTheme,
  VuetifiableThemes,
  ApiPluginOptions,
  BusPluginOptions,
  VueClientBootstrapOptions,
  IdentityPluginOptions,
  LocalStoragePluginOptions,
  VueMainBootstrapOptions,
  PushPluginOptions,
  UiPluginOptions,
  VuetifyPluginOptions,
  IdentityService,
  CronService,
  MiliCron,
  EventCallback,
  VueprintModuleOptions,
  TokenRefreshCallback,
}
