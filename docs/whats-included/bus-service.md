# The Bus Service

The bus service is a service which allows event-based communication between components, tabs and services. It offers an API similar to the [NodeJS EventEmitter](https://nodejs.org/docs/latest-v18.x/api/events.html#class-eventemitter) class.

## Accessing the Bus Service

The Bus Service is both injectable and accessible from the global `Vue` instance:

```vue

<script lang="ts">
import { defineComponent, inject } from 'vue'
import type { BusService } from '@jakguru/vueprint'
export default defineComponent({
    setup() {
        const bus = inject<BusService>('bus')
        return {}
    }
    mounted() {
        const bus: BusService = this.config.globalProperties.$bus
    }
})
</script>
```

## Using the Bus Service

::: info
For more specifics, see the [BusService API Documentation](/api/classes/services_bus.BusService)
:::

::: tip
In order to use custom events in typescript, you will need to add some Typescript Augmentations. For more information, see [Typescript Augmentations](/getting-started/typescript-augmentations)
:::

### Triggering an Event

To trigger an event, simply use the `BusService.emit` method, where the first argument is the event that you are triggering, the second argument are the [BusEventListenOptions](/api/interfaces/services_bus.BusEventListenOptions) used to determine where an event is triggered to, and the remaining arguments are the arguments which will be passed to the listening callbacks.

```typescript
bus.emit(
    'some-custom-event',
    { crossTab: true, local: true },
    customArg1,
    customArg2
)
```

### Listening to an Event

To listen to an event, you can use the `BusService.on` and `BusService.once` methods, where the first argument is the event that you are listening to, the second argument is the callback which will be triggered when the event occurs, and the last argument is the [BusEventListenOptions](/api/interfaces/services_bus.BusEventListenOptions) used to determine the scope of events to subscribe to.

```typescript
const someEventCallback = (arg1, arg2, from) => {
    // do something here
}

bus.on(
    'some-custom-event',
    someEventCallback,
    { crossTab: true, local: true }
)
```

To remove a callback from the listen of callbacks triggered when an event occurs, you can use `BusService.off`, where the first argument is the event that you want to stop listening to, the second argument is the callback which should stop being triggered, and the last argument are the [BusEventListenOptions](/api/interfaces/services_bus.BusEventListenOptions) used to determine the scope of events to unsubscribe from.

### Determining if we are currently in the main tab

To determine if the current tab is the main tab, the `BusService.isMain` method can be used.
