import { computed } from 'vue';
const props = defineProps({
    section: {
        type: Object,
        required: true
    },
    items: {
        type: Array,
        default: () => []
    },
    config: {
        type: Object,
        default: () => ({})
    },
    styleConfig: {
        type: Object,
        default: () => ({})
    }
});
// 是否有分隔符
const hasSeparator = computed(() => {
    const styleConfig = props.styleConfig || {};
    const itemsConfig = styleConfig.items || {};
    const separator = itemsConfig.separator || {};
    return separator.type && separator.type !== 'none';
});
// 格式化时间区间
function getDuration(item) {
    if (!item)
        return '';
    if (item.duration) {
        const start = item.duration.start || '';
        const end = item.duration.end || '';
        return `${start} - ${end}`;
    }
    if (Array.isArray(item.dateRange)) {
        const start = item.dateRange[0] || '';
        const end = item.dateRange[1] || '';
        return `${start} - ${end}`;
    }
    const start = item.start || item.startDate || '';
    const end = item.end || item.endDate || '';
    return `${start} - ${end}`;
}
// 检查是否有实际内容
function hasActualContent(item) {
    const desc = getDescription(item);
    if (!desc)
        return false;
    return String(desc).trim().length > 0;
}
// 获取描述内容
function getDescription(item) {
    if (!item)
        return '';
    const raw = item.desc ??
        item.description ??
        (Array.isArray(item.responsibilities) ? item.responsibilities.join('\n') : item.responsibilities) ??
        '';
    if (!raw)
        return '';
    // 如果是纯字符串
    if (typeof raw === 'string') {
        return raw;
    }
    // 如果是对象，优先使用html属性
    if (typeof raw === 'object') {
        if (raw.html) {
            return raw.html;
        }
        if (raw.text) {
            return raw.text;
        }
    }
    // 兜底：返回空字符串（不再显示 JSON）
    return '';
}
function getCompany(item) {
    return item?.company || item?.organization || item?.companyName || '';
}
function getRole(item) {
    return item?.role || item?.position || item?.title || '';
}
// 净化HTML内容
function sanitizeHtml(html) {
    if (!html)
        return '';
    // 确保html是字符串
    const htmlStr = String(html);
    // 基础安全过滤
    return htmlStr
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .replace(/onclick/gi, '')
        .replace(/onerror/gi, '');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['experience-item']} */ ;
/** @type {__VLS_StyleScopedClasses['experience-description']} */ ;
/** @type {__VLS_StyleScopedClasses['experience-description']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "experience-renderer" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "experience-item" },
        ...{ class: ({ 'with-separator': __VLS_ctx.hasSeparator }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "experience-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "experience-main" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "experience-company" },
    });
    (__VLS_ctx.getCompany(item));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "experience-role" },
    });
    (__VLS_ctx.getRole(item));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "experience-time" },
    });
    (__VLS_ctx.getDuration(item));
    if (__VLS_ctx.hasActualContent(item)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "experience-description" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(__VLS_ctx.getDescription(item))) }, null, null);
    }
}
/** @type {__VLS_StyleScopedClasses['experience-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['experience-item']} */ ;
/** @type {__VLS_StyleScopedClasses['experience-header']} */ ;
/** @type {__VLS_StyleScopedClasses['experience-main']} */ ;
/** @type {__VLS_StyleScopedClasses['experience-company']} */ ;
/** @type {__VLS_StyleScopedClasses['experience-role']} */ ;
/** @type {__VLS_StyleScopedClasses['experience-time']} */ ;
/** @type {__VLS_StyleScopedClasses['experience-description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            hasSeparator: hasSeparator,
            getDuration: getDuration,
            hasActualContent: hasActualContent,
            getDescription: getDescription,
            getCompany: getCompany,
            getRole: getRole,
            sanitizeHtml: sanitizeHtml,
        };
    },
    props: {
        section: {
            type: Object,
            required: true
        },
        items: {
            type: Array,
            default: () => []
        },
        config: {
            type: Object,
            default: () => ({})
        },
        styleConfig: {
            type: Object,
            default: () => ({})
        }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        section: {
            type: Object,
            required: true
        },
        items: {
            type: Array,
            default: () => []
        },
        config: {
            type: Object,
            default: () => ({})
        },
        styleConfig: {
            type: Object,
            default: () => ({})
        }
    },
});
; /* PartiallyEnd: #4569/main.vue */
