import { computed, defineProps } from 'vue';
const props = defineProps();
const skillsList = computed(() => {
    const skills = props.data?.items || [];
    const skillNames = skills.map((skill) => {
        if (typeof skill === 'string')
            return skill;
        return skill?.name || skill?.category || '技能';
    });
    return skillNames.join(' · ');
});
const titleStyle = computed(() => ({
    fontSize: props.config?.titleStyle?.fontSize || '18px',
    fontWeight: props.config?.titleStyle?.fontWeight || '600',
    color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
    textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
    marginBottom: props.data?.style?.paragraphSpacing || '15px',
    borderBottom: `2px solid ${props.styles?.colors?.primary || '#333'}`,
    paddingBottom: '6px',
    ...props.config?.titleStyle?.customStyle
}));
const containerStyle = computed(() => ({
    padding: props.config?.padding,
    ...props.config?.containerStyle
}));
const listStyle = computed(() => ({
    fontSize: props.config?.listStyle?.fontSize || '15px',
    lineHeight: props.config?.listStyle?.lineHeight || '1.6',
    color: props.config?.listStyle?.color || props.styles?.colors?.text || '#333',
    marginBottom: props.data?.style?.elementSpacing || props.styles?.spacing?.elementMargin || '15px',
    ...props.config?.listStyle?.customStyle
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "simple-layout" },
});
if (__VLS_ctx.config?.showTitle !== false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
        ...{ style: (__VLS_ctx.titleStyle) },
    });
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || '专业技能');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "simple-container" },
    ...{ style: (__VLS_ctx.containerStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "skills-list" },
    ...{ style: (__VLS_ctx.listStyle) },
});
(__VLS_ctx.skillsList);
/** @type {__VLS_StyleScopedClasses['simple-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['simple-container']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-list']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            skillsList: skillsList,
            titleStyle: titleStyle,
            containerStyle: containerStyle,
            listStyle: listStyle,
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
