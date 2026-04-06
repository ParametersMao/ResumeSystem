import { ref, watch } from 'vue';
import { Plus, MagicStick } from '@element-plus/icons-vue';
import { ElEmpty } from 'element-plus';
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'change', 'ai-optimize']);
const localItems = ref([]);
watch(() => props.modelValue, (newVal) => {
    if (newVal && newVal.items) {
        localItems.value = newVal.items.map((item) => ({
            company: item.company || '',
            department: item.department || '',
            position: item.position || '',
            dateRange: item.startDate && item.endDate ? [item.startDate, item.endDate] : null,
            type: item.type || '',
            city: item.city || '',
            description: item.description || item.responsibilities?.join('\n') || ''
        }));
    }
    else {
        // 不自动添加空项，让用户主动点击"新增"按钮
        localItems.value = [];
    }
}, { immediate: true, deep: true });
function addItem() {
    localItems.value.push({
        company: '',
        department: '',
        position: '',
        dateRange: null,
        type: '全职',
        city: '',
        description: ''
    });
    emitChange();
}
function removeItem(index) {
    localItems.value.splice(index, 1);
    emitChange();
}
function moveUp(index) {
    if (index > 0) {
        const temp = localItems.value[index];
        localItems.value[index] = localItems.value[index - 1];
        localItems.value[index - 1] = temp;
        emitChange();
    }
}
function moveDown(index) {
    if (index < localItems.value.length - 1) {
        const temp = localItems.value[index];
        localItems.value[index] = localItems.value[index + 1];
        localItems.value[index + 1] = temp;
        emitChange();
    }
}
function emitChange() {
    if (props.modelValue) {
        props.modelValue.items = localItems.value.map(item => ({
            company: item.company,
            department: item.department,
            position: item.position,
            startDate: item.dateRange?.[0] || '',
            endDate: item.dateRange?.[1] || '',
            type: item.type,
            city: item.city,
            description: item.description,
            responsibilities: item.description.split('\n').filter(line => line.trim())
        }));
        emit('update:modelValue', props.modelValue);
        emit('change', props.modelValue);
    }
}
function emitAiOptimize(index) {
    emit('ai-optimize', {
        type: 'experience',
        index: index,
        data: localItems.value[index]
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "experience-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
if (__VLS_ctx.localItems.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-placeholder" },
    });
    const __VLS_0 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        description: "暂无工作经验",
        imageSize: (80),
    }));
    const __VLS_2 = __VLS_1({
        description: "暂无工作经验",
        imageSize: (80),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onClick': {} },
        type: "primary",
        icon: (__VLS_ctx.Plus),
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onClick': {} },
        type: "primary",
        icon: (__VLS_ctx.Plus),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onClick: (__VLS_ctx.addItem)
    };
    __VLS_7.slots.default;
    var __VLS_7;
    var __VLS_3;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "items-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.localItems))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "item-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "item-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (index + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "item-actions" },
        });
        const __VLS_12 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (index === 0),
        }));
        const __VLS_14 = __VLS_13({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (index === 0),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_16;
        let __VLS_17;
        let __VLS_18;
        const __VLS_19 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.localItems.length === 0))
                    return;
                __VLS_ctx.moveUp(index);
            }
        };
        __VLS_15.slots.default;
        var __VLS_15;
        const __VLS_20 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (index === __VLS_ctx.localItems.length - 1),
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (index === __VLS_ctx.localItems.length - 1),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_24;
        let __VLS_25;
        let __VLS_26;
        const __VLS_27 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.localItems.length === 0))
                    return;
                __VLS_ctx.moveDown(index);
            }
        };
        __VLS_23.slots.default;
        var __VLS_23;
        const __VLS_28 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_30 = __VLS_29({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        let __VLS_32;
        let __VLS_33;
        let __VLS_34;
        const __VLS_35 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.localItems.length === 0))
                    return;
                __VLS_ctx.removeItem(index);
            }
        };
        __VLS_31.slots.default;
        var __VLS_31;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "required" },
        });
        const __VLS_36 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ 'onInput': {} },
            modelValue: (item.company),
            placeholder: "请输入公司名称",
        }));
        const __VLS_38 = __VLS_37({
            ...{ 'onInput': {} },
            modelValue: (item.company),
            placeholder: "请输入公司名称",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_40;
        let __VLS_41;
        let __VLS_42;
        const __VLS_43 = {
            onInput: (__VLS_ctx.emitChange)
        };
        var __VLS_39;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        const __VLS_44 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            ...{ 'onInput': {} },
            modelValue: (item.department),
            placeholder: "请输入部门",
        }));
        const __VLS_46 = __VLS_45({
            ...{ 'onInput': {} },
            modelValue: (item.department),
            placeholder: "请输入部门",
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_48;
        let __VLS_49;
        let __VLS_50;
        const __VLS_51 = {
            onInput: (__VLS_ctx.emitChange)
        };
        var __VLS_47;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "required" },
        });
        const __VLS_52 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            ...{ 'onInput': {} },
            modelValue: (item.position),
            placeholder: "请输入职位",
        }));
        const __VLS_54 = __VLS_53({
            ...{ 'onInput': {} },
            modelValue: (item.position),
            placeholder: "请输入职位",
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        let __VLS_56;
        let __VLS_57;
        let __VLS_58;
        const __VLS_59 = {
            onInput: (__VLS_ctx.emitChange)
        };
        var __VLS_55;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "required" },
        });
        const __VLS_60 = {}.ElDatePicker;
        /** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            ...{ 'onChange': {} },
            modelValue: (item.dateRange),
            type: "monthrange",
            rangeSeparator: "至",
            startPlaceholder: "开始时间",
            endPlaceholder: "至今/结束时间",
            format: "YYYY-MM",
            valueFormat: "YYYY-MM",
        }));
        const __VLS_62 = __VLS_61({
            ...{ 'onChange': {} },
            modelValue: (item.dateRange),
            type: "monthrange",
            rangeSeparator: "至",
            startPlaceholder: "开始时间",
            endPlaceholder: "至今/结束时间",
            format: "YYYY-MM",
            valueFormat: "YYYY-MM",
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        let __VLS_64;
        let __VLS_65;
        let __VLS_66;
        const __VLS_67 = {
            onChange: (__VLS_ctx.emitChange)
        };
        var __VLS_63;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        const __VLS_68 = {}.ElSelect;
        /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            ...{ 'onChange': {} },
            modelValue: (item.type),
            placeholder: "请选择",
        }));
        const __VLS_70 = __VLS_69({
            ...{ 'onChange': {} },
            modelValue: (item.type),
            placeholder: "请选择",
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        let __VLS_72;
        let __VLS_73;
        let __VLS_74;
        const __VLS_75 = {
            onChange: (__VLS_ctx.emitChange)
        };
        __VLS_71.slots.default;
        const __VLS_76 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            label: "全职",
            value: "全职",
        }));
        const __VLS_78 = __VLS_77({
            label: "全职",
            value: "全职",
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        const __VLS_80 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            label: "兼职",
            value: "兼职",
        }));
        const __VLS_82 = __VLS_81({
            label: "兼职",
            value: "兼职",
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        const __VLS_84 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            label: "实习",
            value: "实习",
        }));
        const __VLS_86 = __VLS_85({
            label: "实习",
            value: "实习",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        const __VLS_88 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            label: "外包",
            value: "外包",
        }));
        const __VLS_90 = __VLS_89({
            label: "外包",
            value: "外包",
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        var __VLS_71;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        const __VLS_92 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            ...{ 'onInput': {} },
            modelValue: (item.city),
            placeholder: "如：北京",
        }));
        const __VLS_94 = __VLS_93({
            ...{ 'onInput': {} },
            modelValue: (item.city),
            placeholder: "如：北京",
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_96;
        let __VLS_97;
        let __VLS_98;
        const __VLS_99 = {
            onInput: (__VLS_ctx.emitChange)
        };
        var __VLS_95;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-item full-width" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "rich-editor" },
        });
        const __VLS_100 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            ...{ 'onInput': {} },
            modelValue: (item.description),
            type: "textarea",
            rows: (6),
            placeholder: "请输入工作职责与业绩，每条一行，例如：&#10;• 负责公司核心产品的前端开发&#10;• 参与技术方案设计和代码审查&#10;• 优化前端性能，提升用户体验",
        }));
        const __VLS_102 = __VLS_101({
            ...{ 'onInput': {} },
            modelValue: (item.description),
            type: "textarea",
            rows: (6),
            placeholder: "请输入工作职责与业绩，每条一行，例如：&#10;• 负责公司核心产品的前端开发&#10;• 参与技术方案设计和代码审查&#10;• 优化前端性能，提升用户体验",
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        let __VLS_104;
        let __VLS_105;
        let __VLS_106;
        const __VLS_107 = {
            onInput: (__VLS_ctx.emitChange)
        };
        var __VLS_103;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "editor-tips" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "ai-optimize-box" },
        });
        const __VLS_108 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
        }));
        const __VLS_110 = __VLS_109({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        let __VLS_112;
        let __VLS_113;
        let __VLS_114;
        const __VLS_115 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.localItems.length === 0))
                    return;
                __VLS_ctx.emitAiOptimize(index);
            }
        };
        __VLS_111.slots.default;
        const __VLS_116 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
        const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
        __VLS_119.slots.default;
        const __VLS_120 = {}.MagicStick;
        /** @type {[typeof __VLS_components.MagicStick, ]} */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
        const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
        var __VLS_119;
        var __VLS_111;
    }
}
const __VLS_124 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ 'onClick': {} },
    ...{ class: "add-item-btn" },
    type: "primary",
    icon: (__VLS_ctx.Plus),
}));
const __VLS_126 = __VLS_125({
    ...{ 'onClick': {} },
    ...{ class: "add-item-btn" },
    type: "primary",
    icon: (__VLS_ctx.Plus),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onClick: (__VLS_ctx.addItem)
};
__VLS_127.slots.default;
var __VLS_127;
/** @type {__VLS_StyleScopedClasses['experience-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['items-list']} */ ;
/** @type {__VLS_StyleScopedClasses['item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['required']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['required']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['required']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['rich-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-tips']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-optimize-box']} */ ;
/** @type {__VLS_StyleScopedClasses['add-item-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Plus: Plus,
            MagicStick: MagicStick,
            ElEmpty: ElEmpty,
            localItems: localItems,
            addItem: addItem,
            removeItem: removeItem,
            moveUp: moveUp,
            moveDown: moveDown,
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
