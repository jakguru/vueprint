import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import VueMainBootstrap from '@jakguru/vueprint/bootstraps/vue/main.ts'
import VueClientBootstrap from '@jakguru/vueprint/bootstraps/vue/client.ts'

const app = createApp(App)
app.use(VueMainBootstrap)
app.use(VueClientBootstrap)
app.mount('#app')
