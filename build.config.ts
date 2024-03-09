import pkg from './package.json' assert { type: 'json' }
import { defineBuildConfig } from 'unbuild'

const customExternals = ['#app']
export default defineBuildConfig({
  externals: pkg.dependencies
    ? [...customExternals, ...Object.keys(pkg.dependencies)]
    : [...customExternals],
})
