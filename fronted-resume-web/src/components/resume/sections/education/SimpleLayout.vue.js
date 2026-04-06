import { computed, defineProps } from 'vue';
const props = defineProps();
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
    padding: props.config?.padding,
    ...props.config?.containerStyle
}));
const itemStyle = computed(() => ({
    marginBottom: props.data?.style?.elementSpacing || props.styles?.spacing?.elementMargin || '15px',
    paddingBottom: '15px',
    borderBottom: props.config?.itemSeparator === 'dashed' ? '1px dashed #e2e8f0' : '1px solid #e2e8f0',
    ...props.config?.itemStyle
}));
const headerStyle = computed(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    ...props.config?.headerStyle
}));
const schoolStyle = computed(() => ({
    fontSize: '18px',
    fontWeight: '600',
    color: props.styles?.colors?.text || '#334155',
    ...props.config?.schoolStyle
}));
const dateStyle = computed(() => ({
    fontSize: '14px',
    color: props.styles?.colors?.text || '#64748b',
    fontWeight: '500',
    ...props.config?.dateStyle
}));
const degreeStyle = computed(() => ({
    fontSize: '16px',
    color: props.styles?.colors?.primary || '#2c5aa0',
    fontWeight: '500',
    ...props.config?.degreeStyle
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
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || '教育背景');
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "school" },
        ...{ style: (__VLS_ctx.schoolStyle) },
    });
    (item.school || '');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "date" },
        ...{ style: (__VLS_ctx.dateStyle) },
    });
    ((item.duration && item.duration.start) || '');
    ((item.duration && item.duration.end) || '');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "degree" },
        ...{ style: (__VLS_ctx.degreeStyle) },
    });
    (item.degree || '');
}
/** @type {__VLS_StyleScopedClasses['simple-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-container']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['school']} */ ;
/** @type {__VLS_StyleScopedClasses['date']} */ ;
/** @type {__VLS_StyleScopedClasses['degree']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            titleStyle: titleStyle,
            containerStyle: containerStyle,
            itemStyle: itemStyle,
            headerStyle: headerStyle,
            schoolStyle: schoolStyle,
            dateStyle: dateStyle,
            degreeStyle: degreeStyle,
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
