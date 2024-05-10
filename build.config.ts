import pkg from './package.json' assert { type: 'json' }
import { defineBuildConfig } from 'unbuild'
import type { BuildHooks } from 'unbuild'
import type { Plugin } from 'rollup'
import fs from 'fs-extra'
import { join } from 'path'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import RollupPluginLicense from 'rollup-plugin-license'

const customExternals: Array<string> = [
  '#app',
  '@nuxt/kit',
  '@nuxt/schema',
  '#imports',
  'nuxt',
  'nuxt/app',
  '@vuetify/loader-shared',
  'sweetalert2',
  '@types/webfontloader',
]
const includedExternals: Array<string> = [
  '@mdi/font',
  '@mdi/font/css/materialdesignicons.css',
  'tiny-emitter',
]
const externalsWithCustoms = pkg.dependencies
  ? [...customExternals, ...Object.keys(pkg.dependencies)]
  : [...customExternals]
const externals = externalsWithCustoms.filter((external) => !includedExternals.includes(external))

const webpackConfig: webpack.Configuration = {
  mode: 'production',
  entry: './src/vueprint.scss',
  output: {
    path: new URL('./dist', import.meta.url).pathname,
    filename: 'style.js',
    assetModuleFilename: 'assets/[hash][ext][query]', // Customize as needed
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext][query]',
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'vueprint.css',
    }),
  ],
}

const webpackConfigForVuePrintNoVuetify: webpack.Configuration = {
  ...webpackConfig,
  entry: './src/vueprint-no-vuetify.scss',
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'vueprint-no-vuetify.css',
    }),
  ],
}

const onRollupOptions: BuildHooks['rollup:options'] | BuildHooks['rollup:dts:options'] = (
  _ctx,
  options
) => {
  if (!options.plugins || !Array.isArray(options.plugins)) {
    options.plugins = []
  }
  const exists = options.plugins.find(
    (plugin) =>
      'object' === typeof plugin &&
      null !== plugin &&
      'string' === typeof (plugin as Plugin).name &&
      (plugin as Plugin).name === 'rollup-plugin-license'
  )
  if (!exists) {
    options.plugins.push(
      // @ts-ignore
      RollupPluginLicense({
        banner: `VuePrint v${pkg.version}
      Copyright (c) 2024 Jak Guru LLC
      Vueprint a commerical work product released under the MIT License
      and is provided as-is with no warranty or guarantee of support.
      Documentation: https://jakguru.github.io/vueprint/
      
      Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to deal
      in the Software without restriction, including without limitation the rights
      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:

      The above copyright notice and this permission notice shall be included in all
      copies or substantial portions of the Software.

      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
      SOFTWARE.`,
        thirdParty: {
          includePrivate: true,
          output: {
            file: join(new URL('./dist', import.meta.url).pathname, 'dependencies.txt'),
            encoding: 'utf-8', // Default is utf-8.
          },
        },
      })
    )
  }
}

export default defineBuildConfig({
  failOnWarn: false,
  name: pkg.name,
  sourcemap: true,
  rollup: {
    inlineDependencies: true,
  },
  declaration: 'compatible',
  externals,
  hooks: {
    'rollup:options': onRollupOptions,
    'rollup:dts:options': onRollupOptions,
    'build:prepare': (ctx) => {
      ctx.options.entries = ctx.options.entries.filter(
        (entry) =>
          !entry.input ||
          (!entry.input.endsWith('src/vueprint') && !entry.input.includes('vueprint-no-vuetify'))
      )
    },
    'mkdist:done': async () => {
      const results = await Promise.all([
        new Promise((resolve, reject) => {
          webpack(webpackConfig, (err, stats) => {
            if (err || stats?.hasErrors()) {
              return reject(
                err ||
                  stats?.toString({
                    colors: true,
                  })
              )
            }
            resolve(
              stats!.toString({
                colors: true,
              })
            )
          })
        }),
        new Promise((resolve, reject) => {
          webpack(webpackConfigForVuePrintNoVuetify, (err, stats) => {
            if (err || stats?.hasErrors()) {
              return reject(
                err ||
                  stats?.toString({
                    colors: true,
                  })
              )
            }
            resolve(
              stats!.toString({
                colors: true,
              })
            )
          })
        }),
        new Promise((resolve) => {
          fs.copyFile('./src/vueprint.scss', './dist/vueprint.scss', () => {
            resolve('Copied vueprint.scss')
          })
        }),
        new Promise((resolve) => {
          fs.copyFile('./src/vueprint-no-vuetify.scss', './dist/vueprint-no-vuetify.scss', () => {
            resolve('Copied vueprint-no-vuetify.scss')
          })
        }),
        new Promise(async (resolve) => {
          if (fs.existsSync('./dist/style.js')) {
            await fs.remove('./dist/style.js')
            return resolve('Removed style.js')
          } else {
            return resolve('style.js does not exist')
          }
        }),
      ])
      results.forEach((result) => {
        console.log(result)
      })
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
