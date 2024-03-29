/**
 * @module @jakguru/vueprint/plugins/cron
 */
import './augmentations'
import type { App, Plugin } from 'vue'
import { MiliCron } from '../libs/milicron'

/**
 * @todo: change milicron to use something other than the nodejs event emitter as a foundation
 */

/**
 * A plugin managing time based repeating tasks (cron jobs)
 */
export const CronPlugin: Plugin<unknown> = {
  install: (app: App) => {
    const instance = new MiliCron()
    app.provide('cron', instance)
    app.config.globalProperties.$cron = instance
  },
}
