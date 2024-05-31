import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        transformAssetUrls,
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
