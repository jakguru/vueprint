/**
 * @module @jakguru/vueprint/utilities
 */
export * as validation from './validation'
export * as debug from './debug'
export * as colors from './colors'
export * as files from './files'
export * as browser from './browser'
import { useVueprint, getBootStatuses } from '../services/installer'
import type { ComputedRef } from 'vue'

declare global {
  interface Window {
    _vueprint_loaded?: {
      localstorage?: boolean
      cron?: boolean
    }
  }
}

/**
 * Define the shape of a hook that will be used when an application property changes state
 */
export interface ApplicationHook {
  onTrue?: () => void
  onFalse?: () => void
}

/**
 * Define the hooks that will be used when an application property changes state
 */
export interface ApplicationHooks {
  onBooted?: ApplicationHook
  onReady?: ApplicationHook
  onAuthenticated?: ApplicationHook
  onPushPermissions?: ApplicationHook
}

/**
 * Defines the current state of the implementation of the VuePrint integration with the application
 * @property booted If all pre-mount services have been booted
 * @property mounted If the application is currently mounted
 * @property ready If all post-mount services have been booted
 */
export interface ApplicationVueprintState {
  // If the application is currently mounted
  booted: ComputedRef<boolean>
  // If all pre-mount services have been booted
  mounted: ComputedRef<boolean>
  // If all post-mount services have been booted
  ready: ComputedRef<boolean>
  // If the application is updatable
  updateable: ComputedRef<boolean>
}

export { useVueprint, getBootStatuses }
