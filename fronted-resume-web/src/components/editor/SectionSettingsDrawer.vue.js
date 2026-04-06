import { computed, ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits();
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
const localSection = ref(null);
const titleStyle = computed({
    get: () => {
        if (!localSection.value)
            return createDefaultStyle();
        const style = ensureSectionStyle(localSection.value);
        if (!style.title)
            style.title = {};
        return style.title;
    },
    set: (val) => {
        if (localSection.value) {
            const style = ensureSectionStyle(localSection.value);
            style.title = { ...style.title, ...val };
        }
    }
});
const contentStyle = computed({
    get: () => {
        if (!localSection.value)
            return createDefaultStyle();
        const style = ensureSectionStyle(localSection.value);
        if (!style.content)
            style.content = {};
        return style.content;
    },
    set: (val) => {
        if (localSection.value) {
            const style = ensureSectionStyle(localSection.value);
            style.content = { ...style.content, ...val };
        }
    }
});
const localConfig = computed({
    get: () => {
        if (!localSection.value) {
            return {};
        }
        if (!localSection.value.config) {
            localSection.value.config = {};
        }
        return localSection.value.config;
    },
    set: (val) => {
        if (localSection.value) {
            localSection.value.config = { ...localSection.value.config, ...val };
        }
    }
});
watch(() => props.section, (section) => {
    if (visible.value && section) {
        localSection.value = deepClone(section);
    }
}, { immediate: true });
watch(() => visible.value, (val) => {
    if (val && props.section) {
        localSection.value = deepClone(props.section);
    }
    else if (!val) {
        localSection.value = null;
    }
});
function handleClose() {
    emit('update:modelValue', false);
}
function handleSave() {
    if (!localSection.value) {
        handleClose();
        return;
    }
    emit('save', sanitizeSection(localSection.value));
    emit('update:modelValue', false);
}
function deepClone(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}
function ensureSectionStyle(section) {
    if (!section.style)
        section.style = {};
    return section.style;
}
function createDefaultStyle() {
    return {
        backgroundColor: '',
        color: '',
        fontSize: '',
        lineHeight: ''
    };
}
function sanitizeSection(section) {
    const clean = deepClone(section);
    if (clean.style) {
        Object.keys(clean.style).forEach((key) => {
            if (clean.style[key] && typeof clean.style[key] === 'object') {
                Object.keys(clean.style[key]).forEach((prop) => {
                    if (clean.style[key][prop] === '') {
                        delete clean.style[key][prop];
                    }
                });
                if (Object.keys(clean.style[key]).length === 0) {
                    delete clean.style[key];
                }
            }
        });
        if (Object.keys(clean.style).length === 0) {
            delete clean.style;
        }
    }
    return clean;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.visible),
    size: "360px",
    title: "模块设置",
    appendToBody: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.visible),
    size: "360px",
    title: "模块设置",
    appendToBody: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClose: (__VLS_ctx.handleClose)
};
var __VLS_8 = {};
__VLS_3.slots.default;
if (__VLS_ctx.localSection) {
    const __VLS_9 = {}.ElForm;
    /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        labelWidth: "96px",
        ...{ class: "section-settings-form" },
    }));
    const __VLS_11 = __VLS_10({
        labelWidth: "96px",
        ...{ class: "section-settings-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_12.slots.default;
    const __VLS_13 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        label: "模块标题",
    }));
    const __VLS_15 = __VLS_14({
        label: "模块标题",
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_16.slots.default;
    const __VLS_17 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        modelValue: (__VLS_ctx.localSection.title),
        placeholder: "请输入模块标题",
    }));
    const __VLS_19 = __VLS_18({
        modelValue: (__VLS_ctx.localSection.title),
        placeholder: "请输入模块标题",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    var __VLS_16;
    const __VLS_21 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        label: "显示模块",
    }));
    const __VLS_23 = __VLS_22({
        label: "显示模块",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    const __VLS_25 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        modelValue: (__VLS_ctx.localSection.visible),
    }));
    const __VLS_27 = __VLS_26({
        modelValue: (__VLS_ctx.localSection.visible),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    var __VLS_24;
    const __VLS_29 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        label: "自定义图标",
    }));
    const __VLS_31 = __VLS_30({
        label: "自定义图标",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    const __VLS_33 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        modelValue: (__VLS_ctx.localConfig.icon),
        placeholder: "例如：mdi-account 或 emoji",
    }));
    const __VLS_35 = __VLS_34({
        modelValue: (__VLS_ctx.localConfig.icon),
        placeholder: "例如：mdi-account 或 emoji",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    var __VLS_32;
    const __VLS_37 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({}));
    const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_40.slots.default;
    var __VLS_40;
    const __VLS_41 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        label: "背景颜色",
    }));
    const __VLS_43 = __VLS_42({
        label: "背景颜色",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    const __VLS_45 = {}.ElColorPicker;
    /** @type {[typeof __VLS_components.ElColorPicker, typeof __VLS_components.elColorPicker, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        modelValue: (__VLS_ctx.titleStyle.backgroundColor),
        showAlpha: true,
    }));
    const __VLS_47 = __VLS_46({
        modelValue: (__VLS_ctx.titleStyle.backgroundColor),
        showAlpha: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    var __VLS_44;
    const __VLS_49 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        label: "文字颜色",
    }));
    const __VLS_51 = __VLS_50({
        label: "文字颜色",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    const __VLS_53 = {}.ElColorPicker;
    /** @type {[typeof __VLS_components.ElColorPicker, typeof __VLS_components.elColorPicker, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        modelValue: (__VLS_ctx.titleStyle.color),
        showAlpha: true,
    }));
    const __VLS_55 = __VLS_54({
        modelValue: (__VLS_ctx.titleStyle.color),
        showAlpha: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    var __VLS_52;
    const __VLS_57 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        label: "字体大小",
    }));
    const __VLS_59 = __VLS_58({
        label: "字体大小",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    const __VLS_61 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        modelValue: (__VLS_ctx.titleStyle.fontSize),
        placeholder: "例如：18px",
    }));
    const __VLS_63 = __VLS_62({
        modelValue: (__VLS_ctx.titleStyle.fontSize),
        placeholder: "例如：18px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    var __VLS_60;
    const __VLS_65 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({}));
    const __VLS_67 = __VLS_66({}, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    var __VLS_68;
    const __VLS_69 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        label: "文字颜色",
    }));
    const __VLS_71 = __VLS_70({
        label: "文字颜色",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    const __VLS_73 = {}.ElColorPicker;
    /** @type {[typeof __VLS_components.ElColorPicker, typeof __VLS_components.elColorPicker, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        modelValue: (__VLS_ctx.contentStyle.color),
        showAlpha: true,
    }));
    const __VLS_75 = __VLS_74({
        modelValue: (__VLS_ctx.contentStyle.color),
        showAlpha: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    var __VLS_72;
    const __VLS_77 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        label: "行高",
    }));
    const __VLS_79 = __VLS_78({
        label: "行高",
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    __VLS_80.slots.default;
    const __VLS_81 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        modelValue: (__VLS_ctx.contentStyle.lineHeight),
        placeholder: "例如：1.6",
    }));
    const __VLS_83 = __VLS_82({
        modelValue: (__VLS_ctx.contentStyle.lineHeight),
        placeholder: "例如：1.6",
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    var __VLS_80;
    var __VLS_12;
}
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-footer" },
    });
    const __VLS_85 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        ...{ 'onClick': {} },
    }));
    const __VLS_87 = __VLS_86({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    let __VLS_89;
    let __VLS_90;
    let __VLS_91;
    const __VLS_92 = {
        onClick: (__VLS_ctx.handleClose)
    };
    __VLS_88.slots.default;
    var __VLS_88;
    const __VLS_93 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_95 = __VLS_94({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    let __VLS_97;
    let __VLS_98;
    let __VLS_99;
    const __VLS_100 = {
        onClick: (__VLS_ctx.handleSave)
    };
    __VLS_96.slots.default;
    var __VLS_96;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['section-settings-form']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            visible: visible,
            localSection: localSection,
            titleStyle: titleStyle,
            contentStyle: contentStyle,
            localConfig: localConfig,
            handleClose: handleClose,
            handleSave: handleSave,
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
