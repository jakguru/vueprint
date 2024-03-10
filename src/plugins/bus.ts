import './augmentations'
import type { App } from 'vue'
import { BusService } from '../services/bus'
export type {
  BusEventCallbackSignatures,
  BusEvent,
  BusEventCallback,
  BusEventAlreadyTriggered,
  BusEventListenOptions,
  BusEventEmitOptions,
} from '../services/bus'

/**
 * The options for the bus plugin
 */
export interface BusPluginOptions {
  namespace?: string
}

/**
 * A plugin for an event bus which supports events within the same window, across windows, and background push events
 */
export const BusPlugin = {
  install: (app: App, options?: BusPluginOptions) => {
    const instance = new BusService(options?.namespace)
    app.provide('bus', instance)
    app.config.globalProperties.$bus = instance
  },
}
