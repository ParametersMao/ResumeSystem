import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { listMyResumes } from '@/api/resume';
import { useUserStore } from '@/store/user';
const router = useRouter();
const userStore = useUserStore();
const list = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const limit = ref(8);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
onMounted(load);
async function load() {
    if (!userStore.user?.id) {
        await userStore.initUserState();
    }
    if (!userStore.user?.id) {
        return;
    }
    loading.value = true;
    try {
        const data = await listMyResumes(userStore.user.id, page.value, limit.value);
        list.value = data.list;
        total.value = data.total;
    }
    finally {
        loading.value = false;
    }
}
function goCreate() {
    router.push('/templates');
}
function goEdit(id) {
    router.push(`/resume-editor?resumeId=${id}`);
}
function goPreview(id) {
    router.push(`/preview/${id}`);
}
function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['resumes-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resumes-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
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
    onClick: (__VLS_ctx.goCreate)
};
__VLS_3.slots.default;
var __VLS_3;
if (!__VLS_ctx.loading && __VLS_ctx.list.length === 0) {
    const __VLS_8 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        description: "还没有简历，先从模板开始创建一份吧",
    }));
    const __VLS_10 = __VLS_9({
        description: "还没有简历，先从模板开始创建一份吧",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "resume-grid" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        const __VLS_12 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            key: (item.id),
            ...{ class: "resume-card" },
            shadow: "hover",
        }));
        const __VLS_14 = __VLS_13({
            key: (item.id),
            ...{ class: "resume-card" },
            shadow: "hover",
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_15.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "resume-card-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "resume-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (item.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (item.templateName || '默认模板');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.formatDate(item.updateTime));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "resume-actions" },
        });
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
                if (!!(!__VLS_ctx.loading && __VLS_ctx.list.length === 0))
                    return;
                __VLS_ctx.goEdit(item.id);
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
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onClick': {} },
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_28;
        let __VLS_29;
        let __VLS_30;
        const __VLS_31 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.loading && __VLS_ctx.list.length === 0))
                    return;
                __VLS_ctx.goPreview(item.id);
            }
        };
        __VLS_27.slots.default;
        var __VLS_27;
        var __VLS_15;
    }
}
if (__VLS_ctx.totalPages > 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination" },
    });
    const __VLS_32 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onCurrentChange': {} },
        ...{ 'onSizeChange': {} },
        currentPage: (__VLS_ctx.page),
        pageSize: (__VLS_ctx.limit),
        total: (__VLS_ctx.total),
        pageSizes: ([8, 16, 24]),
        layout: "total, sizes, prev, pager, next",
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onCurrentChange': {} },
        ...{ 'onSizeChange': {} },
        currentPage: (__VLS_ctx.page),
        pageSize: (__VLS_ctx.limit),
        total: (__VLS_ctx.total),
        pageSizes: ([8, 16, 24]),
        layout: "total, sizes, prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onCurrentChange: (__VLS_ctx.load)
    };
    const __VLS_40 = {
        onSizeChange: (__VLS_ctx.load)
    };
    var __VLS_35;
}
/** @type {__VLS_StyleScopedClasses['resumes-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-card']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            list: list,
            loading: loading,
            total: total,
            page: page,
            limit: limit,
            totalPages: totalPages,
            load: load,
            goCreate: goCreate,
            goEdit: goEdit,
            goPreview: goPreview,
            formatDate: formatDate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
