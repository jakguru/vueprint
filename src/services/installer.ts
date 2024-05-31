import { getDebugger } from '../utilities/debug'
import { ref, computed, inject, watch, nextTick, onBeforeUnmount } from 'vue'
import type { App, WatchStopHandle, ElementNamespace } from 'vue'
import type { BusService, BusEvent } from './bus'
import type { MiliCron } from '../libs/milicron'
import type { IdentityService } from './identity'
import type { PushService } from './push'
import type { ApplicationHooks, ApplicationVueprintState } from '../utilities'

const debug = getDebugger('VuePrint Installer', '#41B883', '#34495E')
const mounted = ref(false)
let bus: BusService | undefined
let cron: MiliCron | undefined
let identity: IdentityService | undefined
let push: PushService | undefined
const booted = ref({
  localstorage: false as boolean | null,
  cron: false as boolean | null,
})
const windowCallBacks = Object.assign(
  {},
  ...Object.keys(booted.value).map((k) => {
    const windowEvent = [k, 'loaded'].join(':')
    const busEvent = ['loaded', k].join(':') as BusEvent
    return {
      [windowEvent]: () => {
        if (bus) {
          bus.emit(busEvent, { local: true })
        }
      },
    }
  }),
  ...Object.keys(booted.value).map((k) => {
    const windowEvent = [k, 'failed'].join(':')
    const busEvent = ['failed', k].join(':') as BusEvent
    return {
      [windowEvent]: () => {
        if (bus) {
          bus.emit(busEvent, { local: true })
        }
      },
    }
  })
)
const busCallBacks = Object.assign(
  {},
  ...Object.keys(booted.value).map((k) => {
    const busEvent = ['loaded', k].join(':') as BusEvent
    return {
      [busEvent]: () => {
        booted.value[k as keyof typeof booted.value] = true
      },
    }
  }),
  ...Object.keys(booted.value).map((k) => {
    const busEvent = ['failed', k].join(':') as BusEvent
    return {
      [busEvent]: () => {
        booted.value[k as keyof typeof booted.value] = null
      },
    }
  })
)
const isBooted = computed(() => Object.values(booted.value).every((v) => v === true || v === null))
const dependanciesBooted = computed(() => ({
  identity: identity?.booted.value || false,
  push: push?.booted.value || false,
}))
const isDependanciesBooted = computed(() =>
  Object.values(dependanciesBooted.value).every((v) => v === true)
)

const isMounted = computed(() => mounted.value)
const isReady = computed(() => isBooted.value === true && isDependanciesBooted.value === true)
const updateable = computed(
  () =>
    isBooted.value &&
    isReady.value &&
    mounted.value &&
    'undefined' !== typeof push &&
    push.appUpdatePending.value
)

/**
 * Initialize the VuePrint integration with the application
 * @param hooks The hooks that will be used when an application property changes state
 * @returns An object containing the state of the application
 */
export const useVueprint = (
  hooks?: ApplicationHooks,
  _debug: boolean = false
): ApplicationVueprintState => {
  let mountedWatchCanceller: WatchStopHandle | undefined
  let bootedWatchCanceller: WatchStopHandle | undefined
  let readyWatchCanceller: WatchStopHandle | undefined
  let identityBootedWatchCanceller: WatchStopHandle | undefined
  let pushBootedWatchCanceller: WatchStopHandle | undefined
  let authenticatedWatchCanceller: WatchStopHandle | undefined
  let pushPermissionWatchCanceller: WatchStopHandle | undefined
  const doHooksOnBootedOnTrue = () => {
    if (hooks && hooks.onBooted && hooks.onBooted.onTrue) {
      hooks.onBooted.onTrue()
    }
  }
  const doHooksOnReadyOnTrue = () => {
    if (hooks && hooks.onReady && hooks.onReady.onTrue) {
      hooks.onReady.onTrue()
    }
  }
  const doHooksOnPushPermissionsOnTrue = () => {
    if (hooks && hooks.onPushPermissions && hooks.onPushPermissions.onTrue) {
      hooks.onPushPermissions.onTrue()
    }
  }
  const doHooksOnAuthenticatedOnTrue = () => {
    if (hooks && hooks.onAuthenticated && hooks.onAuthenticated.onTrue) {
      hooks.onAuthenticated.onTrue()
    }
  }
  const doHooksOnBootedOnFalse = () => {
    if (hooks && hooks.onBooted && hooks.onBooted.onFalse) {
      hooks.onBooted.onFalse()
    }
  }
  const doHooksOnReadyOnFalse = () => {
    if (hooks && hooks.onReady && hooks.onReady.onFalse) {
      hooks.onReady.onFalse()
    }
  }
  const doHooksOnPushPermissionsOnFalse = () => {
    if (hooks && hooks.onPushPermissions && hooks.onPushPermissions.onFalse) {
      hooks.onPushPermissions.onFalse()
    }
  }
  const doHooksOnAuthenticatedOnFalse = () => {
    if (hooks && hooks.onAuthenticated && hooks.onAuthenticated.onFalse) {
      hooks.onAuthenticated.onFalse()
    }
  }
  const onMounted = () => {
    bootedWatchCanceller = watch(
      () => isBooted.value,
      (booted) => {
        if (booted) {
          doHooksOnBootedOnTrue()
        } else {
          doHooksOnBootedOnFalse()
        }
      },
      { immediate: true }
    )
    readyWatchCanceller = watch(
      () => isReady.value,
      (ready) => {
        if (ready) {
          doHooksOnReadyOnTrue()
        } else {
          doHooksOnReadyOnFalse()
        }
      },
      { immediate: true }
    )
    if (push) {
      pushPermissionWatchCanceller = watch(
        () => push!.canPush.value,
        (permission) => {
          if (permission) {
            doHooksOnPushPermissionsOnTrue()
          } else {
            doHooksOnPushPermissionsOnFalse()
          }
        }
      )
      pushBootedWatchCanceller = watch(
        () => push!.booted.value,
        (booted) => {
          dependanciesBooted.value.push = booted
        },
        { immediate: true }
      )
    }
    if (identity) {
      identityBootedWatchCanceller = watch(
        () => identity!.booted.value,
        (is) => {
          dependanciesBooted.value.identity = is
        },
        { immediate: true }
      )
      authenticatedWatchCanceller = watch(identity.authenticated, (authenticated) => {
        if (authenticated) {
          doHooksOnAuthenticatedOnTrue()
        } else {
          doHooksOnAuthenticatedOnFalse()
        }
      })
    }
  }
  const doOnBeforeUnmount = () => {
    if (bootedWatchCanceller) {
      bootedWatchCanceller()
    }
    if (readyWatchCanceller) {
      readyWatchCanceller()
    }
    if (identityBootedWatchCanceller) {
      identityBootedWatchCanceller()
    }
    if (authenticatedWatchCanceller) {
      authenticatedWatchCanceller()
    }
    if (pushBootedWatchCanceller) {
      pushBootedWatchCanceller()
    }
    if (pushPermissionWatchCanceller) {
      pushPermissionWatchCanceller()
    }
  }
  let wasMounted = false
  mountedWatchCanceller = watch(
    () => isMounted.value,
    (is) => {
      if (is) {
        wasMounted = true
        onMounted()
      } else {
        if (wasMounted) {
          doOnBeforeUnmount()
        }
      }
    },
    { immediate: true }
  )
  onBeforeUnmount(() => {
    if (mountedWatchCanceller) {
      mountedWatchCanceller()
    }
    doOnBeforeUnmount()
  })
  return {
    // If the application is currently mounted
    mounted: isMounted,
    // If all pre-mount services have been booted
    booted: isBooted,
    // If all post-mount services have been booted
    ready: isReady,
    // If the application is updatable
    updateable,
  }
}

export function doApplicationMount(
  this: App,
  originalCb: App['mount'],
  rootContainer: string | Element,
  isHydrate?: boolean | undefined,
  namespace?: boolean | ElementNamespace
) {
  debug('Registering VuePrint')
  bus = this.runWithContext(() => inject<BusService>('bus'))
  cron = this.runWithContext(() => inject<MiliCron>('cron'))
  identity = this.runWithContext(() => inject<IdentityService>('identity'))
  push = this.runWithContext(() => inject<PushService>('push'))
  if (cron) {
    cron.$once('* * * * * * *', () => {
      booted.value.cron = true
    })
    debug('Cron service starting')
    cron.start()
    debug('Cron service started')
  } else {
    debug('No cron service found')
  }
  if (window) {
    if (!window._vueprint_loaded) {
      window._vueprint_loaded = {}
    }
    for (const key in windowCallBacks) {
      window.addEventListener(key, windowCallBacks[key])
    }
    for (const key in window._vueprint_loaded) {
      if (true === window._vueprint_loaded[key as keyof typeof window._vueprint_loaded]) {
        windowCallBacks[`${key}:loaded`]()
      } else if (null === window._vueprint_loaded[key as keyof typeof window._vueprint_loaded]) {
        windowCallBacks[`${key}:failed`]()
      }
    }
  }
  if (bus) {
    for (const key in busCallBacks) {
      bus.on(key as BusEvent, busCallBacks[key], { local: true, immediate: true })
    }
  }
  originalCb.call(this, rootContainer, isHydrate, namespace)
  nextTick(() => {
    if (identity) {
      identity.boot()
    }
    if (push) {
      push.boot()
    }
    mounted.value = true
    debug('VuePrint Registration Complete')
  })
}

export function doApplicationUnmount(this: App, originalCb: App['unmount']) {
  mounted.value = false
  debug('Cleaning up VuePrint')
  if (cron) {
    cron.stop()
  }
  if (window) {
    for (const key in windowCallBacks) {
      window.removeEventListener(key, windowCallBacks[key])
    }
  }
  if (bus) {
    for (const key in busCallBacks) {
      bus.off(key as BusEvent, busCallBacks[key], { local: true })
    }
  }
  if (identity) {
    identity.shutdown()
  }
  if (push) {
    push.shutdown()
  }
  debug('VuePrint Cleaned Up')
  originalCb.call(this)
}

/**
 * Get the current boot statuses of the services
 * @returns The current boot statuses of the services
 */
export const getBootStatuses = () => ({
  isBooted: isBooted.value,
  ...booted.value,
  isDependanciesBooted: isDependanciesBooted.value,
  ...dependanciesBooted.value,
})
