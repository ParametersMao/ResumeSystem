import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, getProfile } from '@/api/user'
import type { User, LoginForm } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  /**
   * 登录，调用真实后端接口
   */
  const login = async (loginForm: LoginForm) => {
    loading.value = true
    try {
      const response = await apiLogin(loginForm)
      // 响应拦截器已解包，response 就是 ApiResponse，data 字段在 response.data 中
      const { access_token, user: userInfo } = response.data
      token.value = access_token
      user.value = userInfo
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userInfo))
      return response
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initUser = async () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      // 尝试获取用户信息
      try {
        const res = await getProfile()
        // 响应拦截器已解包，res.data 就是用户数据
        user.value = res.data
        localStorage.setItem('user', JSON.stringify(res.data))
      } catch {
        logout()
      }
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  return {
    token,
    user,
    loading,
    isLoggedIn,
    login,
    logout,
    initUser,
    updateUser
  }
}, {
  persist: true
}) 