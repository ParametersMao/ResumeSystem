import request from './request';
export function aiPolish(payload) {
    return request.post('/api/ai/polish', payload).then((res) => res.data);
}
export function aiGenerate(payload) {
    return request.post('/api/ai/generate', payload).then((res) => res.data);
}
