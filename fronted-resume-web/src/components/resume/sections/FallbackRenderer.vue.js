const __VLS_props = defineProps({
    section: {
        type: Object,
        required: true
    },
    items: {
        type: [Array, Object, String],
        default: () => []
    },
    layout: {
        type: String,
        default: 'standard'
    },
    config: {
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
    ...{ class: "fallback-renderer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fallback-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.section.type);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
(__VLS_ctx.layout);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fallback-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
(JSON.stringify(__VLS_ctx.items, null, 2));
/** @type {__VLS_StyleScopedClasses['fallback-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['fallback-header']} */ ;
/** @type {__VLS_StyleScopedClasses['fallback-content']} */ ;
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
        layout: {
            type: String,
            default: 'standard'
        },
        config: {
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
        layout: {
            type: String,
            default: 'standard'
        },
        config: {
            type: Object,
            default: () => ({})
        }
    },
});
; /* PartiallyEnd: #4569/main.vue */
