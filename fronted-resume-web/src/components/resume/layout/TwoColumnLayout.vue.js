import { computed, defineProps } from 'vue';
const props = defineProps();
// 容器样式 - 完全从layoutConfig获取
const containerStyle = computed(() => {
    const config = props.layoutConfig?.container || {};
    return {
        ...config
    };
});
// 内容区样式 - 完全从layoutConfig获取
const contentStyle = computed(() => {
    const config = props.layoutConfig?.content || {};
    return {
        ...config
    };
});
// 双列样式 - 完全从layoutConfig获取，但确保有默认值
const columnsStyle = computed(() => {
    const columns = props.layoutConfig?.columns || {};
    const widths = columns.widths || [];
    console.log('TwoColumnLayout: 列样式配置', {
        columns,
        widths,
        gap: columns.gap
    });
    return {
        display: 'grid',
        gridTemplateColumns: widths.length ? widths.join(' ') : '30% 70%', // 确保至少有默认值
        gap: columns.gap !== undefined ? columns.gap : '20px' // 支持gap为"0"的情况
    };
});
// 左列样式 - 完全从layoutConfig获取
const leftColumnStyle = computed(() => {
    const columns = props.layoutConfig?.columns || {};
    console.log('TwoColumnLayout: 左列样式', columns.leftStyle);
    return columns.leftStyle || {};
});
// 右列样式 - 完全从layoutConfig获取
const rightColumnStyle = computed(() => {
    const columns = props.layoutConfig?.columns || {};
    console.log('TwoColumnLayout: 右列样式', columns.rightStyle);
    return columns.rightStyle || {};
});
// 左列模块
const leftColumnSections = computed(() => {
    return [...props.sections]
        .filter(section => {
        const sectionStyle = section.style || {};
        const configStyle = section.config || {};
        // 检查是否明确指定放在左列
        if (sectionStyle.column === 'left' || configStyle.column === 'left') {
            return true;
        }
        // 检查gridColumn配置
        if (sectionStyle.gridColumn === '1 / 2' || configStyle.gridColumn === '1 / 2') {
            return true;
        }
        return false;
    })
        .sort((a, b) => (a.order || 0) - (b.order || 0));
});
// 右列模块
const rightColumnSections = computed(() => {
    // 先获取所有左列模块的ID
    const leftColumnSectionIds = leftColumnSections.value.map(section => section.id);
    return [...props.sections]
        .filter(section => {
        const sectionStyle = section.style || {};
        const configStyle = section.config || {};
        // 如果已经分配到左列则不包含
        if (leftColumnSectionIds.includes(section.id)) {
            return false;
        }
        // 检查是否明确指定放在右列
        if (sectionStyle.column === 'right' || configStyle.column === 'right') {
            return true;
        }
        // 检查gridColumn配置
        if (sectionStyle.gridColumn === '2 / 3' || configStyle.gridColumn === '2 / 3') {
            return true;
        }
        // 默认放在右列
        return true;
    })
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
    // 使用generic-section组件
    return 'generic-section';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-layout two-column-layout" },
    ...{ style: (__VLS_ctx.containerStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-content" },
    ...{ style: (__VLS_ctx.contentStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-columns" },
    ...{ style: (__VLS_ctx.columnsStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-column column-left" },
    ...{ style: (__VLS_ctx.leftColumnStyle) },
});
for (const [section] of __VLS_getVForSourceType((__VLS_ctx.leftColumnSections))) {
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-column column-right" },
    ...{ style: (__VLS_ctx.rightColumnStyle) },
});
for (const [section] of __VLS_getVForSourceType((__VLS_ctx.rightColumnSections))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        key: (section.id),
        ...{ class: (['resume-section', `section-${section.type}`]) },
        ...{ style: (__VLS_ctx.getSectionStyle(section)) },
    });
    var __VLS_8 = {
        section: (section),
        sectionStyle: (__VLS_ctx.getSectionStyleObj(section)),
    };
    var __VLS_9 = __VLS_tryAsConstant(`section-${section.id}`);
    const __VLS_12 = ((__VLS_ctx.getSectionComponent(section)));
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        section: (section),
        sectionStyle: (__VLS_ctx.getSectionStyleObj(section)),
    }));
    const __VLS_14 = __VLS_13({
        section: (section),
        sectionStyle: (__VLS_ctx.getSectionStyleObj(section)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
/** @type {__VLS_StyleScopedClasses['resume-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['two-column-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-content']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-columns']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-column']} */ ;
/** @type {__VLS_StyleScopedClasses['column-left']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-column']} */ ;
/** @type {__VLS_StyleScopedClasses['column-right']} */ ;
// @ts-ignore
var __VLS_2 = __VLS_1, __VLS_3 = __VLS_0, __VLS_10 = __VLS_9, __VLS_11 = __VLS_8;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            containerStyle: containerStyle,
            contentStyle: contentStyle,
            columnsStyle: columnsStyle,
            leftColumnStyle: leftColumnStyle,
            rightColumnStyle: rightColumnStyle,
            leftColumnSections: leftColumnSections,
            rightColumnSections: rightColumnSections,
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
