import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { transformAssetUrls } from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        transformAssetUrls,
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'pwa',
      filename: 'worker.ts',
      injectRegister: false,
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectManifest: {
        injectionPoint: undefined,
        globPatterns: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@jakguru/vueprint': resolve(__dirname, '../src'),
    },
    dedupe: ['vue', 'vuetify', '@jakguru/vueprint'], // avoid error when using dependencies that also use Vue
  },
})
