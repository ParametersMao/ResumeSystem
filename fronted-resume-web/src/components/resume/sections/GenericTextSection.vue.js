import { computed, defineProps } from 'vue';
const props = defineProps();
const defaultTitle = computed(() => props.config?.fallbackTitle || '内容');
const fieldName = computed(() => props.config?.fieldName || 'text');
const raw = computed(() => {
    // 1) 直接字段（data.text 或 data.intention 等）
    if (props.data && typeof props.data === 'object') {
        const direct = props.data[fieldName.value];
        if (direct !== undefined)
            return direct;
    }
    // 2) content 容器
    if (props.data?.content && typeof props.data.content === 'object') {
        const v = props.data.content[fieldName.value];
        if (v !== undefined)
            return v;
    }
    // 3) items[0] 对象（object 单项模块）
    const items = props.data?.items;
    if (Array.isArray(items) && items.length > 0 && items[0] && typeof items[0] === 'object') {
        const v = items[0][fieldName.value];
        if (v !== undefined)
            return v;
    }
    return '';
});
const htmlContent = computed(() => {
    const val = raw.value;
    if (val && typeof val === 'object' && val.html)
        return val.html;
    return '';
});
const plainText = computed(() => {
    const val = raw.value;
    if (typeof val === 'string')
        return val;
    if (val && typeof val === 'object' && val.text)
        return val.text;
    return '';
});
const titleStyle = computed(() => ({
    fontSize: props.config?.titleStyle?.fontSize || '18px',
    fontWeight: props.config?.titleStyle?.fontWeight || '600',
    color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
    textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
    marginBottom: props.data?.style?.paragraphSpacing || '15px',
    borderBottom: props.config?.titleStyle?.borderBottom || `2px solid ${props.styles?.colors?.primary || '#333'}`,
    paddingBottom: '6px',
    ...props.config?.titleStyle?.customStyle
}));
const contentStyle = computed(() => ({
    fontSize: props.config?.contentStyle?.fontSize || '15px',
    lineHeight: props.config?.contentStyle?.lineHeight || '1.7',
    color: props.config?.contentStyle?.color || props.styles?.colors?.text || '#333',
    padding: props.config?.padding,
    ...props.config?.contentStyle?.customStyle
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "generic-text-section" },
});
if (__VLS_ctx.config?.showTitle !== false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
        ...{ style: (__VLS_ctx.titleStyle) },
    });
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || __VLS_ctx.defaultTitle);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-content" },
    ...{ style: (__VLS_ctx.contentStyle) },
});
if (__VLS_ctx.htmlContent) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.htmlContent) }, null, null);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.plainText);
}
/** @type {__VLS_StyleScopedClasses['generic-text-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            defaultTitle: defaultTitle,
            htmlContent: htmlContent,
            plainText: plainText,
            titleStyle: titleStyle,
            contentStyle: contentStyle,
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
