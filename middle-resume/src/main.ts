import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import {
  Cpu,
  Document,
  Expand,
  Files,
  Fold,
  Monitor,
  Odometer,
  Setting,
  Tickets,
  TrendCharts,
  User,
  UserFilled,
  Warning,
} from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useUserStore } from '@/store/modules/user'

import './styles/index.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const icons = {
  Cpu,
  Document,
  Expand,
  Files,
  Fold,
  Monitor,
  Odometer,
  Setting,
  Tickets,
  TrendCharts,
  User,
  UserFilled,
  Warning,
}

for (const [key, component] of Object.entries(icons)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(i18n)

const userStore = useUserStore()
userStore.initUser && userStore.initUser()

app.mount('#app')
