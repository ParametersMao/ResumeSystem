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
    else if (item.date) {
        return item.date;
    }
    if (Array.isArray(item.dateRange)) {
        const start = item.dateRange[0] || '';
        const end = item.dateRange[1] || '';
        return `${start} - ${end}`;
    }
    const start = item.start || item.startDate || '';
    const end = item.end || item.endDate || '';
    return start || end ? `${start} - ${end}` : '';
}
// 获取描述内容
function getDescription(item) {
    if (!item)
        return '';
    const raw = item.desc ?? item.description ?? item.summary ?? '';
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
    // 兜底：转换为字符串
    try {
        return JSON.stringify(item.desc);
    }
    catch (e) {
        return '';
    }
    function hasActualContent(item) {
        const desc = getDescription(item);
        if (!desc)
            return false;
        return String(desc).trim().length > 0;
    }
    function getProjectName(item) {
        return item?.name || item?.projectName || '';
    }
    function getProjectRole(item) {
        return item?.role || item?.position || '';
    }
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
/** @type {__VLS_StyleScopedClasses['project-item']} */ ;
/** @type {__VLS_StyleScopedClasses['project-description']} */ ;
/** @type {__VLS_StyleScopedClasses['project-description']} */ ;
/** @type {__VLS_StyleScopedClasses['project-description']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "projects-renderer" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "project-item" },
        ...{ class: ({ 'with-separator': __VLS_ctx.hasSeparator }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "project-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "project-main" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "project-name" },
    });
    (__VLS_ctx.getProjectName(item));
    if (__VLS_ctx.getProjectRole(item)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "project-role" },
        });
        (__VLS_ctx.getProjectRole(item));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "project-time" },
    });
    (__VLS_ctx.getDuration(item));
    if (__VLS_ctx.hasActualContent(item)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "project-description" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(__VLS_ctx.getDescription(item))) }, null, null);
    }
}
/** @type {__VLS_StyleScopedClasses['projects-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['project-item']} */ ;
/** @type {__VLS_StyleScopedClasses['project-header']} */ ;
/** @type {__VLS_StyleScopedClasses['project-main']} */ ;
/** @type {__VLS_StyleScopedClasses['project-name']} */ ;
/** @type {__VLS_StyleScopedClasses['project-role']} */ ;
/** @type {__VLS_StyleScopedClasses['project-time']} */ ;
/** @type {__VLS_StyleScopedClasses['project-description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            hasSeparator: hasSeparator,
            getDuration: getDuration,
            getDescription: getDescription,
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
