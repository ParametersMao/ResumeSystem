import { computed } from 'vue';
import ResumeRenderer from './ResumeRenderer.vue';
import { adaptLegacyTemplateData, adaptLegacyResumeData } from '@/utils/templateAdapter';
const props = defineProps();
const emit = defineEmits();
// 自定义CSS
const customCss = computed(() => {
    return props.customCss || props.templateData?.customCss || '';
});
// 适配旧版模板数据到新格式
const adaptedTemplate = computed(() => {
    // 优先使用模板中定义的类型
    const templateType = props.templateData?.templateType || props.templateType || 'single-column';
    console.log('NewResumePreview: 原始模板数据', {
        templateData: props.templateData,
        templateType,
        extraStyles: props.extraStyles
    });
    const adapted = adaptLegacyTemplateData(props.templateData, templateType, props.extraStyles);
    console.log('NewResumePreview: 适配后的模板数据', {
        layout: adapted.layout,
        customCss: adapted.customCss?.substring(0, 100) + '...'
    });
    return adapted;
});
// 适配简历数据
const adaptedResumeData = computed(() => {
    return adaptLegacyResumeData(props.resumeData);
});
function onSectionHover(sectionId) {
    emit('sectionHover', sectionId ?? null);
}
function onSectionLeave() {
    emit('sectionHover', null);
}
function onSectionSelect(sectionId) {
    if (!sectionId)
        return;
    emit('sectionSelect', sectionId);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "new-resume-preview" },
});
/** @type {[typeof ResumeRenderer, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ResumeRenderer, new ResumeRenderer({
    ...{ 'onSectionHover': {} },
    ...{ 'onSectionLeave': {} },
    ...{ 'onSectionSelect': {} },
    template: (__VLS_ctx.adaptedTemplate),
    resumeData: (__VLS_ctx.adaptedResumeData),
    customCss: (__VLS_ctx.customCss),
    debug: (__VLS_ctx.debug),
    highlightedSectionId: (__VLS_ctx.highlightedSectionId || undefined),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onSectionHover': {} },
    ...{ 'onSectionLeave': {} },
    ...{ 'onSectionSelect': {} },
    template: (__VLS_ctx.adaptedTemplate),
    resumeData: (__VLS_ctx.adaptedResumeData),
    customCss: (__VLS_ctx.customCss),
    debug: (__VLS_ctx.debug),
    highlightedSectionId: (__VLS_ctx.highlightedSectionId || undefined),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onSectionHover: (__VLS_ctx.onSectionHover)
};
const __VLS_7 = {
    onSectionLeave: (__VLS_ctx.onSectionLeave)
};
const __VLS_8 = {
    onSectionSelect: (__VLS_ctx.onSectionSelect)
};
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['new-resume-preview']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ResumeRenderer: ResumeRenderer,
            customCss: customCss,
            adaptedTemplate: adaptedTemplate,
            adaptedResumeData: adaptedResumeData,
            onSectionHover: onSectionHover,
            onSectionLeave: onSectionLeave,
            onSectionSelect: onSectionSelect,
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
