import { ref, watch, nextTick } from 'vue';
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'change']);
const localData = ref({
    content: '',
    tags: []
});
const inputVisible = ref(false);
const inputValue = ref('');
const inputRef = ref(null);
const commonTags = ['英语四级', '英语六级', '计算机二级', '计算机三级', '奖学金', '优秀毕业生', '优秀学生干部'];
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
function showInput() {
    inputVisible.value = true;
    nextTick(() => inputRef.value?.focus());
}
function handleInputConfirm() {
    if (inputValue.value) {
        addTag(inputValue.value);
    }
    inputVisible.value = false;
    inputValue.value = '';
}
function emitChange() {
    if (props.modelValue) {
        props.modelValue.data = localData.value;
        // 解析content为items
        const lines = localData.value.content.split('\n').filter(line => line.trim());
        props.modelValue.items = lines.map(line => ({
            text: line.trim(),
            content: line.trim()
        }));
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
    ...{ class: "awards-editor" },
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
    rows: (6),
    placeholder: "请输入您获得的荣誉证书，每行一条，例如：&#10;• 荣誉证书03，所获奖励和知识获得，2015&#10;• 荣誉证书02，参加相关项目工作室的奖项，2014",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.localData.content),
    type: "textarea",
    rows: (6),
    placeholder: "请输入您获得的荣誉证书，每行一条，例如：&#10;• 荣誉证书03，所获奖励和知识获得，2015&#10;• 荣誉证书02，参加相关项目工作室的奖项，2014",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onInput: (__VLS_ctx.emitChange)
};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "certificate-tags" },
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
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClose': {} },
        key: (tag),
        closable: true,
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
if (!__VLS_ctx.inputVisible) {
    const __VLS_16 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (__VLS_ctx.showInput)
    };
    __VLS_19.slots.default;
    var __VLS_19;
}
else {
    const __VLS_24 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onKeyup': {} },
        ...{ 'onBlur': {} },
        ref: "inputRef",
        modelValue: (__VLS_ctx.inputValue),
        size: "small",
        ...{ style: {} },
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onKeyup': {} },
        ...{ 'onBlur': {} },
        ref: "inputRef",
        modelValue: (__VLS_ctx.inputValue),
        size: "small",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onKeyup: (__VLS_ctx.handleInputConfirm)
    };
    const __VLS_32 = {
        onBlur: (__VLS_ctx.handleInputConfirm)
    };
    /** @type {typeof __VLS_ctx.inputRef} */ ;
    var __VLS_33 = {};
    var __VLS_27;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "common-tags" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.commonTags))) {
    const __VLS_35 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        ...{ 'onClick': {} },
        key: (tag),
        size: "small",
        text: true,
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onClick': {} },
        key: (tag),
        size: "small",
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_39;
    let __VLS_40;
    let __VLS_41;
    const __VLS_42 = {
        onClick: (...[$event]) => {
            __VLS_ctx.addTag(tag);
        }
    };
    __VLS_38.slots.default;
    (tag);
    var __VLS_38;
}
/** @type {__VLS_StyleScopedClasses['awards-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['certificate-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-container']} */ ;
/** @type {__VLS_StyleScopedClasses['common-tags']} */ ;
// @ts-ignore
var __VLS_34 = __VLS_33;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            localData: localData,
            inputVisible: inputVisible,
            inputValue: inputValue,
            inputRef: inputRef,
            commonTags: commonTags,
            addTag: addTag,
            removeTag: removeTag,
            showInput: showInput,
            handleInputConfirm: handleInputConfirm,
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
