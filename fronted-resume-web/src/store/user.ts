import { defineStore } from 'pinia'
import {
  getUserInfo,
  login as apiLogin,
  loginByEmailCode,
  logout as apiLogout,
  registerByEmail,
  type LoginParams,
  type LoginResult,
  type UserInfo,
} from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('auth_token') || '',
    user: null as UserInfo | null,
    loading: false,
  }),

  getters: {
    isAuthed: (state) => !!state.token && !!state.user,
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    setToken(token: string) {
      this.token = token
      if (token) localStorage.setItem('auth_token', token)
      else localStorage.removeItem('auth_token')
    },

    setUser(user: UserInfo | null) {
      this.user = user
    },

    applySession(session: LoginResult) {
      this.setToken(session.access_token)
      localStorage.setItem('refresh_token', session.refresh_token)
      this.setUser(session.user as UserInfo)
    },

    async login(params: LoginParams) {
      return this.runSessionRequest(() => apiLogin(params), '登录失败')
    },

    async emailLogin(params: { email: string; code: string }) {
      return this.runSessionRequest(() => loginByEmailCode(params), '邮箱登录失败')
    },

    async emailRegister(params: {
      email: string
      code: string
      password: string
      username?: string
    }) {
      return this.runSessionRequest(() => registerByEmail(params), '注册失败')
    },

    async runSessionRequest(
      request: () => Promise<{ code: number; message: string; data: LoginResult }>,
      fallback: string,
    ) {
      try {
        this.loading = true
        const response = await request()
        if (response.code === 200) {
          this.applySession(response.data)
          return { success: true, message: response.message }
        }
        return { success: false, message: response.message }
      } catch (error: any) {
        return {
          success: false,
          message: error.response?.data?.message || fallback,
        }
      } finally {
        this.loading = false
      }
    },

    async fetchUserInfo() {
      if (!this.token) return false
      try {
        const response = await getUserInfo()
        if (response.code === 200) {
          this.setUser(response.data)
          return true
        }
      } catch {
        await this.logout()
      }
      return false
    },

    async logout() {
      try {
        await apiLogout()
      } finally {
        this.setToken('')
        this.setUser(null)
        localStorage.removeItem('refresh_token')
      }
    },

    async initUserState() {
      if (this.token && !this.user) {
        await this.fetchUserInfo()
      }
    },
  },
})
