import type { App } from 'vue'
import { Bus } from 'src/bus'

declare module 'vue' {
  interface ComponentCustomProperties {
    $bus?: Bus
  }
  interface InjectionKey<T> extends Symbol {
    bus: Bus
  }
}

export interface BusPluginOptions {
  namespace?: string
}

export default {
  install: (app: App, options?: BusPluginOptions) => {
    const instance = new Bus(options?.namespace)
    app.provide('bus', instance)
    app.config.globalProperties.$bus = instance
  },
}
