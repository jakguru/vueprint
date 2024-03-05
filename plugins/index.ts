import BusPlugin from './bus'
import CronPlugin from './cron'
import LocalStoragePlugin from './ls'
import VuetifyPlugin from './vuetify'
import ApiPlugin from './api'
import IdentityPlugin from './identity'
import PushPlugin from './push'
import UiPlugin from './ui'
export type { BusPluginOptions } from './bus'
export type { LocalStoragePluginOptions } from './ls'
export type { VuetifyPluginOptions } from './vuetify'
export type { ApiPluginOptions } from './api'
export type { IdentityPluginOptions } from './identity'
export type { PushPluginOptions } from './push'
export default {
  bus: BusPlugin,
  cron: CronPlugin,
  ls: LocalStoragePlugin,
  vuetify: VuetifyPlugin,
  api: ApiPlugin,
  identity: IdentityPlugin,
  push: PushPlugin,
  ui: UiPlugin,
}
