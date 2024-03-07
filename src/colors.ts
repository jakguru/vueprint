import colors from 'vuetify/util/colors'
import { getInstance } from './vuetify'
import type Colors from 'vuetify/util/colors'
type ColorKey = keyof typeof Colors

const { round } = Math

let colorsPopulated = false
const stringToColor = new Map<string, string>()

/**
 * Get a map of color names to their hex values
 * @returns A map of color names to their hex values
 */
export function getColorMap() {
  if (!colorsPopulated) {
    const vuetify = getInstance()
    const themeColors = vuetify.theme.current.value.colors
    for (const key in themeColors) {
      stringToColor.set(key, themeColors[key])
    }
    const regularColors = Object.keys(colors) as Array<ColorKey>
    regularColors.forEach((regularColor) => {
      if (regularColor === 'shades') {
        const shades = Object.keys(colors.shades) as Array<keyof typeof colors.shades>
        shades.forEach((shade) => {
          stringToColor.set(shade, colors.shades[shade])
        })
      } else {
        const color = colors[regularColor]
        const shades = Object.keys(color) as Array<string>
        shades.forEach((shade) => {
          if (shade === 'base') {
            stringToColor.set(regularColor, colors[regularColor][shade])
          } else {
            const suffix = shade.replace(/([a-zA-Z]+)([0-9]+)/gm, '$1-$2')
            const prefix = regularColor
              .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
              .toLowerCase()
            const key = `${prefix}-${suffix}`
            stringToColor.set(key, color[shade as keyof typeof color])
          }
        })
      }
    })
    colorsPopulated = true
  }
  return stringToColor
}

/**
 * Returns a CSS-safe color string
 * @param color The color to convert to a CSS color
 * @returns The css-safe color string
 */
export function colorToCssColor(color: string) {
  if (typeof color !== 'string' || color.trim().length === 0) {
    return color
  }
  if (color.startsWith('#') || color.startsWith('rgb')) {
    return color
  }
  const colorMap = getColorMap()
  const val = colorMap.get(color)
  if (val) {
    return val
  }
  return ''
}

/**
 * Get the hex value of a color
 * @param hex The hex color to convert to an RGB object
 * @returns an object with the r, g, and b values of the hex color
 */
export function hexToRGBObject(hex: string) {
  // Remove the # character if it exists
  hex = hex.replace('#', '')

  // Convert the hex value to RGB values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return {
    r,
    g,
    b,
  }
}

/**
 * Get an RGBA string from a hex color
 * @param hex The hex color to convert to an RGBA string
 * @param alpha The alpha value to use for the RGBA string
 * @returns an RGBA string
 */
export function hexToRGBA(hex: string, alpha = 1) {
  const { r, g, b } = hexToRGBObject(hex)
  return `rgba(${[r, g, b, alpha].filter((v) => 'number' === typeof v && v > 0).join(',')})`
}

/**
 * Converts a Hue value to its RGB representation, given intermediary values calculated from lightness and saturation.
 * This function is a helper function, typically used within a larger algorithm to convert HSL colors to RGB format.
 * It interpolates the RGB value based on the hue's position within its segment of the color wheel.
 *
 * @param {number} p An intermediary value calculated from the lightness, used to adjust the RGB value based on the lightness.
 * @param {number} q Another intermediary value calculated from the lightness and saturation, used to fine-tune the RGB adjustment.
 * @param {number} t Represents the hue component adjusted to fit within one of three ranges for RGB conversion. It should be modified based on the specific RGB channel (red, green, blue) being calculated.
 * @returns {number} The calculated RGB value (for a single channel: R, G, or B) based on the input hue and intermediary values.
 */
export function hueToRgb(p: number, q: number, t: number) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
export function hslToRgb(h: number, s: number, l: number) {
  let r
  let g
  let b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hueToRgb(p, q, h + 1 / 3)
    g = hueToRgb(p, q, h)
    b = hueToRgb(p, q, h - 1 / 3)
  }

  return [round(r * 255), round(g * 255), round(b * 255)]
}

/**
 * Convert a color from a variety of formats to an RGBA string
 * @param color The color to convert to an RGBA string
 * @param alpha The alpha value to use for the RGBA string
 * @returns an RGBA string
 */
export function colorToCssWithAlpha(color: string, alpha = 1) {
  color = colorToCssColor(color)
  if (!color) {
    return ''
  }
  if (color.startsWith('#')) {
    return hexToRGBA(color, alpha)
  }
  // trim all whitespaces and convert to lowercase to normalize the function
  color = color.replace(/\s/g, '').toLowerCase()
  if (color.startsWith('rgba')) {
    // get the rgb values from the rgba and replace the alpha with the new one
    return color.replace(/rgba\(([^)]+)\)/, `rgba($1, ${alpha})`)
  }
  if (color.startsWith('rgb')) {
    // get the rgb values from the rgb and add the alpha
    return color.replace(/rgb\(([^)]+)\)/, `rgba($1, ${alpha})`)
  }
  if (color.startsWith('hsl')) {
    // get the hsl values from the hsl, convert to rgb and add the alpha
    const hsl = color.replace(/hsl\(([^)]+)\)/, '$1').split(',')
    const h = parseInt(hsl[0])
    const s = parseInt(hsl[1])
    const l = parseInt(hsl[2])
    const rgb = hslToRgb(h, s, l)
    return `rgba(${rgb.join(',')}, ${alpha})`
  }
}

/**
 * Convert a color from a variety of formats to a Lottie color array
 * @param color The color to convert to a Lottie color array
 * @param alpha The alpha value to use for the Lottie color array
 * @returns a Lottie color array
 */
export function colorToLottie(color: string, alpha = 1) {
  color = colorToCssColor(color)
  if (!color) {
    return [0, 0, 0, alpha]
  }
  // trim all whitespaces and convert to lowercase to normalize the function
  color = color.replace(/\s/g, '').toLowerCase()
  let r: number | undefined
  let g: number | undefined
  let b: number | undefined
  if (color.startsWith('#')) {
    const obj = hexToRGBObject(color)
    r = obj.r
    g = obj.g
    b = obj.b
  }
  if (color.startsWith('rgba')) {
    // get the rgb values from the rgba
    const rgba = color.replace(/rgba\(([^)]+)\)/, '$1').split(',')
    r = parseInt(rgba[0])
    g = parseInt(rgba[1])
    b = parseInt(rgba[2])
  }
  if (color.startsWith('rgb')) {
    // get the rgb values from the rgb
    const rgb = color.replace(/rgb\(([^)]+)\)/, '$1').split(',')
    r = parseInt(rgb[0])
    g = parseInt(rgb[1])
    b = parseInt(rgb[2])
  }
  if (color.startsWith('hsl')) {
    // get the hsl values from the hsl, convert to rgb and add the alpha
    const hsl = color.replace(/hsl\(([^)]+)\)/, '$1').split(',')
    const h = parseInt(hsl[0])
    const s = parseInt(hsl[1])
    const l = parseInt(hsl[2])
    const rgb = hslToRgb(h, s, l)
    r = rgb[0]
    g = rgb[1]
    b = rgb[2]
  }
  if (!r) {
    r = 0
  }
  if (!g) {
    g = 0
  }
  if (!b) {
    b = 0
  }
  if (r > 255) {
    r = 255
  }
  if (g > 255) {
    g = 255
  }
  if (b > 255) {
    b = 255
  }
  const lr = 0 === r ? 0 : r / 255
  const lg = 0 === g ? 0 : g / 255
  const lb = 0 === b ? 0 : b / 255
  return [lr, lg, lb, alpha]
}
