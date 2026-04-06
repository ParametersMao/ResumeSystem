import { ref, computed, nextTick } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';
import { SECTION_TYPES } from '@/config/sectionTypes';
import DynamicField from '@/components/form/DynamicField.vue';
const props = defineProps();
const emit = defineEmits();
// 技能输入相关
const showSkillInput = ref(false);
const newSkill = ref('');
const skillInputRef = ref();
// 获取模块配置
const sectionConfig = computed(() => {
    return SECTION_TYPES[props.modelValue.type] || SECTION_TYPES.custom;
});
// 是否可以添加项目
const canAddItems = computed(() => {
    return props.modelValue.type !== 'skills' && sectionConfig.value.allowMultiple;
});
// 添加项目
function addItem() {
    const emptyItem = {};
    sectionConfig.value.fields?.forEach(field => {
        emptyItem[field.name] = '';
    });
    const newItems = [...props.modelValue.items, emptyItem];
    emit('update:modelValue', { ...props.modelValue, items: newItems });
}
// 删除项目
function removeItem(index) {
    const newItems = [...props.modelValue.items];
    newItems.splice(index, 1);
    emit('update:modelValue', { ...props.modelValue, items: newItems });
}
// 技能相关操作
function addSkill() {
    showSkillInput.value = true;
    nextTick(() => {
        skillInputRef.value?.focus();
    });
}
function confirmSkill() {
    if (newSkill.value.trim()) {
        const newItems = [...props.modelValue.items, newSkill.value.trim()];
        emit('update:modelValue', { ...props.modelValue, items: newItems });
        newSkill.value = '';
    }
    showSkillInput.value = false;
}
function removeSkill(index) {
    const newItems = [...props.modelValue.items];
    newItems.splice(index, 1);
    emit('update:modelValue', { ...props.modelValue, items: newItems });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['item-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['item-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['item-fields']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.modelValue.title),
    size: "small",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.modelValue.title),
    size: "small",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    modelValue: (__VLS_ctx.modelValue.visible),
    size: "small",
    activeText: "显示",
    inactiveText: "隐藏",
}));
const __VLS_6 = __VLS_5({
    modelValue: (__VLS_ctx.modelValue.visible),
    size: "small",
    activeText: "显示",
    inactiveText: "隐藏",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions" },
});
if (__VLS_ctx.canAddItems) {
    const __VLS_8 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (__VLS_ctx.addItem)
    };
    __VLS_11.slots.default;
    const __VLS_16 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
    const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.Plus;
    /** @type {[typeof __VLS_components.Plus, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    var __VLS_19;
    var __VLS_11;
}
const __VLS_24 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    size: "small",
    type: "danger",
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    size: "small",
    type: "danger",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$emit('remove');
    }
};
__VLS_27.slots.default;
const __VLS_32 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.Delete;
/** @type {[typeof __VLS_components.Delete, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
var __VLS_35;
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-content" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.modelValue.visible) }, null, null);
if (__VLS_ctx.modelValue.type === 'skills') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skills-container" },
    });
    for (const [skill, index] of __VLS_getVForSourceType((__VLS_ctx.modelValue.items))) {
        const __VLS_40 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onClose': {} },
            key: (index),
            closable: true,
            ...{ class: "skill-tag" },
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onClose': {} },
            key: (index),
            closable: true,
            ...{ class: "skill-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_44;
        let __VLS_45;
        let __VLS_46;
        const __VLS_47 = {
            onClose: (...[$event]) => {
                if (!(__VLS_ctx.modelValue.type === 'skills'))
                    return;
                __VLS_ctx.removeSkill(index);
            }
        };
        __VLS_43.slots.default;
        (skill);
        var __VLS_43;
    }
    if (__VLS_ctx.showSkillInput) {
        const __VLS_48 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            ...{ 'onKeyup': {} },
            ...{ 'onBlur': {} },
            ref: "skillInputRef",
            modelValue: (__VLS_ctx.newSkill),
            size: "small",
            ...{ class: "skill-input" },
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onKeyup': {} },
            ...{ 'onBlur': {} },
            ref: "skillInputRef",
            modelValue: (__VLS_ctx.newSkill),
            size: "small",
            ...{ class: "skill-input" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_52;
        let __VLS_53;
        let __VLS_54;
        const __VLS_55 = {
            onKeyup: (__VLS_ctx.confirmSkill)
        };
        const __VLS_56 = {
            onBlur: (__VLS_ctx.confirmSkill)
        };
        /** @type {typeof __VLS_ctx.skillInputRef} */ ;
        var __VLS_57 = {};
        var __VLS_51;
    }
    else {
        const __VLS_59 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
            ...{ 'onClick': {} },
            size: "small",
            ...{ class: "add-skill-btn" },
        }));
        const __VLS_61 = __VLS_60({
            ...{ 'onClick': {} },
            size: "small",
            ...{ class: "add-skill-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_60));
        let __VLS_63;
        let __VLS_64;
        let __VLS_65;
        const __VLS_66 = {
            onClick: (__VLS_ctx.addSkill)
        };
        __VLS_62.slots.default;
        const __VLS_67 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({}));
        const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
        __VLS_70.slots.default;
        const __VLS_71 = {}.Plus;
        /** @type {[typeof __VLS_components.Plus, ]} */ ;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({}));
        const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
        var __VLS_70;
        var __VLS_62;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.modelValue.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "item-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "item-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.modelValue.title);
        (index + 1);
        const __VLS_75 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
            text: true,
        }));
        const __VLS_77 = __VLS_76({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        let __VLS_79;
        let __VLS_80;
        let __VLS_81;
        const __VLS_82 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.modelValue.type === 'skills'))
                    return;
                __VLS_ctx.removeItem(index);
            }
        };
        __VLS_78.slots.default;
        const __VLS_83 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({}));
        const __VLS_85 = __VLS_84({}, ...__VLS_functionalComponentArgsRest(__VLS_84));
        __VLS_86.slots.default;
        const __VLS_87 = {}.Delete;
        /** @type {[typeof __VLS_components.Delete, ]} */ ;
        // @ts-ignore
        const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({}));
        const __VLS_89 = __VLS_88({}, ...__VLS_functionalComponentArgsRest(__VLS_88));
        var __VLS_86;
        var __VLS_78;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "item-fields" },
        });
        for (const [field] of __VLS_getVForSourceType((__VLS_ctx.sectionConfig.fields))) {
            /** @type {[typeof DynamicField, ]} */ ;
            // @ts-ignore
            const __VLS_91 = __VLS_asFunctionalComponent(DynamicField, new DynamicField({
                key: (field.name),
                field: (field),
                modelValue: (item[field.name]),
            }));
            const __VLS_92 = __VLS_91({
                key: (field.name),
                field: (field),
                modelValue: (item[field.name]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        }
    }
}
/** @type {__VLS_StyleScopedClasses['section-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['section-content']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-container']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-input']} */ ;
/** @type {__VLS_StyleScopedClasses['add-skill-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-fields']} */ ;
// @ts-ignore
var __VLS_58 = __VLS_57;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Plus: Plus,
            Delete: Delete,
            DynamicField: DynamicField,
            showSkillInput: showSkillInput,
            newSkill: newSkill,
            skillInputRef: skillInputRef,
            sectionConfig: sectionConfig,
            canAddItems: canAddItems,
            addItem: addItem,
            removeItem: removeItem,
            addSkill: addSkill,
            confirmSkill: confirmSkill,
            removeSkill: removeSkill,
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
