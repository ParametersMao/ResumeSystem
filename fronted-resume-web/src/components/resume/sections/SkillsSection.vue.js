import { computed, defineProps } from 'vue';
import ProgressLayout from './skills/ProgressLayout.vue';
import TagsLayout from './skills/TagsLayout.vue';
import SimpleLayout from './skills/SimpleLayout.vue';
const props = defineProps();
// 根据配置选择布局组件
const layoutComponent = computed(() => {
    const layoutType = props.config?.layout || 'simple';
    const layoutMap = {
        'progress': ProgressLayout,
        'tags': TagsLayout,
        'simple': SimpleLayout
    };
    return layoutMap[layoutType] || SimpleLayout;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "skills-section" },
});
const __VLS_0 = ((__VLS_ctx.layoutComponent));
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    data: (__VLS_ctx.data),
    config: (__VLS_ctx.config),
    styles: (__VLS_ctx.styles),
}));
const __VLS_2 = __VLS_1({
    data: (__VLS_ctx.data),
    config: (__VLS_ctx.config),
    styles: (__VLS_ctx.styles),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['skills-section']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            layoutComponent: layoutComponent,
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
