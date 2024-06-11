/**
 * @module @jakguru/vueprint/utilities/debug
 */
declare const self: (ServiceWorkerGlobalScope & typeof globalThis) | (Window & typeof globalThis)

/**
 * Generate a function that will log messages to the console
 * @param name The name that will be used to prefix the log messages
 * @param color The color of the text in the name
 * @param background The color of the background in the name
 * @returns A function that will log messages to the console
 */
/* eslint-disable no-console */
export const getDebugger = (
  name: string,
  color: string = '#34495E',
  background: string = '#41B883'
) => {
  return (...args: any[]) => {
    if (
      ('undefined' === typeof window &&
        ('undefined' === typeof ServiceWorkerGlobalScope ||
          !(self instanceof ServiceWorkerGlobalScope))) ||
      ('undefined' !== typeof window &&
        'object' === typeof window.process &&
        'object' === typeof window.__modules__ &&
        'function' === typeof window.__export__ &&
        'function' === typeof window.__dynamic_import__)
    ) {
      console.log(`[${name}]`, ...args)
      return
    }
    if (
      'undefined' !== typeof ServiceWorkerGlobalScope &&
      self instanceof ServiceWorkerGlobalScope
    ) {
      if (!name.startsWith('[') && !name.endsWith(']')) {
        name = `[${name}]`
        const oldColor = color
        color = background
        background = oldColor
      }
    }
    console.groupCollapsed(
      `%c${name}`,
      `background-color: ${background}; color: ${color}; padding: 2px 4px;`,
      ...args
    )
    console.debug(new Error('stack').stack!.split('\n').slice(2).join('\n'))
    console.groupEnd()
  }
}
