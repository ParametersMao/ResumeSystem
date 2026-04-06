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
    return props.config?.layout === 'grid' ? 'grid' : 'standard';
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
/** @type {__VLS_StyleScopedClasses['award-list-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "awards-renderer" },
});
if (__VLS_ctx.layout === 'grid') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "awards-grid" },
    });
    for (const [award, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "award-grid-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "award-name" },
        });
        (award.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "award-details" },
        });
        if (award.org) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "award-org" },
            });
            (award.org);
        }
        if (award.date) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "award-date" },
            });
            (award.date);
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "awards-list" },
    });
    for (const [award, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "award-list-item" },
            ...{ class: ({ 'with-separator': __VLS_ctx.hasSeparator }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "award-name" },
        });
        (award.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "award-details" },
        });
        if (award.org) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "award-org" },
            });
            (award.org);
        }
        if (award.date) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "award-date" },
            });
            (award.date);
        }
    }
}
/** @type {__VLS_StyleScopedClasses['awards-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['awards-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['award-grid-item']} */ ;
/** @type {__VLS_StyleScopedClasses['award-name']} */ ;
/** @type {__VLS_StyleScopedClasses['award-details']} */ ;
/** @type {__VLS_StyleScopedClasses['award-org']} */ ;
/** @type {__VLS_StyleScopedClasses['award-date']} */ ;
/** @type {__VLS_StyleScopedClasses['awards-list']} */ ;
/** @type {__VLS_StyleScopedClasses['award-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['award-name']} */ ;
/** @type {__VLS_StyleScopedClasses['award-details']} */ ;
/** @type {__VLS_StyleScopedClasses['award-org']} */ ;
/** @type {__VLS_StyleScopedClasses['award-date']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            layout: layout,
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
