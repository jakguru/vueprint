import { createApp } from 'vue'
import App from './App.vue'
import VueMainBootstrap from '@jakguru/vueprint/bootstraps/vue/main'
import VueClientBootstrap from '@jakguru/vueprint/bootstraps/vue/client'
import { vueprintMainPluginOptions, vueprintClientPluginOptions } from '../../configurations'

const app = createApp(App)
app.use(VueMainBootstrap, vueprintMainPluginOptions)
app.use(VueClientBootstrap, vueprintClientPluginOptions)
app.mount('#app')
