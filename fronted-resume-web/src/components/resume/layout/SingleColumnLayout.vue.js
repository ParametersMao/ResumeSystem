import { computed, defineProps } from 'vue';
const props = defineProps();
// 容器样式
const containerStyle = computed(() => {
    const config = props.layoutConfig?.container || {};
    return {
        width: '100%',
        ...config
    };
});
// 内容区样式
const contentStyle = computed(() => {
    const config = props.layoutConfig?.content || {};
    return {
        width: '100%',
        ...config
    };
});
// 按顺序排序的模块
const sortedSections = computed(() => {
    return [...props.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
});
// 获取模块样式对象
function getSectionStyleObj(section) {
    const sectionType = section.type;
    const defaultStyle = props.sectionStyles?.[sectionType] || {};
    const sectionStyle = section.style || {};
    // 合并默认样式和模块自定义样式
    return {
        ...defaultStyle,
        ...sectionStyle
    };
}
// 获取模块样式字符串
function getSectionStyle(section) {
    const styleObj = getSectionStyleObj(section);
    const result = {};
    // 只提取直接的CSS属性，不包括嵌套对象
    Object.keys(styleObj).forEach(key => {
        if (typeof styleObj[key] !== 'object' || styleObj[key] === null) {
            result[key] = styleObj[key];
        }
    });
    return result;
}
// 获取模块对应的组件
function getSectionComponent(section) {
    return 'generic-section';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-layout single-column-layout" },
    ...{ style: (__VLS_ctx.containerStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-content" },
    ...{ style: (__VLS_ctx.contentStyle) },
});
for (const [section] of __VLS_getVForSourceType((__VLS_ctx.sortedSections))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        key: (section.id),
        ...{ class: (['resume-section', `section-${section.type}`]) },
        ...{ style: (__VLS_ctx.getSectionStyle(section)) },
    });
    var __VLS_0 = {
        section: (section),
        sectionStyle: (__VLS_ctx.getSectionStyleObj(section)),
    };
    var __VLS_1 = __VLS_tryAsConstant(`section-${section.id}`);
    const __VLS_4 = ((__VLS_ctx.getSectionComponent(section)));
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        section: (section),
        sectionStyle: (__VLS_ctx.getSectionStyleObj(section)),
    }));
    const __VLS_6 = __VLS_5({
        section: (section),
        sectionStyle: (__VLS_ctx.getSectionStyleObj(section)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
/** @type {__VLS_StyleScopedClasses['resume-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['single-column-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-content']} */ ;
// @ts-ignore
var __VLS_2 = __VLS_1, __VLS_3 = __VLS_0;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            containerStyle: containerStyle,
            contentStyle: contentStyle,
            sortedSections: sortedSections,
            getSectionStyleObj: getSectionStyleObj,
            getSectionStyle: getSectionStyle,
            getSectionComponent: getSectionComponent,
        };
    },
    __typeProps: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
