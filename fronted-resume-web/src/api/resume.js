import http from './request';
export async function createResume(templateId, title, userId, content) {
    const { data } = await http.post('/api/resumes', {
        templateId: parseInt(templateId),
        title,
        userId,
        content
    });
    return { resumeId: data.data.id.toString() };
}
export async function getResume(resumeId, userId) {
    const params = userId ? { userId } : {};
    const { data } = await http.get(`/api/resumes/${resumeId}`, { params });
    return data.data;
}
export async function updateResume(resumeId, payload, userId) {
    const params = userId ? { userId } : {};
    const { data } = await http.put(`/api/resumes/${resumeId}`, payload, { params });
    return data.data;
}
export async function listMyResumes(userId, page = 1, limit = 10) {
    const { data } = await http.get('/api/resumes', {
        params: { userId, page, limit }
    });
    return data.data;
}
export async function exportResumePdfByHtml(html) {
    const { data } = await http.post('/api/resumes/export', { html });
    return data.data;
}
export async function listResumeVersions(resumeId, userId) {
    const params = userId ? { userId } : {};
    const { data } = await http.get(`/api/resumes/${resumeId}/versions`, { params });
    return data.data;
}
export async function rollbackResumeVersion(resumeId, versionId, userId) {
    const params = userId ? { userId } : {};
    const { data } = await http.post(`/api/resumes/${resumeId}/rollback`, { versionId }, { params });
    return data.data;
}
