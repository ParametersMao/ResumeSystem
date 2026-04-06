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
// 是否有分隔符
const hasSeparator = computed(() => {
    const styleConfig = props.styleConfig || {};
    const itemsConfig = styleConfig.items || {};
    const separator = itemsConfig.separator || {};
    return separator.type && separator.type !== 'none';
});
// 格式化时间区间
function getDuration(item) {
    if (!item)
        return '';
    if (item.duration) {
        const start = item.duration.start || '';
        const end = item.duration.end || '';
        return `${start} - ${end}`;
    }
    if (Array.isArray(item.dateRange)) {
        const start = item.dateRange[0] || '';
        const end = item.dateRange[1] || '';
        return `${start} - ${end}`;
    }
    const start = item.start || item.startDate || '';
    const end = item.end || item.endDate || '';
    return `${start} - ${end}`;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['education-item']} */ ;
/** @type {__VLS_StyleScopedClasses['education-courses']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "education-renderer" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "education-item" },
        ...{ class: ({ 'with-separator': __VLS_ctx.hasSeparator }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "education-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "education-main" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "education-school" },
    });
    (item.school);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "education-degree" },
    });
    (item.degree);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "education-time" },
    });
    (__VLS_ctx.getDuration(item));
    if (item.major) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "education-major" },
        });
        (item.major);
    }
    if (item.gpa) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "education-gpa" },
        });
        (item.gpa);
    }
    if (item.courses) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "education-courses" },
        });
        (item.courses);
    }
}
/** @type {__VLS_StyleScopedClasses['education-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['education-item']} */ ;
/** @type {__VLS_StyleScopedClasses['education-header']} */ ;
/** @type {__VLS_StyleScopedClasses['education-main']} */ ;
/** @type {__VLS_StyleScopedClasses['education-school']} */ ;
/** @type {__VLS_StyleScopedClasses['education-degree']} */ ;
/** @type {__VLS_StyleScopedClasses['education-time']} */ ;
/** @type {__VLS_StyleScopedClasses['education-major']} */ ;
/** @type {__VLS_StyleScopedClasses['education-gpa']} */ ;
/** @type {__VLS_StyleScopedClasses['education-courses']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            hasSeparator: hasSeparator,
            getDuration: getDuration,
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
