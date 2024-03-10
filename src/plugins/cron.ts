import './augmentations'
import type { App } from 'vue'
import { MiliCron } from '@jakguru/milicron'

/**
 * @todo: change milicron to use something other than the nodejs event emitter as a foundation
 */

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
