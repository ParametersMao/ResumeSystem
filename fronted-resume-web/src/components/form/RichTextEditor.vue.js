import { ref, onBeforeUnmount, watch } from 'vue';
import { Editor, Toolbar } from '@wangeditor-next/editor-for-vue';
import '@wangeditor-next/editor/dist/css/style.css';
import { createEmptyRichText, normalizeRichTextValue } from '@/utils/richText';
const props = withDefaults(defineProps(), {
    height: 300,
    placeholder: '请输入内容...'
});
const emit = defineEmits();
const ICON_PRESETS = ['✔️', '⭐', '🔥', '💡', '🚀', '📌', '🎯', '💼'];
const editorRef = ref();
const valueHtml = ref('');
const currentValue = ref(createEmptyRichText());
const toolbarConfig = {
    excludeKeys: ['uploadImage', 'uploadVideo', 'insertTable', 'codeBlock', 'insertLink']
};
const editorConfig = {
    placeholder: props.placeholder,
    MENU_CONF: {}
};
watch(() => props.modelValue, (newValue) => {
    const normalized = normalizeRichTextValue(newValue);
    currentValue.value = normalized;
    if (normalized.html !== valueHtml.value) {
        valueHtml.value = normalized.html;
        if (editorRef.value && typeof editorRef.value.setHtml === 'function') {
            const html = normalized.html || '<p><br></p>';
            if (editorRef.value.getHtml() !== html) {
                editorRef.value.setHtml(html);
            }
        }
    }
}, { immediate: true, deep: true });
function handleCreated(editor) {
    editorRef.value = editor;
    if (currentValue.value.html) {
        editor.setHtml(currentValue.value.html);
    }
}
function handleChange(editor) {
    const html = editor.getHtml();
    const text = editor.getText();
    const json = Array.isArray(editor.children) ? editor.children : [];
    const normalized = normalizeRichTextValue({ html, text, json });
    currentValue.value = normalized;
    valueHtml.value = normalized.html;
    emit('update:modelValue', normalized);
}
function emitAi() {
    const html = editorRef.value?.getHtml?.() || valueHtml.value || '';
    emit('ai', html);
}
function insertIcon(icon) {
    if (!editorRef.value)
        return;
    editorRef.value.insertText?.(`${icon} `);
}
onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (!editor)
        return;
    editor.destroy?.();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    height: 300,
    placeholder: '请输入内容...'
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['icon-item']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-content']} */ ;
/** @type {__VLS_StyleScopedClasses['w-e-text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['w-e-scroll']} */ ;
// CSS variable injection 
__VLS_ctx.props.height + "px";
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "rich-text-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "rte-toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "left-tools" },
});
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "field-label" },
    });
    (__VLS_ctx.label);
    if (__VLS_ctx.required) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "required" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "right-tools" },
});
const __VLS_0 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    placement: "bottom",
    trigger: "click",
    width: "200",
}));
const __VLS_2 = __VLS_1({
    placement: "bottom",
    trigger: "click",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "icon-grid" },
});
for (const [icon] of __VLS_getVForSourceType((__VLS_ctx.ICON_PRESETS))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.insertIcon(icon);
            } },
        key: (icon),
        ...{ class: "icon-item" },
    });
    (icon);
}
{
    const { reference: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_4 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        size: "small",
        ...{ class: "icon-btn" },
    }));
    const __VLS_6 = __VLS_5({
        size: "small",
        ...{ class: "icon-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    var __VLS_7;
}
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    size: "small",
    ...{ class: "ai-btn" },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    size: "small",
    ...{ class: "ai-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.emitAi)
};
__VLS_11.slots.default;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-container" },
});
const __VLS_16 = {}.Toolbar;
/** @type {[typeof __VLS_components.Toolbar, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    editor: (__VLS_ctx.editorRef),
    defaultConfig: (__VLS_ctx.toolbarConfig),
    ...{ class: "editor-toolbar" },
}));
const __VLS_18 = __VLS_17({
    editor: (__VLS_ctx.editorRef),
    defaultConfig: (__VLS_ctx.toolbarConfig),
    ...{ class: "editor-toolbar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.Editor;
/** @type {[typeof __VLS_components.Editor, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onOnCreated': {} },
    ...{ 'onOnChange': {} },
    defaultConfig: (__VLS_ctx.editorConfig),
    modelValue: (__VLS_ctx.valueHtml),
    ...{ class: "editor-content" },
}));
const __VLS_22 = __VLS_21({
    ...{ 'onOnCreated': {} },
    ...{ 'onOnChange': {} },
    defaultConfig: (__VLS_ctx.editorConfig),
    modelValue: (__VLS_ctx.valueHtml),
    ...{ class: "editor-content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onOnCreated: (__VLS_ctx.handleCreated)
};
const __VLS_28 = {
    onOnChange: (__VLS_ctx.handleChange)
};
var __VLS_23;
/** @type {__VLS_StyleScopedClasses['rich-text-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['rte-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['left-tools']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['required']} */ ;
/** @type {__VLS_StyleScopedClasses['right-tools']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-item']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-container']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Editor: Editor,
            Toolbar: Toolbar,
            props: props,
            ICON_PRESETS: ICON_PRESETS,
            editorRef: editorRef,
            valueHtml: valueHtml,
            toolbarConfig: toolbarConfig,
            editorConfig: editorConfig,
            handleCreated: handleCreated,
            handleChange: handleChange,
            emitAi: emitAi,
            insertIcon: insertIcon,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
