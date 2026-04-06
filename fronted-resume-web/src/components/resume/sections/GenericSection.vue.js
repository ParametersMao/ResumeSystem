import { computed, defineEmits, defineProps, markRaw, resolveComponent } from 'vue';
import { componentRegistry } from '@/utils/componentRegistry';
import { isBasicSection } from '@/utils/sectionType';
import { normalizeModuleType, getRendererName, isBasicInfoModule, getDefaultModuleConfig } from '@/utils/sectionTypeMapping';
import { adaptRendererConfig, adaptStyleConfigForRenderer } from '@/utils/rendererConfigAdapter';
const props = defineProps();
const emit = defineEmits();
// 标准化模块类型
const normalizedType = computed(() => {
    return normalizeModuleType(props.section.type);
});
// 合并配置
const mergedConfig = computed(() => {
    const config = props.section.config || {};
    const defaultConfig = getDefaultModuleConfig(normalizedType.value);
    return {
        ...defaultConfig,
        ...config,
        layout: config.layout || defaultConfig.layout || 'standard'
    };
});
// 提取样式配置
const styleConfig = computed(() => {
    return {
        ...(props.sectionStyle || {}),
        ...(props.section.style || {})
    };
});
// 适配后的配置和样式（供渲染器使用）
const adaptedConfig = computed(() => {
    return adaptRendererConfig(props.section, styleConfig.value);
});
const adaptedStyleConfig = computed(() => {
    return adaptStyleConfigForRenderer(styleConfig.value);
});
// 自定义类名
const customClass = computed(() => {
    const config = props.section.config || {};
    return config.customClass || '';
});
// 是否应该显示标题
// 对于 basic/personal 类型，如果 config.showTitle === false，则不显示（由内部布局组件控制）
const shouldShowTitle = computed(() => {
    const config = props.section.config || {};
    // 使用新的类型检查
    if (isBasicInfoModule(normalizedType.value) && config.showTitle === false) {
        return false;
    }
    // 也兼容旧的检查方法
    if (isBasicSection(props.section.type) && config.showTitle === false) {
        return false;
    }
    return true;
});
// 模块容器样式
const sectionStyle = computed(() => {
    const style = styleConfig.value;
    const containerStyle = style.container || {};
    console.log(`GenericSection: ${props.section.type} 模块样式`, {
        styleConfig: style,
        containerStyle: containerStyle
    });
    // 基础样式属性
    return {
        margin: containerStyle.margin || '0 0 25px 0',
        padding: containerStyle.padding || '0',
        backgroundColor: containerStyle.backgroundColor,
        borderRadius: containerStyle.borderRadius,
        boxShadow: containerStyle.boxShadow,
        border: containerStyle.border,
        ...containerStyle // 合并其他属性
    };
});
// 标题组件
const titleComponent = computed(() => {
    // 检查是否定义了特殊标题组件
    const titleConfig = styleConfig.value.title || {};
    if (titleConfig.component) {
        // 尝试从组件注册表获取
        const customComponent = componentRegistry.get(titleConfig.component);
        if (customComponent) {
            return markRaw(customComponent.component);
        }
    }
    // 返回默认标题组件（h2）
    return 'h2';
});
// 标题特殊样式类
const titleSpecialClass = computed(() => {
    const titleConfig = styleConfig.value.title || {};
    const special = titleConfig.special || {};
    if (special.type) {
        return `title-${special.type}`;
    }
    return '';
});
// 标题样式 - 减少内联样式，更多依赖CSS类
const titleStyle = computed(() => {
    const titleConfig = styleConfig.value.title || {};
    // 如果定义了特殊标题样式，则部分样式将由CSS类处理
    const special = titleConfig.special || {};
    // 只保留必要的内联样式，其他通过CSS类应用
    return {
        color: titleConfig.color,
        fontSize: titleConfig.fontSize,
        fontWeight: titleConfig.fontWeight,
        textAlign: titleConfig.textAlign,
        margin: titleConfig.margin,
        padding: titleConfig.padding,
        special: undefined,
        component: undefined,
        ...Object.entries(titleConfig)
            .filter(([key]) => !['special', 'component'].includes(key))
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
    };
});
// 内容区域样式 - 减少内联样式
const contentStyle = computed(() => {
    const contentConfig = styleConfig.value.content || {};
    // 只保留必要的内联样式，其他通过CSS类应用
    return {
        fontSize: contentConfig.fontSize,
        lineHeight: contentConfig.lineHeight,
        color: contentConfig.color,
        margin: contentConfig.margin,
        padding: contentConfig.padding,
        ...Object.entries(contentConfig)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
    };
});
// 内容组件 - 根据模块类型和布局选择合适的组件
const contentComponent = computed(() => {
    const section = props.section;
    const config = mergedConfig.value;
    console.log(`GenericSection: 选择渲染器`, {
        originalType: section.type,
        normalizedType: normalizedType.value,
        rendererName: getRendererName(normalizedType.value)
    });
    // 1. 首先尝试使用标准化后的类型获取渲染器
    const standardRendererName = getRendererName(normalizedType.value);
    let renderer = resolveComponent(standardRendererName);
    if (renderer && typeof renderer !== 'string') {
        console.log(`✓ 找到标准渲染器: ${standardRendererName}`);
        return markRaw(renderer);
    }
    // 2. 尝试使用原始类型获取渲染器（兼容性）
    const originalRendererName = `${section.type}-renderer`;
    if (originalRendererName !== standardRendererName) {
        renderer = resolveComponent(originalRendererName);
        if (renderer && typeof renderer !== 'string') {
            console.log(`✓ 找到原始类型渲染器: ${originalRendererName}`);
            return markRaw(renderer);
        }
    }
    // 3. 尝试通用渲染器
    const genericRenderer = resolveComponent('generic-renderer');
    if (genericRenderer && typeof genericRenderer !== 'string') {
        console.log(`✓ 使用通用渲染器`);
        return markRaw(genericRenderer);
    }
    // 4. 最后使用fallback渲染器
    const fallbackRenderer = resolveComponent('fallback-renderer');
    if (fallbackRenderer && typeof fallbackRenderer !== 'string') {
        console.warn(`⚠ 使用fallback渲染器: ${section.type}`);
        return markRaw(fallbackRenderer);
    }
    // 完全兜底：使用div
    console.error(`✗ 未找到任何渲染器: ${section.type}`);
    return 'div';
});
function emitHover() {
    emit('hover', props.section.id);
}
function emitLeave() {
    emit('leave', props.section.id);
}
function emitSelect() {
    emit('select', props.section.id);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onMouseenter: (__VLS_ctx.emitHover) },
    ...{ onMouseleave: (__VLS_ctx.emitLeave) },
    ...{ onClick: (__VLS_ctx.emitSelect) },
    ...{ class: ([
            'section-wrapper',
            `section-${__VLS_ctx.section.type}-wrapper`,
            __VLS_ctx.customClass,
            { 'is-highlighted': __VLS_ctx.highlighted }
        ]) },
    ...{ style: (__VLS_ctx.sectionStyle) },
});
if (__VLS_ctx.shouldShowTitle) {
    const __VLS_0 = ((__VLS_ctx.titleComponent));
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ class: ([
                'section-title',
                `section-${__VLS_ctx.section.type}-title`,
                __VLS_ctx.titleSpecialClass
            ]) },
        ...{ style: (__VLS_ctx.titleStyle) },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: ([
                'section-title',
                `section-${__VLS_ctx.section.type}-title`,
                __VLS_ctx.titleSpecialClass
            ]) },
        ...{ style: (__VLS_ctx.titleStyle) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    (__VLS_ctx.section.title);
    var __VLS_3;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: ([
            'section-content',
            `section-${__VLS_ctx.section.type}-content`
        ]) },
    ...{ style: (__VLS_ctx.contentStyle) },
});
const __VLS_4 = ((__VLS_ctx.contentComponent));
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    section: (__VLS_ctx.section),
    items: (__VLS_ctx.section.items),
    config: (__VLS_ctx.adaptedConfig),
    styleConfig: (__VLS_ctx.adaptedStyleConfig),
}));
const __VLS_6 = __VLS_5({
    section: (__VLS_ctx.section),
    items: (__VLS_ctx.section.items),
    config: (__VLS_ctx.adaptedConfig),
    styleConfig: (__VLS_ctx.adaptedStyleConfig),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            adaptedConfig: adaptedConfig,
            adaptedStyleConfig: adaptedStyleConfig,
            customClass: customClass,
            shouldShowTitle: shouldShowTitle,
            sectionStyle: sectionStyle,
            titleComponent: titleComponent,
            titleSpecialClass: titleSpecialClass,
            titleStyle: titleStyle,
            contentStyle: contentStyle,
            contentComponent: contentComponent,
            emitHover: emitHover,
            emitLeave: emitLeave,
            emitSelect: emitSelect,
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
