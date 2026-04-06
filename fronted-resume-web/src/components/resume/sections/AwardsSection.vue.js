import { computed, defineProps } from 'vue';
const props = defineProps();
const titleStyle = computed(() => ({
    fontSize: props.config?.titleStyle?.fontSize || '18px',
    fontWeight: props.config?.titleStyle?.fontWeight || '600',
    color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
    textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
    marginBottom: props.data?.style?.paragraphSpacing || '15px',
    borderBottom: props.config?.titleStyle?.borderBottom || `2px solid ${props.styles?.colors?.primary || '#333'}`,
    paddingBottom: '6px',
    ...props.config?.titleStyle?.customStyle
}));
const gridStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: props.config?.gridTemplateColumns || 'repeat(2, 1fr)',
    gap: props.data?.style?.elementSpacing || props.styles?.spacing?.elementMargin || '12px'
}));
const cardStyle = computed(() => ({
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: props.config?.padding || '12px',
    background: '#fff'
}));
const nameStyle = computed(() => ({
    fontSize: '15px',
    fontWeight: '600',
    color: props.styles?.colors?.text || '#333',
    marginBottom: '6px'
}));
const orgStyle = computed(() => ({
    fontSize: '13px',
    color: '#666'
}));
const dateStyle = computed(() => ({
    fontSize: '12px',
    color: props.styles?.colors?.primary || '#4a90a4'
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "awards-section" },
});
if (__VLS_ctx.config?.showTitle !== false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
        ...{ style: (__VLS_ctx.titleStyle) },
    });
    (__VLS_ctx.data?.title || __VLS_ctx.config?.title || '荣誉证书');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "awards-grid" },
    ...{ style: (__VLS_ctx.gridStyle) },
});
for (const [item, idx] of __VLS_getVForSourceType(((__VLS_ctx.data?.items || [])))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (idx),
        ...{ class: "award-card" },
        ...{ style: (__VLS_ctx.cardStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "award-name" },
        ...{ style: (__VLS_ctx.nameStyle) },
    });
    (item.name || '奖项/证书');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "award-org" },
        ...{ style: (__VLS_ctx.orgStyle) },
    });
    (item.org || '');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "award-date" },
        ...{ style: (__VLS_ctx.dateStyle) },
    });
    (item.date || '');
}
/** @type {__VLS_StyleScopedClasses['awards-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['awards-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['award-card']} */ ;
/** @type {__VLS_StyleScopedClasses['award-name']} */ ;
/** @type {__VLS_StyleScopedClasses['award-org']} */ ;
/** @type {__VLS_StyleScopedClasses['award-date']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            titleStyle: titleStyle,
            gridStyle: gridStyle,
            cardStyle: cardStyle,
            nameStyle: nameStyle,
            orgStyle: orgStyle,
            dateStyle: dateStyle,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
