import { computed, defineProps } from 'vue';
import PersonalInfoSection from './sections/PersonalInfoSection.vue';
import ExperienceSection from './sections/ExperienceSection.vue';
import EducationSection from './sections/EducationSection.vue';
import SkillsSection from './sections/SkillsSection.vue';
import ProjectsSection from './sections/ProjectsSection.vue';
import CustomSection from './sections/CustomSection.vue';
import GenericTextSection from './sections/GenericTextSection.vue';
import InternshipSection from './sections/InternshipSection.vue';
import CampusSection from './sections/CampusSection.vue';
import AwardsSection from './sections/AwardsSection.vue';
import SchemaRenderer from './sections/SchemaRenderer.vue';
const props = defineProps();
// 组件映射表 - 支持动态扩展
// 注意：模板中可以使用 'personal' 或 'basic'，都会映射到 PersonalInfoSection
const componentMap = {
    'basic': PersonalInfoSection,
    'personal': PersonalInfoSection, // 兼容模板中的 'personal' 类型
    'experience': ExperienceSection,
    'education': EducationSection,
    'skills': SkillsSection,
    'projects': ProjectsSection,
    'intention': GenericTextSection,
    'summary': GenericTextSection,
    'hobbies': GenericTextSection,
    'awards': AwardsSection,
    'internship': InternshipSection,
    'campus': CampusSection,
    'custom': CustomSection
};
const sectionComponent = computed(() => {
    // 优先检查是否有自定义渲染器
    if (props.config?.renderer) {
        return props.config.renderer;
    }
    // 检查是否有Schema定义
    if (props.config?.schema) {
        return SchemaRenderer;
    }
    // 使用默认组件映射
    return componentMap[props.type] || CustomSection;
});
// 自定义类名
const customClass = computed(() => {
    const config = props.config || {};
    return config.customClass || '';
});
const sectionStyle = computed(() => {
    const config = props.config || {};
    // 解析模块 style（gridColumn 等）
    const style = {
        marginBottom: props.styles?.spacing?.sectionMargin || '25px',
        margin: config.margin || '0',
        padding: config.padding || '0',
        backgroundColor: config.backgroundColor,
        borderRadius: config.borderRadius,
        boxShadow: config.boxShadow,
        ...config.customStyles,
        ...config.customStyle // 支持 customStyle 对象
    };
    if (config.gridColumn)
        style.gridColumn = config.gridColumn;
    if (config.gap)
        style.gap = config.gap;
    return style;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-section" },
    ...{ class: (__VLS_ctx.customClass) },
    ...{ style: (__VLS_ctx.sectionStyle) },
});
const __VLS_0 = ((__VLS_ctx.sectionComponent));
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
/** @type {__VLS_StyleScopedClasses['resume-section']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            sectionComponent: sectionComponent,
            customClass: customClass,
            sectionStyle: sectionStyle,
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
