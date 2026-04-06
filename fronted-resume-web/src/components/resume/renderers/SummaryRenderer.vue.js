import { inject } from 'vue';
const props = defineProps({
    section: {
        type: Object,
        required: true
    },
    items: {
        type: [Array, Object, String],
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
// 尝试从父组件注入resumeData
const resumeData = inject('resumeData', null);
// 格式化对象为可读字符串
function formatObject(obj) {
    if (!obj)
        return '';
    try {
        if (typeof obj === 'object') {
            return JSON.stringify(obj, null, 2);
        }
        return String(obj);
    }
    catch (e) {
        return '无法格式化对象';
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
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-renderer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-content" },
});
if (typeof __VLS_ctx.items === 'string') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-text" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(__VLS_ctx.items)) }, null, null);
}
else if (Array.isArray(__VLS_ctx.items) && __VLS_ctx.items.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-items" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "summary-item" },
        });
        if (typeof item === 'string') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(item)) }, null, null);
        }
        else if (item && typeof item === 'object') {
            if (item.text && typeof item.text === 'object' && item.text.html) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(item.text.html)) }, null, null);
            }
            else {
                if (item.text) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(item.text)) }, null, null);
                }
                else if (item.html) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(item.html)) }, null, null);
                }
                else {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    (__VLS_ctx.formatObject(item));
                }
            }
        }
    }
}
else if (__VLS_ctx.section.data && __VLS_ctx.section.data.summary) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-text" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(__VLS_ctx.section.data.summary)) }, null, null);
}
else if (__VLS_ctx.section.data && __VLS_ctx.section.data.profile && __VLS_ctx.section.data.profile.summary) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-text" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(__VLS_ctx.section.data.profile.summary)) }, null, null);
}
else if (__VLS_ctx.resumeData && __VLS_ctx.resumeData.profile && __VLS_ctx.resumeData.profile.summary) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-text" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.sanitizeHtml(__VLS_ctx.resumeData.profile.summary)) }, null, null);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-debug" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
        ...{ class: "debug-info" },
    });
    (__VLS_ctx.formatObject({ items: __VLS_ctx.items, section: __VLS_ctx.section }));
}
/** @type {__VLS_StyleScopedClasses['summary-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-content']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-text']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-items']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-text']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-text']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-text']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-debug']} */ ;
/** @type {__VLS_StyleScopedClasses['debug-info']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            resumeData: resumeData,
            formatObject: formatObject,
            sanitizeHtml: sanitizeHtml,
        };
    },
    props: {
        section: {
            type: Object,
            required: true
        },
        items: {
            type: [Array, Object, String],
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
            type: [Array, Object, String],
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
