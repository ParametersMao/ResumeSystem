import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import CoreResumePreview from '@/components/core-resume/CoreResumePreview.vue';
import { buildResumeTitle, createEmptyDocument, ensureAllSections, parseResumeContent } from '@/core-resume/model';
import { getResume } from '@/api/resume';
import { useUserStore } from '@/store/user';
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const previewRef = ref(null);
const documentState = ref(createEmptyDocument());
const exporting = ref(false);
const title = computed(() => buildResumeTitle(documentState.value.profile));
onMounted(loadResume);
async function loadResume() {
    try {
        await userStore.initUserState();
        const resume = await getResume(String(route.params.resumeId), userStore.user?.id);
        const parsed = parseResumeContent(resume.content);
        if (parsed) {
            documentState.value = ensureAllSections(parsed);
        }
    }
    catch (error) {
        console.error('加载预览失败:', error);
        ElMessage.error('加载预览失败');
    }
}
function goBack() {
    router.back();
}
async function exportPdf() {
    const sheet = previewRef.value?.sheetRef;
    if (!sheet) {
        return;
    }
    exporting.value = true;
    try {
        const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
            import('html2canvas'),
            import('jspdf'),
        ]);
        const canvas = await html2canvas(sheet, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        const imageHeight = (canvas.height * pageWidth) / canvas.width;
        let remaining = imageHeight;
        let y = 0;
        pdf.addImage(imgData, 'JPEG', 0, y, pageWidth, imageHeight);
        remaining -= pageHeight;
        while (remaining > 0) {
            y = remaining - imageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, y, pageWidth, imageHeight);
            remaining -= pageHeight;
        }
        pdf.save(`${title.value}.pdf`);
    }
    finally {
        exporting.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['preview-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-toolbar']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.title);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar-actions" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.goBack)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.exporting),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.exporting),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.exportPdf)
};
__VLS_11.slots.default;
var __VLS_11;
/** @type {[typeof CoreResumePreview, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(CoreResumePreview, new CoreResumePreview({
    ref: "previewRef",
    document: (__VLS_ctx.documentState),
}));
const __VLS_17 = __VLS_16({
    ref: "previewRef",
    document: (__VLS_ctx.documentState),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
/** @type {typeof __VLS_ctx.previewRef} */ ;
var __VLS_19 = {};
var __VLS_18;
/** @type {__VLS_StyleScopedClasses['preview-page']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-actions']} */ ;
// @ts-ignore
var __VLS_20 = __VLS_19;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CoreResumePreview: CoreResumePreview,
            previewRef: previewRef,
            documentState: documentState,
            exporting: exporting,
            title: title,
            goBack: goBack,
            exportPdf: exportPdf,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
