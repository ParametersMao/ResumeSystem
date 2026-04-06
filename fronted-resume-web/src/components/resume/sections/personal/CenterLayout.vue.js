import { computed, defineProps } from 'vue';
const props = defineProps();
const contactsText = computed(() => {
    const { contacts } = props.data?.basic || {};
    if (!contacts)
        return '请完善联系方式';
    const items = [];
    if (contacts.email)
        items.push(contacts.email);
    if (contacts.phone)
        items.push(contacts.phone);
    if (contacts.site)
        items.push(contacts.site);
    return items.join(' · ') || '请完善联系方式';
});
const containerStyle = computed(() => ({
    textAlign: 'center',
    marginBottom: props.styles?.spacing?.sectionMargin || '20px',
    padding: props.config?.padding,
    ...props.config?.containerStyle
}));
const contentStyle = computed(() => ({
    marginBottom: props.styles?.spacing?.elementMargin || '15px',
    ...props.config?.contentStyle
}));
const nameStyle = computed(() => ({
    fontSize: props.config?.nameStyle?.fontSize || '32px',
    fontWeight: props.config?.nameStyle?.fontWeight || '700',
    color: props.config?.nameStyle?.color || props.styles?.colors?.primary || '#333',
    marginBottom: '8px',
    ...props.config?.nameStyle?.customStyle
}));
const titleStyle = computed(() => ({
    fontSize: props.config?.titleStyle?.fontSize || '18px',
    fontWeight: props.config?.titleStyle?.fontWeight || '400',
    color: props.config?.titleStyle?.color || props.styles?.colors?.text || '#666',
    marginBottom: '12px',
    ...props.config?.titleStyle?.customStyle
}));
const contactsStyle = computed(() => ({
    fontSize: props.config?.contactsStyle?.fontSize || '14px',
    color: props.config?.contactsStyle?.color || props.styles?.colors?.text || '#666',
    opacity: props.config?.contactsStyle?.opacity || '0.8',
    ...props.config?.contactsStyle?.customStyle
}));
const summaryStyle = computed(() => ({
    marginTop: props.styles?.spacing?.elementMargin || '15px',
    textAlign: 'left',
    ...props.config?.summaryStyle
}));
const summaryTitleStyle = computed(() => ({
    fontSize: props.config?.summaryTitleStyle?.fontSize || '18px',
    fontWeight: props.config?.summaryTitleStyle?.fontWeight || '600',
    color: props.config?.summaryTitleStyle?.color || props.styles?.colors?.primary || '#333',
    textAlign: props.config?.summaryTitleStyle?.textAlign || props.config?.summaryTitleStyle?.alignment || 'left',
    marginBottom: props.data?.style?.paragraphSpacing || '10px',
    borderBottom: props.config?.summaryTitleStyle?.borderBottom || `2px solid ${props.styles?.colors?.primary || '#333'}`,
    paddingBottom: '6px',
    ...props.config?.summaryTitleStyle?.customStyle
}));
const summaryContentStyle = computed(() => ({
    fontSize: props.config?.summaryContentStyle?.fontSize || '15px',
    lineHeight: props.config?.summaryContentStyle?.lineHeight || '1.6',
    color: props.config?.summaryContentStyle?.color || props.styles?.colors?.text || '#666',
    ...props.config?.summaryContentStyle?.customStyle
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "center-layout" },
    ...{ style: (__VLS_ctx.containerStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "center-content" },
    ...{ style: (__VLS_ctx.contentStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "name" },
    ...{ style: (__VLS_ctx.nameStyle) },
});
(__VLS_ctx.data?.basic?.name || '请填写姓名');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
    ...{ style: (__VLS_ctx.titleStyle) },
});
(__VLS_ctx.data?.basic?.title || '请填写职位');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "contacts" },
    ...{ style: (__VLS_ctx.contactsStyle) },
});
(__VLS_ctx.contactsText);
if (__VLS_ctx.data?.summary) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary" },
        ...{ style: (__VLS_ctx.summaryStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-title" },
        ...{ style: (__VLS_ctx.summaryTitleStyle) },
    });
    (__VLS_ctx.config?.summaryTitle || '个人概述');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-content" },
        ...{ style: (__VLS_ctx.summaryContentStyle) },
    });
    (__VLS_ctx.data.summary);
}
/** @type {__VLS_StyleScopedClasses['center-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['center-content']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['contacts']} */ ;
/** @type {__VLS_StyleScopedClasses['summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-title']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            contactsText: contactsText,
            containerStyle: containerStyle,
            contentStyle: contentStyle,
            nameStyle: nameStyle,
            titleStyle: titleStyle,
            contactsStyle: contactsStyle,
            summaryStyle: summaryStyle,
            summaryTitleStyle: summaryTitleStyle,
            summaryContentStyle: summaryContentStyle,
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
