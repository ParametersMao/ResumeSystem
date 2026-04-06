import { computed } from 'vue';
import { PERSONAL_FIELDS, getFieldByKey, getFieldDisplayValue } from '@/config/personalFields';
const props = defineProps();
// 获取字段值
const nameField = computed(() => getFieldByKey('name'));
const titleField = computed(() => getFieldByKey('title'));
const avatarField = computed(() => getFieldByKey('avatar'));
const summaryField = computed(() => getFieldByKey('summary'));
const nameValue = computed(() => getFieldDisplayValue(props.data, nameField.value));
const titleValue = computed(() => getFieldDisplayValue(props.data, titleField.value));
const avatarValue = computed(() => getFieldDisplayValue(props.data, avatarField.value));
const summaryValue = computed(() => getFieldDisplayValue(props.data, summaryField.value));
// 联系方式字段
const contactFields = computed(() => {
    return PERSONAL_FIELDS.filter(f => f.type === 'contact');
});
const hasContacts = computed(() => {
    return contactFields.value.some(f => getFieldDisplayValue(props.data, f));
});
// 根据配置排序的字段列表
const orderedFields = computed(() => {
    const fields = PERSONAL_FIELDS.filter(f => f.type !== 'avatar' &&
        f.type !== 'summary' &&
        f.key !== 'name' &&
        f.key !== 'title');
    const order = props.config?.fields?.order;
    if (order && Array.isArray(order)) {
        return order
            .map(key => fields.find(f => f.key === key))
            .filter(Boolean);
    }
    return fields;
});
// 判断字段是否应该显示
function shouldShowField(key) {
    const visibleFields = props.config?.fields?.visible;
    if (!visibleFields || !Array.isArray(visibleFields)) {
        return true; // 默认全部显示
    }
    return visibleFields.includes(key);
}
// 获取字段标签
function getFieldLabel(field) {
    const customLabels = props.config?.fields?.labels;
    if (customLabels && customLabels[field.key]) {
        return customLabels[field.key];
    }
    return field.defaultLabel || field.label;
}
// 获取字段样式
function getFieldStyle(field) {
    const fieldStyles = props.config?.fields?.styles;
    const baseStyle = props.config?.fieldStyle || {};
    const customStyle = fieldStyles?.[field.key] || {};
    return { ...baseStyle, ...customStyle };
}
function getFieldLabelStyle(field) {
    return props.config?.fieldLabelStyle || {};
}
function getFieldValueStyle(field) {
    return props.config?.fieldValueStyle || {};
}
function getContactItemStyle(field) {
    return props.config?.contactItemStyle || {};
}
// 容器样式
const containerStyle = computed(() => ({
    ...props.config?.containerStyle,
    ...props.styles?.container
}));
const contentStyle = computed(() => ({
    ...props.config?.contentStyle
}));
const titleStyle = computed(() => ({
    ...props.config?.titleStyle,
    ...props.styles?.title
}));
const arrowStyle = computed(() => ({
    ...props.config?.arrowStyle
}));
const avatarSectionStyle = computed(() => ({
    ...props.config?.avatarSectionStyle
}));
const avatarImageStyle = computed(() => ({
    ...props.config?.avatarImageStyle
}));
const avatarPlaceholderStyle = computed(() => ({
    ...props.config?.avatarPlaceholderStyle
}));
const infoSectionStyle = computed(() => ({
    ...props.config?.infoSectionStyle
}));
const nameRowStyle = computed(() => ({
    ...props.config?.nameRowStyle
}));
const nameStyle = computed(() => ({
    ...props.config?.nameStyle
}));
const titleRowStyle = computed(() => ({
    ...props.config?.titleRowStyle
}));
const titleTextStyle = computed(() => ({
    ...props.config?.titleTextStyle
}));
const fieldsContainerStyle = computed(() => ({
    ...props.config?.fieldsContainerStyle
}));
const contactsStyle = computed(() => ({
    ...props.config?.contactStyle
}));
const contactLabelStyle = computed(() => ({
    ...props.config?.contactLabelStyle
}));
const contactValueStyle = computed(() => ({
    ...props.config?.contactValueStyle
}));
const summarySectionStyle = computed(() => ({
    ...props.config?.summaryStyle
}));
const summaryTitleStyle = computed(() => ({
    ...props.config?.summaryTitleStyle
}));
const summaryContentStyle = computed(() => ({
    ...props.config?.summaryContentStyle
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flexible-personal-layout" },
    ...{ style: (__VLS_ctx.containerStyle) },
});
if (__VLS_ctx.config?.showTitle !== false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
        ...{ style: (__VLS_ctx.titleStyle) },
    });
    (__VLS_ctx.config?.title || '基本信息');
    if (__VLS_ctx.config?.titleStyle === 'ribbon') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "title-ribbon-arrow" },
            ...{ style: (__VLS_ctx.arrowStyle) },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "personal-content" },
    ...{ style: (__VLS_ctx.contentStyle) },
});
if (__VLS_ctx.avatarField && __VLS_ctx.shouldShowField(__VLS_ctx.avatarField.key)) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "avatar-section" },
        ...{ style: (__VLS_ctx.avatarSectionStyle) },
    });
    if (__VLS_ctx.avatarValue) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.avatarValue),
            ...{ class: "avatar-image" },
            ...{ style: (__VLS_ctx.avatarImageStyle) },
            alt: (__VLS_ctx.nameValue || '头像'),
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "avatar-placeholder" },
            ...{ style: (__VLS_ctx.avatarPlaceholderStyle) },
        });
        (__VLS_ctx.config?.avatarText || '头像');
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-section" },
    ...{ style: (__VLS_ctx.infoSectionStyle) },
});
if (__VLS_ctx.nameField && __VLS_ctx.shouldShowField(__VLS_ctx.nameField.key)) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "name-row" },
        ...{ style: (__VLS_ctx.nameRowStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "name" },
        ...{ style: (__VLS_ctx.nameStyle) },
    });
    (__VLS_ctx.nameValue || '请填写姓名');
}
if (__VLS_ctx.titleField && __VLS_ctx.shouldShowField(__VLS_ctx.titleField.key)) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-row" },
        ...{ style: (__VLS_ctx.titleRowStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
        ...{ style: (__VLS_ctx.titleTextStyle) },
    });
    (__VLS_ctx.titleValue || '请填写职位');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fields-container" },
    ...{ style: (__VLS_ctx.fieldsContainerStyle) },
});
for (const [field] of __VLS_getVForSourceType((__VLS_ctx.orderedFields))) {
    (field.key);
    if (__VLS_ctx.shouldShowField(field.key) && field.type !== 'avatar' && field.type !== 'summary') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field-item" },
            ...{ class: (`field-${field.key}`) },
            ...{ style: (__VLS_ctx.getFieldStyle(field)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "field-label" },
            ...{ style: (__VLS_ctx.getFieldLabelStyle(field)) },
        });
        (__VLS_ctx.getFieldLabel(field));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "field-value" },
            ...{ style: (__VLS_ctx.getFieldValueStyle(field)) },
        });
        (__VLS_ctx.getFieldDisplayValue(__VLS_ctx.data, field) || '-');
    }
}
if (__VLS_ctx.hasContacts) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "contacts-section" },
        ...{ style: (__VLS_ctx.contactsStyle) },
    });
    if (__VLS_ctx.shouldShowField(__VLS_ctx.contactField.key) && __VLS_ctx.getFieldDisplayValue(__VLS_ctx.data, __VLS_ctx.contactField)) {
        for (const [contactField] of __VLS_getVForSourceType((__VLS_ctx.contactFields))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (contactField.key),
                ...{ class: "contact-item" },
                ...{ style: (__VLS_ctx.getContactItemStyle(contactField)) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "contact-label" },
                ...{ style: (__VLS_ctx.contactLabelStyle) },
            });
            (__VLS_ctx.getFieldLabel(contactField));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "contact-value" },
                ...{ style: (__VLS_ctx.contactValueStyle) },
            });
            (__VLS_ctx.getFieldDisplayValue(__VLS_ctx.data, contactField));
        }
    }
}
if (__VLS_ctx.summaryField && __VLS_ctx.shouldShowField(__VLS_ctx.summaryField.key) && __VLS_ctx.summaryValue) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-section" },
        ...{ style: (__VLS_ctx.summarySectionStyle) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-title" },
        ...{ style: (__VLS_ctx.summaryTitleStyle) },
    });
    (__VLS_ctx.getFieldLabel(__VLS_ctx.summaryField));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-content" },
        ...{ style: (__VLS_ctx.summaryContentStyle) },
    });
    (__VLS_ctx.summaryValue);
}
/** @type {__VLS_StyleScopedClasses['flexible-personal-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-ribbon-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['personal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-image']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['info-section']} */ ;
/** @type {__VLS_StyleScopedClasses['name-row']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['fields-container']} */ ;
/** @type {__VLS_StyleScopedClasses['field-item']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['field-value']} */ ;
/** @type {__VLS_StyleScopedClasses['contacts-section']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-label']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-section']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-title']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getFieldDisplayValue: getFieldDisplayValue,
            nameField: nameField,
            titleField: titleField,
            avatarField: avatarField,
            summaryField: summaryField,
            nameValue: nameValue,
            titleValue: titleValue,
            avatarValue: avatarValue,
            summaryValue: summaryValue,
            contactFields: contactFields,
            hasContacts: hasContacts,
            orderedFields: orderedFields,
            shouldShowField: shouldShowField,
            getFieldLabel: getFieldLabel,
            getFieldStyle: getFieldStyle,
            getFieldLabelStyle: getFieldLabelStyle,
            getFieldValueStyle: getFieldValueStyle,
            getContactItemStyle: getContactItemStyle,
            containerStyle: containerStyle,
            contentStyle: contentStyle,
            titleStyle: titleStyle,
            arrowStyle: arrowStyle,
            avatarSectionStyle: avatarSectionStyle,
            avatarImageStyle: avatarImageStyle,
            avatarPlaceholderStyle: avatarPlaceholderStyle,
            infoSectionStyle: infoSectionStyle,
            nameRowStyle: nameRowStyle,
            nameStyle: nameStyle,
            titleRowStyle: titleRowStyle,
            titleTextStyle: titleTextStyle,
            fieldsContainerStyle: fieldsContainerStyle,
            contactsStyle: contactsStyle,
            contactLabelStyle: contactLabelStyle,
            contactValueStyle: contactValueStyle,
            summarySectionStyle: summarySectionStyle,
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
