import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CoreResumePreview from '@/components/core-resume/CoreResumePreview.vue';
import { createDemoDocument, extractThemeFromTemplate } from '@/core-resume/model';
import { getTemplateVariantLabel, resolveTemplateVariant } from '@/core-resume/templates';
import { addFavoriteTemplate, fetchTemplates, getTemplateDetail, listFavoriteTemplateIds, removeFavoriteTemplate, } from '@/api/template';
import { useUserStore } from '@/store/user';
const FAVORITE_TEMPLATE_STORAGE_KEY = 'resume-favorite-template-ids';
const RECENT_TEMPLATE_STORAGE_KEY = 'resume-recent-template-ids';
const RECENT_TEMPLATE_LIMIT = 8;
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const list = ref([]);
const loading = ref(false);
const page = ref(1);
const limit = ref(8);
const activeVariant = ref('all');
const activeScope = ref('all');
const favoriteTemplateIds = ref(readStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY));
const recentTemplateIds = ref(readStoredTemplateIds(RECENT_TEMPLATE_STORAGE_KEY).slice(0, RECENT_TEMPLATE_LIMIT));
const previewVisible = ref(false);
const previewDocument = ref(null);
const variantOptions = [
    { value: 'all', label: '全部版式' },
    { value: 'classic', label: '经典单栏' },
    { value: 'sidebar', label: '侧栏双栏' },
    { value: 'timeline', label: '时间轴版' },
    { value: 'spotlight', label: '聚焦封面' },
    { value: 'ats', label: 'ATS 极简' },
    { value: 'executive', label: '高管黑金' },
    { value: 'compact', label: '紧凑信息流' },
    { value: 'editorial', label: '编辑创意' },
];
const scopeOptions = [
    { value: 'all', label: '全部模板' },
    { value: 'favorites', label: '只看收藏' },
    { value: 'recent', label: '最近使用' },
];
const favoriteTemplateSet = computed(() => new Set(favoriteTemplateIds.value));
const recentTemplateSet = computed(() => new Set(recentTemplateIds.value));
const variantFilteredTemplates = computed(() => {
    if (activeVariant.value === 'all') {
        return [...list.value];
    }
    return list.value.filter((item) => item.templateVariant === activeVariant.value);
});
const visibleTemplates = computed(() => {
    let templates = [...variantFilteredTemplates.value];
    if (activeScope.value === 'favorites') {
        templates = templates.filter((item) => favoriteTemplateSet.value.has(item.templateId));
    }
    if (activeScope.value === 'recent') {
        const recentOrder = new Map(recentTemplateIds.value.map((templateId, index) => [templateId, index]));
        templates = templates
            .filter((item) => recentOrder.has(item.templateId))
            .sort((left, right) => (recentOrder.get(left.templateId) ?? 99) - (recentOrder.get(right.templateId) ?? 99));
    }
    return templates;
});
const pagedTemplates = computed(() => {
    const start = (page.value - 1) * limit.value;
    return visibleTemplates.value.slice(start, start + limit.value);
});
const listTitle = computed(() => {
    if (activeScope.value === 'favorites') {
        return '我的收藏';
    }
    if (activeScope.value === 'recent') {
        return '最近使用';
    }
    return activeVariant.value === 'all' ? '全部模板' : getTemplateVariantLabel(activeVariant.value);
});
const emptyDescription = computed(() => {
    if (activeScope.value === 'favorites') {
        return '还没有收藏模板，可以先回到全部模板挑选。';
    }
    if (activeScope.value === 'recent') {
        return '还没有最近使用记录，使用任意模板后会出现在这里。';
    }
    return '当前筛选条件下还没有模板。';
});
watch(() => userStore.isLoggedIn, () => {
    syncFavoriteTemplateIds();
});
load();
syncFavoriteTemplateIds();
async function load() {
    loading.value = true;
    try {
        const batchSize = 100;
        const firstPage = await fetchTemplates(1, batchSize, '', [], 'recommended');
        const mergedList = [...firstPage.list];
        const totalPages = Math.max(1, Math.ceil(firstPage.total / batchSize));
        for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
            const nextPage = await fetchTemplates(currentPage, batchSize, '', [], 'recommended');
            mergedList.push(...nextPage.list);
        }
        list.value = mergedList;
        page.value = 1;
    }
    catch (error) {
        console.error('模板列表加载失败:', error);
        list.value = [];
    }
    finally {
        loading.value = false;
    }
}
async function syncFavoriteTemplateIds() {
    if (!userStore.isLoggedIn) {
        favoriteTemplateIds.value = readStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY);
        return;
    }
    try {
        const serverFavoriteIds = await listFavoriteTemplateIds();
        const localFavoriteIds = readStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY);
        const missingLocalFavorites = localFavoriteIds.filter((templateId) => !serverFavoriteIds.includes(templateId));
        for (const templateId of missingLocalFavorites) {
            await addFavoriteTemplate(templateId);
        }
        favoriteTemplateIds.value = missingLocalFavorites.length
            ? await listFavoriteTemplateIds()
            : serverFavoriteIds;
        writeStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY, favoriteTemplateIds.value);
    }
    catch (error) {
        console.error('模板收藏同步失败:', error);
        favoriteTemplateIds.value = readStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY);
    }
}
async function openPreview(templateId) {
    previewDocument.value = createDemoDocument();
    previewVisible.value = true;
    try {
        const detail = await getTemplateDetail(templateId);
        const templateData = typeof detail.templateData === 'string'
            ? JSON.parse(detail.templateData)
            : detail.templateData;
        previewDocument.value = createDemoDocument(extractThemeFromTemplate(templateData));
        previewDocument.value.templateId = templateId;
        previewDocument.value.templateName = detail.name;
        previewDocument.value.templateVariant = resolveTemplateVariant(previewDocument.value, templateData);
    }
    catch (error) {
        console.error('模板预览加载失败:', error);
    }
}
function openEditor(templateId) {
    const resumeQuery = typeof route.query.resumeId === 'string' ? route.query.resumeId : '';
    const query = new URLSearchParams();
    if (templateId) {
        persistRecentTemplate(templateId);
    }
    if (resumeQuery) {
        query.set('resumeId', resumeQuery);
    }
    if (templateId) {
        query.set('templateId', templateId);
    }
    const queryString = query.toString();
    router.push(queryString ? `/resume-editor?${queryString}` : '/resume-editor');
}
function selectVariant(next) {
    activeVariant.value = next;
    page.value = 1;
}
function selectScope(next) {
    activeScope.value = next;
    page.value = 1;
}
function getVariantCount(variant) {
    if (variant === 'all') {
        return list.value.length;
    }
    return list.value.filter((item) => item.templateVariant === variant).length;
}
function getScopeCount(scope) {
    if (scope === 'favorites') {
        return variantFilteredTemplates.value.filter((item) => favoriteTemplateSet.value.has(item.templateId)).length;
    }
    if (scope === 'recent') {
        return variantFilteredTemplates.value.filter((item) => recentTemplateSet.value.has(item.templateId)).length;
    }
    return variantFilteredTemplates.value.length;
}
function handlePageChange(nextPage) {
    page.value = nextPage;
}
function handleSizeChange(nextSize) {
    limit.value = nextSize;
    page.value = 1;
}
async function toggleFavorite(templateId) {
    const wasFavorite = isFavorite(templateId);
    const nextFavoriteIds = wasFavorite
        ? favoriteTemplateIds.value.filter((item) => item !== templateId)
        : [templateId, ...favoriteTemplateIds.value.filter((item) => item !== templateId)];
    favoriteTemplateIds.value = nextFavoriteIds;
    writeStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY, nextFavoriteIds);
    if (!userStore.isLoggedIn) {
        return;
    }
    try {
        if (wasFavorite) {
            await removeFavoriteTemplate(templateId);
        }
        else {
            await addFavoriteTemplate(templateId);
        }
    }
    catch (error) {
        console.error('模板收藏保存失败:', error);
        favoriteTemplateIds.value = wasFavorite
            ? [templateId, ...favoriteTemplateIds.value.filter((item) => item !== templateId)]
            : favoriteTemplateIds.value.filter((item) => item !== templateId);
        writeStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY, favoriteTemplateIds.value);
    }
}
function isFavorite(templateId) {
    return favoriteTemplateSet.value.has(templateId);
}
function isRecent(templateId) {
    return recentTemplateIds.value.includes(templateId);
}
function persistRecentTemplate(templateId) {
    recentTemplateIds.value = [
        templateId,
        ...recentTemplateIds.value.filter((item) => item !== templateId),
    ].slice(0, RECENT_TEMPLATE_LIMIT);
    writeStoredTemplateIds(RECENT_TEMPLATE_STORAGE_KEY, recentTemplateIds.value);
}
function readStoredTemplateIds(storageKey) {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed
            .map((item) => String(item))
            .filter(Boolean);
    }
    catch {
        return [];
    }
}
function writeStoredTemplateIds(storageKey, templateIds) {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(templateIds));
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['list-header']} */ ;
/** @type {__VLS_StyleScopedClasses['list-header']} */ ;
/** @type {__VLS_StyleScopedClasses['template-card']} */ ;
/** @type {__VLS_StyleScopedClasses['template-card']} */ ;
/** @type {__VLS_StyleScopedClasses['template-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['template-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['template-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['templates-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-row']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-label']} */ ;
/** @type {__VLS_StyleScopedClasses['template-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "templates-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.openEditor();
    }
};
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "filter-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "filter-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chip-group" },
});
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.variantOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectVariant(option.value);
            } },
        key: (option.value),
        ...{ class: "filter-chip" },
        ...{ class: ({ active: __VLS_ctx.activeVariant === option.value }) },
        type: "button",
    });
    (option.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.getVariantCount(option.value));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "filter-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chip-group" },
});
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.scopeOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectScope(option.value);
            } },
        key: (option.value),
        ...{ class: "filter-chip" },
        ...{ class: ({ active: __VLS_ctx.activeScope === option.value }) },
        type: "button",
    });
    (option.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.getScopeCount(option.value));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "list-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.listTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.visibleTemplates.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "template-grid" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.pagedTemplates))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.templateId),
        ...{ class: "template-card" },
        ...{ class: ({
                favorited: __VLS_ctx.isFavorite(item.templateId),
                recent: __VLS_ctx.isRecent(item.templateId),
            }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-cover" },
    });
    if (item.coverUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (item.coverUrl),
            alt: (`${item.name} 预览图`),
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "template-cover-placeholder" },
        });
        (item.variantLabel || '模板预览');
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-title-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (item.name);
    if (__VLS_ctx.isFavorite(item.templateId)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "status-badge" },
        });
    }
    else if (__VLS_ctx.isRecent(item.templateId)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "status-badge muted" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.variantLabel || '默认版式');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.useCount || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-actions" },
    });
    const __VLS_8 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (...[$event]) => {
            __VLS_ctx.toggleFavorite(item.templateId);
        }
    };
    __VLS_11.slots.default;
    (__VLS_ctx.isFavorite(item.templateId) ? '取消收藏' : '收藏');
    var __VLS_11;
    const __VLS_16 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openPreview(item.templateId);
        }
    };
    __VLS_19.slots.default;
    var __VLS_19;
    const __VLS_24 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openEditor(item.templateId);
        }
    };
    __VLS_27.slots.default;
    var __VLS_27;
}
if (!__VLS_ctx.loading && !__VLS_ctx.pagedTemplates.length) {
    const __VLS_32 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        description: (__VLS_ctx.emptyDescription),
    }));
    const __VLS_34 = __VLS_33({
        description: (__VLS_ctx.emptyDescription),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
}
if (__VLS_ctx.visibleTemplates.length > __VLS_ctx.limit) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination" },
    });
    const __VLS_36 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onCurrentChange': {} },
        ...{ 'onSizeChange': {} },
        currentPage: (__VLS_ctx.page),
        pageSize: (__VLS_ctx.limit),
        total: (__VLS_ctx.visibleTemplates.length),
        pageSizes: ([8, 16, 24]),
        layout: "total, sizes, prev, pager, next",
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onCurrentChange': {} },
        ...{ 'onSizeChange': {} },
        currentPage: (__VLS_ctx.page),
        pageSize: (__VLS_ctx.limit),
        total: (__VLS_ctx.visibleTemplates.length),
        pageSizes: ([8, 16, 24]),
        layout: "total, sizes, prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onCurrentChange: (__VLS_ctx.handlePageChange)
    };
    const __VLS_44 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    var __VLS_39;
}
const __VLS_45 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    modelValue: (__VLS_ctx.previewVisible),
    title: "模板预览",
    width: "88%",
    top: "4vh",
}));
const __VLS_47 = __VLS_46({
    modelValue: (__VLS_ctx.previewVisible),
    title: "模板预览",
    width: "88%",
    top: "4vh",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
if (__VLS_ctx.previewDocument) {
    /** @type {[typeof CoreResumePreview, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(CoreResumePreview, new CoreResumePreview({
        document: (__VLS_ctx.previewDocument),
    }));
    const __VLS_50 = __VLS_49({
        document: (__VLS_ctx.previewDocument),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
}
var __VLS_48;
/** @type {__VLS_StyleScopedClasses['templates-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-row']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-label']} */ ;
/** @type {__VLS_StyleScopedClasses['chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-row']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-label']} */ ;
/** @type {__VLS_StyleScopedClasses['chip-group']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['list-header']} */ ;
/** @type {__VLS_StyleScopedClasses['template-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['template-card']} */ ;
/** @type {__VLS_StyleScopedClasses['template-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['template-cover-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['template-body']} */ ;
/** @type {__VLS_StyleScopedClasses['template-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['template-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['template-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CoreResumePreview: CoreResumePreview,
            loading: loading,
            page: page,
            limit: limit,
            activeVariant: activeVariant,
            activeScope: activeScope,
            previewVisible: previewVisible,
            previewDocument: previewDocument,
            variantOptions: variantOptions,
            scopeOptions: scopeOptions,
            visibleTemplates: visibleTemplates,
            pagedTemplates: pagedTemplates,
            listTitle: listTitle,
            emptyDescription: emptyDescription,
            openPreview: openPreview,
            openEditor: openEditor,
            selectVariant: selectVariant,
            selectScope: selectScope,
            getVariantCount: getVariantCount,
            getScopeCount: getScopeCount,
            handlePageChange: handlePageChange,
            handleSizeChange: handleSizeChange,
            toggleFavorite: toggleFavorite,
            isFavorite: isFavorite,
            isRecent: isRecent,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
