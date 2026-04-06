import http from './request';
export async function fetchTemplates(page = 1, limit = 20, keyword = '', industryTags = []) {
    const tagParam = industryTags.length ? industryTags.join(',') : undefined;
    const { data } = await http.get('/api/templates', { params: { page, limit, templateName: keyword, status: true, industryTags: tagParam } });
    const mapped = {
        list: data.data.list.map((t) => ({
            templateId: String(t.id),
            name: t.templateName,
            coverUrl: t.previewImage || '',
            themeColor: '#2e6cff',
            fontFamily: 'Source Han Sans',
            status: t.status ? 'online' : 'offline'
        })),
        total: data.data.total,
        page: data.data.page,
        limit: data.data.limit
    };
    return mapped;
}
export async function getTemplate(templateId) {
    const { data } = await http.get(`/api/templates`, { params: { id: templateId } });
    const t = Array.isArray(data.data?.list) ? data.data.list.find((x) => String(x.id) === templateId) : data.data;
    const mapped = {
        templateId: String(t.id),
        name: t.templateName,
        coverUrl: t.previewImage || '',
        themeColor: '#2e6cff',
        fontFamily: 'Source Han Sans',
        status: t.status ? 'online' : 'offline'
    };
    return mapped;
}
// 获取模板详情（包含 templateData），优先走 /api/templates/:id
export async function getTemplateDetail(templateId) {
    const { data } = await http.get(`/api/templates/${templateId}`);
    const t = data.data;
    const mapped = {
        templateId: String(t.id),
        name: t.templateName,
        coverUrl: t.previewImage || '',
        themeColor: '#2e6cff',
        fontFamily: 'Source Han Sans',
        status: t.status ? 'online' : 'offline',
        templateData: t.templateData
    };
    return mapped;
}
