# Service Worker Provider

The service worker provider acts as a wrapper around the functionality of the service worker to integrate it more closely with your application for functionality such as background messages, push notifications or application updates.

::: tip
The Service Worker Provider is meant to be used in the service worker.
:::

## Accessing the Service Worker Provider

The Service Worker Provider should be imported from `@jakguru/vueprint/pwa/worker`

```typescript
import { ServiceWorkerProvider } from '@jakguru/vueprint/pwa/worker'
import type { ServiceWorkerProviderOptions } from '@jakguru/vueprint/pwa/worker'
```

## Using the Service Worker Provider

::: info
For more specifics, see the [ServiceWorkerProvider API Documentation](/api/classes/pwa_worker.ServiceWorkerProvider)
:::

### Configuration

The Service Worker Provider constructor accepts 2 arguments: `self` which is an instance of `ServiceWorkerGlobalScope`, and an optional <code>[ServiceWorkerProviderOptions](/api/interfaces/pwa_worker.ServiceWorkerProviderOptions)</code> object which has 2 properties:

| Key | Type | Description |
| --- | --- | --- |
| `firebase` | [FirebaseOptions](https://firebase.google.com/docs/reference/js/app.firebaseoptions) | Firebase configuration object. Contains a set of parameters required by services in order to successfully communicate with Firebase server APIs and to associate client data with your Firebase project and Firebase application. |
| `namespace` | `string` | The namespace to use in the `broadcast-channel` to ensure that messages are sent and received between tabs |

### Adding Hooks

The Service Worker Provider includes an instance of the [Bus Service](/whats-included/bus-service) under the hood, so you can use the same `.on`, `.once`, `.off`, `.emit` and `.await` methods which you would normally use with the Bus Service.

### Booting the Service Worker Provider

After initializing the Service Worker Provider instance, you will need to call `instance.boot()` to activate all of processes.

#### Available Service Worker Events

* `sw:activate`
* `sw:install`
* `sw:fetch`
* `sw:message`
* `sw:messageerror`
* `sw:notificationclick`
* `sw:notificationclose`
* `sw:push`
* `sw:pushsubscriptionchange`
* `sw:sync`
* `sw:backgroundfetchabort`
* `sw:backgroundfetchclick`
* `sw:backgroundfetchfail`
* `sw:backgroundfetchsuccess`
* `sw:canmakepayment`
* `sw:contentdelete`
* `sw:cookiechange`
* `sw:paymentrequest`
* `sw:periodicsync`

## Practical Example

```typescript
import { ServiceWorkerProvider } from '@jakguru/vueprint/pwa/worker'
import type { ServiceWorkerProviderOptions } from '@jakguru/vueprint/pwa/worker'
import type { FirebaseOptions } from 'firebase/app'

declare global {
  interface ImportMeta {
    env: Record<string, string>
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis

const firebase: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FCM_CONFIG_API_KEY || '',
  authDomain: import.meta.env.VITE_FCM_CONFIG_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FCM_CONFIG_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FCM_CONFIG_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FCM_CONFIG_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FCM_CONFIG_APP_ID || '',
  measurementId: import.meta.env.VITE_FCM_CONFIG_MEASUREMENT_ID || '',
}

const options: ServiceWorkerProviderOptions = {
  namespace: import.meta.env.VITE_APP_NAMESPACE,
  firebase,
}

const instance = new ServiceWorkerProvider(self, options)
instance.boot()
```
