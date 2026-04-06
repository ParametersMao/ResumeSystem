import { computed, defineProps } from 'vue';
const props = defineProps();
const containerStyle = computed(() => ({
    marginBottom: props.styles?.spacing?.sectionMargin || '20px',
    padding: props.config?.padding,
    ...props.config?.containerStyle
}));
const cardStyle = computed(() => ({
    background: props.config?.cardBackground || '#ffffff',
    border: props.config?.cardBorder || '1px solid #e2e8f0',
    borderRadius: props.config?.cardBorderRadius || '12px',
    padding: props.config?.cardPadding || '24px',
    boxShadow: props.config?.cardShadow || '0 2px 8px rgba(0,0,0,0.1)',
    ...props.config?.cardStyle
}));
const headerStyle = computed(() => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    ...props.config?.headerStyle
}));
const avatarSectionStyle = computed(() => ({
    marginRight: '20px',
    ...props.config?.avatarSectionStyle
}));
const avatarStyle = computed(() => ({
    width: props.config?.avatarSize || '80px',
    height: props.config?.avatarSize || '80px',
    borderRadius: '50%',
    background: props.config?.avatarBackground || '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: props.config?.avatarTextColor || '#64748b',
    fontSize: '12px',
    ...props.config?.avatarStyle
}));
const basicInfoStyle = computed(() => ({
    flex: '1',
    ...props.config?.basicInfoStyle
}));
const nameStyle = computed(() => ({
    fontSize: props.config?.nameStyle?.fontSize || '24px',
    fontWeight: props.config?.nameStyle?.fontWeight || '700',
    color: props.config?.nameStyle?.color || props.styles?.colors?.primary || '#1e293b',
    marginBottom: '4px',
    ...props.config?.nameStyle?.customStyle
}));
const titleStyle = computed(() => ({
    fontSize: props.config?.titleStyle?.fontSize || '16px',
    color: props.config?.titleStyle?.color || props.styles?.colors?.text || '#64748b',
    ...props.config?.titleStyle?.customStyle
}));
const bodyStyle = computed(() => ({
    ...props.config?.bodyStyle
}));
const contactStyle = computed(() => ({
    ...props.config?.contactStyle
}));
const summaryStyle = computed(() => ({
    marginTop: '20px',
    ...props.config?.summaryStyle
}));
const summaryTitleStyle = computed(() => ({
    fontSize: '18px',
    fontWeight: '600',
    color: props.styles?.colors?.primary || '#1e293b',
    marginBottom: '10px',
    ...props.config?.summaryTitleStyle
}));
const summaryContentStyle = computed(() => ({
    fontSize: '14px',
    lineHeight: '1.6',
    color: props.styles?.colors?.text || '#475569',
    ...props.config?.summaryContentStyle
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-layout" },
    ...{ style: (__VLS_ctx.containerStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-card" },
    ...{ style: (__VLS_ctx.cardStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-header" },
    ...{ style: (__VLS_ctx.headerStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-section" },
    ...{ style: (__VLS_ctx.avatarSectionStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-placeholder" },
    ...{ style: (__VLS_ctx.avatarStyle) },
});
(__VLS_ctx.config?.avatarText || '头像');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basic-info" },
    ...{ style: (__VLS_ctx.basicInfoStyle) },
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
    ...{ class: "card-body" },
    ...{ style: (__VLS_ctx.bodyStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "contact-info" },
    ...{ style: (__VLS_ctx.contactStyle) },
});
if (__VLS_ctx.data?.basic?.contacts?.email) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "contact-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.data.basic.contacts.email);
}
if (__VLS_ctx.data?.basic?.contacts?.phone) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "contact-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.data.basic.contacts.phone);
}
if (__VLS_ctx.data?.basic?.contacts?.site) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "contact-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.data.basic.contacts.site);
}
if (__VLS_ctx.data?.summary) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-section" },
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
/** @type {__VLS_StyleScopedClasses['card-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-info']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-info']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-section']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-title']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            containerStyle: containerStyle,
            cardStyle: cardStyle,
            headerStyle: headerStyle,
            avatarSectionStyle: avatarSectionStyle,
            avatarStyle: avatarStyle,
            basicInfoStyle: basicInfoStyle,
            nameStyle: nameStyle,
            titleStyle: titleStyle,
            bodyStyle: bodyStyle,
            contactStyle: contactStyle,
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
