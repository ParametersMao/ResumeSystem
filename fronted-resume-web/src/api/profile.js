import request from './request';
export function getCuserProfile() {
    return request.get('/api/cuser/profile').then((res) => res.data);
}
export function updateCuserProfile(payload) {
    return request.patch('/api/cuser/profile', payload).then((res) => res.data);
}
export async function uploadCuserAvatar(file) {
    const form = new FormData();
    if (file)
        form.append('file', file);
    return request.post('/api/cuser/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
}
