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
    const start = item.start || item.startDate || '';
    const end = item.end || item.endDate || '';
    return `${start} - ${end}`;
}
// 获取描述内容
function getDescription(item) {
    if (!item)
        return '';
    const desc = item.desc || item.description;
    if (!desc)
        return '';
    // 如果是纯字符串
    if (typeof desc === 'string') {
        return desc;
    }
    // 如果是对象，优先使用html属性
    if (typeof desc === 'object') {
        if (desc.html) {
            return desc.html;
        }
        if (desc.text) {
            return desc.text;
        }
    }
    // 兜底：转换为字符串
    try {
        return JSON.stringify(desc);
    }
    catch (e) {
        return '';
    }
}
// 净化HTML内容
function sanitizeHtml(html) {
    // 基础安全过滤
    return html
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
/** @type {__VLS_StyleScopedClasses['campus-item']} */ ;
/** @type {__VLS_StyleScopedClasses['campus-description']} */ ;
/** @type {__VLS_StyleScopedClasses['campus-description']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "campus-renderer" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "campus-item" },
        ...{ class: ({ 'with-separator': __VLS_ctx.hasSeparator }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "campus-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "campus-main" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "campus-name" },
    });
    (item.name || item.organization);
    if (item.role || item.position) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "campus-role" },
        });
        (item.role || item.position);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "campus-time" },
    });
    (__VLS_ctx.getDuration(item));
    if (item.desc || item.description) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "campus-description" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(__VLS_ctx.getDescription(item))) }, null, null);
    }
}
/** @type {__VLS_StyleScopedClasses['campus-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['campus-item']} */ ;
/** @type {__VLS_StyleScopedClasses['campus-header']} */ ;
/** @type {__VLS_StyleScopedClasses['campus-main']} */ ;
/** @type {__VLS_StyleScopedClasses['campus-name']} */ ;
/** @type {__VLS_StyleScopedClasses['campus-role']} */ ;
/** @type {__VLS_StyleScopedClasses['campus-time']} */ ;
/** @type {__VLS_StyleScopedClasses['campus-description']} */ ;
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
