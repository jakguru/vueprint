import { BusPlugin } from './bus'
import { CronPlugin } from './cron'
import { LocalStoragePlugin } from './ls'
import { VuetifyPlugin } from './vuetify'
import { ApiPlugin } from './api'
import { IdentityPlugin } from './identity'
import { PushPlugin } from './push'
import { UiPlugin } from './ui'
export * from './bus'
export * from './ls'
export * from './vuetify'
export * from './api'
export * from './identity'
export * from './push'
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
