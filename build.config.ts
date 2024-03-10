import pkg from './package.json' assert { type: 'json' }
import { defineBuildConfig } from 'unbuild'

const customExternals = ['#app', '@nuxt/schema']
export default defineBuildConfig({
  name: pkg.name,
  sourcemap: true,
  declaration: 'compatible',
  externals: pkg.dependencies
    ? [...customExternals, ...Object.keys(pkg.dependencies)]
    : [...customExternals],
})
