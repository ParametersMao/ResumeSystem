import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Sortable from 'sortablejs';
import SimpleSectionEditor from './SimpleSectionEditor.vue';
import BasicSectionEditor from './BasicSectionEditor.vue';
import SectionSettingsDrawer from './SectionSettingsDrawer.vue';
import { isBasicSection } from '@/utils/sectionType';
const props = defineProps();
const emit = defineEmits();
// 始终以 resumeData.sections 的顺序为准
const orderedSections = computed(() => props.resumeData.sections.filter(s => !isBasicSection(s.type)));
const basicSection = computed(() => props.resumeData.sections.find(s => isBasicSection(s.type)));
const rootEl = ref(null);
const sortableContainer = ref();
const sortableInstance = ref(null);
const settingsVisible = ref(false);
const editingSection = ref(null);
onMounted(() => {
    initSortable();
});
onBeforeUnmount(() => {
    destroySortable();
});
watch(() => orderedSections.value.length, () => {
    nextTick(() => initSortable());
});
function initSortable() {
    if (!sortableContainer.value)
        return;
    destroySortable();
    sortableInstance.value = Sortable.create(sortableContainer.value, {
        animation: 180,
        handle: '.drag-handle',
        ghostClass: 'drag-ghost',
        onEnd: (evt) => {
            if (evt.oldIndex == null || evt.newIndex == null || evt.oldIndex === evt.newIndex)
                return;
            reorderSections(evt.oldIndex, evt.newIndex);
        }
    });
}
function destroySortable() {
    if (sortableInstance.value) {
        sortableInstance.value.destroy();
        sortableInstance.value = null;
    }
}
function reorderSections(oldIndex, newIndex) {
    const sections = props.resumeData.sections;
    const basic = sections.find(s => isBasicSection(s.type));
    const others = sections.filter(s => !isBasicSection(s.type));
    if (oldIndex < 0 || oldIndex >= others.length || newIndex < 0 || newIndex >= others.length)
        return;
    const [moved] = others.splice(oldIndex, 1);
    others.splice(newIndex, 0, moved);
    const merged = [];
    if (basic)
        merged.push(basic);
    merged.push(...others);
    sections.splice(0, sections.length, ...merged);
    merged.forEach((section, index) => {
        section.order = index;
    });
    nextTick(() => initSortable());
}
function onUpdateSection(id, newSection) {
    const index = props.resumeData.sections.findIndex(s => s.id === id);
    if (index > -1)
        props.resumeData.sections[index] = newSection;
}
function onUpdateBasicSection(newSection) {
    const idx = props.resumeData.sections.findIndex(s => s.id === newSection.id);
    if (idx > -1)
        props.resumeData.sections[idx] = { ...props.resumeData.sections[idx], ...newSection };
}
function removeSection(id) {
    const index = props.resumeData.sections.findIndex(s => s.id === id);
    if (index > -1)
        props.resumeData.sections.splice(index, 1);
}
function onAiFromSection(payload) {
    emit('ai', payload);
}
function emitHighlight(sectionId) {
    emit('highlight', sectionId);
}
function emitClearHighlight() {
    emit('clear-highlight');
}
function emitSelect(sectionId) {
    emit('select', sectionId);
}
function openSettings(section) {
    editingSection.value = section;
    settingsVisible.value = true;
}
function applySectionSettings(updated) {
    if (!updated)
        return;
    const target = props.resumeData.sections.find(section => section.id === updated.id);
    if (!target)
        return;
    target.title = updated.title;
    target.visible = updated.visible;
    target.config = { ...target.config, ...updated.config };
    if (updated.style) {
        target.style = { ...target.style, ...updated.style };
    }
}
function scrollToSection(sectionId) {
    const target = rootEl.value?.querySelector(`[data-section-id="${sectionId}"]`);
    if (!target)
        return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
const __VLS_exposed = {
    scrollToSection
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['module-editor-item']} */ ;
/** @type {__VLS_StyleScopedClasses['module-editor-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-highlighted']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-list-editor" },
    ref: "rootEl",
});
/** @type {typeof __VLS_ctx.rootEl} */ ;
if (__VLS_ctx.basicSection) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMouseenter: (...[$event]) => {
                if (!(__VLS_ctx.basicSection))
                    return;
                __VLS_ctx.emitHighlight(__VLS_ctx.basicSection.id);
            } },
        ...{ onMouseleave: (__VLS_ctx.emitClearHighlight) },
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.basicSection))
                    return;
                __VLS_ctx.emitSelect(__VLS_ctx.basicSection.id);
            } },
        ...{ class: "module-editor-item" },
        ...{ class: ({ 'is-highlighted': __VLS_ctx.highlightedSectionId === __VLS_ctx.basicSection.id }) },
    });
    /** @type {[typeof BasicSectionEditor, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(BasicSectionEditor, new BasicSectionEditor({
        ...{ 'onUpdate:section': {} },
        ...{ 'onSettings': {} },
        section: (__VLS_ctx.basicSection),
        modelValue: (__VLS_ctx.resumeData.profile),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onUpdate:section': {} },
        ...{ 'onSettings': {} },
        section: (__VLS_ctx.basicSection),
        modelValue: (__VLS_ctx.resumeData.profile),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        'onUpdate:section': (__VLS_ctx.onUpdateBasicSection)
    };
    const __VLS_7 = {
        onSettings: (...[$event]) => {
            if (!(__VLS_ctx.basicSection))
                return;
            __VLS_ctx.openSettings(__VLS_ctx.basicSection);
        }
    };
    var __VLS_2;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-editor-list" },
    ref: "sortableContainer",
});
/** @type {typeof __VLS_ctx.sortableContainer} */ ;
for (const [section] of __VLS_getVForSourceType((__VLS_ctx.orderedSections))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMouseenter: (...[$event]) => {
                __VLS_ctx.emitHighlight(section.id);
            } },
        ...{ onMouseleave: (__VLS_ctx.emitClearHighlight) },
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.emitSelect(section.id);
            } },
        key: (section.id),
        ...{ class: "module-editor-item" },
        'data-id': (section.id),
        'data-section-id': (section.id),
        ...{ class: ({ 'is-highlighted': __VLS_ctx.highlightedSectionId === section.id }) },
    });
    /** @type {[typeof SimpleSectionEditor, ]} */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(SimpleSectionEditor, new SimpleSectionEditor({
        ...{ 'onUpdate:modelValue': {} },
        ...{ 'onRemove': {} },
        ...{ 'onAi': {} },
        ...{ 'onSettings': {} },
        modelValue: (section),
        highlighted: (__VLS_ctx.highlightedSectionId === section.id),
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onUpdate:modelValue': {} },
        ...{ 'onRemove': {} },
        ...{ 'onAi': {} },
        ...{ 'onSettings': {} },
        modelValue: (section),
        highlighted: (__VLS_ctx.highlightedSectionId === section.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_11;
    let __VLS_12;
    let __VLS_13;
    const __VLS_14 = {
        'onUpdate:modelValue': (...[$event]) => {
            __VLS_ctx.onUpdateSection(section.id, $event);
        }
    };
    const __VLS_15 = {
        onRemove: (...[$event]) => {
            __VLS_ctx.removeSection(section.id);
        }
    };
    const __VLS_16 = {
        onAi: (__VLS_ctx.onAiFromSection)
    };
    const __VLS_17 = {
        onSettings: (...[$event]) => {
            __VLS_ctx.openSettings(section);
        }
    };
    var __VLS_10;
}
/** @type {[typeof SectionSettingsDrawer, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(SectionSettingsDrawer, new SectionSettingsDrawer({
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.settingsVisible),
    section: (__VLS_ctx.editingSection),
}));
const __VLS_19 = __VLS_18({
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.settingsVisible),
    section: (__VLS_ctx.editingSection),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
let __VLS_21;
let __VLS_22;
let __VLS_23;
const __VLS_24 = {
    onSave: (__VLS_ctx.applySectionSettings)
};
var __VLS_20;
/** @type {__VLS_StyleScopedClasses['module-list-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['module-editor-item']} */ ;
/** @type {__VLS_StyleScopedClasses['module-editor-list']} */ ;
/** @type {__VLS_StyleScopedClasses['module-editor-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SimpleSectionEditor: SimpleSectionEditor,
            BasicSectionEditor: BasicSectionEditor,
            SectionSettingsDrawer: SectionSettingsDrawer,
            orderedSections: orderedSections,
            basicSection: basicSection,
            rootEl: rootEl,
            sortableContainer: sortableContainer,
            settingsVisible: settingsVisible,
            editingSection: editingSection,
            onUpdateSection: onUpdateSection,
            onUpdateBasicSection: onUpdateBasicSection,
            removeSection: removeSection,
            onAiFromSection: onAiFromSection,
            emitHighlight: emitHighlight,
            emitClearHighlight: emitClearHighlight,
            emitSelect: emitSelect,
            openSettings: openSettings,
            applySectionSettings: applySectionSettings,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
