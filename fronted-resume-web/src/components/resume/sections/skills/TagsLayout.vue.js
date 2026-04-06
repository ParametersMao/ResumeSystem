import { computed, defineProps } from 'vue';
const props = defineProps();
const getSkillName = (skill) => {
    if (typeof skill === 'string')
        return skill;
    return skill?.name || skill?.category || '技能';
};
const titleStyle = computed(() => ({
    fontSize: props.config?.titleStyle?.fontSize || '20px',
    fontWeight: props.config?.titleStyle?.fontWeight || '600',
    color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#2c5aa0',
    marginBottom: '20px',
    borderBottom: props.config?.titleStyle?.borderBottom || `3px solid ${props.styles?.colors?.primary || '#2c5aa0'}`,
    paddingBottom: '8px',
    ...props.config?.titleStyle?.customStyle
}));
const containerStyle = computed(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: props.config?.gap || '10px',
    ...props.config?.containerStyle
}));
const tagStyle = computed(() => ({
    display: 'inline-block',
    backgroundColor: props.config?.tagStyle?.backgroundColor || '#f1f5f9',
    color: props.config?.tagStyle?.color || '#334155',
    padding: props.config?.tagStyle?.padding || '6px 14px',
    borderRadius: props.config?.tagStyle?.borderRadius || '20px',
    fontSize: props.config?.tagStyle?.fontSize || '14px',
    fontWeight: props.config?.tagStyle?.fontWeight || '500',
    border: props.config?.tagStyle?.border || 'none',
    cursor: 'default',
    transition: 'all 0.2s ease',
    ...props.config?.tagStyle?.customStyle
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tags-layout" },
});
if (__VLS_ctx.config?.showTitle !== false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
        ...{ style: (__VLS_ctx.titleStyle) },
    });
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || '技能专长');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tags-container" },
    ...{ style: (__VLS_ctx.containerStyle) },
});
for (const [skill, index] of __VLS_getVForSourceType((__VLS_ctx.data?.items || []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        key: (index),
        ...{ class: "skill-tag" },
        ...{ style: (__VLS_ctx.tagStyle) },
    });
    (__VLS_ctx.getSkillName(skill));
}
/** @type {__VLS_StyleScopedClasses['tags-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-container']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-tag']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getSkillName: getSkillName,
            titleStyle: titleStyle,
            containerStyle: containerStyle,
            tagStyle: tagStyle,
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
