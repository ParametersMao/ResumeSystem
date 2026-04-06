import { defineStore } from 'pinia';
import { login as apiLogin, register as apiRegister, getUserInfo, logout as apiLogout } from '@/api/user';
export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('auth_token') || '',
        user: null,
        loading: false
    }),
    getters: {
        isAuthed: (state) => !!state.token && !!state.user,
        isLoggedIn: (state) => !!state.token
    },
    actions: {
        // 设置token
        setToken(token) {
            this.token = token;
            if (token) {
                localStorage.setItem('auth_token', token);
            }
            else {
                localStorage.removeItem('auth_token');
            }
        },
        // 设置用户信息
        setUser(user) {
            this.user = user;
        },
        // 登录
        async login(params) {
            try {
                this.loading = true;
                const response = await apiLogin(params);
                if (response.code === 200) {
                    this.setToken(response.data.access_token);
                    this.setUser(response.data.user);
                    return { success: true, message: response.message };
                }
                else {
                    return { success: false, message: response.message };
                }
            }
            catch (error) {
                const message = error.response?.data?.message || '登录失败';
                return { success: false, message };
            }
            finally {
                this.loading = false;
            }
        },
        // 注册
        async register(params) {
            try {
                this.loading = true;
                const response = await apiRegister(params);
                if (response.code === 200) {
                    this.setToken(response.data.access_token);
                    this.setUser(response.data.user);
                    return { success: true, message: response.message };
                }
                else {
                    return { success: false, message: response.message };
                }
            }
            catch (error) {
                const message = error.response?.data?.message || '注册失败';
                return { success: false, message };
            }
            finally {
                this.loading = false;
            }
        },
        // 获取用户信息
        async fetchUserInfo() {
            if (!this.token)
                return;
            try {
                const response = await getUserInfo();
                if (response.code === 200) {
                    this.setUser(response.data);
                    return true;
                }
            }
            catch (error) {
                console.error('获取用户信息失败:', error);
                // 如果获取用户信息失败，可能token已失效
                this.logout();
            }
            return false;
        },
        // 登出
        async logout() {
            try {
                await apiLogout();
            }
            catch (error) {
                console.error('登出接口调用失败:', error);
            }
            finally {
                this.setToken('');
                this.setUser(null);
            }
        },
        // 初始化用户状态（应用启动时调用）
        async initUserState() {
            if (this.token && !this.user) {
                await this.fetchUserInfo();
            }
        }
    }
});
