const __VLS_props = defineProps({
    section: {
        type: Object,
        required: true
    },
    items: {
        type: [Array, Object, String],
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "intention-renderer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "intention-content" },
});
if (typeof __VLS_ctx.items === 'string') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "intention-text" },
    });
    (__VLS_ctx.items);
}
else if (Array.isArray(__VLS_ctx.items) && __VLS_ctx.items.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "intention-items" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "intention-item" },
        });
        if (typeof item === 'string') {
            (item);
        }
        else {
            if (item.intention) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "intention-value" },
                });
                (item.intention);
            }
            if (item.position) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "intention-position" },
                });
                (item.position);
            }
            if (item.location) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "intention-location" },
                });
                (item.location);
            }
            if (item.salary) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "intention-salary" },
                });
                (item.salary);
            }
        }
    }
}
/** @type {__VLS_StyleScopedClasses['intention-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['intention-content']} */ ;
/** @type {__VLS_StyleScopedClasses['intention-text']} */ ;
/** @type {__VLS_StyleScopedClasses['intention-items']} */ ;
/** @type {__VLS_StyleScopedClasses['intention-item']} */ ;
/** @type {__VLS_StyleScopedClasses['intention-value']} */ ;
/** @type {__VLS_StyleScopedClasses['intention-position']} */ ;
/** @type {__VLS_StyleScopedClasses['intention-location']} */ ;
/** @type {__VLS_StyleScopedClasses['intention-salary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        section: {
            type: Object,
            required: true
        },
        items: {
            type: [Array, Object, String],
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
            type: [Array, Object, String],
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
