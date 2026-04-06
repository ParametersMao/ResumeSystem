import { computed } from 'vue';
import RichTextEditor from './RichTextEditor.vue';
import { createEmptyRichText, normalizeRichTextValue } from '@/utils/richText';
const props = defineProps();
const emit = defineEmits();
// 处理 v-model 绑定
const fieldValue = computed({
    get: () => {
        if (props.field.type === 'textarea' && props.field.richText) {
            if (!props.modelValue) {
                return createEmptyRichText();
            }
            return normalizeRichTextValue(props.modelValue);
        }
        return props.modelValue;
    },
    set: (value) => {
        if (props.field.type === 'textarea' && props.field.richText) {
            emit('update:modelValue', normalizeRichTextValue(value));
        }
        else {
            emit('update:modelValue', value);
        }
    }
});
// dateRange 的拆分绑定
const startValue = computed({
    get: () => (props.modelValue?.start ?? ''),
    set: (v) => {
        const next = { ...(props.modelValue || {}), start: v };
        emit('update:modelValue', next);
    }
});
const endValue = computed({
    get: () => (props.modelValue?.end ?? ''),
    set: (v) => {
        const next = { ...(props.modelValue || {}), end: v };
        emit('update:modelValue', next);
    }
});
function onAi(html) {
    emit('ai', html);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dynamic-field" },
});
if (__VLS_ctx.field.label && !(__VLS_ctx.field.type === 'textarea' && __VLS_ctx.field.richText)) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "field-label" },
    });
    (__VLS_ctx.field.label);
    if (__VLS_ctx.field.required) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "required" },
        });
    }
}
if (__VLS_ctx.field.type === 'text') {
    const __VLS_0 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        modelValue: (__VLS_ctx.fieldValue),
        placeholder: (`请输入${__VLS_ctx.field.label}`),
    }));
    const __VLS_2 = __VLS_1({
        modelValue: (__VLS_ctx.fieldValue),
        placeholder: (`请输入${__VLS_ctx.field.label}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else if (__VLS_ctx.field.type === 'textarea' && !__VLS_ctx.field.richText) {
    const __VLS_4 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        modelValue: (__VLS_ctx.fieldValue),
        type: "textarea",
        rows: (3),
        placeholder: (`请输入${__VLS_ctx.field.label}`),
    }));
    const __VLS_6 = __VLS_5({
        modelValue: (__VLS_ctx.fieldValue),
        type: "textarea",
        rows: (3),
        placeholder: (`请输入${__VLS_ctx.field.label}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
}
else if (__VLS_ctx.field.type === 'textarea' && __VLS_ctx.field.richText) {
    /** @type {[typeof RichTextEditor, ]} */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(RichTextEditor, new RichTextEditor({
        ...{ 'onAi': {} },
        modelValue: (__VLS_ctx.fieldValue),
        label: (__VLS_ctx.field.label),
        required: (__VLS_ctx.field.required),
        placeholder: (`请输入${__VLS_ctx.field.label}`),
        height: (200),
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onAi': {} },
        modelValue: (__VLS_ctx.fieldValue),
        label: (__VLS_ctx.field.label),
        required: (__VLS_ctx.field.required),
        placeholder: (`请输入${__VLS_ctx.field.label}`),
        height: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_11;
    let __VLS_12;
    let __VLS_13;
    const __VLS_14 = {
        onAi: (__VLS_ctx.onAi)
    };
    var __VLS_10;
}
else if (__VLS_ctx.field.type === 'date') {
    const __VLS_15 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
        modelValue: (__VLS_ctx.fieldValue),
        placeholder: (__VLS_ctx.field.name === 'end' ? '至今' : '2023-01'),
    }));
    const __VLS_17 = __VLS_16({
        modelValue: (__VLS_ctx.fieldValue),
        placeholder: (__VLS_ctx.field.name === 'end' ? '至今' : '2023-01'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
}
else if (__VLS_ctx.field.type === 'dateRange') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "date-range-row" },
    });
    const __VLS_19 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
        modelValue: (__VLS_ctx.startValue),
        placeholder: "开始时间，如 2023-01",
        ...{ class: "date-input" },
    }));
    const __VLS_21 = __VLS_20({
        modelValue: (__VLS_ctx.startValue),
        placeholder: "开始时间，如 2023-01",
        ...{ class: "date-input" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "date-sep" },
    });
    const __VLS_23 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
        modelValue: (__VLS_ctx.endValue),
        placeholder: "结束时间，如 至今/2024-12",
        ...{ class: "date-input" },
    }));
    const __VLS_25 = __VLS_24({
        modelValue: (__VLS_ctx.endValue),
        placeholder: "结束时间，如 至今/2024-12",
        ...{ class: "date-input" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
}
else if (__VLS_ctx.field.type === 'select') {
    const __VLS_27 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        modelValue: (__VLS_ctx.fieldValue),
        placeholder: (`请选择${__VLS_ctx.field.label}`),
    }));
    const __VLS_29 = __VLS_28({
        modelValue: (__VLS_ctx.fieldValue),
        placeholder: (`请选择${__VLS_ctx.field.label}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_30.slots.default;
    for (const [option] of __VLS_getVForSourceType((__VLS_ctx.field.options))) {
        const __VLS_31 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
            key: (option),
            label: (option),
            value: (option),
        }));
        const __VLS_33 = __VLS_32({
            key: (option),
            label: (option),
            value: (option),
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    }
    var __VLS_30;
}
/** @type {__VLS_StyleScopedClasses['dynamic-field']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['required']} */ ;
/** @type {__VLS_StyleScopedClasses['date-range-row']} */ ;
/** @type {__VLS_StyleScopedClasses['date-input']} */ ;
/** @type {__VLS_StyleScopedClasses['date-sep']} */ ;
/** @type {__VLS_StyleScopedClasses['date-input']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RichTextEditor: RichTextEditor,
            fieldValue: fieldValue,
            startValue: startValue,
            endValue: endValue,
            onAi: onAi,
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
