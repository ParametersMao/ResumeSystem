import { computed, defineProps } from 'vue';
const props = defineProps();
const getSkillName = (skill) => {
    if (typeof skill === 'string')
        return skill;
    return skill?.name || skill?.category || '技能';
};
const getSkillLevel = (skill) => {
    if (typeof skill === 'string')
        return 80; // 默认进度
    return skill?.level || skill?.progress || 80;
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
const gridStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${props.config?.columns || 3}, 1fr)`,
    gap: props.config?.gap || '20px',
    marginTop: '15px',
    ...props.config?.gridStyle
}));
const itemStyle = computed(() => ({
    marginBottom: '15px',
    ...props.config?.itemStyle
}));
const nameStyle = computed(() => ({
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '14px',
    color: props.styles?.colors?.text || '#333',
    ...props.config?.nameStyle
}));
const progressStyle = computed(() => ({
    width: '100%',
    height: '6px',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden',
    ...props.config?.progressStyle
}));
const progressBarStyle = (level) => computed(() => ({
    height: '100%',
    backgroundColor: props.styles?.colors?.primary || '#4a90a4',
    borderRadius: '3px',
    width: `${level}%`,
    transition: 'width 0.3s ease',
    ...props.config?.progressBarStyle
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-layout" },
});
if (__VLS_ctx.config?.showTitle !== false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
        ...{ style: (__VLS_ctx.titleStyle) },
    });
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || '专业技能');
    if (__VLS_ctx.config?.titleStyle === 'ribbon') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "title-ribbon-arrow" },
            ...{ style: (__VLS_ctx.arrowStyle) },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "skills-grid" },
    ...{ style: (__VLS_ctx.gridStyle) },
});
for (const [skill, index] of __VLS_getVForSourceType((__VLS_ctx.data?.items || []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "skill-item" },
        ...{ style: (__VLS_ctx.itemStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skill-name" },
        ...{ style: (__VLS_ctx.nameStyle) },
    });
    (__VLS_ctx.getSkillName(skill));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skill-progress" },
        ...{ style: (__VLS_ctx.progressStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skill-progress-bar" },
        ...{ style: (__VLS_ctx.progressBarStyle(__VLS_ctx.getSkillLevel(skill))) },
    });
}
/** @type {__VLS_StyleScopedClasses['progress-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-ribbon-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-item']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-name']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-progress-bar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getSkillName: getSkillName,
            getSkillLevel: getSkillLevel,
            titleStyle: titleStyle,
            arrowStyle: arrowStyle,
            gridStyle: gridStyle,
            itemStyle: itemStyle,
            nameStyle: nameStyle,
            progressStyle: progressStyle,
            progressBarStyle: progressBarStyle,
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
