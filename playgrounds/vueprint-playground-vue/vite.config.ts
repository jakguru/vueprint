import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // enable hydration mismatch details in production build
    __VUE_PROD_DEVTOOLS__: 'true',
  },
  build: {
    minify: false,
  },
  plugins: [
    nodePolyfills({
      include: ['events'],
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
