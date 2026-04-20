import http from './request';
import { resolveTemplatePreset } from '@/core-resume/templates';
export async function fetchTemplates(page = 1, limit = 20, keyword = '', industryTags = [], sortBy = 'recommended') {
    const safeLimit = Math.min(limit, 100);
    const tagParam = industryTags.length ? industryTags.join(',') : undefined;
    const { data } = await http.get('/api/templates', {
        params: { page, limit: safeLimit, templateName: keyword, status: true, industryTags: tagParam, sortBy }
    });
    const mapped = {
        list: data.data.list.map((t) => ({
            ...toTemplatePresetMeta({ templateName: t.templateName, templateVariant: t.templateVariant }),
            templateId: String(t.id),
            name: t.templateName,
            coverUrl: t.previewImage || '',
            themeColor: '#2e6cff',
            fontFamily: 'Source Han Sans',
            industryTags: splitIndustryTags(t.industryTags),
            useCount: t.useCount || 0,
            recommendWeight: t.recommendWeight || 0,
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
        ...toTemplatePresetMeta({ templateName: t.templateName, templateVariant: t.templateVariant }),
        templateId: String(t.id),
        name: t.templateName,
        coverUrl: t.previewImage || '',
        themeColor: '#2e6cff',
        fontFamily: 'Source Han Sans',
        industryTags: splitIndustryTags(t.industryTags),
        useCount: t.useCount || 0,
        recommendWeight: t.recommendWeight || 0,
        status: t.status ? 'online' : 'offline'
    };
    return mapped;
}
// 获取模板详情（包含 templateData），优先走 /api/templates/:id
export async function getTemplateDetail(templateId) {
    const { data } = await http.get(`/api/templates/${templateId}`);
    const t = data.data;
    const mapped = {
        ...toTemplatePresetMeta({ templateName: t.templateName, templateVariant: t.templateVariant }, t.templateData ? safeParseTemplateData(t.templateData) : undefined),
        templateId: String(t.id),
        name: t.templateName,
        coverUrl: t.previewImage || '',
        themeColor: '#2e6cff',
        fontFamily: 'Source Han Sans',
        industryTags: splitIndustryTags(t.industryTags),
        useCount: t.useCount || 0,
        recommendWeight: t.recommendWeight || 0,
        status: t.status ? 'online' : 'offline',
        templateData: t.templateData
    };
    return mapped;
}
function toTemplatePresetMeta(source, templateData) {
    const preset = resolveTemplatePreset(source, templateData);
    return {
        presetKey: preset.key,
        templateVariant: preset.variant,
        variantLabel: preset.label,
        variantDescription: preset.description,
    };
}
function safeParseTemplateData(templateData) {
    if (typeof templateData === 'string') {
        try {
            return JSON.parse(templateData);
        }
        catch {
            return undefined;
        }
    }
    return templateData;
}
function splitIndustryTags(value) {
    if (!value) {
        return [];
    }
    return value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
}
export async function listFavoriteTemplateIds() {
    const { data } = await http.get('/api/templates/favorites/list');
    return (data.data.templateIds || []).map((item) => String(item));
}
export async function addFavoriteTemplate(templateId) {
    await http.post(`/api/templates/${templateId}/favorite`);
}
export async function removeFavoriteTemplate(templateId) {
    await http.delete(`/api/templates/${templateId}/favorite`);
}
