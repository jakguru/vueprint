/**
 * @module @jakguru/vueprint/utilities/browser
 */
import Bowser from 'bowser'

/**
 * Describes the shape of the BrowserInfo object
 */
export interface BrowserInfo {
  /**
   * The name of the browser
   */
  browserName: string
  /**
   * The version of the browser
   */
  browserVersion: string
  /**
   * The name of the operating system
   */
  osName: string
  /**
   * The version of the operating system
   */
  osVersion: string
  /**
   * The type of platform i.e. desktop / mobile
   */
  platformType: string
  /**
   * The name of the browser engine
   */
  engineName: string
  /**
   * The version of the browser engine
   */
  engineVersion: string
}

/**
 * Get the current browser information
 * @returns BrowserInfo
 */
export const getBrowserInfo = () => {
  if (!window || !window.navigator || !window.navigator.userAgent) {
    return {
      browserName: 'SSR',
      browserVersion: '0.0.0',
      osName: 'Unknown',
      osVersion: '0.0.0',
      platformType: 'SSR',
      engineName: 'SSR',
      engineVersion: '0.0.0',
    }
  }
  const parsed = Bowser.parse(window.navigator.userAgent)
  return {
    browserName: parsed.browser.name || 'Unknown',
    browserVersion: parsed.browser.version || '0.0.0',
    osName: parsed.os.name || 'Unknown',
    osVersion: parsed.os.version || '0.0.0',
    platformType: parsed.platform.type || 'Unknown',
    engineName: parsed.engine.name || 'Unknown',
    engineVersion: parsed.engine.version || '0.0.0',
  }
}
