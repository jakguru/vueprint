import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import { uglify } from 'rollup-plugin-uglify'
import pkg from './package.json' assert { type: 'json' }

export default [
  // browser-friendly UMD build
  {
    input: 'index.ts',
    output: {
      name: 'vueprint',
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
      exports: 'default',
    },
    plugins: [
      typescript({
        outputToFilesystem: true,
        exclude: ['bin/**/*', 'tests/**/*', 'vitepress/**/*'],
      }),
      resolve(),
      commonjs(),
      json(),
      nodePolyfills(),
      uglify(),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'index.ts',
    external: pkg.dependencies ? Object.keys(pkg.dependencies) : [],
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true, exports: 'default' },
      { file: pkg.module, format: 'es', sourcemap: true, exports: 'default' },
    ],
    plugins: [
      typescript({
        outputToFilesystem: true,
        exclude: ['bin/**/*', 'tests/**/*', 'vitepress/**/*'],
      }),
      resolve(),
      commonjs(),
      json(),
    ],
  },
]
