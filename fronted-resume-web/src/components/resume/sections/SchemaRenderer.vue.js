import { computed, defineProps, onMounted, nextTick } from 'vue';
import { componentRegistry } from '@/utils/componentRegistry';
const props = defineProps();
// 基础样式计算
const schemaClass = computed(() => {
    const classes = ['schema-renderer'];
    if (props.schema.className)
        classes.push(props.schema.className);
    if (props.config?.customClass)
        classes.push(props.config.customClass);
    return classes.join(' ');
});
const schemaStyle = computed(() => {
    const style = {
        ...props.schema.style,
        ...props.config?.customStyle
    };
    return style;
});
// Grid布局
const gridStyle = computed(() => {
    const cols = props.schema.columns || 1;
    const gap = props.schema.gap || '16px';
    return {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: gap
    };
});
// Flex布局
const flexStyle = computed(() => {
    return {
        display: 'flex',
        flexDirection: props.schema.direction || 'row',
        justifyContent: props.schema.justify || 'flex-start',
        alignItems: props.schema.align || 'stretch',
        gap: props.schema.gap || '16px',
        flexWrap: props.schema.wrap || 'nowrap'
    };
});
// 文本样式
const textClass = computed(() => {
    const classes = ['schema-text'];
    if (props.schema.variant)
        classes.push(`text-${props.schema.variant}`);
    return classes.join(' ');
});
const textStyle = computed(() => {
    const style = {};
    if (props.schema.fontSize)
        style.fontSize = props.schema.fontSize;
    if (props.schema.fontWeight)
        style.fontWeight = props.schema.fontWeight;
    if (props.schema.color)
        style.color = props.schema.color;
    if (props.schema.textAlign)
        style.textAlign = props.schema.textAlign;
    return style;
});
// 图片样式
const imageClass = computed(() => {
    const classes = ['schema-image'];
    if (props.schema.className)
        classes.push(props.schema.className);
    return classes.join(' ');
});
const imageStyle = computed(() => {
    return {
        width: props.schema.width || '100%',
        height: props.schema.height || 'auto',
        objectFit: props.schema.objectFit || 'cover'
    };
});
// 列表样式
const listClass = computed(() => {
    const classes = ['schema-list'];
    if (props.schema.variant === 'ordered')
        classes.push('ordered-list');
    return classes.join(' ');
});
const listStyle = computed(() => {
    return {
        listStyleType: props.schema.variant === 'ordered' ? 'decimal' : 'disc'
    };
});
const itemClass = computed(() => {
    return ['schema-list-item'];
});
const itemStyle = computed(() => {
    return {
        marginBottom: props.schema.itemSpacing || '8px'
    };
});
// 表格样式
const tableClass = computed(() => {
    const classes = ['schema-table'];
    if (props.schema.striped)
        classes.push('striped');
    if (props.schema.bordered)
        classes.push('bordered');
    return classes.join(' ');
});
const tableStyle = computed(() => {
    return {
        width: '100%',
        borderCollapse: 'collapse'
    };
});
// 图表样式
const chartClass = computed(() => {
    return ['schema-chart'];
});
const chartStyle = computed(() => {
    return {
        width: props.schema.width || '100%',
        height: props.schema.height || '300px'
    };
});
const chartId = computed(() => {
    return `chart-${Math.random().toString(36).substr(2, 9)}`;
});
const containerClass = computed(() => {
    return ['schema-container'];
});
const containerStyle = computed(() => {
    return {
        display: 'block'
    };
});
// 工具方法
function renderTextContent() {
    if (props.schema.content) {
        return props.schema.content;
    }
    if (props.schema.field && props.data) {
        return props.data[props.schema.field] || '';
    }
    return '';
}
function getImageSrc() {
    if (props.schema.src) {
        return props.schema.src;
    }
    if (props.schema.field && props.data) {
        return props.data[props.schema.field] || '';
    }
    return '';
}
function getListItems() {
    if (props.schema.items) {
        return props.schema.items;
    }
    if (props.schema.field && props.data) {
        return props.data[props.schema.field] || [];
    }
    return [];
}
function renderListItem(item) {
    if (typeof item === 'string') {
        return item;
    }
    if (typeof item === 'object' && item.text) {
        return item.text;
    }
    return String(item);
}
function getTableRows() {
    if (props.schema.rows) {
        return props.schema.rows;
    }
    if (props.schema.field && props.data) {
        return props.data[props.schema.field] || [];
    }
    return [];
}
function getColumnStyle(index) {
    const style = {};
    if (props.schema.columnStyles && props.schema.columnStyles[index]) {
        Object.assign(style, props.schema.columnStyles[index]);
    }
    return style;
}
function getCustomComponent() {
    if (props.schema.component) {
        return props.schema.component;
    }
    if (props.schema.componentId) {
        const definition = componentRegistry.get(props.schema.componentId);
        return definition?.component;
    }
    return 'div';
}
// 图表渲染（需要引入图表库）
onMounted(async () => {
    if (props.schema.type === 'chart' && props.schema.chartType) {
        await nextTick();
        // 这里可以集成 ECharts、Chart.js 等图表库
        console.log('Chart rendering not implemented yet');
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['schema-table']} */ ;
/** @type {__VLS_StyleScopedClasses['schema-table']} */ ;
/** @type {__VLS_StyleScopedClasses['schema-table']} */ ;
/** @type {__VLS_StyleScopedClasses['bordered']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: (__VLS_ctx.schemaClass) },
    ...{ style: (__VLS_ctx.schemaStyle) },
});
if (__VLS_ctx.schema.type === 'grid') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "schema-grid" },
        ...{ style: (__VLS_ctx.gridStyle) },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.schema.items))) {
        const __VLS_0 = {}.SchemaRenderer;
        /** @type {[typeof __VLS_components.SchemaRenderer, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            key: (index),
            schema: (item),
            data: (__VLS_ctx.data),
            config: (__VLS_ctx.config),
            styles: (__VLS_ctx.styles),
        }));
        const __VLS_2 = __VLS_1({
            key: (index),
            schema: (item),
            data: (__VLS_ctx.data),
            config: (__VLS_ctx.config),
            styles: (__VLS_ctx.styles),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
}
else if (__VLS_ctx.schema.type === 'flex') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "schema-flex" },
        ...{ style: (__VLS_ctx.flexStyle) },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.schema.items))) {
        const __VLS_4 = {}.SchemaRenderer;
        /** @type {[typeof __VLS_components.SchemaRenderer, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            key: (index),
            schema: (item),
            data: (__VLS_ctx.data),
            config: (__VLS_ctx.config),
            styles: (__VLS_ctx.styles),
        }));
        const __VLS_6 = __VLS_5({
            key: (index),
            schema: (item),
            data: (__VLS_ctx.data),
            config: (__VLS_ctx.config),
            styles: (__VLS_ctx.styles),
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    }
}
else if (__VLS_ctx.schema.type === 'text') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: (__VLS_ctx.textClass) },
        ...{ style: (__VLS_ctx.textStyle) },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderTextContent()) }, null, null);
}
else if (__VLS_ctx.schema.type === 'image') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.getImageSrc()),
        alt: (__VLS_ctx.schema.alt || ''),
        ...{ class: (__VLS_ctx.imageClass) },
        ...{ style: (__VLS_ctx.imageStyle) },
    });
}
else if (__VLS_ctx.schema.type === 'list') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: (__VLS_ctx.listClass) },
        ...{ style: (__VLS_ctx.listStyle) },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.getListItems()))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (index),
            ...{ class: (__VLS_ctx.itemClass) },
            ...{ style: (__VLS_ctx.itemStyle) },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderListItem(item)) }, null, null);
    }
}
else if (__VLS_ctx.schema.type === 'table') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
        ...{ class: (__VLS_ctx.tableClass) },
        ...{ style: (__VLS_ctx.tableStyle) },
    });
    if (__VLS_ctx.schema.header) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
        for (const [col, index] of __VLS_getVForSourceType((__VLS_ctx.schema.header))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
                key: (index),
                ...{ style: (__VLS_ctx.getColumnStyle(index)) },
            });
            (col);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [row, rowIndex] of __VLS_getVForSourceType((__VLS_ctx.getTableRows()))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            key: (rowIndex),
        });
        for (const [cell, colIndex] of __VLS_getVForSourceType((row))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                key: (colIndex),
                ...{ style: (__VLS_ctx.getColumnStyle(colIndex)) },
            });
            (cell);
        }
    }
}
else if (__VLS_ctx.schema.type === 'chart') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: (__VLS_ctx.chartClass) },
        ...{ style: (__VLS_ctx.chartStyle) },
        id: (__VLS_ctx.chartId),
    });
}
else if (__VLS_ctx.schema.type === 'custom') {
    const __VLS_8 = ((__VLS_ctx.getCustomComponent()));
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        data: (__VLS_ctx.data),
        config: (__VLS_ctx.config),
        styles: (__VLS_ctx.styles),
        ...(__VLS_ctx.schema.props || {}),
    }));
    const __VLS_10 = __VLS_9({
        data: (__VLS_ctx.data),
        config: (__VLS_ctx.config),
        styles: (__VLS_ctx.styles),
        ...(__VLS_ctx.schema.props || {}),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: (__VLS_ctx.containerClass) },
        ...{ style: (__VLS_ctx.containerStyle) },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.schema.children || []))) {
        const __VLS_12 = {}.SchemaRenderer;
        /** @type {[typeof __VLS_components.SchemaRenderer, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            key: (index),
            schema: (item),
            data: (__VLS_ctx.data),
            config: (__VLS_ctx.config),
            styles: (__VLS_ctx.styles),
        }));
        const __VLS_14 = __VLS_13({
            key: (index),
            schema: (item),
            data: (__VLS_ctx.data),
            config: (__VLS_ctx.config),
            styles: (__VLS_ctx.styles),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    }
}
/** @type {__VLS_StyleScopedClasses['schema-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['schema-flex']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            schemaClass: schemaClass,
            schemaStyle: schemaStyle,
            gridStyle: gridStyle,
            flexStyle: flexStyle,
            textClass: textClass,
            textStyle: textStyle,
            imageClass: imageClass,
            imageStyle: imageStyle,
            listClass: listClass,
            listStyle: listStyle,
            itemClass: itemClass,
            itemStyle: itemStyle,
            tableClass: tableClass,
            tableStyle: tableStyle,
            chartClass: chartClass,
            chartStyle: chartStyle,
            chartId: chartId,
            containerClass: containerClass,
            containerStyle: containerStyle,
            renderTextContent: renderTextContent,
            getImageSrc: getImageSrc,
            getListItems: getListItems,
            renderListItem: renderListItem,
            getTableRows: getTableRows,
            getColumnStyle: getColumnStyle,
            getCustomComponent: getCustomComponent,
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
