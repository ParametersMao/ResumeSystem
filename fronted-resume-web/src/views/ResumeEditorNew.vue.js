import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import StylePanel from '@/components/editor/StylePanel.vue';
import CustomSectionConfig from '@/components/editor/CustomSectionConfig.vue';
import AiPolishPanel from '@/components/editor/AiPolishPanel.vue';
import ModuleListEditor from '@/components/editor/ModuleListEditor.vue';
import { getTemplateDetail } from '@/api/template';
import { createResume, getResume, updateResume, listResumeVersions, rollbackResumeVersion } from '@/api/resume';
import { useUserStore } from '@/store/user';
import NewResumePreview from '@/components/resume/NewResumePreview.vue';
import { transformProfileDataToSections, createNewSection, reorderSections } from '@/utils/dataTransform';
import { createEmptyRichText, normalizeSectionRichText } from '@/utils/richText';
import { adaptLegacyTemplateData, adaptLegacyResumeData } from '@/utils/templateAdapter';
import { applyTemplateToResume } from '@/utils/templateMapper';
import { isBasicSection, getCanonicalSectionType } from '@/utils/sectionType';
import { exportResumePdfByHtml } from '@/api/resume';
import { buildExportHtmlDocument, buildResumeBodyHtml, exportResumeWithPagedjs } from '@/utils/pagedExport';
import { DEFAULT_SECTION_TITLES, SECTION_TYPE_OPTIONS } from '@/config/sectionTypes';
import { aiGenerate } from '@/api/ai';
// 已移除 moduleStateManager 依赖，统一以 resumeData.sections 为数据源
// 其他组件已在上面导入
// 路由参数
const route = useRoute();
const templateId = route.query.templateId;
const resumeId = route.query.resumeId;
// 用户状态
const userStore = useUserStore();
// 响应式数据
const resume = ref(null);
const templateData = ref(null);
const templateMetaName = ref('');
const settingsCollapsed = ref(true);
const saveStatus = ref('idle');
const showCustomConfig = ref(false);
const customCss = ref('');
const aiVisible = ref(false);
const currentRichText = ref('');
const aiTarget = ref(null);
const highlightedSectionId = ref(null);
const moduleListRef = ref(null);
const previewContainerRef = ref(null);
const exportPdfLoading = ref(false);
// 版本历史
const versionsVisible = ref(false);
const versionsLoading = ref(false);
const versions = ref([]);
// 岗位生成
const jobDialogVisible = ref(false);
const jobGenerating = ref(false);
const jobForm = ref({ jobTitle: '' });
// 简历数据 - 新的结构
const resumeData = ref({
    profile: {
        basic: {
            name: '',
            title: '',
            contacts: {
                email: '',
                phone: '',
                site: ''
            }
        },
        summary: ''
    },
    sections: [
        { id: `basic-${Date.now()}`, type: 'basic', title: '个人信息', visible: true, order: 0, items: [] }
    ]
});
// 模板样式
const templateStyles = ref({
    colors: {
        primary: '#3498db',
        secondary: '#f0f8ff',
        text: '#2c3e50',
        background: '#ffffff'
    },
    fonts: {
        heading: 'Montserrat, sans-serif',
        body: 'Open Sans, sans-serif'
    },
    spacing: {
        sectionMargin: '25px',
        elementMargin: '15px'
    }
});
function extractOverridesFromSection(section) {
    if (!section)
        return undefined;
    return {
        title: section.title,
        visible: section.visible,
        config: section.config,
        style: section.style,
        order: section.order
    };
}
function buildBasicSection(overrides) {
    const sections = resumeData.value.sections || [];
    const existing = sections.find((section) => isBasicSection(section.type));
    const base = existing
        ? { ...existing, type: 'basic' }
        : {
            id: `basic-${Date.now()}`,
            type: 'basic',
            title: '个人信息',
            visible: true,
            order: 0,
            items: [],
            config: {}
        };
    if (overrides?.title)
        base.title = overrides.title;
    if (overrides?.visible !== undefined)
        base.visible = overrides.visible;
    if (overrides?.config) {
        base.config = { ...overrides.config };
    }
    else if (!base.config) {
        base.config = {};
    }
    if (overrides?.style) {
        base.style = { ...overrides.style };
    }
    else if (!base.style) {
        base.style = {};
    }
    if (overrides?.order !== undefined) {
        base.order = overrides.order;
    }
    return base;
}
function setSectionsKeepingBasic(sectionsInput, explicitOverrides) {
    const sections = Array.isArray(sectionsInput) ? sectionsInput : [];
    const inlineBasic = explicitOverrides ? undefined : sections.find((section) => isBasicSection(section.type));
    const overrides = explicitOverrides || extractOverridesFromSection(inlineBasic);
    const filteredSections = sections.filter((section) => !isBasicSection(section.type));
    const basicSection = buildBasicSection(overrides);
    const normalized = [basicSection, ...filteredSections].map((section, index) => ({
        ...section,
        type: isBasicSection(section.type) ? 'basic' : section.type,
        order: index
    }));
    resumeData.value.sections = normalized;
    return normalized;
}
// 计算属性
const saveStatusText = computed(() => {
    const statusMap = {
        idle: '',
        saving: '保存中...',
        saved: '已保存',
        error: '保存失败'
    };
    return statusMap[saveStatus.value];
});
// 显示在编辑页左上角的标题：已有简历标题 > 基于模板名的默认标题 > 占位
const displayTitle = computed(() => {
    const existing = resume.value?.title;
    if (existing)
        return existing;
    const tplName = templateMetaName.value || templateData.value?.templateName;
    return tplName ? `基于${tplName}的简历` : '未命名简历';
});
// 动态设置浏览器标签页标题（只显示模板名称）
watch([templateMetaName, templateData], () => {
    const tplName = templateMetaName.value || templateData.value?.templateName;
    if (tplName) {
        document.title = tplName;
    }
    else if (resume.value?.title) {
        document.title = resume.value.title;
    }
    else {
        document.title = '简历编辑器';
    }
}, { immediate: true });
// 预览HTML生成 - 已替换为DynamicResumePreview组件
// const previewHtml = computed(() => {
//   const renderEngine = new ResumeRenderEngine(templateData.value, templateStyles.value)
//   return renderEngine.generateHtml(resumeData.value)
// })
// 初始化
onMounted(async () => {
    if (templateId) {
        await loadTemplate();
    }
    if (resumeId) {
        await loadResume();
    }
    else if (!templateId) {
        // 只有在没有模板ID且没有简历ID时才创建默认模块
        initializeDefaultSections();
    }
});
// 加载模板
async function loadTemplate() {
    try {
        const template = await getTemplateDetail(templateId);
        console.log('加载模板详情:', template);
        const rootTplName = template?.name || template?.templateName;
        if (rootTplName) {
            templateMetaName.value = rootTplName;
        }
        // 处理模板数据（对齐 middle-resume 的多重容错策略）
        function safeParseTemplateData(input) {
            if (!input)
                return {};
            if (typeof input === 'object')
                return input;
            let str = String(input);
            // 1) 直接解析
            try {
                return JSON.parse(str);
            }
            catch { }
            // 2) 清理 BOM 与前后空白再试
            try {
                let cleaned = str.replace(/^\uFEFF/, '').replace(/^\s+/, '').replace(/\s+$/, '');
                return JSON.parse(cleaned);
            }
            catch { }
            // 3) 从第一个 { 截取到最后一个 } 再试
            try {
                const first = str.indexOf('{');
                const last = str.lastIndexOf('}');
                if (first !== -1 && last > first) {
                    const sliced = str.slice(first, last + 1);
                    return JSON.parse(sliced);
                }
            }
            catch { }
            // 4) 兜底：尝试按对象字面量宽松解析（兼容单引号/尾逗号）
            try {
                const first = str.indexOf('{');
                const last = str.lastIndexOf('}');
                const sliced = (first !== -1 && last > first) ? str.slice(first, last + 1) : str;
                const obj = (new Function('return (' + sliced + ')'))();
                if (obj && typeof obj === 'object')
                    return obj;
            }
            catch { }
            // 5) 最终兜底：返回空对象
            return {};
        }
        const parsedTemplateData = safeParseTemplateData(template.templateData);
        if (!parsedTemplateData || Object.keys(parsedTemplateData).length === 0) {
            ElMessage.error('模板数据格式错误，无法加载');
            console.error('Raw templateData:', template.templateData);
            return;
        }
        // 设置模板数据
        templateData.value = parsedTemplateData;
        // 更新样式配置（模板样式）
        if (parsedTemplateData?.styles) {
            Object.assign(templateStyles.value.colors, parsedTemplateData.styles.colors);
            Object.assign(templateStyles.value.fonts, parsedTemplateData.styles.fonts);
            Object.assign(templateStyles.value.spacing, parsedTemplateData.styles.spacing);
        }
        // 同步全局样式（新模板 globalStyles → 简历数据的 globalStyles）
        if (parsedTemplateData?.globalStyles) {
            resumeData.value.globalStyles = parsedTemplateData.globalStyles;
        }
        // 处理两种模板格式：新格式(sections) 和 旧格式(layout)
        if (parsedTemplateData?.sections && Array.isArray(parsedTemplateData.sections)) {
            try {
                mergeTemplateProfile(parsedTemplateData.profile);
                const mergedSections = applyTemplateToResume(parsedTemplateData.sections, resumeData.value.sections);
                const completedSections = ensureAllStandardSections(mergedSections);
                setSectionsKeepingBasic(completedSections);
                console.log('成功回填新格式模板数据到 resumeData:', completedSections);
            }
            catch (sectionError) {
                console.error('回填新格式模板数据时出错:', sectionError);
            }
        }
        else if (parsedTemplateData?.layout && Array.isArray(parsedTemplateData.layout)) {
            // 旧格式：根据 layout 数组创建 sections
            try {
                mergeTemplateProfile(parsedTemplateData.profile);
                // 根据 layout 创建 sections
                const newSections = [];
                let basicOverrides;
                parsedTemplateData.layout.forEach((moduleConfig, index) => {
                    if (!moduleConfig)
                        return;
                    const canonicalType = getCanonicalSectionType(moduleConfig.type) || moduleConfig.type;
                    if (isBasicSection(canonicalType)) {
                        basicOverrides = {
                            title: moduleConfig.title || moduleConfig.config?.title || '基本信息',
                            visible: moduleConfig.visible !== false,
                            config: moduleConfig.config,
                            style: moduleConfig.style,
                            order: moduleConfig.order ?? index
                        };
                        return;
                    }
                    const sectionType = canonicalType;
                    const section = createNewSection(sectionType, newSections);
                    section.title = moduleConfig.config?.title || getDefaultSectionTitle(sectionType);
                    section.order = typeof moduleConfig.order === 'number' ? moduleConfig.order : index;
                    section.visible = moduleConfig.visible !== false;
                    section.config = moduleConfig.config || section.config;
                    section.style = moduleConfig.style || section.style;
                    newSections.push(section);
                });
                const normalizedSections = newSections.map(section => normalizeSectionRichText(section));
                const completedSections = ensureAllStandardSections(normalizedSections);
                setSectionsKeepingBasic(completedSections, basicOverrides);
                console.log('成功根据 layout 创建 sections:', newSections);
            }
            catch (layoutError) {
                console.error('根据 layout 创建 sections 时出错:', layoutError);
            }
        }
        else {
            // 兜底：创建默认模块
            console.log('模板格式不支持，使用默认模块');
            initializeDefaultSections();
        }
        console.log('模板加载完成:', parsedTemplateData);
        // 模板加载成功，清除可能的错误信息
        ElMessage.success('模板加载成功');
    }
    catch (error) {
        ElMessage.error('模板加载失败');
        console.error('Template load error:', error);
    }
}
// 获取模块类型的默认标题
function getDefaultSectionTitle(type) {
    return DEFAULT_SECTION_TITLES[type] || type;
}
const STANDARD_SECTION_TYPES = SECTION_TYPE_OPTIONS.map(option => option.value);
function buildPlaceholderSection(type, visible, order) {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const base = {
        id,
        type,
        title: getDefaultSectionTitle(type),
        visible,
        order,
        items: []
    };
    if (type === 'custom') {
        base.config = {
            fields: [
                { name: 'title', label: '标题', type: 'text', required: true },
                { name: 'content', label: '内容', type: 'textarea', required: false }
            ]
        };
    }
    return base;
}
function ensureAllStandardSections(sectionsInput) {
    const sections = Array.isArray(sectionsInput) ? [...sectionsInput] : [];
    const existingTypes = new Set();
    sections.forEach((section) => {
        const canonical = getCanonicalSectionType(section.type) || section.type;
        if (!canonical || canonical === 'basic')
            return;
        existingTypes.add(canonical);
    });
    let maxOrder = Math.max(-1, ...sections.map(section => section.order || 0));
    STANDARD_SECTION_TYPES.forEach((type) => {
        if (type === 'basic')
            return;
        if (existingTypes.has(type))
            return;
        maxOrder += 1;
        sections.push(buildPlaceholderSection(type, false, maxOrder));
    });
    return sections;
}
function mergeTemplateProfile(templateProfile) {
    if (!templateProfile)
        return;
    const target = resumeData.value.profile;
    if (!target.basic) {
        target.basic = {
            name: '',
            title: '',
            contacts: {
                email: '',
                phone: '',
                site: ''
            }
        };
    }
    const templateBasic = templateProfile.basic || {};
    target.basic.name = target.basic.name || templateBasic.name || '';
    target.basic.title = target.basic.title || templateBasic.title || '';
    const targetContacts = target.basic.contacts || {};
    const templateContacts = templateBasic.contacts || {};
    target.basic.contacts = {
        email: targetContacts.email || templateContacts.email || '',
        phone: targetContacts.phone || templateContacts.phone || '',
        site: targetContacts.site || templateContacts.site || ''
    };
    if (!target.summary && templateProfile.summary) {
        target.summary = templateProfile.summary;
    }
}
// 加载简历
async function loadResume() {
    try {
        const resumeData_api = await getResume(resumeId, userStore.user?.id);
        resume.value = resumeData_api;
        // 解析简历内容
        if (resumeData_api.content) {
            const content = typeof resumeData_api.content === 'string'
                ? JSON.parse(resumeData_api.content)
                : resumeData_api.content;
            if (content.profile) {
                // 如果是新格式的数据
                if (content.sections) {
                    resumeData.value = content;
                }
                else {
                    // 如果是旧格式，转换为新格式
                    resumeData.value = transformProfileDataToSections(content.profile);
                }
            }
            if (content.styles) {
                Object.assign(templateStyles.value, content.styles);
            }
            const normalizedSections = Array.isArray(resumeData.value.sections)
                ? resumeData.value.sections.map(section => normalizeSectionRichText(section))
                : [];
            const completedSections = ensureAllStandardSections(normalizedSections);
            setSectionsKeepingBasic(completedSections);
        }
        ElMessage.success('简历加载成功');
    }
    catch (error) {
        ElMessage.error('简历加载失败');
        console.error('Resume load error:', error);
    }
}
// 初始化默认模块
function initializeDefaultSections() {
    const orderSeed = [];
    const seq = (n) => Array.from({ length: n }).map((_, i) => ({ id: `seed-${i}`, order: i }));
    resumeData.value.sections = [
        { id: `basic-${Date.now()}`, type: 'basic', title: '基本信息', visible: true, order: 0, items: [] },
        { id: `intention-${Date.now() + 1}`, type: 'intention', title: '求职意向', visible: true, order: 1, items: [], config: { fields: [{ name: 'intention', label: '求职意向', type: 'text', required: true }] } },
        createNewSection('education', orderSeed),
        createNewSection('experience', orderSeed),
        createNewSection('projects', orderSeed),
        createNewSection('internship', orderSeed),
        createNewSection('campus', orderSeed),
        createNewSection('skills', orderSeed),
        createNewSection('awards', orderSeed),
        normalizeSectionRichText({
            id: `summary-${Date.now() + 2}`,
            type: 'summary',
            title: '自我评价',
            visible: true,
            order: 9,
            items: [{ text: createEmptyRichText() }],
            config: { fields: [{ name: 'text', label: '自我评价', type: 'textarea', richText: true }] }
        }),
        { id: `hobbies-${Date.now() + 3}`, type: 'hobbies', title: '兴趣爱好', visible: false, order: 10, items: [], config: { fields: [{ name: 'text', label: '兴趣爱好', type: 'text' }] } },
        createNewSection('custom', orderSeed)
    ];
    setSectionsKeepingBasic([...resumeData.value.sections]);
}
// 添加新模块
function addSection(type) {
    if (type === 'custom') {
        showCustomConfig.value = true;
        return;
    }
    const newSection = createNewSection(type, resumeData.value.sections);
    resumeData.value.sections.push(newSection);
    ElMessage.success(`已添加${newSection.title}模块`);
}
// 确认自定义模块配置
function confirmCustomSection(config) {
    const newSection = createNewSection('custom', resumeData.value.sections, config.title);
    newSection.config = {
        fields: config.fields
    };
    resumeData.value.sections.push(newSection);
    showCustomConfig.value = false;
    ElMessage.success(`已添加${config.title}模块`);
}
// 删除模块
function removeSection(sectionId) {
    const index = resumeData.value.sections.findIndex(s => s.id === sectionId);
    if (index > -1) {
        const section = resumeData.value.sections[index];
        resumeData.value.sections.splice(index, 1);
        ElMessage.success(`已删除${section.title}模块`);
    }
}
// 移动模块顺序
function moveSection(sectionId, delta) {
    const idx = resumeData.value.sections.findIndex(s => s.id === sectionId);
    if (idx === -1)
        return;
    const target = idx + delta;
    if (target < 0 || target >= resumeData.value.sections.length)
        return;
    const reordered = reorderSections(resumeData.value.sections, idx, target);
    setSectionsKeepingBasic(reordered);
}
// 设置面板操作
function toggleSettings() {
    settingsCollapsed.value = !settingsCollapsed.value;
}
function updatePreview() {
    // 预览会自动更新，因为使用了计算属性
}
// 供子组件触发 AI 面板
;
window.__RTE_AI_TRIGGER__ = (html) => triggerAiFor(html);
// AI 润色：从外部触发（后续与富文本编辑器集成时调用）
function onAiFromSection(payload) {
    aiTarget.value = { sectionId: payload.sectionId, itemIndex: payload.itemIndex, fieldName: payload.fieldName };
    triggerAiFor(payload.html);
}
function triggerAiFor(text) {
    if (!text) {
        aiVisible.value = false;
        return;
    }
    const html = typeof text === 'string' ? text : (text.html || '');
    currentRichText.value = html;
    aiVisible.value = !!(html && html.trim());
}
function applyAiSuggestion(html) {
    // 精准回填：写回触发AI的具体模块/条目/字段
    if (!aiTarget.value)
        return;
    const { sectionId, itemIndex, fieldName } = aiTarget.value;
    const sec = resumeData.value.sections.find(s => s.id === sectionId);
    if (!sec || !sec.items?.[itemIndex])
        return;
    // 类型断言，确保fieldName可以作为索引
    const item = sec.items[itemIndex];
    item[fieldName] = { html };
}
function handleEditorHighlight(sectionId) {
    highlightedSectionId.value = sectionId;
}
function clearEditorHighlight() {
    highlightedSectionId.value = null;
}
function handleEditorSelect(sectionId) {
    highlightedSectionId.value = sectionId;
}
function handlePreviewHighlight(sectionId) {
    highlightedSectionId.value = sectionId;
    if (sectionId) {
        moduleListRef.value?.scrollToSection(sectionId);
    }
}
function handlePreviewSelect(sectionId) {
    highlightedSectionId.value = sectionId;
    moduleListRef.value?.scrollToSection(sectionId);
}
// 保存简历
async function saveResume() {
    if (!userStore.user?.id) {
        ElMessage.error('请先登录');
        return;
    }
    saveStatus.value = 'saving';
    try {
        // 生成导出HTML（与 JSON 一并保存）
        // 使用新版渲染引擎
        const adaptedTemplate = adaptLegacyTemplateData(templateData.value, 'single-column', templateStyles.value);
        const adaptedResumeData = adaptLegacyResumeData(resumeData.value);
        // 创建一个临时div来渲染HTML以便导出
        const tempDiv = document.createElement('div');
        const tempStyleElement = document.createElement('style');
        // 注入基本样式确保导出页面可用
        const primaryColor = templateStyles.value.colors?.primary || '#2f80ed';
        const exportCss = [
            "body, html { margin: 0; padding: 0; font-family: 'Microsoft YaHei', sans-serif; }",
            '.resume-container { max-width: 860px; margin: 0 auto; padding: 30px; background: white; }',
            '.resume-section { margin-bottom: 20px; }',
            '.section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: ' + primaryColor + '; }',
            '.section-content { font-size: 14px; line-height: 1.6; }'
        ].join('\n');
        tempStyleElement.textContent = exportCss;
        // 使用Renderer生成HTML并应用样式
        const exportTitle = resumeData.value.profile?.basic?.name || '简历';
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${exportTitle}</title>
  ${tempStyleElement.outerHTML}
</head>
<body>
  <div class="resume-container">
    ${tempDiv.innerHTML}
  </div>
</body>
</html>`;
        const content = {
            profile: resumeData.value.profile,
            sections: resumeData.value.sections,
            templateData: templateData.value,
            templateName: templateMetaName.value || templateData.value?.templateName,
            html
        };
        if (resume.value?.id) {
            // 更新现有简历
            await updateResume(resume.value.id.toString(), {
                title: resume.value.title,
                content: JSON.stringify(content),
                version: resume.value.version
            }, userStore.user.id);
        }
        else {
            // 创建新简历
            const title = `基于${(templateMetaName.value || templateData.value?.templateName || '模板')}的简历`;
            const result = await createResume(templateId, title, userStore.user.id, JSON.stringify(content));
            if (result.resumeId) {
                resume.value = { id: parseInt(result.resumeId), title, version: 1 };
                // 更新URL
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('resumeId', result.resumeId);
                window.history.replaceState({}, '', newUrl.toString());
            }
        }
        saveStatus.value = 'saved';
        ElMessage.success('保存成功');
        setTimeout(() => {
            saveStatus.value = 'idle';
        }, 3000);
    }
    catch (error) {
        saveStatus.value = 'error';
        ElMessage.error('保存失败');
        console.error('Save error:', error);
        setTimeout(() => {
            saveStatus.value = 'idle';
        }, 3000);
    }
}
async function exportPdf() {
    const container = previewContainerRef.value;
    if (!container) {
        ElMessage.error('未找到预览区域');
        return;
    }
    const rawName = `${resumeData.value.profile?.basic?.name || '我的简历'}`;
    const safeName = sanitizeFilename(rawName);
    const pdfFilename = `${safeName}.pdf`;
    exportPdfLoading.value = true;
    try {
        // 主路径：服务端 Puppeteer 生成 PDF，一键下载
        try {
            const bodyHtml = buildResumeBodyHtml(container);
            const html = buildExportHtmlDocument({
                title: rawName,
                bodyHtml,
                baseHref: `${location.origin}/`,
                extraCss: customCss.value?.trim() || undefined,
            });
            const { url } = await exportResumePdfByHtml(html);
            if (!url)
                throw new Error('服务端未返回PDF地址');
            await downloadPdfFromUrl(url, pdfFilename);
            ElMessage.success('PDF 导出成功');
            return;
        }
        catch (e) {
            console.error('export pdf by server error', e);
            const serverMsg = e?.response?.data?.message;
            ElMessage.info(serverMsg ? `${serverMsg}，正在尝试打印方式…` : '服务端导出失败，正在尝试打印方式…');
        }
        // 回退A：分页打印（让用户选择“另存为 PDF”）
        try {
            await exportResumeWithPagedjs({ container, title: safeName, extraCss: customCss.value });
            ElMessage.success('已打开打印窗口，请选择保存为 PDF');
            return;
        }
        catch (e) {
            console.error('export pdf pagedjs error', e);
        }
        // 回退B：截图导出（兜底）
        try {
            const scale = 2;
            const canvas = await html2canvas(container, { scale, useCORS: true });
            const imgData = canvas.toDataURL('image/jpeg', 0.92);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.save(pdfFilename);
            ElMessage.success('PDF 导出成功（截图模式）');
        }
        catch (fallbackError) {
            ElMessage.error('导出失败');
            console.error('export pdf fallback error', fallbackError);
        }
    }
    finally {
        exportPdfLoading.value = false;
    }
}
function sanitizeFilename(input) {
    return String(input || '简历')
        .trim()
        .replace(/[\\/:*?"<>|]+/g, '_')
        .replace(/\s+/g, ' ')
        .slice(0, 80) || '简历';
}
async function downloadPdfFromUrl(url, filename) {
    if (url.startsWith('data:application/pdf;base64,')) {
        const base64 = url.split(',')[1] || '';
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++)
            bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        triggerBlobDownload(blob, filename);
        return;
    }
    try {
        const res = await fetch(url, { credentials: 'omit' });
        if (!res.ok)
            throw new Error(`下载失败: ${res.status}`);
        const blob = await res.blob();
        triggerBlobDownload(blob, filename);
    }
    catch (e) {
        // 可能是跨域/CORS 导致无法 fetch，降级打开新窗口
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // 已经提供了可访问的 PDF（新窗口），不要再回退到打印/截图
        return;
    }
}
function triggerBlobDownload(blob, filename) {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
function formatDateTime(input) {
    const d = new Date(input);
    if (Number.isNaN(d.getTime()))
        return String(input || '-');
    return d.toLocaleString('zh-CN');
}
function openVersions() {
    versionsVisible.value = true;
    loadVersions();
}
async function loadVersions() {
    if (!resume.value?.id) {
        versions.value = [];
        return;
    }
    versionsLoading.value = true;
    try {
        const data = await listResumeVersions(String(resume.value.id), userStore.user?.id);
        versions.value = (data || []);
    }
    catch (e) {
        versions.value = [];
    }
    finally {
        versionsLoading.value = false;
    }
}
async function rollbackTo(versionId) {
    if (!resume.value?.id)
        return;
    try {
        const updated = await rollbackResumeVersion(String(resume.value.id), versionId, userStore.user?.id);
        // 重新加载简历内容（以服务端为准）
        resume.value = updated;
        await loadResume();
        ElMessage.success('回滚成功');
        await loadVersions();
    }
    catch (e) {
        ElMessage.error(e?.message || '回滚失败');
    }
}
function openJobGenerate() {
    jobDialogVisible.value = true;
}
function upsertSection(type) {
    const sec = resumeData.value.sections.find((s) => s.type === type);
    if (sec)
        return sec;
    const created = createNewSection(type, resumeData.value.sections);
    resumeData.value.sections.push(created);
    setSectionsKeepingBasic([...resumeData.value.sections]);
    return created;
}
async function generateByJob() {
    const jobTitle = String(jobForm.value.jobTitle || '').trim();
    if (!jobTitle) {
        ElMessage.warning('请输入岗位名称');
        return;
    }
    jobGenerating.value = true;
    try {
        const res = await aiGenerate({ jobTitle });
        if (res.code !== 200)
            throw new Error(res.message || '生成失败');
        // 1) profile.summary
        if (res.data.summary) {
            resumeData.value.profile.summary = res.data.summary;
        }
        // 2) skills
        if (Array.isArray(res.data.skills)) {
            const sec = upsertSection('skills');
            sec.visible = true;
            sec.items = [...res.data.skills];
        }
        // 3) projects（尽量按类型结构填充）
        if (Array.isArray(res.data.projects)) {
            const sec = upsertSection('projects');
            sec.visible = true;
            sec.items = res.data.projects.map((p) => ({
                name: p.name || '项目（示例）',
                role: p.role || '',
                duration: p.duration || { start: '', end: '' },
                desc: p.desc || '',
            }));
        }
        ElMessage.success('已生成并填充（Mock）');
        jobDialogVisible.value = false;
    }
    catch (e) {
        ElMessage.error(e?.message || '生成失败');
    }
    finally {
        jobGenerating.value = false;
    }
}
// 自动保存（防抖）
let saveTimer = null;
watch([resumeData, templateStyles], () => {
    if (saveTimer) {
        clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(() => {
        if (resume.value?.id) {
            saveResume();
        }
    }, 2000);
}, { deep: true });
// 监听模板数据变化，确保模块状态管理同步
watch(templateData, (newTemplate) => {
    // 模板变化时，样式已在 loadTemplate 中合并，此处无需额外状态同步
}, { immediate: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['editor-left']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-header']} */ ;
/** @type {__VLS_StyleScopedClasses['add-section-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-and-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-left']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-open']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-right']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-container']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-iframe']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-left']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-right']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-left']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-right']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-editor" },
    ...{ class: ({ 'ai-open': __VLS_ctx.aiVisible }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.displayTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "save-status" },
});
(__VLS_ctx.saveStatusText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-content" },
});
/** @type {[typeof ModuleListEditor, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ModuleListEditor, new ModuleListEditor({
    ...{ 'onAi': {} },
    ...{ 'onHighlight': {} },
    ...{ 'onClearHighlight': {} },
    ...{ 'onSelect': {} },
    ref: "moduleListRef",
    resumeData: (__VLS_ctx.resumeData),
    highlightedSectionId: (__VLS_ctx.highlightedSectionId),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onAi': {} },
    ...{ 'onHighlight': {} },
    ...{ 'onClearHighlight': {} },
    ...{ 'onSelect': {} },
    ref: "moduleListRef",
    resumeData: (__VLS_ctx.resumeData),
    highlightedSectionId: (__VLS_ctx.highlightedSectionId),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onAi: (__VLS_ctx.onAiFromSection)
};
const __VLS_7 = {
    onHighlight: (__VLS_ctx.handleEditorHighlight)
};
const __VLS_8 = {
    onClearHighlight: (__VLS_ctx.clearEditorHighlight)
};
const __VLS_9 = {
    onSelect: (__VLS_ctx.handleEditorSelect)
};
/** @type {typeof __VLS_ctx.moduleListRef} */ ;
var __VLS_10 = {};
var __VLS_2;
/** @type {[typeof CustomSectionConfig, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(CustomSectionConfig, new CustomSectionConfig({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    ...{ 'onClosed': {} },
    visible: (__VLS_ctx.showCustomConfig),
}));
const __VLS_13 = __VLS_12({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    ...{ 'onClosed': {} },
    visible: (__VLS_ctx.showCustomConfig),
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_15;
let __VLS_16;
let __VLS_17;
const __VLS_18 = {
    onConfirm: (__VLS_ctx.confirmCustomSection)
};
const __VLS_19 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showCustomConfig = false;
    }
};
const __VLS_20 = {
    onClosed: (...[$event]) => {
        __VLS_ctx.showCustomConfig = false;
    }
};
var __VLS_14;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-and-preview" },
    ...{ class: ({ 'with-ai': __VLS_ctx.aiVisible }) },
});
if (__VLS_ctx.aiVisible) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-column" },
    });
    /** @type {[typeof AiPolishPanel, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(AiPolishPanel, new AiPolishPanel({
        ...{ 'onApply': {} },
        ...{ 'onClose': {} },
        visible: (__VLS_ctx.aiVisible),
        inputText: (__VLS_ctx.currentRichText),
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onApply': {} },
        ...{ 'onClose': {} },
        visible: (__VLS_ctx.aiVisible),
        inputText: (__VLS_ctx.currentRichText),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_24;
    let __VLS_25;
    let __VLS_26;
    const __VLS_27 = {
        onApply: (__VLS_ctx.applyAiSuggestion)
    };
    const __VLS_28 = {
        onClose: (...[$event]) => {
            if (!(__VLS_ctx.aiVisible))
                return;
            __VLS_ctx.aiVisible = false;
        }
    };
    var __VLS_23;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-column" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-actions" },
});
const __VLS_29 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    ...{ 'onClick': {} },
    size: "small",
}));
const __VLS_31 = __VLS_30({
    ...{ 'onClick': {} },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_33;
let __VLS_34;
let __VLS_35;
const __VLS_36 = {
    onClick: (__VLS_ctx.saveResume)
};
__VLS_32.slots.default;
var __VLS_32;
const __VLS_37 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    ...{ 'onClick': {} },
    size: "small",
}));
const __VLS_39 = __VLS_38({
    ...{ 'onClick': {} },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_41;
let __VLS_42;
let __VLS_43;
const __VLS_44 = {
    onClick: (__VLS_ctx.openVersions)
};
__VLS_40.slots.default;
var __VLS_40;
const __VLS_45 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    ...{ 'onClick': {} },
    size: "small",
    type: "success",
}));
const __VLS_47 = __VLS_46({
    ...{ 'onClick': {} },
    size: "small",
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
let __VLS_49;
let __VLS_50;
let __VLS_51;
const __VLS_52 = {
    onClick: (__VLS_ctx.openJobGenerate)
};
__VLS_48.slots.default;
var __VLS_48;
const __VLS_53 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
    loading: (__VLS_ctx.exportPdfLoading),
    disabled: (__VLS_ctx.exportPdfLoading),
}));
const __VLS_55 = __VLS_54({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
    loading: (__VLS_ctx.exportPdfLoading),
    disabled: (__VLS_ctx.exportPdfLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
let __VLS_57;
let __VLS_58;
let __VLS_59;
const __VLS_60 = {
    onClick: (__VLS_ctx.exportPdf)
};
__VLS_56.slots.default;
(__VLS_ctx.exportPdfLoading ? '导出中…' : '导出PDF');
var __VLS_56;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-container" },
    ref: "previewContainerRef",
});
/** @type {typeof __VLS_ctx.previewContainerRef} */ ;
/** @type {[typeof NewResumePreview, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(NewResumePreview, new NewResumePreview({
    ...{ 'onSectionHover': {} },
    ...{ 'onSectionSelect': {} },
    resumeData: (__VLS_ctx.resumeData),
    templateData: (__VLS_ctx.templateData),
    templateType: (__VLS_ctx.templateData?.templateType || 'single-column'),
    extraStyles: (__VLS_ctx.templateStyles),
    customCss: (__VLS_ctx.customCss),
    key: (`preview-${Date.now()}`),
    highlightedSectionId: (__VLS_ctx.highlightedSectionId),
}));
const __VLS_62 = __VLS_61({
    ...{ 'onSectionHover': {} },
    ...{ 'onSectionSelect': {} },
    resumeData: (__VLS_ctx.resumeData),
    templateData: (__VLS_ctx.templateData),
    templateType: (__VLS_ctx.templateData?.templateType || 'single-column'),
    extraStyles: (__VLS_ctx.templateStyles),
    customCss: (__VLS_ctx.customCss),
    key: (`preview-${Date.now()}`),
    highlightedSectionId: (__VLS_ctx.highlightedSectionId),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onSectionHover: (__VLS_ctx.handlePreviewHighlight)
};
const __VLS_68 = {
    onSectionSelect: (__VLS_ctx.handlePreviewSelect)
};
var __VLS_63;
/** @type {[typeof StylePanel, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(StylePanel, new StylePanel({
    ...{ 'onToggle': {} },
    ...{ 'onUpdate': {} },
    ...{ 'onUpdate:customCss': {} },
    modelValue: (__VLS_ctx.templateStyles),
    collapsed: (__VLS_ctx.settingsCollapsed),
}));
const __VLS_70 = __VLS_69({
    ...{ 'onToggle': {} },
    ...{ 'onUpdate': {} },
    ...{ 'onUpdate:customCss': {} },
    modelValue: (__VLS_ctx.templateStyles),
    collapsed: (__VLS_ctx.settingsCollapsed),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onToggle: (__VLS_ctx.toggleSettings)
};
const __VLS_76 = {
    onUpdate: (__VLS_ctx.updatePreview)
};
const __VLS_77 = {
    'onUpdate:customCss': (...[$event]) => {
        __VLS_ctx.customCss = $event;
    }
};
var __VLS_71;
if (__VLS_ctx.settingsCollapsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-toggle-collapsed" },
    });
    const __VLS_78 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        ...{ 'onClick': {} },
        text: true,
        ...{ class: "toggle-btn-collapsed" },
    }));
    const __VLS_80 = __VLS_79({
        ...{ 'onClick': {} },
        text: true,
        ...{ class: "toggle-btn-collapsed" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    let __VLS_82;
    let __VLS_83;
    let __VLS_84;
    const __VLS_85 = {
        onClick: (__VLS_ctx.toggleSettings)
    };
    __VLS_81.slots.default;
    const __VLS_86 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({}));
    const __VLS_88 = __VLS_87({}, ...__VLS_functionalComponentArgsRest(__VLS_87));
    __VLS_89.slots.default;
    const __VLS_90 = {}.ArrowLeft;
    /** @type {[typeof __VLS_components.ArrowLeft, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({}));
    const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
    var __VLS_89;
    var __VLS_81;
}
const __VLS_94 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    modelValue: (__VLS_ctx.versionsVisible),
    title: "版本历史",
    size: "520px",
    destroyOnClose: true,
}));
const __VLS_96 = __VLS_95({
    modelValue: (__VLS_ctx.versionsVisible),
    title: "版本历史",
    size: "520px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
__VLS_97.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "versions-toolbar" },
});
const __VLS_98 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
    ...{ 'onClick': {} },
    size: "small",
    loading: (__VLS_ctx.versionsLoading),
}));
const __VLS_100 = __VLS_99({
    ...{ 'onClick': {} },
    size: "small",
    loading: (__VLS_ctx.versionsLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
let __VLS_102;
let __VLS_103;
let __VLS_104;
const __VLS_105 = {
    onClick: (__VLS_ctx.loadVersions)
};
__VLS_101.slots.default;
var __VLS_101;
const __VLS_106 = {}.ElText;
/** @type {[typeof __VLS_components.ElText, typeof __VLS_components.elText, typeof __VLS_components.ElText, typeof __VLS_components.elText, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    type: "info",
}));
const __VLS_108 = __VLS_107({
    type: "info",
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
__VLS_109.slots.default;
var __VLS_109;
const __VLS_110 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
    data: (__VLS_ctx.versions),
    ...{ style: {} },
}));
const __VLS_112 = __VLS_111({
    data: (__VLS_ctx.versions),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.versionsLoading) }, null, null);
__VLS_113.slots.default;
const __VLS_114 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    prop: "id",
    label: "ID",
    width: "90",
}));
const __VLS_116 = __VLS_115({
    prop: "id",
    label: "ID",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
const __VLS_118 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    prop: "sourceVersion",
    label: "源版本",
    width: "90",
}));
const __VLS_120 = __VLS_119({
    prop: "sourceVersion",
    label: "源版本",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
const __VLS_122 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
    prop: "createTime",
    label: "时间",
}));
const __VLS_124 = __VLS_123({
    prop: "createTime",
    label: "时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
__VLS_125.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_125.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(row.createTime));
}
var __VLS_125;
const __VLS_126 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    label: "操作",
    width: "120",
}));
const __VLS_128 = __VLS_127({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
__VLS_129.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_129.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_130 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_132 = __VLS_131({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    let __VLS_134;
    let __VLS_135;
    let __VLS_136;
    const __VLS_137 = {
        onClick: (...[$event]) => {
            __VLS_ctx.rollbackTo(row.id);
        }
    };
    __VLS_133.slots.default;
    var __VLS_133;
}
var __VLS_129;
var __VLS_113;
const __VLS_138 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({}));
const __VLS_140 = __VLS_139({}, ...__VLS_functionalComponentArgsRest(__VLS_139));
const __VLS_142 = {}.ElText;
/** @type {[typeof __VLS_components.ElText, typeof __VLS_components.elText, typeof __VLS_components.ElText, typeof __VLS_components.elText, ]} */ ;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
    type: "info",
}));
const __VLS_144 = __VLS_143({
    type: "info",
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
__VLS_145.slots.default;
var __VLS_145;
var __VLS_97;
const __VLS_146 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    modelValue: (__VLS_ctx.jobDialogVisible),
    title: "基于岗位生成内容",
    width: "520px",
    destroyOnClose: true,
}));
const __VLS_148 = __VLS_147({
    modelValue: (__VLS_ctx.jobDialogVisible),
    title: "基于岗位生成内容",
    width: "520px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
__VLS_149.slots.default;
const __VLS_150 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    model: (__VLS_ctx.jobForm),
    labelWidth: "90px",
}));
const __VLS_152 = __VLS_151({
    model: (__VLS_ctx.jobForm),
    labelWidth: "90px",
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
__VLS_153.slots.default;
const __VLS_154 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    label: "岗位名称",
}));
const __VLS_156 = __VLS_155({
    label: "岗位名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
__VLS_157.slots.default;
const __VLS_158 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    modelValue: (__VLS_ctx.jobForm.jobTitle),
    placeholder: "例如：前端工程师",
    maxlength: "128",
}));
const __VLS_160 = __VLS_159({
    modelValue: (__VLS_ctx.jobForm.jobTitle),
    placeholder: "例如：前端工程师",
    maxlength: "128",
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
var __VLS_157;
var __VLS_153;
{
    const { footer: __VLS_thisSlot } = __VLS_149.slots;
    const __VLS_162 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
        ...{ 'onClick': {} },
    }));
    const __VLS_164 = __VLS_163({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_163));
    let __VLS_166;
    let __VLS_167;
    let __VLS_168;
    const __VLS_169 = {
        onClick: (...[$event]) => {
            __VLS_ctx.jobDialogVisible = false;
        }
    };
    __VLS_165.slots.default;
    var __VLS_165;
    const __VLS_170 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.jobGenerating),
    }));
    const __VLS_172 = __VLS_171({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.jobGenerating),
    }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    let __VLS_174;
    let __VLS_175;
    let __VLS_176;
    const __VLS_177 = {
        onClick: (__VLS_ctx.generateByJob)
    };
    __VLS_173.slots.default;
    var __VLS_173;
}
var __VLS_149;
/** @type {__VLS_StyleScopedClasses['resume-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-left']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-header']} */ ;
/** @type {__VLS_StyleScopedClasses['save-status']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-content']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-right']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-and-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-column']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-column']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-container']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-toggle-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['versions-toolbar']} */ ;
// @ts-ignore
var __VLS_11 = __VLS_10;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ArrowLeft: ArrowLeft,
            StylePanel: StylePanel,
            CustomSectionConfig: CustomSectionConfig,
            AiPolishPanel: AiPolishPanel,
            ModuleListEditor: ModuleListEditor,
            NewResumePreview: NewResumePreview,
            templateData: templateData,
            settingsCollapsed: settingsCollapsed,
            showCustomConfig: showCustomConfig,
            customCss: customCss,
            aiVisible: aiVisible,
            currentRichText: currentRichText,
            highlightedSectionId: highlightedSectionId,
            moduleListRef: moduleListRef,
            previewContainerRef: previewContainerRef,
            exportPdfLoading: exportPdfLoading,
            versionsVisible: versionsVisible,
            versionsLoading: versionsLoading,
            versions: versions,
            jobDialogVisible: jobDialogVisible,
            jobGenerating: jobGenerating,
            jobForm: jobForm,
            resumeData: resumeData,
            templateStyles: templateStyles,
            saveStatusText: saveStatusText,
            displayTitle: displayTitle,
            confirmCustomSection: confirmCustomSection,
            toggleSettings: toggleSettings,
            updatePreview: updatePreview,
            onAiFromSection: onAiFromSection,
            applyAiSuggestion: applyAiSuggestion,
            handleEditorHighlight: handleEditorHighlight,
            clearEditorHighlight: clearEditorHighlight,
            handleEditorSelect: handleEditorSelect,
            handlePreviewHighlight: handlePreviewHighlight,
            handlePreviewSelect: handlePreviewSelect,
            saveResume: saveResume,
            exportPdf: exportPdf,
            formatDateTime: formatDateTime,
            openVersions: openVersions,
            loadVersions: loadVersions,
            rollbackTo: rollbackTo,
            openJobGenerate: openJobGenerate,
            generateByJob: generateByJob,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
