import type { App } from 'vue'
import { Bus } from '../src/bus'
export type {
  BusEventCallbackSignatures,
  BusEvent,
  BusEventCallback,
  BusEventAlreadyTriggered,
  BusEventListenOptions,
  BusEventEmitOptions,
} from '../src/bus'

declare module 'vue' {
  interface ComponentCustomProperties {
    $bus?: Bus
  }
  interface InjectionKey<T> extends Symbol {
    bus: Bus
  }
}

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
    const instance = new Bus(options?.namespace)
    app.provide('bus', instance)
    app.config.globalProperties.$bus = instance
  },
}
