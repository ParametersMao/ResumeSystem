import { computed } from 'vue';
const props = defineProps({
    section: {
        type: Object,
        required: true
    },
    items: {
        type: Array,
        default: () => []
    },
    config: {
        type: Object,
        default: () => ({})
    },
    styleConfig: {
        type: Object,
        default: () => ({})
    }
});
// 布局类型
const layout = computed(() => {
    const cfg = props.config?.layout || 'standard';
    const hasProgressStyle = Boolean(props.styleConfig?.custom?.[".skill-progress"]) || Boolean(props.styleConfig?.custom?.[".skill-progress-bar"]);
    return hasProgressStyle ? 'progress' : cfg;
});
// 标准化的技能项
const normalizedSkills = computed(() => {
    const skills = props.items || [];
    return skills.map(skill => {
        if (typeof skill === 'string') {
            return skill;
        }
        if (typeof skill === 'object') {
            return skill.name || skill.text || JSON.stringify(skill);
        }
        return String(skill);
    });
});
// 进度型技能项
const progressItems = computed(() => {
    const skills = props.items || [];
    return skills.map((s) => ({
        name: s?.name || (typeof s === 'string' ? s : ''),
        proficiency: Number(s?.proficiency ?? 0),
        level: s?.level
    }));
});
// 是否有分隔符
const hasSeparator = computed(() => {
    const styleConfig = props.styleConfig || {};
    const itemsConfig = styleConfig.items || {};
    const separator = itemsConfig.separator || {};
    return separator.type && separator.type !== 'none';
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['skill-list-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "skills-renderer" },
});
if (__VLS_ctx.layout === 'tags') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skills-tags" },
    });
    for (const [skill, index] of __VLS_getVForSourceType((__VLS_ctx.normalizedSkills))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "skill-tag" },
        });
        (skill);
    }
}
else if (__VLS_ctx.layout === 'progress') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skills-progress" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.progressItems))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "skill-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skill-name-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skill-name" },
        });
        (item.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skill-level" },
        });
        (item.level || (item.proficiency + '%'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skill-progress" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skill-progress-bar" },
            ...{ style: ({ width: (item.proficiency || 0) + '%' }) },
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skills-list" },
    });
    for (const [skill, index] of __VLS_getVForSourceType((__VLS_ctx.normalizedSkills))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "skill-list-item" },
            ...{ class: ({ 'with-separator': __VLS_ctx.hasSeparator }) },
        });
        (skill);
    }
}
/** @type {__VLS_StyleScopedClasses['skills-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-item']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-name-row']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-name']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-level']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-progress-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-list']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-list-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            layout: layout,
            normalizedSkills: normalizedSkills,
            progressItems: progressItems,
            hasSeparator: hasSeparator,
        };
    },
    props: {
        section: {
            type: Object,
            required: true
        },
        items: {
            type: Array,
            default: () => []
        },
        config: {
            type: Object,
            default: () => ({})
        },
        styleConfig: {
            type: Object,
            default: () => ({})
        }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        section: {
            type: Object,
            required: true
        },
        items: {
            type: Array,
            default: () => []
        },
        config: {
            type: Object,
            default: () => ({})
        },
        styleConfig: {
            type: Object,
            default: () => ({})
        }
    },
});
; /* PartiallyEnd: #4569/main.vue */
