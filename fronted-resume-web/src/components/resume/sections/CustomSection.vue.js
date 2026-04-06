import { computed, defineProps } from 'vue';
const props = defineProps();
const titleStyle = computed(() => ({
    fontSize: props.config?.titleStyle?.fontSize || '18px',
    fontWeight: props.config?.titleStyle?.fontWeight || '600',
    color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
    marginBottom: props.config?.titleStyle?.marginBottom || '15px',
    borderBottom: props.config?.titleStyle?.borderBottom || `2px solid ${props.styles?.colors?.primary || '#333'}`,
    paddingBottom: '6px',
    ...props.config?.titleStyle?.customStyle
}));
const contentStyle = computed(() => ({
    fontSize: props.config?.contentStyle?.fontSize || '14px',
    lineHeight: props.config?.contentStyle?.lineHeight || '1.6',
    color: props.config?.contentStyle?.color || props.styles?.colors?.text || '#666',
    ...props.config?.contentStyle?.customStyle
}));
const itemStyle = computed(() => ({
    marginBottom: props.config?.itemStyle?.marginBottom || '15px',
    padding: props.config?.itemStyle?.padding || '10px',
    border: props.config?.itemStyle?.border || '1px solid #f0f0f0',
    borderRadius: props.config?.itemStyle?.borderRadius || '4px',
    ...props.config?.itemStyle?.customStyle
}));
// 工具：判断是否富文本字段
function isRichTextField(field) {
    return field?.type === 'textarea' && field?.richText === true;
}
// 工具：渲染富文本内容（兼容多种结构）
function renderRich(value) {
    if (!value)
        return '';
    if (typeof value === 'string')
        return value;
    if (value && typeof value === 'object') {
        if (typeof value.html === 'string')
            return value.html;
        if (Array.isArray(value.json))
            return convertJsonToHtml(value.json);
        if (Array.isArray(value.ops))
            return value.ops.map((op) => op.insert).join('');
    }
    return '';
}
// 工具：普通文本格式化
function formatPlain(val) {
    if (val == null)
        return '';
    if (typeof val === 'object') {
        return '';
    }
    return String(val);
}
// 工具：格式化时间区间
function formatDateRange(val) {
    if (!val || typeof val !== 'object')
        return '';
    const { start, end } = val;
    if (start && end) {
        return `${start} - ${end}`;
    }
    else if (start) {
        return start;
    }
    else if (end) {
        return end;
    }
    return '';
}
// 简易 JSON -> HTML 转换
function convertJsonToHtml(jsonData) {
    if (!Array.isArray(jsonData))
        return '';
    return jsonData
        .map((node) => {
        if (typeof node === 'string')
            return node;
        const { type, children } = node || {};
        const childrenHtml = children ? convertJsonToHtml(children) : '';
        switch (type) {
            case 'paragraph':
                return `<p>${childrenHtml}</p>`;
            case 'header': {
                const level = node.level || 1;
                return `<h${level}>${childrenHtml}</h${level}>`;
            }
            case 'list-item':
                return `<li>${childrenHtml}</li>`;
            case 'bulleted-list':
                return `<ul>${childrenHtml}</ul>`;
            case 'numbered-list':
                return `<ol>${childrenHtml}</ol>`;
            default:
                return childrenHtml;
        }
    })
        .join('');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "custom-section" },
});
if (__VLS_ctx.config?.showTitle !== false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
        ...{ style: (__VLS_ctx.titleStyle) },
    });
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || '自定义模块');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-content" },
    ...{ style: (__VLS_ctx.contentStyle) },
});
if (__VLS_ctx.data?.items?.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "items-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.data.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "item" },
            ...{ style: (__VLS_ctx.itemStyle) },
        });
        for (const [field] of __VLS_getVForSourceType(((__VLS_ctx.config?.fields || [])))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (field.name),
                ...{ class: "field" },
            });
            if (field.label) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
                (field.label);
            }
            if (field.type === 'dateRange') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "field-date-range" },
                });
                (__VLS_ctx.formatDateRange(item[field.name]));
            }
            else if (!__VLS_ctx.isRichTextField(field)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "field-text" },
                });
                (__VLS_ctx.formatPlain(item[field.name]));
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "field-rich" },
                });
                __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderRich(item[field.name])) }, null, null);
            }
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
}
/** @type {__VLS_StyleScopedClasses['custom-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-content']} */ ;
/** @type {__VLS_StyleScopedClasses['items-list']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field-date-range']} */ ;
/** @type {__VLS_StyleScopedClasses['field-text']} */ ;
/** @type {__VLS_StyleScopedClasses['field-rich']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            titleStyle: titleStyle,
            contentStyle: contentStyle,
            itemStyle: itemStyle,
            isRichTextField: isRichTextField,
            renderRich: renderRich,
            formatPlain: formatPlain,
            formatDateRange: formatDateRange,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
