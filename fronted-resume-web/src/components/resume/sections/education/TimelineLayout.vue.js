import { computed, defineProps } from 'vue';
const props = defineProps();
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
        marginBottom: '15px',
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
    ...props.config?.containerStyle
}));
const itemStyle = computed(() => ({
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #f0f0f0',
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
const schoolStyle = computed(() => ({
    fontSize: '16px',
    fontWeight: '600',
    color: props.styles?.colors?.text || '#333',
    marginBottom: '5px',
    ...props.config?.schoolStyle
}));
const degreeStyle = computed(() => ({
    fontSize: '14px',
    color: props.styles?.colors?.text || '#333',
    ...props.config?.degreeStyle
}));
const dateStyle = computed(() => ({
    fontSize: '14px',
    color: props.styles?.colors?.primary || '#4a90a4',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    marginLeft: '20px',
    ...props.config?.dateStyle
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
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || '教育背景');
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "school" },
        ...{ style: (__VLS_ctx.schoolStyle) },
    });
    (item.school || '');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "degree" },
        ...{ style: (__VLS_ctx.degreeStyle) },
    });
    (item.degree || '');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-date" },
        ...{ style: (__VLS_ctx.dateStyle) },
    });
    (item.start || '');
    (item.end || '');
}
/** @type {__VLS_StyleScopedClasses['timeline-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-ribbon-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-container']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-header']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-content']} */ ;
/** @type {__VLS_StyleScopedClasses['school']} */ ;
/** @type {__VLS_StyleScopedClasses['degree']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-date']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            titleStyle: titleStyle,
            arrowStyle: arrowStyle,
            containerStyle: containerStyle,
            itemStyle: itemStyle,
            headerStyle: headerStyle,
            contentStyle: contentStyle,
            schoolStyle: schoolStyle,
            degreeStyle: degreeStyle,
            dateStyle: dateStyle,
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
