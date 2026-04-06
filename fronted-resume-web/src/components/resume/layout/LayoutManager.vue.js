import { computed, defineProps } from 'vue';
import SingleColumnLayout from './SingleColumnLayout.vue';
import TwoColumnLayout from './TwoColumnLayout.vue';
import ThreeColumnLayout from './ThreeColumnLayout.vue';
import CustomLayout from './CustomLayout.vue';
const props = defineProps();
// 布局组件映射
const layoutComponentMap = {
    'single-column': SingleColumnLayout,
    'two-column': TwoColumnLayout,
    'three-column': ThreeColumnLayout,
    'custom': CustomLayout
};
// 根据配置决定使用哪个布局组件
const layoutComponent = computed(() => {
    const layoutType = props.layoutConfig?.type || 'single-column';
    console.log('LayoutManager: 使用布局类型', layoutType, '配置:', props.layoutConfig);
    const component = layoutComponentMap[layoutType] || SingleColumnLayout;
    console.log('LayoutManager: 选择的布局组件', layoutType, '=>', component.name || '未命名组件');
    return component;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = ((__VLS_ctx.layoutComponent));
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    layoutConfig: (__VLS_ctx.layoutConfig),
    sections: (__VLS_ctx.sections),
    sectionStyles: (__VLS_ctx.sectionStyles),
}));
const __VLS_2 = __VLS_1({
    layoutConfig: (__VLS_ctx.layoutConfig),
    sections: (__VLS_ctx.sections),
    sectionStyles: (__VLS_ctx.sectionStyles),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
var __VLS_3;
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
