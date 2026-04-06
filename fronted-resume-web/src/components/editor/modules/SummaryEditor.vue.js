import { ref, watch } from 'vue';
import { MagicStick } from '@element-plus/icons-vue';
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'change', 'ai-optimize']);
const localData = ref({
    content: ''
});
const templates = [
    '本人积极进取，性格外向，擅长沟通协作。具有较强的学习能力和责任心，能够快速适应新环境。工作认真负责，注重团队合作，愿意承担挑战性的工作。',
    '具有扎实的专业基础和丰富的实践经验，熟悉行业发展趋势。工作中注重效率和质量，善于发现和解决问题。具备良好的沟通能力和团队精神，能够在压力下保持良好的工作状态。',
    '热爱本职工作，对待工作认真负责，善于总结和反思。具有较强的执行力和创新意识，能够独立完成工作任务。注重个人成长，持续学习新知识和新技能。'
];
watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        if (newVal.data && newVal.data.content) {
            localData.value.content = newVal.data.content;
        }
        else if (newVal.items && newVal.items.length > 0) {
            localData.value.content = newVal.items[0].text || newVal.items[0].content || '';
        }
    }
}, { immediate: true, deep: true });
function useTemplate(template) {
    localData.value.content = template;
    emitChange();
}
function emitChange() {
    if (props.modelValue) {
        props.modelValue.data = { content: localData.value.content };
        props.modelValue.items = [{ text: localData.value.content, content: localData.value.content }];
        emit('update:modelValue', props.modelValue);
        emit('change', props.modelValue);
    }
}
function emitAiOptimize() {
    emit('ai-optimize', {
        type: 'summary',
        data: localData.value
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-item full-width" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.localData.content),
    type: "textarea",
    rows: (8),
    placeholder: "请输入您的自我评价，展示您的优势、性格特点、职业素养等",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.localData.content),
    type: "textarea",
    rows: (8),
    placeholder: "请输入您的自我评价，展示您的优势、性格特点、职业素养等",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onInput: (__VLS_ctx.emitChange)
};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-tips" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-optimize-box" },
});
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.emitAiOptimize)
};
__VLS_11.slots.default;
const __VLS_16 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.MagicStick;
/** @type {[typeof __VLS_components.MagicStick, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_19;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "template-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "template-list" },
});
for (const [template, index] of __VLS_getVForSourceType((__VLS_ctx.templates))) {
    const __VLS_24 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        key: (index),
        size: "small",
        text: true,
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        key: (index),
        size: "small",
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (...[$event]) => {
            __VLS_ctx.useTemplate(template);
        }
    };
    __VLS_27.slots.default;
    (index + 1);
    var __VLS_27;
}
for (const [template, index] of __VLS_getVForSourceType((__VLS_ctx.templates))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "template-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (template);
}
/** @type {__VLS_StyleScopedClasses['summary-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-optimize-box']} */ ;
/** @type {__VLS_StyleScopedClasses['template-section']} */ ;
/** @type {__VLS_StyleScopedClasses['template-list']} */ ;
/** @type {__VLS_StyleScopedClasses['template-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MagicStick: MagicStick,
            localData: localData,
            templates: templates,
            useTemplate: useTemplate,
            emitChange: emitChange,
            emitAiOptimize: emitAiOptimize,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
