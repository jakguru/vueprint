import axios, { Axios } from 'axios'
import { LocalStorage } from './localStorage'
import { Bus } from './bus'

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
