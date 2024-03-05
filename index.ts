import { getDebugger } from 'src/debug'
import {
  colorToCssColor,
  hexToRGBObject,
  hexToRGBA,
  hueToRgb,
  hslToRgb,
  colorToCssWithAlpha,
  colorToLottie,
} from 'src/colors'
import nuxt from './nuxt'
import * as plugins from './plugins'

export default {
  nuxt,
  plugins,
  getDebugger,
  colorToCssColor,
  hexToRGBObject,
  hexToRGBA,
  hueToRgb,
  hslToRgb,
  colorToCssWithAlpha,
  colorToLottie,
}
