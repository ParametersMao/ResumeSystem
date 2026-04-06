import request from './request';
// C端用户登录
export function login(params) {
    return request.post('/api/auth/cuser/login', params).then(res => res.data);
}
// C端用户注册
export function register(params) {
    return request.post('/api/auth/register', params).then(res => res.data);
}
// 获取用户信息
export function getUserInfo() {
    return request.get('/api/auth/cuser/profile').then(res => res.data);
}
// 退出登录（前端操作，清除token）
export function logout() {
    // 这里可以调用后端接口使token失效，目前只做前端清理
    return Promise.resolve();
}
