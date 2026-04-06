import { computed, defineProps } from 'vue';
import { normalizeRichTextValue } from '@/utils/richText';
const props = defineProps();
// 检查是否有实际内容
const hasContent = (desc) => {
    if (!desc)
        return false;
    const normalized = normalizeRichTextValue(desc);
    return normalized.html.trim().length > 0 || normalized.text.trim().length > 0;
};
// 渲染富文本描述
const renderDescription = (desc) => normalizeRichTextValue(desc).html;
const sanitizeIcon = (icon) => {
    if (!icon)
        return '';
    const value = typeof icon === 'string' ? icon : icon?.text || icon?.value || '';
    return value?.slice(0, 2) || '';
};
const isIconUrl = (icon) => {
    const value = getIconValue(icon);
    return (value.startsWith('http') ||
        value.startsWith('data:') ||
        /\.(svg|png|jpe?g|gif|webp)$/i.test(value));
};
const normalizeIconUrl = (icon) => getIconValue(icon);
const getIconValue = (icon) => {
    if (!icon)
        return '';
    if (typeof icon === 'string')
        return icon.trim();
    return String(icon.url || icon.value || icon.text || '').trim();
};
const formatDuration = (item) => {
    const duration = item?.duration || {};
    const start = duration.start ?? item.start ?? '';
    const end = duration.end ?? item.end ?? '';
    if (start && end)
        return `${start} - ${end}`;
    if (start)
        return start;
    if (end)
        return end;
    return '';
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
const companyStyle = computed(() => ({
    fontSize: '18px',
    fontWeight: '600',
    color: props.styles?.colors?.text || '#334155',
    ...props.config?.companyStyle
}));
const dateStyle = computed(() => ({
    fontSize: '14px',
    color: props.styles?.colors?.text || '#64748b',
    fontWeight: '500',
    ...props.config?.dateStyle
}));
const positionStyle = computed(() => ({
    fontSize: '16px',
    color: props.styles?.colors?.primary || '#2c5aa0',
    fontWeight: '500',
    marginBottom: '10px',
    ...props.config?.positionStyle
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
/** @type {__VLS_StyleScopedClasses['icon-wrapper']} */ ;
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
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || '工作经历');
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
        if (__VLS_ctx.isIconUrl(item.icon)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (__VLS_ctx.normalizeIconUrl(item.icon)),
                alt: "",
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.sanitizeIcon(item.icon));
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "company" },
        ...{ style: (__VLS_ctx.companyStyle) },
    });
    (item.company || '');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "date" },
        ...{ style: (__VLS_ctx.dateStyle) },
    });
    (__VLS_ctx.formatDuration(item));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "position" },
        ...{ style: (__VLS_ctx.positionStyle) },
    });
    (item.role || '');
    if (__VLS_ctx.hasContent(item.desc)) {
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
/** @type {__VLS_StyleScopedClasses['company']} */ ;
/** @type {__VLS_StyleScopedClasses['date']} */ ;
/** @type {__VLS_StyleScopedClasses['position']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            hasContent: hasContent,
            renderDescription: renderDescription,
            sanitizeIcon: sanitizeIcon,
            isIconUrl: isIconUrl,
            normalizeIconUrl: normalizeIconUrl,
            formatDuration: formatDuration,
            titleStyle: titleStyle,
            containerStyle: containerStyle,
            itemStyle: itemStyle,
            headerStyle: headerStyle,
            companyStyle: companyStyle,
            dateStyle: dateStyle,
            positionStyle: positionStyle,
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
