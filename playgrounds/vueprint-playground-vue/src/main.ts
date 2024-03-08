import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import VueMainBootstrap from '@jakguru/vueprint/bootstraps/vue/main'
import VueClientBootstrap from '@jakguru/vueprint/bootstraps/vue/client'

const app = createApp(App)
app.use(VueMainBootstrap)
app.use(VueClientBootstrap)
app.mount('#app')
