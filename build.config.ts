import pkg from './package.json' assert { type: 'json' }
import { defineBuildConfig } from 'unbuild'
import fs from 'fs-extra'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const customExternals: Array<string> = ['#app', '@nuxt/schema', '#imports', 'nuxt', 'nuxt/app']
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
        (entry) => !entry.input || !entry.input.endsWith('src/vueprint')
      )
    },
    'mkdist:done': async () => {
      const res = await new Promise((resolve, reject) => {
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
      })
      console.log(res)
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
