import type { ApiService } from '../services/api'
import type { BusService } from '../services/bus'
import type { IdentityService } from '../services/identity'
import type { LocalStorageService } from '../services/localStorage'
import type { PushService } from '../services/push'
import type { SwalService } from '../services/ui'
import type { ToastService } from '../services/ui'
import type { NotyfService } from '../services/ui'
import type { SoundsService } from '../services/ui'
import type { MiliCron } from '../libs/milicron'

declare module 'vue' {
  interface ComponentCustomProperties {
    $api?: ApiService
    $bus?: BusService
    $cron?: MiliCron
    $identity?: IdentityService
    $ls?: LocalStorageService
    $push?: PushService
    $swal?: SwalService
    $toast?: ToastService
    $notyf?: NotyfService
    $sounds?: SoundsService
  }
  interface InjectionKey<T> extends Symbol {
    api: ApiService
    bus: BusService
    cron: MiliCron
    identity: IdentityService
    ls: LocalStorageService
    push: PushService
    swal: SwalService
    toast: ToastService
    notyf: NotyfService
    sounds: SoundsService
  }
}
