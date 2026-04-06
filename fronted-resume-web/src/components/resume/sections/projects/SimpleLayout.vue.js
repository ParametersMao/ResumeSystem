import { computed, defineProps } from 'vue';
import { normalizeRichTextValue } from '@/utils/richText';
const props = defineProps();
// 渲染富文本描述（兼容 { html, json, text } / Quill ops / string）
const renderDescription = (desc) => normalizeRichTextValue(desc).html;
const sanitizeIcon = (icon) => {
    if (!icon)
        return '';
    const value = typeof icon === 'string' ? icon : icon?.text || '';
    return value?.slice(0, 2) || '';
};
const formatDuration = (item) => {
    const duration = item?.duration || {};
    const start = duration.start ?? item.start ?? '';
    const end = duration.end ?? item.end ?? '';
    const fallback = item.date || '';
    if (start && end)
        return `${start} - ${end}`;
    if (start)
        return start;
    if (end)
        return end;
    return fallback;
};
const titleStyle = computed(() => ({
    fontSize: props.config?.titleStyle?.fontSize || '20px',
    fontWeight: props.config?.titleStyle?.fontWeight || '600',
    color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#2c5aa0',
    textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
    marginBottom: props.data?.style?.paragraphSpacing || '20px',
    borderBottom: props.config?.titleStyle?.borderBottom || `3px solid ${props.styles?.colors?.primary || '#2c5aa0'}`,
    paddingBottom: '8px',
    ...props.config?.titleStyle?.customStyle
}));
const containerStyle = computed(() => ({
    display: 'block',
    padding: props.config?.padding,
    ...props.config?.containerStyle
}));
const itemStyle = computed(() => ({
    marginBottom: props.data?.style?.elementSpacing || props.styles?.spacing?.elementMargin || '15px',
    paddingBottom: '20px',
    borderBottom: props.config?.itemSeparator === 'dashed' ? '1px dashed #e2e8f0' : '1px solid #e2e8f0',
    ...props.config?.itemStyle
}));
const headerStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    ...props.config?.headerStyle
}));
const nameStyle = computed(() => ({
    fontSize: '18px',
    fontWeight: '600',
    color: props.styles?.colors?.text || '#334155',
    ...props.config?.nameStyle
}));
const dateStyle = computed(() => ({
    fontSize: '14px',
    color: props.styles?.colors?.text || '#64748b',
    fontWeight: '500',
    ...props.config?.dateStyle
}));
const roleStyle = computed(() => ({
    fontSize: '16px',
    color: props.styles?.colors?.primary || '#2c5aa0',
    fontWeight: '500',
    marginBottom: '10px',
    ...props.config?.roleStyle
}));
const descriptionStyle = computed(() => ({
    fontSize: '14px',
    lineHeight: '1.6',
    color: props.styles?.colors?.text || '#475569',
    ...props.config?.descriptionStyle
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "simple-layout" },
});
if (__VLS_ctx.config?.showTitle !== false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
        ...{ style: (__VLS_ctx.titleStyle) },
    });
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || '项目经历');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "simple-container" },
    ...{ style: (__VLS_ctx.containerStyle) },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.data?.items || []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "simple-item" },
        ...{ style: (__VLS_ctx.itemStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-header" },
        ...{ style: (__VLS_ctx.headerStyle) },
    });
    if (item.icon) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "icon-wrapper" },
        });
        (__VLS_ctx.sanitizeIcon(item.icon));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "project-name" },
        ...{ style: (__VLS_ctx.nameStyle) },
    });
    (item.name || '项目名称');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "date" },
        ...{ style: (__VLS_ctx.dateStyle) },
    });
    (__VLS_ctx.formatDuration(item));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "project-role" },
        ...{ style: (__VLS_ctx.roleStyle) },
    });
    (item.role || '项目角色');
    if (item.desc) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "description" },
            ...{ style: (__VLS_ctx.descriptionStyle) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderDescription(item.desc)) }, null, null);
    }
}
/** @type {__VLS_StyleScopedClasses['simple-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-container']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['project-name']} */ ;
/** @type {__VLS_StyleScopedClasses['date']} */ ;
/** @type {__VLS_StyleScopedClasses['project-role']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            renderDescription: renderDescription,
            sanitizeIcon: sanitizeIcon,
            formatDuration: formatDuration,
            titleStyle: titleStyle,
            containerStyle: containerStyle,
            itemStyle: itemStyle,
            headerStyle: headerStyle,
            nameStyle: nameStyle,
            dateStyle: dateStyle,
            roleStyle: roleStyle,
            descriptionStyle: descriptionStyle,
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
