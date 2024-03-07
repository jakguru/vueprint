import axios, { Axios } from 'axios'
import { LocalStorage } from './localStorage'
import { Bus } from './bus'

/**
 * Initialize an instance of Axios with the given base URL, LocalStorage instance, and Bus instance
 * @private
 * @param baseURL The URL to use as the base for all requests
 * @param ls The LocalStorage instance to use for storing and retrieving the bearer token
 * @param bus The Bus instance to use for unauthorized requests
 * @returns An Axios instance
 */
export const initializeApi = (baseURL: string, ls: LocalStorage, bus: Bus): Axios => {
  if (!(ls instanceof LocalStorage)) {
    throw new Error('Invalid or missing LocalStorage instance')
  }
  if (!(bus instanceof Bus)) {
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
