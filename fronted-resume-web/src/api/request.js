import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import { setupMock } from './mock';
import router from '@/router';
// 使用相对 baseURL，开发态通过 Vite 代理到后端，避免浏览器 CORS
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || '/',
    timeout: 15000
});
// ==================== Token 自动刷新状态 ====================
let isRefreshing = false;
let pendingRequests = [];
function onRefreshed(newToken) {
    pendingRequests.forEach(({ resolve }) => resolve(newToken));
    pendingRequests = [];
}
function onRefreshFailed(err) {
    pendingRequests.forEach(({ reject }) => reject(err));
    pendingRequests = [];
}
// ==================== 请求拦截器 ====================
instance.interceptors.request.use((config) => {
    const user = useUserStore();
    if (user.token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
});
// ==================== 响应拦截器（统一错误处理 + Token 自动刷新） ====================
instance.interceptors.response.use((resp) => resp, async (err) => {
    if (!err.response) {
        // 网络错误：无响应
        ElMessage.error('网络连接失败，请检查网络后重试');
        return Promise.reject(err);
    }
    const { status, data } = err.response;
    const originalConfig = err.config;
    // ---- 401：Token 过期，尝试自动刷新 ----
    if (status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            // 没有 refresh_token，直接清除登录状态跳转登录页
            handleUnauthorized();
            return Promise.reject(err);
        }
        // 如果已经在刷新中，排队等待
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingRequests.push({
                    resolve: (token) => {
                        originalConfig.headers['Authorization'] = `Bearer ${token}`;
                        resolve(instance(originalConfig));
                    },
                    reject
                });
            });
        }
        isRefreshing = true;
        try {
            // 调用刷新接口
            const refreshRes = await axios.post('/api/auth/refresh', { refresh_token: refreshToken }, { baseURL: import.meta.env.VITE_API_BASE || '/' });
            const newAccessToken = refreshRes.data?.data?.access_token;
            const newRefreshToken = refreshRes.data?.data?.refresh_token;
            if (!newAccessToken)
                throw new Error('刷新接口未返回有效 token');
            // 更新本地存储
            const user = useUserStore();
            user.setToken(newAccessToken);
            if (newRefreshToken) {
                localStorage.setItem('refresh_token', newRefreshToken);
            }
            // 通知排队的请求
            onRefreshed(newAccessToken);
            // 重试原始请求
            originalConfig.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return instance(originalConfig);
        }
        catch (refreshErr) {
            // 刷新失败，清除登录状态
            onRefreshFailed(refreshErr);
            handleUnauthorized();
            return Promise.reject(refreshErr);
        }
        finally {
            isRefreshing = false;
        }
    }
    // ---- 统一错误提示 ----
    switch (status) {
        case 401:
            // 401 且 _retry=true（刷新后仍然 401），说明 refresh_token 也过期了
            handleUnauthorized();
            break;
        case 403:
            ElMessage.error('无权访问，请联系管理员');
            break;
        case 500:
            ElMessage.error('服务器错误，请稍后重试');
            break;
        default: {
            // 其他错误使用后端返回的 message，或兜底提示
            const msg = data?.message;
            if (msg) {
                ElMessage.error(msg);
            }
            break;
        }
    }
    return Promise.reject(err);
});
/**
 * 清除登录状态并跳转登录页
 */
function handleUnauthorized() {
    const user = useUserStore();
    user.setToken('');
    user.setUser(null);
    localStorage.removeItem('refresh_token');
    ElMessage.warning('登录已过期，请重新登录');
    router.push('/login');
}
// 仅当显式设置 VITE_USE_MOCK=true 时启用本地 Mock
if (import.meta.env.VITE_USE_MOCK === 'true') {
    setupMock(instance);
}
export default instance;
