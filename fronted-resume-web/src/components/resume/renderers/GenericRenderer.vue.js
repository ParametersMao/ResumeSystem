import { computed } from 'vue';
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
// 模块类型
const sectionType = computed(() => props.section.type || 'generic');
// 是否为列表类型
const isList = computed(() => Array.isArray(props.items));
// 是否有分隔符
const hasSeparator = computed(() => {
    const styleConfig = props.styleConfig || {};
    const itemsConfig = styleConfig.items || {};
    const separator = itemsConfig.separator || {};
    return separator.type && separator.type !== 'none';
});
// 项目样式
const itemStyle = computed(() => {
    const styleConfig = props.styleConfig || {};
    const itemsConfig = styleConfig.items || {};
    return {
        marginBottom: itemsConfig.spacing || '15px',
        // 其他项目样式
        ...itemsConfig
    };
});
// 过滤出可显示的属性
function visibleItemProps(obj) {
    const result = {};
    if (!obj)
        return result;
    // 过滤掉特殊属性和函数
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] !== 'function' &&
            key !== 'component' &&
            key !== 'style' &&
            key !== 'config' &&
            key !== 'className' &&
            !key.startsWith('_')) {
            result[key] = obj[key];
        }
    });
    return result;
}
// 格式化字段名称
function formatFieldName(key) {
    // 将驼峰命名转换为空格分隔的词组
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}
// 格式化字段值
function formatFieldValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'object') {
        // 对象类型的特殊处理
        if (value.html) {
            return value.html;
        }
        if (value.text) {
            return value.text;
        }
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        // 日期区间对象
        if (value.start || value.end) {
            return `${value.start || ''} - ${value.end || ''}`;
        }
        try {
            return JSON.stringify(value);
        }
        catch (e) {
            return '[Object]';
        }
    }
    return String(value);
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
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "generic-renderer" },
});
if (__VLS_ctx.isList) {
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: ([
                    'section-item',
                    `section-${__VLS_ctx.sectionType}-item`,
                    { 'with-separator': __VLS_ctx.hasSeparator }
                ]) },
            ...{ style: (__VLS_ctx.itemStyle) },
        });
        if (typeof item === 'string') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-text" },
            });
            (item);
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-content" },
            });
            if (item.text) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "item-text" },
                });
                (item.text);
            }
            else if (item.html) {
            }
            else {
                for (const [value, key] of __VLS_getVForSourceType((__VLS_ctx.visibleItemProps(item)))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (key),
                        ...{ class: "item-field" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "field-name" },
                    });
                    (__VLS_ctx.formatFieldName(key));
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "field-value" },
                    });
                    (__VLS_ctx.formatFieldValue(value));
                }
            }
        }
    }
}
else {
    if (typeof __VLS_ctx.items === 'object') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "object-content" },
        });
        for (const [value, key] of __VLS_getVForSourceType((__VLS_ctx.visibleItemProps(__VLS_ctx.items)))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (key),
                ...{ class: "item-field" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "field-name" },
            });
            (__VLS_ctx.formatFieldName(key));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "field-value" },
            });
            (__VLS_ctx.formatFieldValue(value));
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "text-content" },
        });
        (__VLS_ctx.items);
    }
}
/** @type {__VLS_StyleScopedClasses['generic-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['item-text']} */ ;
/** @type {__VLS_StyleScopedClasses['item-content']} */ ;
/** @type {__VLS_StyleScopedClasses['item-text']} */ ;
/** @type {__VLS_StyleScopedClasses['item-field']} */ ;
/** @type {__VLS_StyleScopedClasses['field-name']} */ ;
/** @type {__VLS_StyleScopedClasses['field-value']} */ ;
/** @type {__VLS_StyleScopedClasses['object-content']} */ ;
/** @type {__VLS_StyleScopedClasses['item-field']} */ ;
/** @type {__VLS_StyleScopedClasses['field-name']} */ ;
/** @type {__VLS_StyleScopedClasses['field-value']} */ ;
/** @type {__VLS_StyleScopedClasses['text-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            sectionType: sectionType,
            isList: isList,
            hasSeparator: hasSeparator,
            itemStyle: itemStyle,
            visibleItemProps: visibleItemProps,
            formatFieldName: formatFieldName,
            formatFieldValue: formatFieldValue,
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
