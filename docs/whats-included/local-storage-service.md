# Local Storage Service

The Local Storage service is used to store information used by the application. It keeps all information encrypted using [secure-ls](https://www.npmjs.com/package/secure-ls) as a driver, while ensuring that all components of the application and all instances of the application in the same browser are kept in sync.

## Accessing the Local Storage Service

The Local Storage Service is both injectable and accessible from the global `Vue` instance:

```vue

<script lang="ts">
import { defineComponent, inject } from 'vue'
import type { LocalStorageService } from '@jakguru/vueprint'
export default defineComponent({
    setup() {
        const ls = inject<LocalStorageService>('ls')
        return {}
    }
    mounted() {
        const ls: LocalStorageService = this.config.globalProperties.$ls
    }
})
</script>
```

## Using the Local Storage Service

::: info
For more specifics, see the [LocalStorageService API Documentation](/api/classes/services_localStorage.LocalStorageService)
:::

The main methods for interacting with the Local Storage Service are the `LocalStorageService.get` and `LocalStorageService.set` methods.
