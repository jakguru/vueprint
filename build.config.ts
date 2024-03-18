import pkg from './package.json' assert { type: 'json' }
import { defineBuildConfig } from 'unbuild'
import fs from 'fs-extra'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const customExternals: Array<string> = [
  '#app',
  '@nuxt/schema',
  '#imports',
  'nuxt',
  'nuxt/app',
  '@vuetify/loader-shared',
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
