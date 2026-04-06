import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import html2canvas from 'html2canvas';
import { listMyResumes } from '@/api/resume';
import { useUserStore } from '@/store/user';
const router = useRouter();
const userStore = useUserStore();
const list = ref([]);
const total = ref(0);
const page = ref(1);
const limit = ref(8);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
async function load() {
    const userId = userStore.user?.id;
    if (!userId) {
        return;
    }
    const data = await listMyResumes(userId, page.value, limit.value);
    list.value = data.list;
    total.value = data.total;
    await nextTick();
    // 生成缩略图
    for (const r of list.value)
        generateThumb(r);
}
function goEdit(id) { router.push(`/editor/${id}`); }
function goPreview(id) { router.push(`/preview/${id}`); }
function share(_id) { }
function remove(_id) { }
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
async function generateThumb(resume) {
    // 构建一个小型渲染容器
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '500px';
    container.innerHTML = renderMini(resume);
    document.body.appendChild(container);
    try {
        const pageEl = container.querySelector('.mini-page');
        const canvas = await html2canvas(pageEl, { scale: 1, useCORS: true });
        resume.thumbUrl = canvas.toDataURL('image/png');
    }
    finally {
        document.body.removeChild(container);
    }
}
function renderMini(resume) {
    const itemsHtml = resume.sections.map(s => {
        const listHtml = (s.visible ? s.items.map((it) => `<li>${formatItem(it)}</li>`).join('') : '');
        return s.visible ? `<div class=\"sec\"><div class=\"ttl\">${s.title}</div><ul>${listHtml}</ul></div>` : '';
    }).join('');
    return `
  <div class=\"mini-page\" style=\"width:500px;background:#fff;color:#333;border:1px solid #eee;padding:16px;\">
    <h3 style=\"margin:0 0 8px\">${resume.meta.title}</h3>
    ${itemsHtml}
  </div>`;
}
function formatItem(it) {
    if (it.company)
        return `${it.company} - ${it.role}`;
    if (it.name)
        return `${it.name}`;
    if (it.content)
        return `${it.content}`;
    return '';
}
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['resume-card']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resumes-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-grid" },
});
for (const [r] of __VLS_getVForSourceType((__VLS_ctx.list))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (r.resumeId),
        ...{ class: "resume-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-preview" },
    });
    if (r.thumbUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (r.thumbUrl),
            alt: "简历预览",
            ...{ class: "preview-image" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-placeholder" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "placeholder-text" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "resume-title" },
    });
    (r.meta.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "resume-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "resume-id" },
    });
    (new Date(r.meta.updatedAt).toISOString().slice(0, 10).replace(/-/g, ''));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "update-time" },
    });
    (__VLS_ctx.formatDate(r.meta.updatedAt));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.goEdit(r.resumeId);
            } },
        ...{ class: "action-btn edit-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "btn-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.goPreview(r.resumeId);
            } },
        ...{ class: "action-btn preview-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "btn-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.share(r.resumeId);
            } },
        ...{ class: "action-btn share-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "btn-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.remove(r.resumeId);
            } },
        ...{ class: "action-btn delete-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "btn-icon" },
    });
}
if (__VLS_ctx.totalPages > 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "page-info" },
    });
    (__VLS_ctx.page);
    (__VLS_ctx.totalPages);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-controls" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.totalPages > 1))
                    return;
                __VLS_ctx.page--;
                __VLS_ctx.load();
            } },
        ...{ class: "page-btn" },
        disabled: (__VLS_ctx.page <= 1),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.totalPages > 1))
                    return;
                __VLS_ctx.page++;
                __VLS_ctx.load();
            } },
        ...{ class: "page-btn" },
        disabled: (__VLS_ctx.page >= __VLS_ctx.totalPages),
    });
}
/** @type {__VLS_StyleScopedClasses['resumes-page']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-image']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-text']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-title']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-id']} */ ;
/** @type {__VLS_StyleScopedClasses['update-time']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['share-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['page-info']} */ ;
/** @type {__VLS_StyleScopedClasses['page-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            list: list,
            page: page,
            totalPages: totalPages,
            load: load,
            goEdit: goEdit,
            goPreview: goPreview,
            share: share,
            remove: remove,
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
