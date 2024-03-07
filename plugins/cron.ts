import type { App } from 'vue'
import { MiliCron } from '@jakguru/milicron'

declare module 'vue' {
  interface ComponentCustomProperties {
    $cron?: MiliCron
  }
  interface InjectionKey<T> extends Symbol {
    cron: MiliCron
  }
}

/**
 * A plugin managing time based repeating tasks (cron jobs)
 */
export const CronPlugin = {
  install: (app: App) => {
    const instance = new MiliCron()
    app.provide('cron', instance)
    app.config.globalProperties.$cron = instance
  },
}
