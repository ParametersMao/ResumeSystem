import { computed, defineProps } from 'vue';
import { normalizeRichTextValue } from '@/utils/richText';
const props = defineProps();
// 渲染富文本描述（兼容多种存储结构）
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
const titleStyle = computed(() => {
    if (props.config?.titleStyle === 'ribbon') {
        return {
            position: 'relative',
            background: props.config?.titleConfig?.backgroundColor || props.styles?.colors?.primary || '#4a90a4',
            color: props.config?.titleConfig?.color || 'white',
            padding: props.config?.titleConfig?.padding || '12px 20px',
            margin: props.config?.titleConfig?.margin || '20px 0 15px 0',
            fontSize: props.config?.titleConfig?.fontSize || '18px',
            fontWeight: props.config?.titleConfig?.fontWeight || 'bold'
        };
    }
    return {
        fontSize: props.config?.titleStyle?.fontSize || '18px',
        fontWeight: props.config?.titleStyle?.fontWeight || '600',
        color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
        textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
        marginBottom: props.data?.style?.paragraphSpacing || '15px',
        borderBottom: `2px solid ${props.styles?.colors?.primary || '#333'}`,
        paddingBottom: '6px'
    };
});
const arrowStyle = computed(() => {
    const primaryColor = props.styles?.colors?.primary || '#4a90a4';
    return {
        content: '""',
        position: 'absolute',
        right: '-15px',
        top: '0',
        width: '0',
        height: '0',
        borderTop: `24px solid ${primaryColor}`,
        borderBottom: `24px solid ${primaryColor}`,
        borderRight: '15px solid transparent'
    };
});
const containerStyle = computed(() => ({
    marginBottom: '20px',
    padding: props.config?.padding,
    ...props.config?.containerStyle
}));
const itemStyle = computed(() => ({
    marginBottom: props.data?.style?.elementSpacing || '18px',
    paddingBottom: '12px',
    borderBottom: props.config?.itemSeparator === 'dashed'
        ? `1px dashed ${props.styles?.colors?.border || 'rgba(15, 23, 42, 0.12)'}`
        : `1px solid ${props.styles?.colors?.border || 'rgba(15, 23, 42, 0.12)'}`,
    ...props.config?.itemStyle
}));
const headerStyle = computed(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    ...props.config?.headerStyle
}));
const contentStyle = computed(() => ({
    flex: '1',
    ...props.config?.contentStyle
}));
const nameStyle = computed(() => ({
    fontSize: '16px',
    fontWeight: '600',
    color: props.styles?.colors?.text || '#111827',
    marginBottom: '5px',
    ...props.config?.nameStyle
}));
const roleStyle = computed(() => ({
    fontSize: '14px',
    color: props.styles?.colors?.primary || '#2563eb',
    marginBottom: '8px',
    ...props.config?.roleStyle
}));
const dateStyle = computed(() => ({
    fontSize: '14px',
    color: props.styles?.colors?.secondary || props.styles?.colors?.primary || '#2563eb',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    marginLeft: '20px',
    ...props.config?.dateStyle
}));
const descriptionStyle = computed(() => ({
    fontSize: '14px',
    lineHeight: '1.6',
    color: props.styles?.colors?.text || '#111827',
    ...props.config?.descriptionStyle
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "timeline-layout" },
});
if (__VLS_ctx.config?.showTitle !== false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
        ...{ style: (__VLS_ctx.titleStyle) },
    });
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || '项目经历');
    if (__VLS_ctx.config?.titleStyle === 'ribbon') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "title-ribbon-arrow" },
            ...{ style: (__VLS_ctx.arrowStyle) },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "timeline-container" },
    ...{ style: (__VLS_ctx.containerStyle) },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.data?.items || []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "timeline-item" },
        ...{ style: (__VLS_ctx.itemStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-header" },
        ...{ style: (__VLS_ctx.headerStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-content" },
        ...{ style: (__VLS_ctx.contentStyle) },
    });
    if (item.icon) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "icon-wrapper" },
        });
        (__VLS_ctx.sanitizeIcon(item.icon));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "project-name" },
        ...{ style: (__VLS_ctx.nameStyle) },
    });
    (item.name || '项目名称');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "project-role" },
        ...{ style: (__VLS_ctx.roleStyle) },
    });
    (item.role || '项目角色');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-date" },
        ...{ style: (__VLS_ctx.dateStyle) },
    });
    (__VLS_ctx.formatDuration(item));
    if (item.desc) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "description" },
            ...{ style: (__VLS_ctx.descriptionStyle) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderDescription(item.desc)) }, null, null);
    }
}
/** @type {__VLS_StyleScopedClasses['timeline-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-ribbon-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-container']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-header']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-content']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['text-block']} */ ;
/** @type {__VLS_StyleScopedClasses['project-name']} */ ;
/** @type {__VLS_StyleScopedClasses['project-role']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-date']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            renderDescription: renderDescription,
            sanitizeIcon: sanitizeIcon,
            formatDuration: formatDuration,
            titleStyle: titleStyle,
            arrowStyle: arrowStyle,
            containerStyle: containerStyle,
            itemStyle: itemStyle,
            headerStyle: headerStyle,
            contentStyle: contentStyle,
            nameStyle: nameStyle,
            roleStyle: roleStyle,
            dateStyle: dateStyle,
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
