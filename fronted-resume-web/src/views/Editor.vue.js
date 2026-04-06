import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useResumeStore } from '@/store/resume';
import { getResume, updateResume } from '@/api/resume';
const route = useRoute();
const store = useResumeStore();
const resume = computed(() => store.resume);
const title = computed({
    get: () => resume.value?.meta.title || '',
    set: (v) => store.applyPatch(d => d.meta.title = v)
});
const saveStateLabel = computed(() => ({ idle: '', saving: '保存中...', saved: '已保存', conflict: '有冲突', error: '保存失败' }[store.saveState]));
onMounted(async () => {
    const id = String(route.params.resumeId);
    const data = await getResume(id);
    store.setResume(data);
});
function addWork() {
    if (!resume.value)
        return;
    const section = resume.value.sections.find(s => s.type === 'work');
    const work = { type: 'work', company: '未命名公司', role: '职位', start: '2022-01', end: '2023-12', highlights: ['示例亮点 1', '示例亮点 2'] };
    store.applyPatch(d => {
        if (section) {
            section.items.push(work);
        }
        else {
            const s = { id: crypto.randomUUID(), type: 'work', title: '工作经历', visible: true, items: [work] };
            d.sections.push(s);
        }
    });
}
// 自动保存（去抖）
let timer = null;
watch(() => store.resume, async (val) => {
    if (!val)
        return;
    if (timer)
        clearTimeout(timer);
    store.saveState = 'saving';
    timer = window.setTimeout(async () => {
        try {
            const updated = await updateResume(val.resumeId, val, { version: val.meta.version });
            store.setResume(updated);
            store.saveState = 'saved';
        }
        catch (e) {
            store.saveState = e?.response?.status === 409 ? 'conflict' : 'error';
        }
    }, 800);
}, { deep: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "topbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ style: {} },
});
(__VLS_ctx.title);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.saveStateLabel);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "btn" },
    to: (`/preview/${__VLS_ctx.resume?.resumeId}`),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "btn" },
    to: (`/preview/${__VLS_ctx.resume?.resumeId}`),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.addWork) },
    ...{ class: "btn primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel left" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ style: {} },
});
for (const [s] of __VLS_getVForSourceType((__VLS_ctx.resume?.sections))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (s.id),
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: "checkbox",
    });
    (s.visible);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (s.title);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "canvas" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ style: {} },
});
(__VLS_ctx.title);
for (const [s] of __VLS_getVForSourceType((__VLS_ctx.resume?.sections))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        key: (s.id),
        ...{ style: {} },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (s.visible) }, null, null);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (s.title);
    for (const [it, i] of __VLS_getVForSourceType((s.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (i),
            ...{ style: {} },
        });
        if (it.type === 'work') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            (it.company);
            (it.role);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({
                ...{ style: {} },
            });
            (it.start);
            (it.end || '至今');
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
                ...{ style: {} },
            });
            for (const [h, idx] of __VLS_getVForSourceType((it.highlights))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                    key: (idx),
                });
                (h);
            }
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel right" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "color",
});
(__VLS_ctx.resume.style.themeColor);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    min: "10",
    max: "14",
});
(__VLS_ctx.resume.style.fontSize);
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['left']} */ ;
/** @type {__VLS_StyleScopedClasses['canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['right']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            resume: resume,
            title: title,
            saveStateLabel: saveStateLabel,
            addWork: addWork,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
