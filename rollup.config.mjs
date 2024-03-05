import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import styles from 'rollup-plugin-styles'
import pkg from './package.json' assert { type: 'json' }

export default [
  {
    input: 'index.ts',
    external: pkg.dependencies ? Object.keys(pkg.dependencies) : [],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'default',
        assetFileNames: '[name][extname]',
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
        exports: 'default',
        assetFileNames: '[name][extname]',
      },
    ],
    plugins: [
      typescript({
        outputToFilesystem: true,
        exclude: ['bin/**/*', 'tests/**/*', 'vitepress/**/*'],
      }),
      styles({
        mode: ['extract', 'assets/styles.css'],
        dts: true,
        minimize: true,
        sourceMap: true,
      }),
      resolve(),
      commonjs(),
      json(),
    ],
  },
]
