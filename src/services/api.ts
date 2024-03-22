/**
 * The API Service is a simple instance of [Axios](https://axios-http.com/) which has been pre-configured to include a `bearer` token provided from the [Local Storage](/api/classes/jakguru_vueprint_services_localStorage.LocalStorageService) service.
 * @module @jakguru/vueprint/services/api
 */
import axios, {
  Axios,
  AxiosDefaults,
  AxiosInterceptorManager,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { LocalStorageService } from './localStorage'
import { BusService } from './bus'

/**
 * Initialize an instance of Axios with the given base URL, LocalStorageService instance, and Bus instance
 * @private
 * @param baseURL The URL to use as the base for all requests
 * @param ls The LocalStorageService instance to use for storing and retrieving the bearer token
 * @param bus The Bus instance to use for unauthorized requests
 * @returns An Axios instance
 */
export const initializeApi = (baseURL: string, ls: LocalStorageService, bus: BusService): Axios => {
  if (!(ls instanceof LocalStorageService)) {
    throw new Error('Invalid or missing LocalStorageService instance')
  }
  if (!(bus instanceof BusService)) {
    throw new Error('Invalid or missing Bus instance')
  }
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
  }) as ApiService
  instance.interceptors.request.use(
    (config) => {
      if (ls && ls.loaded) {
        const bearer = ls.get('bearer')
        if (bearer) {
          config.headers.Authorization = `Bearer ${bearer}`
        }
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  instance.interceptors.response.use(
    (response) => {
      if (response.status === 401) {
        if (bus) {
          bus.emit('api:unauthorized', {
            local: true,
            crossTab: true,
          })
        }
      }
      return response
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        if (bus) {
          bus.emit('api:unauthorized', {
            local: true,
            crossTab: true,
          })
        }
      }
      return Promise.reject(error)
    }
  )
  return instance
}

/**
 * Check if the given variable is an Axios instance
 * @group Utility Functions
 * @param instance The variable that should be checked to see if it is an Axios instance
 * @returns boolean indicating whether the given variable is an Axios instance
 */
export const isAxiosInstance = (instance: any): boolean => {
  return (
    'function' === typeof instance &&
    'object' === typeof instance.defaults &&
    'function' === typeof instance.request &&
    'function' === typeof instance.get &&
    'function' === typeof instance.delete &&
    'function' === typeof instance.head &&
    'function' === typeof instance.options &&
    'function' === typeof instance.post &&
    'function' === typeof instance.put &&
    'function' === typeof instance.patch
  )
}

/**
 * The API Service is a simple instance of [Axios](https://axios-http.com/) which has been pre-configured to include a `bearer` token provided from the [Local Storage](/api/classes/jakguru_vueprint_services_localStorage.LocalStorageService) service.
 * @remarks
 * ## Accessing the API Service
 *
 * The API Service is both injectable and accessible from the global `Vue` instance:
 *
 * ```vue
 *
 * <script lang="ts">
 * import { defineComponent, inject } from 'vue'
 * import type { ApiService } from '@jakguru/vueprint'
 * export default defineComponent({
 *     setup() {
 *         const api = inject<ApiService>('api')
 *         return {}
 *     }
 *     mounted() {
 *         const api: ApiService = this.config.globalProperties.$api
 *     }
 * })
 * </script>
 * ```
 *
 * ## Using the API Service
 *
 * For more information, please see the [Axios API Documentation](https://axios-http.com/docs/api_intro)
 */
export declare class ApiService extends Axios {
  constructor(config?: AxiosRequestConfig)
  public defaults: AxiosDefaults
  public interceptors: {
    request: AxiosInterceptorManager<InternalAxiosRequestConfig>
    response: AxiosInterceptorManager<AxiosResponse>
  }
  public getUri(config?: AxiosRequestConfig): string
  public request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>
  public get<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R>
  public delete<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R>
  public head<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R>
  public options<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R>
  public post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>
  public put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>
  public patch<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>
  public postForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>
  public putForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>
  public patchForm<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>
}
