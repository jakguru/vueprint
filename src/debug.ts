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
    if ('undefined' === typeof window) {
      console.log(`[${name}]`, ...args)
      return
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
