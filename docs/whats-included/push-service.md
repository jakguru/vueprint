# Push Service

The Push service handles the integration between the application and the browser API's for Push / Desktop notifications and the service workers which are used to enable background push notifications.

## Accessing the Push Service

The Push Service is both injectable and accessible from the global `Vue` instance:

```vue

<script lang="ts">
import { defineComponent, inject } from 'vue'
import type { PushService } from '@jakguru/vueprint'
export default defineComponent({
    setup() {
        const push = inject<PushService>('push')
        return {}
    }
    mounted() {
        const push: PushService = this.config.globalProperties.$push
    }
})
</script>
```

## Using the Push Service

::: info
For more specifics, see the [PushService API Documentation](/api/classes/services_push.PushService)
:::

### Determining Push Permission State

Using the accessor `PushService.canPush` and `PushService.canRequestPermission`, you can determine if the visitor has already permitted push notifications (or web push notifications) or if the application is allowed to request those permissions. This can be used to display a prompt in the UI to request permissions for Push notifications.

It is also possible to activate the permission flow of the browser by triggering `PushService.requestPushPermission` method, or to request that the application disable the `PushService.canRequestPermission` from returning `true` by triggering the `PushService.doNotRequestPushPermission` method.

It is also possible to manually trigger a desktop notification by calling the `PushService.createWebPushNotification` method.
