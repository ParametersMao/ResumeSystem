import { SECTION_TYPES } from '@/config/sectionTypes';
export function createEmptyRichText() {
    return {
        html: '',
        text: '',
        json: []
    };
}
export function normalizeRichTextValue(value) {
    if (!value) {
        return createEmptyRichText();
    }
    if (typeof value === 'string') {
        return {
            html: value,
            text: stripHtml(value),
            json: []
        };
    }
    if (typeof value === 'object') {
        const html = typeof value.html === 'string' ? value.html : '';
        const text = typeof value.text === 'string' ? value.text : (html ? stripHtml(html) : '');
        const json = Array.isArray(value.json) ? value.json : [];
        return {
            html,
            text,
            json
        };
    }
    return {
        html: String(value),
        text: String(value),
        json: []
    };
}
export function normalizeSectionRichText(section) {
    const config = SECTION_TYPES[section.type];
    if (!config?.fields?.length || !Array.isArray(section.items)) {
        return section;
    }
    const richFields = config.fields.filter(field => field.type === 'textarea' && field.richText);
    if (richFields.length === 0) {
        return section;
    }
    section.items = section.items.map(item => {
        if (typeof item !== 'object' || item === null)
            return item;
        const next = { ...item };
        richFields.forEach(field => {
            next[field.name] = normalizeRichTextValue(next[field.name]);
        });
        return next;
    });
    return section;
}
export function stripHtml(html) {
    if (!html)
        return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
