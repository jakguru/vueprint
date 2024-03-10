# The API Service

The API Service is a simple instance of [Axios](https://axios-http.com/) which has been pre-configured to include a `bearer` token provided from the [Local Storage](/whats-included/local-storage-service) service.

## Accessing the API Service

The API Service is both injectable and accessible from the global `Vue` instance:

```vue

<script lang="ts">
import { defineComponent, inject } from 'vue'
import type { ApiService } from '@jakguru/vueprint'
export default defineComponent({
    setup() {
        const api = inject<ApiService>('api')
        return {}
    }
    mounted() {
        const api: ApiService = this.config.globalProperties.$api
    }
})
</script>
```

## Using the API Service

For more information, please see the [Axios API Documentation](https://axios-http.com/docs/api_intro)
