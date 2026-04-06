import { computed, defineProps, markRaw, resolveComponent } from 'vue';
const props = defineProps();
// 尝试解析Schema渲染器组件
const schemaComponent = markRaw(resolveComponent('SchemaRenderer') || 'div');
// 获取布局Schema
const layoutSchema = computed(() => props.layoutConfig?.schema || null);
// 容器样式
const containerStyle = computed(() => {
    const config = props.layoutConfig?.container || {};
    return {
        maxWidth: config.maxWidth || '100%',
        margin: config.margin || '0 auto',
        padding: config.padding || '0',
        backgroundColor: config.backgroundColor,
        ...config
    };
});
// 内容区样式
const contentStyle = computed(() => {
    const config = props.layoutConfig?.content || {};
    return {
        padding: config.padding || '0',
        backgroundColor: config.backgroundColor || '#ffffff',
        borderRadius: config.borderRadius || '0',
        boxShadow: config.boxShadow,
        ...config
    };
});
// 按顺序排序的模块
const sortedSections = computed(() => {
    return [...props.sections]
        .sort((a, b) => (a.order || 0) - (b.order || 0));
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
    // 这个函数将返回合适的组件
    // 实际实现将由父组件提供或通过动态注册系统解析
    return 'div';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-layout custom-layout" },
    ...{ style: (__VLS_ctx.containerStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-content" },
    ...{ style: (__VLS_ctx.contentStyle) },
});
if (__VLS_ctx.layoutSchema) {
    const __VLS_0 = ((__VLS_ctx.schemaComponent));
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        schema: (__VLS_ctx.layoutSchema),
        sections: (__VLS_ctx.sortedSections),
        sectionStyles: (__VLS_ctx.sectionStyles),
    }));
    const __VLS_2 = __VLS_1({
        schema: (__VLS_ctx.layoutSchema),
        sections: (__VLS_ctx.sortedSections),
        sectionStyles: (__VLS_ctx.sectionStyles),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.sortedSections))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            key: (section.id),
            ...{ class: (['resume-section', `section-${section.type}`]) },
            ...{ style: (__VLS_ctx.getSectionStyle(section)) },
        });
        var __VLS_4 = {
            section: (section),
            sectionStyle: (__VLS_ctx.getSectionStyleObj(section)),
        };
        var __VLS_5 = __VLS_tryAsConstant(`section-${section.id}`);
        const __VLS_8 = ((__VLS_ctx.getSectionComponent(section)));
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            section: (section),
            sectionStyle: (__VLS_ctx.getSectionStyleObj(section)),
        }));
        const __VLS_10 = __VLS_9({
            section: (section),
            sectionStyle: (__VLS_ctx.getSectionStyleObj(section)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    }
}
/** @type {__VLS_StyleScopedClasses['resume-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-content']} */ ;
// @ts-ignore
var __VLS_6 = __VLS_5, __VLS_7 = __VLS_4;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            schemaComponent: schemaComponent,
            layoutSchema: layoutSchema,
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
