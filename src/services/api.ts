import axios, { Axios } from 'axios'
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
  })
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

export type ApiService = Axios
