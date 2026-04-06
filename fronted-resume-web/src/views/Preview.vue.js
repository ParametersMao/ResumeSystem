import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getResume } from '@/api/resume';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportResumePdfByHtml } from '@/api/resume';
const route = useRoute();
const router = useRouter();
const resume = ref(null);
const pageRef = ref(null);
function goBack() { router.back(); }
function formatItem(it) {
    if (it.company)
        return `${it.company} - ${it.role}`;
    if (it.name)
        return `${it.name}`;
    return JSON.stringify(it);
}
async function exportPdfClick() {
    if (!pageRef.value)
        return;
    // 方案A：本地导出（保留）
    const canvas = await html2canvas(pageRef.value, { scale: 2, useCORS: true });
    const img = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = 210;
    const h = 297;
    const imgW = w;
    const imgH = (canvas.height * imgW) / canvas.width;
    let left = imgH;
    let pos = 0;
    pdf.addImage(img, 'JPEG', 0, pos, imgW, imgH);
    left -= h;
    while (left > 0) {
        pos = left - imgH;
        pdf.addPage();
        pdf.addImage(img, 'JPEG', 0, pos, imgW, imgH);
        left -= h;
    }
    pdf.save('resume.pdf');
    // 方案B：服务端导出（对接后端）
    const html = pageRef.value.outerHTML;
    try {
        const { url } = await exportResumePdfByHtml(html);
        if (url)
            window.open(url, '_blank');
    }
    catch (e) {
        // 忽略失败，仍保留本地导出结果
    }
}
onMounted(async () => {
    const id = String(route.params.resumeId);
    resume.value = await getResume(id);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "topbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goBack) },
    ...{ class: "btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.exportPdfClick) },
    ...{ class: "btn primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "canvas" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "pageRef",
    ...{ class: "page" },
});
/** @type {typeof __VLS_ctx.pageRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ style: {} },
});
(__VLS_ctx.resume?.meta.title);
for (const [s] of __VLS_getVForSourceType((__VLS_ctx.resume?.sections))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (s.id),
        ...{ style: {} },
    });
    if (s.visible) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (s.title);
    }
    if (s.visible) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
            ...{ style: {} },
        });
        for (const [it, idx] of __VLS_getVForSourceType((s.items))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: (idx),
            });
            (__VLS_ctx.formatItem(it));
        }
    }
}
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            resume: resume,
            pageRef: pageRef,
            goBack: goBack,
            formatItem: formatItem,
            exportPdfClick: exportPdfClick,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
