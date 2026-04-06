import { computed, nextTick, ref } from 'vue';
import { Rank } from '@element-plus/icons-vue';
import { SECTION_TYPES } from '@/config/sectionTypes';
import DynamicField from '@/components/form/DynamicField.vue';
import { createEmptyRichText, normalizeRichTextValue } from '@/utils/richText';
const props = defineProps();
const emit = defineEmits();
const displayIcon = computed(() => {
    return props.modelValue.config?.icon || '📝';
});
// 响应式数据
const sectionVisible = ref(props.modelValue.visible);
const collapsed = ref(false);
const showSkillInput = ref(false);
const newSkill = ref('');
const skillInputRef = ref();
const editingTitle = ref(false);
const tempTitle = ref(props.modelValue.title);
const collapsedItems = ref(new Set());
// 计算属性
const sectionConfig = computed(() => {
    // 自定义模块：优先使用模块自身携带的字段配置
    if (props.modelValue.type === 'custom') {
        const base = { ...SECTION_TYPES.custom };
        const customFields = props.modelValue?.config?.fields;
        if (Array.isArray(customFields) && customFields.length > 0) {
            return { ...base, fields: customFields };
        }
        return base;
    }
    return SECTION_TYPES[props.modelValue.type] || SECTION_TYPES.custom;
});
const showAddButton = computed(() => {
    return props.modelValue.type !== 'skills' && sectionConfig.value.allowMultiple;
});
// 对于 object 类型且不允许多项的模块，若 items 为空则自动创建一个空对象项
if (sectionConfig.value.itemType === 'object' && !sectionConfig.value.allowMultiple && (!props.modelValue.items || props.modelValue.items.length === 0)) {
    const empty = {};
    sectionConfig.value.fields?.forEach(field => {
        if (field.type === 'dateRange') {
            empty[field.name] = { start: '', end: '' };
        }
        else {
            empty[field.name] = '';
        }
    });
    emit('update:modelValue', { ...props.modelValue, items: [empty] });
}
// 方法
function updateVisibility(visible) {
    emit('update:modelValue', { ...props.modelValue, visible });
}
function startEditTitle() {
    tempTitle.value = props.modelValue.title;
    editingTitle.value = true;
}
function confirmEditTitle() {
    const title = (tempTitle.value || '').trim();
    if (title && title !== props.modelValue.title) {
        emit('update:modelValue', { ...props.modelValue, title });
    }
    editingTitle.value = false;
}
function cancelEditTitle() {
    editingTitle.value = false;
}
function getItemTitle(item, index) {
    const config = sectionConfig.value;
    if (config.fields && config.fields.length > 0) {
        const firstField = config.fields[0];
        const titleCandidate = item[firstField.name];
        // 如果是富文本或对象，避免把结构化内容渲染到标题上
        if (titleCandidate && typeof titleCandidate === 'object') {
            return `${props.modelValue.title} ${index + 1}`;
        }
        return titleCandidate || `${props.modelValue.title} ${index + 1}`;
    }
    return `${props.modelValue.title} ${index + 1}`;
}
function addItem() {
    const emptyItem = {};
    sectionConfig.value.fields?.forEach(field => {
        if (field.type === 'dateRange') {
            emptyItem[field.name] = { start: '', end: '' };
        }
        else if (field.type === 'textarea' && field.richText) {
            emptyItem[field.name] = createEmptyRichText();
        }
        else {
            emptyItem[field.name] = '';
        }
    });
    const newItems = [...props.modelValue.items, emptyItem];
    emit('update:modelValue', { ...props.modelValue, items: newItems });
}
function removeItem(index) {
    const newItems = [...props.modelValue.items];
    newItems.splice(index, 1);
    emit('update:modelValue', { ...props.modelValue, items: newItems });
}
function moveUp(index) {
    if (index === 0)
        return;
    const newItems = [...props.modelValue.items];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    emit('update:modelValue', { ...props.modelValue, items: newItems });
}
function moveDown(index) {
    if (index === props.modelValue.items.length - 1)
        return;
    const newItems = [...props.modelValue.items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    emit('update:modelValue', { ...props.modelValue, items: newItems });
}
function updateItemField(itemIndex, fieldName, value) {
    const newItems = [...props.modelValue.items];
    const field = sectionConfig.value.fields?.find(f => f.name === fieldName);
    const normalizedValue = field?.type === 'textarea' && field.richText
        ? normalizeRichTextValue(value)
        : value;
    newItems[itemIndex] = { ...newItems[itemIndex], [fieldName]: normalizedValue };
    emit('update:modelValue', { ...props.modelValue, items: newItems });
}
function onAiRequest(itemIndex, fieldName, html) {
    emit('ai', { sectionId: props.modelValue.id, itemIndex, fieldName, html });
}
function toggleItemCollapse(idx) {
    const s = new Set(collapsedItems.value);
    if (s.has(idx))
        s.delete(idx);
    else
        s.add(idx);
    collapsedItems.value = s;
}
function isItemCollapsed(idx) {
    return collapsedItems.value.has(idx);
}
// 技能相关方法
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
/** @type {__VLS_StyleScopedClasses['simple-section-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['drag-handle']} */ ;
/** @type {__VLS_StyleScopedClasses['add-skill-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "simple-section-editor" },
    ...{ class: ({ 'is-highlighted': __VLS_ctx.highlighted }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "drag-handle" },
    title: "拖拽排序",
});
const __VLS_0 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.Rank;
/** @type {[typeof __VLS_components.Rank, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
(__VLS_ctx.displayIcon);
if (!__VLS_ctx.editingTitle) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "section-title" },
    });
    (__VLS_ctx.modelValue.title);
    const __VLS_8 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        ...{ class: "edit-title-btn" },
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        ...{ class: "edit-title-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (__VLS_ctx.startEditTitle)
    };
    __VLS_11.slots.default;
    var __VLS_11;
}
else {
    const __VLS_16 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.tempTitle),
        size: "small",
        ...{ class: "title-input" },
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.tempTitle),
        size: "small",
        ...{ class: "title-input" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onKeyup: (__VLS_ctx.confirmEditTitle)
    };
    var __VLS_19;
    const __VLS_24 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.confirmEditTitle)
    };
    __VLS_27.slots.default;
    var __VLS_27;
    const __VLS_32 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.cancelEditTitle)
    };
    __VLS_35.slots.default;
    var __VLS_35;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions" },
});
const __VLS_40 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    text: true,
    size: "small",
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    text: true,
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (...[$event]) => {
        __VLS_ctx.collapsed = !__VLS_ctx.collapsed;
    }
};
__VLS_43.slots.default;
(__VLS_ctx.collapsed ? '展开' : '收起');
var __VLS_43;
const __VLS_48 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.modelValue.visible),
    size: "small",
    activeText: (__VLS_ctx.modelValue.visible ? '显示' : '隐藏'),
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.modelValue.visible),
    size: "small",
    activeText: (__VLS_ctx.modelValue.visible ? '显示' : '隐藏'),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    text: true,
    size: "small",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    text: true,
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$emit('settings');
    }
};
__VLS_55.slots.default;
var __VLS_55;
if (__VLS_ctx.showAddButton) {
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (__VLS_ctx.addItem)
    };
    __VLS_63.slots.default;
    var __VLS_63;
}
const __VLS_68 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onClick': {} },
    type: "danger",
    size: "small",
    plain: true,
}));
const __VLS_70 = __VLS_69({
    ...{ 'onClick': {} },
    type: "danger",
    size: "small",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$emit('remove');
    }
};
__VLS_71.slots.default;
var __VLS_71;
if (__VLS_ctx.sectionVisible) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-content" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.collapsed) }, null, null);
    if (__VLS_ctx.modelValue.type === 'skills') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skills-container" },
        });
        for (const [skill, index] of __VLS_getVForSourceType((__VLS_ctx.modelValue.items))) {
            const __VLS_76 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                ...{ 'onClose': {} },
                key: (index),
                closable: true,
                ...{ class: "skill-tag" },
            }));
            const __VLS_78 = __VLS_77({
                ...{ 'onClose': {} },
                key: (index),
                closable: true,
                ...{ class: "skill-tag" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            let __VLS_80;
            let __VLS_81;
            let __VLS_82;
            const __VLS_83 = {
                onClose: (...[$event]) => {
                    if (!(__VLS_ctx.sectionVisible))
                        return;
                    if (!(__VLS_ctx.modelValue.type === 'skills'))
                        return;
                    __VLS_ctx.removeSkill(index);
                }
            };
            __VLS_79.slots.default;
            (skill);
            var __VLS_79;
        }
        if (__VLS_ctx.showSkillInput) {
            const __VLS_84 = {}.ElInput;
            /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
            // @ts-ignore
            const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
                ...{ 'onKeyup': {} },
                ...{ 'onBlur': {} },
                ref: "skillInputRef",
                modelValue: (__VLS_ctx.newSkill),
                size: "small",
                ...{ class: "skill-input" },
            }));
            const __VLS_86 = __VLS_85({
                ...{ 'onKeyup': {} },
                ...{ 'onBlur': {} },
                ref: "skillInputRef",
                modelValue: (__VLS_ctx.newSkill),
                size: "small",
                ...{ class: "skill-input" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_85));
            let __VLS_88;
            let __VLS_89;
            let __VLS_90;
            const __VLS_91 = {
                onKeyup: (__VLS_ctx.confirmSkill)
            };
            const __VLS_92 = {
                onBlur: (__VLS_ctx.confirmSkill)
            };
            /** @type {typeof __VLS_ctx.skillInputRef} */ ;
            var __VLS_93 = {};
            var __VLS_87;
        }
        else {
            const __VLS_95 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
                ...{ 'onClick': {} },
                size: "small",
                ...{ class: "add-skill-btn" },
            }));
            const __VLS_97 = __VLS_96({
                ...{ 'onClick': {} },
                size: "small",
                ...{ class: "add-skill-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_96));
            let __VLS_99;
            let __VLS_100;
            let __VLS_101;
            const __VLS_102 = {
                onClick: (__VLS_ctx.addSkill)
            };
            __VLS_98.slots.default;
            var __VLS_98;
        }
    }
    else {
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.modelValue.items))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (index),
                ...{ class: "item-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "item-title" },
            });
            (__VLS_ctx.getItemTitle(item, index));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-actions" },
            });
            const __VLS_103 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
                ...{ 'onClick': {} },
                size: "small",
                text: true,
            }));
            const __VLS_105 = __VLS_104({
                ...{ 'onClick': {} },
                size: "small",
                text: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_104));
            let __VLS_107;
            let __VLS_108;
            let __VLS_109;
            const __VLS_110 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.sectionVisible))
                        return;
                    if (!!(__VLS_ctx.modelValue.type === 'skills'))
                        return;
                    __VLS_ctx.toggleItemCollapse(index);
                }
            };
            __VLS_106.slots.default;
            (__VLS_ctx.isItemCollapsed(index) ? '展开' : '收起');
            var __VLS_106;
            const __VLS_111 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
                ...{ 'onClick': {} },
                size: "small",
                disabled: (index === 0),
            }));
            const __VLS_113 = __VLS_112({
                ...{ 'onClick': {} },
                size: "small",
                disabled: (index === 0),
            }, ...__VLS_functionalComponentArgsRest(__VLS_112));
            let __VLS_115;
            let __VLS_116;
            let __VLS_117;
            const __VLS_118 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.sectionVisible))
                        return;
                    if (!!(__VLS_ctx.modelValue.type === 'skills'))
                        return;
                    __VLS_ctx.moveUp(index);
                }
            };
            __VLS_114.slots.default;
            var __VLS_114;
            const __VLS_119 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
                ...{ 'onClick': {} },
                size: "small",
                disabled: (index === __VLS_ctx.modelValue.items.length - 1),
            }));
            const __VLS_121 = __VLS_120({
                ...{ 'onClick': {} },
                size: "small",
                disabled: (index === __VLS_ctx.modelValue.items.length - 1),
            }, ...__VLS_functionalComponentArgsRest(__VLS_120));
            let __VLS_123;
            let __VLS_124;
            let __VLS_125;
            const __VLS_126 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.sectionVisible))
                        return;
                    if (!!(__VLS_ctx.modelValue.type === 'skills'))
                        return;
                    __VLS_ctx.moveDown(index);
                }
            };
            __VLS_122.slots.default;
            var __VLS_122;
            const __VLS_127 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
                ...{ 'onClick': {} },
                size: "small",
                type: "danger",
            }));
            const __VLS_129 = __VLS_128({
                ...{ 'onClick': {} },
                size: "small",
                type: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_128));
            let __VLS_131;
            let __VLS_132;
            let __VLS_133;
            const __VLS_134 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.sectionVisible))
                        return;
                    if (!!(__VLS_ctx.modelValue.type === 'skills'))
                        return;
                    __VLS_ctx.removeItem(index);
                }
            };
            __VLS_130.slots.default;
            var __VLS_130;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "item-fields" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.isItemCollapsed(index)) }, null, null);
            for (const [field] of __VLS_getVForSourceType(((__VLS_ctx.sectionConfig.fields || [])))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (field.name),
                    ...{ class: "field-row" },
                });
                /** @type {[typeof DynamicField, ]} */ ;
                // @ts-ignore
                const __VLS_135 = __VLS_asFunctionalComponent(DynamicField, new DynamicField({
                    ...{ 'onUpdate:modelValue': {} },
                    ...{ 'onAi': {} },
                    field: (field),
                    modelValue: (item[field.name]),
                }));
                const __VLS_136 = __VLS_135({
                    ...{ 'onUpdate:modelValue': {} },
                    ...{ 'onAi': {} },
                    field: (field),
                    modelValue: (item[field.name]),
                }, ...__VLS_functionalComponentArgsRest(__VLS_135));
                let __VLS_138;
                let __VLS_139;
                let __VLS_140;
                const __VLS_141 = {
                    'onUpdate:modelValue': (...[$event]) => {
                        if (!(__VLS_ctx.sectionVisible))
                            return;
                        if (!!(__VLS_ctx.modelValue.type === 'skills'))
                            return;
                        __VLS_ctx.updateItemField(index, field.name, $event);
                    }
                };
                const __VLS_142 = {
                    onAi: ((html) => __VLS_ctx.onAiRequest(index, field.name, html))
                };
                var __VLS_137;
            }
        }
    }
}
/** @type {__VLS_StyleScopedClasses['simple-section-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-info']} */ ;
/** @type {__VLS_StyleScopedClasses['drag-handle']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-title-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['title-input']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['section-content']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-container']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-input']} */ ;
/** @type {__VLS_StyleScopedClasses['add-skill-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['item-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['field-row']} */ ;
// @ts-ignore
var __VLS_94 = __VLS_93;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Rank: Rank,
            DynamicField: DynamicField,
            displayIcon: displayIcon,
            sectionVisible: sectionVisible,
            collapsed: collapsed,
            showSkillInput: showSkillInput,
            newSkill: newSkill,
            skillInputRef: skillInputRef,
            editingTitle: editingTitle,
            tempTitle: tempTitle,
            sectionConfig: sectionConfig,
            showAddButton: showAddButton,
            startEditTitle: startEditTitle,
            confirmEditTitle: confirmEditTitle,
            cancelEditTitle: cancelEditTitle,
            getItemTitle: getItemTitle,
            addItem: addItem,
            removeItem: removeItem,
            moveUp: moveUp,
            moveDown: moveDown,
            updateItemField: updateItemField,
            onAiRequest: onAiRequest,
            toggleItemCollapse: toggleItemCollapse,
            isItemCollapsed: isItemCollapsed,
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
