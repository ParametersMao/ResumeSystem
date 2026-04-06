import { ref, watch } from 'vue';
import ExperienceEditor from './ExperienceEditor.vue';
const props = defineProps();
const emit = defineEmits(['update:modelValue', 'change', 'ai-optimize']);
const localData = ref(null);
watch(() => props.modelValue, (newVal) => {
    localData.value = newVal;
}, { immediate: true, deep: true });
function emitChange(data) {
    emit('update:modelValue', data);
    emit('change', data);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "internship-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "section-desc" },
});
/** @type {[typeof ExperienceEditor, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ExperienceEditor, new ExperienceEditor({
    ...{ 'onChange': {} },
    ...{ 'onAiOptimize': {} },
    modelValue: (__VLS_ctx.localData),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onChange': {} },
    ...{ 'onAiOptimize': {} },
    modelValue: (__VLS_ctx.localData),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onChange: (__VLS_ctx.emitChange)
};
const __VLS_7 = {
    onAiOptimize: (...[$event]) => {
        __VLS_ctx.$emit('ai-optimize', $event);
    }
};
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['internship-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ExperienceEditor: ExperienceEditor,
            localData: localData,
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
