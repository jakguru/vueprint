import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import styles from 'rollup-plugin-styles'
import pkg from './package.json' assert { type: 'json' }
// import { fileURLToPath } from 'url'
// import { dirname, join } from 'path'

// eslint-disable-next-line @typescript-eslint/naming-convention
// const __filename = fileURLToPath(import.meta.url)
// eslint-disable-next-line @typescript-eslint/naming-convention
// const __dirname = dirname(__filename)

const files = [
  'index.ts',
  'bootstraps/vue/client.ts',
  'bootstraps/vue/main.ts',
  'nuxt/index.ts',
  'composables/useVueprint.ts',
  'plugins/bus.ts',
  'plugins/cron.ts',
  'plugins/ls.ts',
  'plugins/vuetify.ts',
  'plugins/api.ts',
  'plugins/identity.ts',
  'plugins/push.ts',
  'plugins/ui.ts',
]

const configurations = files.map((file) => {
  return {
    input: file,
    external: pkg.dependencies ? ['@nuxt/kit', ...Object.keys(pkg.dependencies)] : ['@nuxt/kit'],
    output: [
      {
        file: ['dist', file.replace(/\.ts$/, '.js')].join('/'),
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        assetFileNames: '[name][extname]',
      },
      {
        file: ['dist', file.replace(/\.ts$/, '.mjs')].join('/'),
        format: 'es',
        sourcemap: true,
        exports: 'named',
        assetFileNames: '[name][extname]',
      },
    ],
    plugins: [
      typescript({
        outputToFilesystem: true,
        exclude: ['bin/**/*', 'tests/**/*', 'vitepress/**/*', 'docs/**/*', 'playgrounds/**/*'],
      }),
      styles({
        mode: [file === 'index.ts' ? 'extract' : 'inject', 'assets/styles.css'],
        dts: true,
        minimize: true,
        sourceMap: true,
      }),
      resolve(),
      commonjs(),
      json(),
    ],
  }
})

export default configurations

// export default [
//   {
//     input: 'index.ts',
//     external: pkg.dependencies ? ['@nuxt/kit', ...Object.keys(pkg.dependencies)] : ['@nuxt/kit'],
//     output: [
//       {
//         file: pkg.main,
//         format: 'cjs',
//         sourcemap: true,
//         exports: 'named',
//         assetFileNames: '[name][extname]',
//       },
//       {
//         file: pkg.module,
//         format: 'es',
//         sourcemap: true,
//         exports: 'named',
//         assetFileNames: '[name][extname]',
//       },
//     ],
//     plugins: [
//       typescript({
//         outputToFilesystem: true,
//         exclude: ['bin/**/*', 'tests/**/*', 'vitepress/**/*', 'docs/**/*', 'playgrounds/**/*'],
//       }),
//       styles({
//         mode: ['extract', 'assets/styles.css'],
//         dts: true,
//         minimize: true,
//         sourceMap: true,
//       }),
//       resolve(),
//       commonjs(),
//       json(),
//     ],
//   },
// ]
