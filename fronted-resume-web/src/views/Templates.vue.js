import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, View, Plus, Picture, Upload } from '@element-plus/icons-vue';
import { fetchTemplates, getTemplateDetail } from '@/api/template';
import { normalizeTemplateFile, normalizeTemplateData } from '@/utils/templateFile';
import { transformProfileDataToSections } from '@/utils/dataTransform';
import NewResumePreview from '@/components/resume/NewResumePreview.vue';
const list = ref([]);
const total = ref(0);
const page = ref(1);
const limit = ref(8);
const keyword = ref('');
const router = useRouter();
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const tagOptions = ['互联网', '金融', '制造', '教育', '医疗', '设计', '运营', '产品', '测试', '数据'];
const selectedTags = ref([]);
async function load() {
    const data = await fetchTemplates(page.value, limit.value, keyword.value, selectedTags.value);
    list.value = data.list;
    total.value = data.total;
}
// 预览与使用弹窗
const previewVisible = ref(false);
const currentTemplateId = ref('');
const autoUseAfterConfirm = ref(false);
const activeTab = ref('preview');
const profileJson = ref(JSON.stringify({
    basic: { name: '张三', title: '前端工程师', contacts: { email: 'zhangsan@example.com', phone: '13800138000', site: 'https://example.com' } },
    summary: '拥有3+年前端经验，熟悉 Vue3/TypeScript，关注性能与体验。',
    experience: [{ company: '示例公司A', role: '前端工程师', start: '2022-01', end: '2023-12', desc: '负责核心业务前端研发与性能优化。' }],
    education: [{ school: '北京大学', degree: '计算机科学 本科', start: '2016-09', end: '2020-06' }],
    skills: ['JavaScript', 'TypeScript', 'Vue3', 'Vite', 'Pinia'],
    projects: [{ name: '在线简历平台', role: '前端负责人', date: '2023', desc: '搭建在线编辑与导出能力。' }]
}, null, 2));
const templateDataJson = ref(null);
const normalizedTemplateData = ref(null);
const templateDiagnostics = ref(null);
const templateValidation = ref(null);
const uploadInputRef = ref(null);
const isUploadingTemplate = ref(false);
const previewResumeData = computed(() => {
    const profile = safeParse(profileJson.value);
    return transformProfileDataToSections(profile || {});
});
const normalizedTemplateType = computed(() => {
    const layoutType = normalizedTemplateData.value?.layout?.type;
    return layoutType || normalizedTemplateData.value?.templateType || 'single-column';
});
function openPreview(templateId) {
    currentTemplateId.value = templateId;
    autoUseAfterConfirm.value = false;
    activeTab.value = 'preview';
    templateValidation.value = null;
    templateDiagnostics.value = null;
    normalizedTemplateData.value = null;
    loadTemplateAndRender();
}
function useTemplate(templateId) {
    // 在新标签页中打开编辑器
    const editorUrl = `/resume-editor?templateId=${templateId}`;
    window.open(editorUrl, '_blank');
}
function triggerTemplateUpload() {
    uploadInputRef.value?.click();
}
async function handleTemplateUpload(event) {
    const target = event.target;
    const file = target.files?.[0];
    if (!file)
        return;
    try {
        isUploadingTemplate.value = true;
        const text = await file.text();
        const result = normalizeTemplateFile(text);
        templateDataJson.value = result.raw;
        normalizedTemplateData.value = result.normalized;
        templateValidation.value = result.validation;
        templateDiagnostics.value = result.diagnostics;
        if (templateValidation.value?.success) {
            ElMessage.success('模板校验通过，可以预览并使用该模板');
        }
        else {
            ElMessage.warning('模板结构存在问题，请检查校验结果');
        }
        if (result.format === 'old') {
            ElMessage.info('已检测到旧格式模板，系统已自动转换为新格式进行预览');
        }
        previewVisible.value = true;
        currentTemplateId.value = '';
        activeTab.value = templateValidation.value?.success ? 'preview' : 'validation';
    }
    catch (error) {
        console.error('本地模板解析失败:', error);
        ElMessage.error('上传的模板文件解析失败，请确认 JSON 格式');
    }
    finally {
        isUploadingTemplate.value = false;
        if (target) {
            target.value = '';
        }
    }
}
async function loadTemplateAndRender() {
    if (!currentTemplateId.value)
        return;
    try {
        const detail = await getTemplateDetail(currentTemplateId.value);
        console.log('用户端获取到的模板详情:', detail); // 调试日志
        // 解析模板数据
        let templateDataObj;
        if (typeof detail.templateData === 'string') {
            templateDataObj = JSON.parse(detail.templateData);
        }
        else {
            templateDataObj = detail.templateData || {};
        }
        console.log('用户端解析后的模板数据:', templateDataObj); // 调试日志
        console.log('用户端模板颜色配置:', templateDataObj?.styles?.colors); // 调试日志
        const normalized = normalizeTemplateData(templateDataObj);
        templateDataJson.value = normalized.raw;
        normalizedTemplateData.value = normalized.normalized;
        templateDiagnostics.value = normalized.diagnostics;
        templateValidation.value = normalized.validation;
        if (templateValidation.value && !templateValidation.value.success) {
            ElMessage.warning('模板校验未通过，已列出问题，仍可预览。');
        }
        previewVisible.value = true;
    }
    catch (error) {
        console.error('加载模板详情失败:', error);
        // 生成错误预览
        templateDataJson.value = null;
        normalizedTemplateData.value = null;
        previewVisible.value = true;
    }
}
function safeParse(v) { try {
    return JSON.parse(v);
}
catch {
    return {};
} }
async function confirmUse() {
    if (!currentTemplateId.value)
        return;
    // 这个函数现在已被 useTemplate 替代，保留兼容性
    useTemplate(currentTemplateId.value);
    previewVisible.value = false;
}
function createProject() {
    // 创建新项目的逻辑，暂时跳转到模板选择
    router.push('/templates');
}
function buildResumeFrom(tpl, profile, resumeId, templateId) {
    const theme = tpl?.styles?.colors?.primary || '#2e6cff';
    const fontFamily = (tpl?.styles?.fonts?.body) || 'Source Han Sans';
    const basic = profile?.basic || {};
    const exps = Array.isArray(profile?.experience) ? profile.experience : [];
    const summary = profile?.summary || '';
    const sections = [];
    if (summary)
        sections.push({ id: crypto.randomUUID(), type: 'summary', title: '个人简介', visible: true, items: [{ type: 'summary', content: summary }] });
    if (exps.length)
        sections.push({ id: crypto.randomUUID(), type: 'work', title: '工作经历', visible: true, items: exps.map((e) => ({ type: 'work', company: e.company, role: e.role, start: e.start, end: e.end, highlights: e.desc ? [e.desc] : [] })) });
    const margins = [48, 48, 48, 48];
    return {
        resumeId,
        userId: 'u_1',
        templateId,
        meta: { title: basic.title ? `${basic.name || '我的'} - ${basic.title}` : (basic.name || '我的简历'), updatedAt: Date.now(), version: 1 },
        style: { themeColor: theme, fontFamily, fontSize: 12, lineHeight: 1.4, page: { margin: margins, columns: 1 } },
        sections
    };
}
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['template-card']} */ ;
/** @type {__VLS_StyleScopedClasses['template-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['template-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['json-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['issues-list']} */ ;
/** @type {__VLS_StyleScopedClasses['template-data-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "templates-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-right" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    ...{ class: "upload-btn" },
    loading: (__VLS_ctx.isUploadingTemplate),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    ...{ class: "upload-btn" },
    loading: (__VLS_ctx.isUploadingTemplate),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.triggerTemplateUpload)
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
var __VLS_3;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "warning",
    ...{ class: "create-btn" },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "warning",
    ...{ class: "create-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.createProject)
};
__VLS_19.slots.default;
const __VLS_24 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-row" },
});
const __VLS_32 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索模板名称...",
    ...{ class: "search-input" },
    clearable: true,
}));
const __VLS_34 = __VLS_33({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索模板名称...",
    ...{ class: "search-input" },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onKeyup: (__VLS_ctx.load)
};
__VLS_35.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_35.slots;
    const __VLS_40 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ class: "search-icon" },
    }));
    const __VLS_42 = __VLS_41({
        ...{ class: "search-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    const __VLS_44 = {}.Search;
    /** @type {[typeof __VLS_components.Search, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
    const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    var __VLS_43;
}
var __VLS_35;
const __VLS_48 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedTags),
    multiple: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    clearable: true,
    placeholder: "行业标签筛选",
    ...{ class: "tag-select" },
}));
const __VLS_50 = __VLS_49({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedTags),
    multiple: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    clearable: true,
    placeholder: "行业标签筛选",
    ...{ class: "tag-select" },
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onChange: (__VLS_ctx.load)
};
__VLS_51.slots.default;
for (const [t] of __VLS_getVForSourceType((__VLS_ctx.tagOptions))) {
    const __VLS_56 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        key: (t),
        label: (t),
        value: (t),
    }));
    const __VLS_58 = __VLS_57({
        key: (t),
        label: (t),
        value: (t),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
}
var __VLS_51;
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.handleTemplateUpload) },
    ref: "uploadInputRef",
    type: "file",
    accept: "application/json,.json,.template",
    ...{ class: "hidden-file-input" },
});
/** @type {typeof __VLS_ctx.uploadInputRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "template-grid" },
});
const __VLS_60 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    gutter: (24),
}));
const __VLS_62 = __VLS_61({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
for (const [t] of __VLS_getVForSourceType((__VLS_ctx.list))) {
    const __VLS_64 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        key: (t.templateId),
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        xl: (6),
        ...{ class: "template-col" },
    }));
    const __VLS_66 = __VLS_65({
        key: (t.templateId),
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        xl: (6),
        ...{ class: "template-col" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    const __VLS_68 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ class: "template-card" },
        shadow: "hover",
    }));
    const __VLS_70 = __VLS_69({
        ...{ class: "template-card" },
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-preview" },
    });
    if (t.coverUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (t.coverUrl),
            alt: "模板封面",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-placeholder" },
        });
        const __VLS_72 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            size: "40",
            color: "#ccc",
        }));
        const __VLS_74 = __VLS_73({
            size: "40",
            color: "#ccc",
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        const __VLS_76 = {}.Picture;
        /** @type {[typeof __VLS_components.Picture, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
        const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
        var __VLS_75;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "template-name" },
    });
    (t.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "template-theme" },
    });
    (t.themeColor);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-actions" },
    });
    const __VLS_80 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_84;
    let __VLS_85;
    let __VLS_86;
    const __VLS_87 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openPreview(t.templateId);
        }
    };
    __VLS_83.slots.default;
    const __VLS_88 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
    const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    const __VLS_92 = {}.View;
    /** @type {[typeof __VLS_components.View, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
    const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
    var __VLS_91;
    var __VLS_83;
    const __VLS_96 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_100;
    let __VLS_101;
    let __VLS_102;
    const __VLS_103 = {
        onClick: (...[$event]) => {
            __VLS_ctx.useTemplate(t.templateId);
        }
    };
    __VLS_99.slots.default;
    const __VLS_104 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({}));
    const __VLS_106 = __VLS_105({}, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_107.slots.default;
    const __VLS_108 = {}.Plus;
    /** @type {[typeof __VLS_components.Plus, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
    const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
    var __VLS_107;
    var __VLS_99;
    var __VLS_71;
    var __VLS_67;
}
var __VLS_63;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pagination-section" },
});
const __VLS_112 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.limit),
    total: (__VLS_ctx.total),
    pageSizes: ([8, 16, 24, 32]),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_114 = __VLS_113({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.limit),
    total: (__VLS_ctx.total),
    pageSizes: ([8, 16, 24, 32]),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
let __VLS_116;
let __VLS_117;
let __VLS_118;
const __VLS_119 = {
    onSizeChange: (__VLS_ctx.load)
};
const __VLS_120 = {
    onCurrentChange: (__VLS_ctx.load)
};
var __VLS_115;
const __VLS_121 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    modelValue: (__VLS_ctx.previewVisible),
    title: "模板预览",
    width: "90%",
    top: "5vh",
    closeOnClickModal: (false),
    destroyOnClose: true,
}));
const __VLS_123 = __VLS_122({
    modelValue: (__VLS_ctx.previewVisible),
    title: "模板预览",
    width: "90%",
    top: "5vh",
    closeOnClickModal: (false),
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_124.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-content" },
});
const __VLS_125 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "preview-tabs" },
}));
const __VLS_127 = __VLS_126({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "preview-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
__VLS_128.slots.default;
const __VLS_129 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    label: "渲染效果",
    name: "preview",
}));
const __VLS_131 = __VLS_130({
    label: "渲染效果",
    name: "preview",
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_132.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-renderer" },
});
if (__VLS_ctx.normalizedTemplateData) {
    /** @type {[typeof NewResumePreview, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(NewResumePreview, new NewResumePreview({
        resumeData: (__VLS_ctx.previewResumeData),
        templateData: (__VLS_ctx.normalizedTemplateData),
        templateType: (__VLS_ctx.normalizedTemplateType),
    }));
    const __VLS_134 = __VLS_133({
        resumeData: (__VLS_ctx.previewResumeData),
        templateData: (__VLS_ctx.normalizedTemplateData),
        templateType: (__VLS_ctx.normalizedTemplateType),
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
}
else {
    const __VLS_136 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        description: "暂无可预览模板",
    }));
    const __VLS_138 = __VLS_137({
        description: "暂无可预览模板",
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
}
var __VLS_132;
const __VLS_140 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    label: "可编辑数据",
    name: "data",
}));
const __VLS_142 = __VLS_141({
    label: "可编辑数据",
    name: "data",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "data-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "data-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_144 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    ...{ 'onClick': {} },
    size: "small",
}));
const __VLS_146 = __VLS_145({
    ...{ 'onClick': {} },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
let __VLS_148;
let __VLS_149;
let __VLS_150;
const __VLS_151 = {
    onClick: (...[$event]) => {
        __VLS_ctx.loadTemplateAndRender();
    }
};
__VLS_147.slots.default;
var __VLS_147;
const __VLS_152 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    modelValue: (__VLS_ctx.profileJson),
    type: "textarea",
    rows: (20),
    placeholder: "请输入JSON格式的个人信息数据",
    ...{ class: "json-editor" },
}));
const __VLS_154 = __VLS_153({
    modelValue: (__VLS_ctx.profileJson),
    type: "textarea",
    rows: (20),
    placeholder: "请输入JSON格式的个人信息数据",
    ...{ class: "json-editor" },
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "data-tip" },
});
var __VLS_143;
const __VLS_156 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    label: "模板数据",
    name: "template",
}));
const __VLS_158 = __VLS_157({
    label: "模板数据",
    name: "template",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
const __VLS_160 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    ...{ class: "template-data-card" },
}));
const __VLS_162 = __VLS_161({
    ...{ class: "template-data-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
    ...{ class: "template-data-content" },
});
(JSON.stringify(__VLS_ctx.normalizedTemplateData || __VLS_ctx.templateDataJson, null, 2));
var __VLS_163;
var __VLS_159;
const __VLS_164 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    label: "校验结果",
    name: "validation",
}));
const __VLS_166 = __VLS_165({
    label: "校验结果",
    name: "validation",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "validation-panel" },
});
if (__VLS_ctx.templateValidation) {
    if (__VLS_ctx.templateValidation.success) {
        const __VLS_168 = {}.ElResult;
        /** @type {[typeof __VLS_components.ElResult, typeof __VLS_components.elResult, ]} */ ;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
            icon: "success",
            title: "校验通过",
            subTitle: "模板结构符合规范，可正常使用。",
        }));
        const __VLS_170 = __VLS_169({
            icon: "success",
            title: "校验通过",
            subTitle: "模板结构符合规范，可正常使用。",
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "issues-list" },
        });
        const __VLS_172 = {}.ElAlert;
        /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
        // @ts-ignore
        const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
            type: "error",
            closable: (false),
            title: "模板存在以下格式问题：",
            ...{ class: "issues-alert" },
        }));
        const __VLS_174 = __VLS_173({
            type: "error",
            closable: (false),
            title: "模板存在以下格式问题：",
            ...{ class: "issues-alert" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_173));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        for (const [issue, idx] of __VLS_getVForSourceType((__VLS_ctx.templateValidation.issues))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: (idx),
            });
            (issue);
        }
    }
}
else {
    const __VLS_176 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        description: "尚未进行校验",
    }));
    const __VLS_178 = __VLS_177({
        description: "尚未进行校验",
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
}
if (__VLS_ctx.templateDiagnostics && __VLS_ctx.templateDiagnostics.warnings.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "issues-list" },
    });
    const __VLS_180 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        type: "warning",
        closable: (false),
        title: "模板兼容性提示：",
        ...{ class: "issues-alert" },
    }));
    const __VLS_182 = __VLS_181({
        type: "warning",
        closable: (false),
        title: "模板兼容性提示：",
        ...{ class: "issues-alert" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
    for (const [warning, idx] of __VLS_getVForSourceType((__VLS_ctx.templateDiagnostics.warnings))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (`warn-${idx}`),
        });
        (warning.message);
        (warning.path);
    }
}
var __VLS_167;
var __VLS_128;
{
    const { footer: __VLS_thisSlot } = __VLS_124.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_184 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        ...{ 'onClick': {} },
    }));
    const __VLS_186 = __VLS_185({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    let __VLS_188;
    let __VLS_189;
    let __VLS_190;
    const __VLS_191 = {
        onClick: (...[$event]) => {
            __VLS_ctx.previewVisible = false;
        }
    };
    __VLS_187.slots.default;
    var __VLS_187;
    const __VLS_192 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        ...{ 'onClick': {} },
    }));
    const __VLS_194 = __VLS_193({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    let __VLS_196;
    let __VLS_197;
    let __VLS_198;
    const __VLS_199 = {
        onClick: (...[$event]) => {
            __VLS_ctx.loadTemplateAndRender();
        }
    };
    __VLS_195.slots.default;
    var __VLS_195;
    const __VLS_200 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_202 = __VLS_201({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    let __VLS_204;
    let __VLS_205;
    let __VLS_206;
    const __VLS_207 = {
        onClick: (...[$event]) => {
            __VLS_ctx.confirmUse();
        }
    };
    __VLS_203.slots.default;
    (__VLS_ctx.autoUseAfterConfirm ? '确定使用' : '使用模板');
    var __VLS_203;
}
var __VLS_124;
/** @type {__VLS_StyleScopedClasses['templates-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-row']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-select']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden-file-input']} */ ;
/** @type {__VLS_StyleScopedClasses['template-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['template-col']} */ ;
/** @type {__VLS_StyleScopedClasses['template-card']} */ ;
/** @type {__VLS_StyleScopedClasses['template-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['template-info']} */ ;
/** @type {__VLS_StyleScopedClasses['template-name']} */ ;
/** @type {__VLS_StyleScopedClasses['template-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['template-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-section']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-content']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['data-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['data-header']} */ ;
/** @type {__VLS_StyleScopedClasses['json-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['data-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['template-data-card']} */ ;
/** @type {__VLS_StyleScopedClasses['template-data-content']} */ ;
/** @type {__VLS_StyleScopedClasses['validation-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['issues-list']} */ ;
/** @type {__VLS_StyleScopedClasses['issues-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['issues-list']} */ ;
/** @type {__VLS_StyleScopedClasses['issues-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Search: Search,
            View: View,
            Plus: Plus,
            Picture: Picture,
            Upload: Upload,
            NewResumePreview: NewResumePreview,
            list: list,
            total: total,
            page: page,
            limit: limit,
            keyword: keyword,
            tagOptions: tagOptions,
            selectedTags: selectedTags,
            load: load,
            previewVisible: previewVisible,
            autoUseAfterConfirm: autoUseAfterConfirm,
            activeTab: activeTab,
            profileJson: profileJson,
            templateDataJson: templateDataJson,
            normalizedTemplateData: normalizedTemplateData,
            templateDiagnostics: templateDiagnostics,
            templateValidation: templateValidation,
            uploadInputRef: uploadInputRef,
            isUploadingTemplate: isUploadingTemplate,
            previewResumeData: previewResumeData,
            normalizedTemplateType: normalizedTemplateType,
            openPreview: openPreview,
            useTemplate: useTemplate,
            triggerTemplateUpload: triggerTemplateUpload,
            handleTemplateUpload: handleTemplateUpload,
            loadTemplateAndRender: loadTemplateAndRender,
            confirmUse: confirmUse,
            createProject: createProject,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
