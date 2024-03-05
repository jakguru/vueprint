import BusPlugin from './bus'
import CronPlugin from './cron'
import LocalStoragePlugin from './ls'
export type { BusPluginOptions } from './bus'
export type { LocalStoragePluginOptions } from './ls'
export default { bus: BusPlugin, cron: CronPlugin, ls: LocalStoragePlugin }
