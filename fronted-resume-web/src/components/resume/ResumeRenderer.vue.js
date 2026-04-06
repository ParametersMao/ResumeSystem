import { computed, defineEmits, defineProps, ref, provide } from 'vue';
import StyleInjector from './StyleInjector.vue';
import LayoutManager from './layout/LayoutManager.vue';
import GenericSection from './sections/GenericSection.vue';
const props = defineProps();
const emit = defineEmits();
// 生成唯一ID
const uniqueId = ref(`resume-${Date.now()}`);
// 容器ID
const containerId = computed(() => props.containerId || uniqueId.value);
// 布局配置
const layoutConfig = computed(() => {
    const layout = props.template.layout || {
        type: 'single-column',
        container: {
            maxWidth: '860px',
            margin: '0 auto',
            padding: '20px'
        },
        content: {
            padding: '30px',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }
    };
    console.log('ResumeRenderer: 布局配置', JSON.stringify(layout, null, 2));
    return layout;
});
// 简历全局样式 - 完全从模板数据中获取
const resumeStyle = computed(() => {
    const globalConfig = props.template.globalStyles || {};
    const theme = props.template.theme || {};
    const layout = props.template.layout || {};
    console.log('ResumeRenderer: 样式配置', {
        globalConfig,
        theme: theme.colors,
        layout: layout.container
    });
    // 构建样式对象，优先使用模板数据
    const style = {
        fontFamily: globalConfig.fontFamily || theme.typography?.fontFamily?.body,
        color: globalConfig.color || theme.colors?.text?.primary,
        backgroundColor: globalConfig.backgroundColor,
        lineHeight: globalConfig.lineHeight,
        fontSize: globalConfig.fontSize,
        minHeight: '100vh', // 确保简历至少占满视口高度
        boxSizing: 'border-box'
    };
    // 应用布局容器样式
    if (layout.container) {
        Object.assign(style, {
            maxWidth: layout.container.maxWidth,
            margin: layout.container.margin,
            padding: layout.container.padding,
            boxShadow: layout.container.boxShadow,
            borderRadius: layout.container.borderRadius,
            backgroundColor: layout.container.backgroundColor || style.backgroundColor
        });
    }
    // 合并其他全局样式
    if (globalConfig.style) {
        Object.assign(style, globalConfig.style);
    }
    return style;
});
// 自定义CSS
const customCss = computed(() => {
    return props.customCss || props.template.customCss || '';
});
// 过滤并排序的模块
const filteredSections = computed(() => {
    const resumeData = props.resumeData || {};
    const sections = resumeData.sections || [];
    // 以 sections 为渲染唯一来源，避免基础模块重复/错显
    let result = [...sections];
    // 过滤掉不可见的模块
    result = result.filter(section => section.visible !== false);
    // 按order排序
    return result.sort((a, b) => (a.order || 0) - (b.order || 0));
});
// 提供resumeData给子组件使用
provide('resumeData', props.resumeData);
// 获取模块样式
function getSectionStyle(section) {
    const sectionStyles = props.template.sectionStyles || {};
    const sectionType = section.type;
    return {
        ...(sectionStyles[sectionType] || {}),
        ...(section.style || {})
    };
}
function isSectionHighlighted(sectionId) {
    return !!props.highlightedSectionId && props.highlightedSectionId === sectionId;
}
function handleSectionHover(sectionId) {
    emit('sectionHover', sectionId);
}
function handleSectionLeave() {
    emit('sectionHover');
    emit('sectionLeave');
}
function handleSectionSelect(sectionId) {
    emit('sectionSelect', sectionId);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-renderer" },
    id: (__VLS_ctx.containerId),
    ...{ style: (__VLS_ctx.resumeStyle) },
});
/** @type {[typeof StyleInjector, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(StyleInjector, new StyleInjector({
    theme: (__VLS_ctx.template.theme),
    globalStyles: (__VLS_ctx.template.globalStyles),
    responsive: (__VLS_ctx.template.responsive),
    sectionStyles: (__VLS_ctx.template.sectionStyles),
    customCss: (__VLS_ctx.customCss),
}));
const __VLS_1 = __VLS_0({
    theme: (__VLS_ctx.template.theme),
    globalStyles: (__VLS_ctx.template.globalStyles),
    responsive: (__VLS_ctx.template.responsive),
    sectionStyles: (__VLS_ctx.template.sectionStyles),
    customCss: (__VLS_ctx.customCss),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
/** @type {[typeof LayoutManager, typeof LayoutManager, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(LayoutManager, new LayoutManager({
    layoutConfig: (__VLS_ctx.layoutConfig),
    sections: (__VLS_ctx.filteredSections),
    sectionStyles: (__VLS_ctx.template.sectionStyles),
}));
const __VLS_4 = __VLS_3({
    layoutConfig: (__VLS_ctx.layoutConfig),
    sections: (__VLS_ctx.filteredSections),
    sectionStyles: (__VLS_ctx.template.sectionStyles),
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_5.slots.default;
for (const [section] of __VLS_getVForSourceType((__VLS_ctx.filteredSections))) {
    {
        const { [__VLS_tryAsConstant(`section-${section.id}`)]: __VLS_thisSlot } = __VLS_5.slots;
        const [slotProps] = __VLS_getSlotParams(__VLS_thisSlot);
        /** @type {[typeof GenericSection, ]} */ ;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent(GenericSection, new GenericSection({
            ...{ 'onHover': {} },
            ...{ 'onLeave': {} },
            ...{ 'onSelect': {} },
            section: (section),
            sectionStyle: (__VLS_ctx.getSectionStyle(section)),
            highlighted: (__VLS_ctx.isSectionHighlighted(section.id)),
        }));
        const __VLS_7 = __VLS_6({
            ...{ 'onHover': {} },
            ...{ 'onLeave': {} },
            ...{ 'onSelect': {} },
            section: (section),
            sectionStyle: (__VLS_ctx.getSectionStyle(section)),
            highlighted: (__VLS_ctx.isSectionHighlighted(section.id)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        let __VLS_9;
        let __VLS_10;
        let __VLS_11;
        const __VLS_12 = {
            onHover: (...[$event]) => {
                __VLS_ctx.handleSectionHover(section.id);
            }
        };
        const __VLS_13 = {
            onLeave: (__VLS_ctx.handleSectionLeave)
        };
        const __VLS_14 = {
            onSelect: (...[$event]) => {
                __VLS_ctx.handleSectionSelect(section.id);
            }
        };
        var __VLS_8;
    }
}
var __VLS_5;
if (__VLS_ctx.debug) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "debug-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.template, null, 2));
}
/** @type {__VLS_StyleScopedClasses['resume-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['debug-info']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            StyleInjector: StyleInjector,
            LayoutManager: LayoutManager,
            GenericSection: GenericSection,
            containerId: containerId,
            layoutConfig: layoutConfig,
            resumeStyle: resumeStyle,
            customCss: customCss,
            filteredSections: filteredSections,
            getSectionStyle: getSectionStyle,
            isSectionHighlighted: isSectionHighlighted,
            handleSectionHover: handleSectionHover,
            handleSectionLeave: handleSectionLeave,
            handleSectionSelect: handleSectionSelect,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
