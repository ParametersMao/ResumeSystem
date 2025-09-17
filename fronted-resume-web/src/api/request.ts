import axios from 'axios'
import { useUserStore } from '@/store/user'
import { setupMock } from './mock'

// 使用相对 baseURL，开发态通过 Vite 代理到后端，避免浏览器 CORS
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/',
  timeout: 15000
})

instance.interceptors.request.use((config) => {
  const user = useUserStore()
  if (user.token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${user.token}`
  }
  return config
})

instance.interceptors.response.use(
  (resp) => resp,
  (err) => Promise.reject(err)
)

export interface ApiResponse<T> { code: number; message: string; data: T }
export interface PageResult<T> { list: T[]; total: number; page: number; limit: number }

// 仅当显式设置 VITE_USE_MOCK=true 时启用本地 Mock
if (import.meta.env.VITE_USE_MOCK === 'true') {
  setupMock(instance)
}

export default instance


