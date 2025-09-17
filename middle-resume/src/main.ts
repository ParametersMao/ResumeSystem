import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useUserStore } from '@/store/modules/user'

import './styles/index.css'

// 默认启用暗色主题（Element Plus 基于 .dark 选择器切换 css vars）
if (!document.documentElement.classList.contains('dark')) {
  document.documentElement.classList.add('dark')
}

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(ElementPlus, {
  locale: zhCn,
})

// 初始化用户信息，确保刷新后能自动恢复登录状态
const userStore = useUserStore()
userStore.initUser && userStore.initUser()

app.mount('#app') 