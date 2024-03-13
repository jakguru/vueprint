import pkg from './package.json' assert { type: 'json' }
import { defineBuildConfig } from 'unbuild'
import sass from 'sass'
import fs from 'fs-extra'

const customExternals: Array<string> = ['#app', '@nuxt/schema', '#imports', 'nuxt', 'nuxt/app']
const includedExternals: Array<string> = ['@mdi/font', '@mdi/font/css/materialdesignicons.css']
const externalsWithCustoms = pkg.dependencies
  ? [...customExternals, ...Object.keys(pkg.dependencies)]
  : [...customExternals]
const externals = externalsWithCustoms.filter((external) => !includedExternals.includes(external))
export default defineBuildConfig({
  failOnWarn: false,
  name: pkg.name,
  sourcemap: true,
  declaration: 'compatible',
  externals,
  hooks: {
    'build:prepare': (ctx) => {
      ctx.options.entries = ctx.options.entries.filter(
        (entry) => !entry.input || !entry.input.endsWith('src/vueprint')
      )
    },
    'mkdist:done': () => {
      const compiledSass = sass.compile('./src/vueprint.scss', {
        style: 'compressed',
        loadPaths: ['./node_modules/'],
      })
      fs.writeFileSync('dist/vueprint.css', compiledSass.css, { encoding: 'utf-8' })
    },
    'build:done': () => {
      const nuxtRelatedFiles = fs.readdirSync('./dist/nuxt')
      nuxtRelatedFiles.forEach((file) => {
        const current = fs.readFileSync(`./dist/nuxt/${file}`, { encoding: 'utf-8' })
        const updated = current.replace('nuxt/app', `#imports`)
        if (current !== updated) {
          fs.writeFileSync(`./dist/nuxt/${file}`, updated, { encoding: 'utf-8' })
        }
      })
    },
  },
})
