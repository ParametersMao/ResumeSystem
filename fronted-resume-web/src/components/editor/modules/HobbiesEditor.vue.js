import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'change']);
const localData = ref({
    description: '',
    tags: []
});
const commonHobbies = [
    '阅读', '跑步', '游泳', '健身', '旅游', '摄影', '音乐', '电影',
    '绘画', '书法', '羽毛球', '篮球', '足球', '乒乓球', '登山', '骑行'
];
watch(() => props.modelValue, (newVal) => {
    if (newVal && newVal.data) {
        localData.value = { ...localData.value, ...newVal.data };
    }
}, { immediate: true, deep: true });
function addTag(tag) {
    if (tag && !localData.value.tags.includes(tag)) {
        localData.value.tags.push(tag);
        emitChange();
    }
}
function removeTag(tag) {
    localData.value.tags = localData.value.tags.filter(t => t !== tag);
    emitChange();
}
function emitChange() {
    if (props.modelValue) {
        props.modelValue.data = localData.value;
        emit('update:modelValue', props.modelValue);
        emit('change', props.modelValue);
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hobbies-editor" },
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
    modelValue: (__VLS_ctx.localData.description),
    type: "textarea",
    rows: (4),
    placeholder: "请描述您的兴趣爱好，展示您的个性和生活态度",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.localData.description),
    type: "textarea",
    rows: (4),
    placeholder: "请描述您的兴趣爱好，展示您的个性和生活态度",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onInput: (__VLS_ctx.emitChange)
};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hobbies-tags" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tags-container" },
});
for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.localData.tags))) {
    const __VLS_8 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClose': {} },
        key: (tag),
        closable: true,
        type: "info",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClose': {} },
        key: (tag),
        closable: true,
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClose: (...[$event]) => {
            __VLS_ctx.removeTag(tag);
        }
    };
    __VLS_11.slots.default;
    (tag);
    var __VLS_11;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "common-tags" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.commonHobbies))) {
    const __VLS_16 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        key: (tag),
        size: "small",
        text: true,
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        key: (tag),
        size: "small",
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (...[$event]) => {
            __VLS_ctx.addTag(tag);
        }
    };
    __VLS_19.slots.default;
    (tag);
    var __VLS_19;
}
/** @type {__VLS_StyleScopedClasses['hobbies-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['hobbies-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-container']} */ ;
/** @type {__VLS_StyleScopedClasses['common-tags']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            localData: localData,
            commonHobbies: commonHobbies,
            addTag: addTag,
            removeTag: removeTag,
            emitChange: emitChange,
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
