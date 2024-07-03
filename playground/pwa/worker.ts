/// <reference lib="WebWorker" />
// @ts-ignore - this actually works
import { ServiceWorkerProvider } from '@jakguru/vueprint/pwa/worker'
// @ts-ignore - this actually works
import { getDebugger } from '@jakguru/vueprint/utilities/debug'
// @ts-ignore - this actually works
import type { ServiceWorkerProviderOptions } from '@jakguru/vueprint/pwa/worker'
import type { FirebaseOptions } from 'firebase/app'

declare const self: ServiceWorkerGlobalScope & typeof globalThis

const debug = getDebugger('SW')

const firebase: FirebaseOptions = {
  apiKey: 'AIzaSyD2Sae2shhrOHh_EwsyRxTa4Kg9QLMsZ_s',
  authDomain: 'vueprint-development.firebaseapp.com',
  projectId: 'vueprint-development',
  storageBucket: 'vueprint-development.appspot.com',
  messagingSenderId: '583302108349',
  appId: '1:583302108349:web:51c168ac2bfefa22be13d4',
}

const options: ServiceWorkerProviderOptions = {
  namespace: 'vueprint',
  firebase,
}

const instance = new ServiceWorkerProvider(self, options)
instance.boot()
debug('Service Worker booted')
