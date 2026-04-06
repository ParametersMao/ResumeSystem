import { computed, defineProps } from 'vue';
const props = defineProps();
// 提取基本信息
const basicInfo = computed(() => {
    const { basic, summary } = props.data || {};
    return { basic, summary };
});
// 提取联系方式
const contactInfo = computed(() => {
    const { basic } = basicInfo.value;
    const { contacts } = basic || {};
    return contacts || {};
});
// 生成表格行数据
const tableRows = computed(() => {
    console.log('TableLayout - props.data:', props.data);
    console.log('TableLayout - props.config:', props.config);
    const { basic } = basicInfo.value;
    const { name, title } = basic || {};
    const { phone, email, site } = contactInfo.value;
    console.log('TableLayout - extracted basic:', basic);
    console.log('TableLayout - extracted summary:', basicInfo.value.summary);
    console.log('TableLayout - extracted name:', name, 'title:', title);
    console.log('TableLayout - extracted phone:', phone, 'email:', email);
    // 根据接口数据动态生成字段，只显示实际存在的数据
    const fields = [];
    // 姓名和职位（来自 profile.basic）
    if (name)
        fields.push(['姓名', name]);
    if (title)
        fields.push(['职位', title]);
    // 联系方式（来自 profile.basic.contacts）
    if (phone)
        fields.push(['电话', phone]);
    if (email)
        fields.push(['邮箱', email]);
    if (site)
        fields.push(['主页', site]);
    // 如果没有字段，显示提示
    if (fields.length === 0) {
        fields.push(['提示', '暂无个人信息']);
    }
    // 如果配置了自定义字段，使用自定义字段
    if (props.config?.fields && Array.isArray(props.config.fields)) {
        return props.config.fields;
    }
    console.log('TableLayout - final fields:', fields);
    return fields;
});
// 容器样式
const containerStyle = computed(() => ({
    marginBottom: props.config?.marginBottom || '20px',
    padding: props.config?.padding,
    ...props.config?.containerStyle
}));
// 标题样式
const titleStyle = computed(() => {
    const config = props.config?.titleConfig || {};
    const baseStyle = {
        position: 'relative',
        background: config.backgroundColor || props.styles?.colors?.primary || '#4a90a4',
        color: config.color || 'white',
        padding: config.padding || '12px 20px',
        margin: config.margin || '20px 0 15px 0',
        fontSize: config.fontSize || '18px',
        fontWeight: config.fontWeight || 'bold'
    };
    return { ...baseStyle, ...config.customStyle };
});
// 标题箭头样式（ribbon效果）
const arrowStyle = computed(() => {
    const primaryColor = props.styles?.colors?.primary || '#4a90a4';
    return {
        content: '""',
        position: 'absolute',
        right: '-15px',
        top: '0',
        width: '0',
        height: '0',
        borderTop: `24px solid ${primaryColor}`,
        borderBottom: `24px solid ${primaryColor}`,
        borderRight: '15px solid transparent'
    };
});
// 布局样式
const layoutStyle = computed(() => ({
    display: 'flex',
    ...props.config?.layoutStyle
}));
// 信息区域样式
const infoStyle = computed(() => ({
    flex: '1',
    paddingRight: '20px',
    ...props.config?.infoStyle
}));
// 表格样式
const tableStyle = computed(() => ({
    width: '100%',
    borderCollapse: 'collapse',
    ...props.config?.tableStyle
}));
// 单元格样式
const cellStyle = computed(() => ({
    padding: '8px 12px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
    ...props.config?.cellStyle
}));
// 头像区域样式
const avatarStyle = computed(() => ({
    width: props.config?.avatarWidth || '120px',
    textAlign: 'center',
    ...props.config?.avatarStyle
}));
// 头像占位符样式
const avatarPlaceholderStyle = computed(() => ({
    width: props.config?.avatarWidth || '120px',
    height: props.config?.avatarHeight || '150px',
    background: props.config?.avatarBackground || '#f0f0f0',
    borderRadius: props.config?.avatarBorderRadius || '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: props.config?.avatarTextColor || '#999',
    ...props.config?.avatarPlaceholderStyle
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-container" },
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
    ...{ class: "profile-layout" },
    ...{ style: (__VLS_ctx.layoutStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-info" },
    ...{ style: (__VLS_ctx.infoStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
    ...{ class: "info-table" },
    ...{ style: (__VLS_ctx.tableStyle) },
});
for (const [row, index] of __VLS_getVForSourceType((__VLS_ctx.tableRows))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
        key: (index),
    });
    for (const [cell, cellIndex] of __VLS_getVForSourceType((row))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            key: (cellIndex),
            ...{ style: (__VLS_ctx.cellStyle) },
        });
        (cell);
    }
}
if (__VLS_ctx.basicInfo.summary) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-content" },
    });
    (__VLS_ctx.basicInfo.summary);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-avatar" },
    ...{ style: (__VLS_ctx.avatarStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-placeholder" },
    ...{ style: (__VLS_ctx.avatarPlaceholderStyle) },
});
(__VLS_ctx.config?.avatarText || '头像区域');
/** @type {__VLS_StyleScopedClasses['profile-container']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['title-ribbon-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-table']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-section']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-title']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-content']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            basicInfo: basicInfo,
            tableRows: tableRows,
            containerStyle: containerStyle,
            titleStyle: titleStyle,
            arrowStyle: arrowStyle,
            layoutStyle: layoutStyle,
            infoStyle: infoStyle,
            tableStyle: tableStyle,
            cellStyle: cellStyle,
            avatarStyle: avatarStyle,
            avatarPlaceholderStyle: avatarPlaceholderStyle,
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
