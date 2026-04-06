import { ref, watch, nextTick } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'change']);
const localData = ref({
    description: '',
    tags: [],
    skills: []
});
const inputVisible = ref(false);
const inputValue = ref('');
const inputRef = ref(null);
const commonTags = [
    'Office软件', '沟通能力', '口才', '文字表达', '数据分析', '项目管理',
    '团队合作', '时间管理', 'JavaScript', 'Python', 'Java', 'Node.js',
    'Vue', 'React', 'TypeScript', 'SQL', '产品设计', '广告设计'
];
watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        if (newVal.data) {
            localData.value = { ...localData.value, ...newVal.data };
        }
        if (newVal.items) {
            localData.value.skills = newVal.items;
        }
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
    nextTick(() => {
        inputRef.value?.focus();
    });
}
function handleInputConfirm() {
    if (inputValue.value) {
        addTag(inputValue.value);
    }
    inputVisible.value = false;
    inputValue.value = '';
}
function addSkill() {
    localData.value.skills.push({ name: '', level: 3 });
    emitChange();
}
function removeSkill(index) {
    localData.value.skills.splice(index, 1);
    emitChange();
}
function emitChange() {
    if (props.modelValue) {
        props.modelValue.data = {
            description: localData.value.description,
            tags: localData.value.tags
        };
        props.modelValue.items = localData.value.skills;
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
    ...{ class: "skills-editor" },
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
    rows: (6),
    placeholder: "请输入您的技能特长，例如：&#10;语言能力：大学英语六级，英语听说读写熟练&#10;计算机：熟练使用Office办公软件，如Word、Excel&#10;团队能力：具有良好的团队协作能力",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.localData.description),
    type: "textarea",
    rows: (6),
    placeholder: "请输入您的技能特长，例如：&#10;语言能力：大学英语六级，英语听说读写熟练&#10;计算机：熟练使用Office办公软件，如Word、Excel&#10;团队能力：具有良好的团队协作能力",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onInput: (__VLS_ctx.emitChange)
};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "skills-tags-section" },
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
        ...{ class: "skill-tag" },
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClose': {} },
        key: (tag),
        closable: true,
        ...{ class: "skill-tag" },
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
if (__VLS_ctx.inputVisible) {
    const __VLS_16 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onKeyup': {} },
        ...{ 'onBlur': {} },
        ref: "inputRef",
        modelValue: (__VLS_ctx.inputValue),
        size: "small",
        ...{ class: "tag-input" },
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onKeyup': {} },
        ...{ 'onBlur': {} },
        ref: "inputRef",
        modelValue: (__VLS_ctx.inputValue),
        size: "small",
        ...{ class: "tag-input" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onKeyup: (__VLS_ctx.handleInputConfirm)
    };
    const __VLS_24 = {
        onBlur: (__VLS_ctx.handleInputConfirm)
    };
    /** @type {typeof __VLS_ctx.inputRef} */ ;
    var __VLS_25 = {};
    var __VLS_19;
}
else {
    const __VLS_27 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_29 = __VLS_28({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_31;
    let __VLS_32;
    let __VLS_33;
    const __VLS_34 = {
        onClick: (__VLS_ctx.showInput)
    };
    __VLS_30.slots.default;
    var __VLS_30;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "common-tags" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "skills-level-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "skill-items" },
});
for (const [skill, index] of __VLS_getVForSourceType((__VLS_ctx.localData.skills))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "skill-item" },
    });
    const __VLS_43 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        ...{ 'onInput': {} },
        modelValue: (skill.name),
        placeholder: "技能名称",
        ...{ style: {} },
    }));
    const __VLS_45 = __VLS_44({
        ...{ 'onInput': {} },
        modelValue: (skill.name),
        placeholder: "技能名称",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_47;
    let __VLS_48;
    let __VLS_49;
    const __VLS_50 = {
        onInput: (__VLS_ctx.emitChange)
    };
    var __VLS_46;
    const __VLS_51 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        ...{ 'onChange': {} },
        modelValue: (skill.level),
        placeholder: "熟练度",
        ...{ style: {} },
    }));
    const __VLS_53 = __VLS_52({
        ...{ 'onChange': {} },
        modelValue: (skill.level),
        placeholder: "熟练度",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_55;
    let __VLS_56;
    let __VLS_57;
    const __VLS_58 = {
        onChange: (__VLS_ctx.emitChange)
    };
    __VLS_54.slots.default;
    const __VLS_59 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        label: "了解",
        value: (1),
    }));
    const __VLS_61 = __VLS_60({
        label: "了解",
        value: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    const __VLS_63 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
        label: "一般",
        value: (2),
    }));
    const __VLS_65 = __VLS_64({
        label: "一般",
        value: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    const __VLS_67 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
        label: "良好",
        value: (3),
    }));
    const __VLS_69 = __VLS_68({
        label: "良好",
        value: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    const __VLS_71 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
        label: "熟练",
        value: (4),
    }));
    const __VLS_73 = __VLS_72({
        label: "熟练",
        value: (4),
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    const __VLS_75 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        label: "精通",
        value: (5),
    }));
    const __VLS_77 = __VLS_76({
        label: "精通",
        value: (5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    var __VLS_54;
    const __VLS_79 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
        ...{ 'onClick': {} },
        type: "danger",
        size: "small",
        icon: (__VLS_ctx.Delete),
    }));
    const __VLS_81 = __VLS_80({
        ...{ 'onClick': {} },
        type: "danger",
        size: "small",
        icon: (__VLS_ctx.Delete),
    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    let __VLS_83;
    let __VLS_84;
    let __VLS_85;
    const __VLS_86 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeSkill(index);
        }
    };
    __VLS_82.slots.default;
    var __VLS_82;
}
const __VLS_87 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
    ...{ 'onClick': {} },
    size: "small",
    icon: (__VLS_ctx.Plus),
}));
const __VLS_89 = __VLS_88({
    ...{ 'onClick': {} },
    size: "small",
    icon: (__VLS_ctx.Plus),
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
let __VLS_91;
let __VLS_92;
let __VLS_93;
const __VLS_94 = {
    onClick: (__VLS_ctx.addSkill)
};
__VLS_90.slots.default;
var __VLS_90;
/** @type {__VLS_StyleScopedClasses['skills-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-tags-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-container']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-input']} */ ;
/** @type {__VLS_StyleScopedClasses['common-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-level-section']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-items']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-item']} */ ;
// @ts-ignore
var __VLS_26 = __VLS_25;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Plus: Plus,
            Delete: Delete,
            localData: localData,
            inputVisible: inputVisible,
            inputValue: inputValue,
            inputRef: inputRef,
            commonTags: commonTags,
            addTag: addTag,
            removeTag: removeTag,
            showInput: showInput,
            handleInputConfirm: handleInputConfirm,
            addSkill: addSkill,
            removeSkill: removeSkill,
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
