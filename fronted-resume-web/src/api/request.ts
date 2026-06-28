import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { setupMock } from './mock'
import router from '@/router'

// 使用相对地址时，开发环境通过 Vite 代理访问后端，生产环境由反向代理转发。
const apiBaseURL = import.meta.env.VITE_API_BASE || '/'

function normalizeApiUrl(url: string) {
  const normalizedBase = apiBaseURL.replace(/\/+$/, '')
  if (normalizedBase === '/api' && /^\/api(\/|$)/.test(url)) {
    return url.replace(/^\/api(?=\/|$)/, '')
  }
  return url
}

const instance = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
})

let isRefreshing = false
let pendingRequests: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function onRefreshed(newToken: string) {
  pendingRequests.forEach(({ resolve }) => resolve(newToken))
  pendingRequests = []
}

function onRefreshFailed(error: unknown) {
  pendingRequests.forEach(({ reject }) => reject(error))
  pendingRequests = []
}

instance.interceptors.request.use((config) => {
  if (config.url) config.url = normalizeApiUrl(config.url)
  const user = useUserStore()
  if (user.token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      ElMessage.error('网络连接失败，请检查网络后重试')
      return Promise.reject(error)
    }

    const { status, data } = error.response
    const originalConfig = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (status === 401 && !originalConfig._retry) {
      originalConfig._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        handleUnauthorized()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve: (token: string) => {
              originalConfig.headers.Authorization = `Bearer ${token}`
              resolve(instance(originalConfig))
            },
            reject,
          })
        })
      }

      isRefreshing = true
      try {
        const refreshResponse = await axios.post(
          normalizeApiUrl('/api/auth/refresh'),
          { refresh_token: refreshToken },
          { baseURL: apiBaseURL },
        )
        const newAccessToken = refreshResponse.data?.data?.access_token
        const newRefreshToken = refreshResponse.data?.data?.refresh_token
        if (!newAccessToken) throw new Error('刷新接口未返回有效 token')

        const user = useUserStore()
        user.setToken(newAccessToken)
        if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken)
        onRefreshed(newAccessToken)
        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`
        return instance(originalConfig)
      } catch (refreshError) {
        onRefreshFailed(refreshError)
        handleUnauthorized()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    switch (status) {
      case 401:
        handleUnauthorized()
        break
      case 403:
        ElMessage.error((data as { message?: string })?.message || '无权访问')
        break
      case 429: {
        const retryAfter = error.response.headers['retry-after']
        const suffix = retryAfter ? `，请在 ${retryAfter} 秒后重试` : '，请稍后再试'
        ElMessage.warning(`操作过于频繁${suffix}`)
        break
      }
      case 500:
        ElMessage.error('服务器错误，请稍后重试')
        break
      default: {
        const message = (data as { message?: string })?.message
        if (message) ElMessage.error(message)
      }
    }
    return Promise.reject(error)
  },
)

function handleUnauthorized() {
  const user = useUserStore()
  user.setToken('')
  user.setUser(null)
  localStorage.removeItem('refresh_token')
  ElMessage.warning('登录已过期，请重新登录')
  router.push('/login')
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  limit: number
}

if (import.meta.env.VITE_USE_MOCK === 'true') {
  setupMock(instance)
}

export default instance
