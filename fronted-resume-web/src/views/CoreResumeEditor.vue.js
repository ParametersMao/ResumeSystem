import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import CoreResumePreview from '@/components/core-resume/CoreResumePreview.vue';
import { buildResumeTitle, CORE_SECTION_DEFINITIONS, createEmptyDocument, createSectionItem, ensureAllSections, extractThemeFromTemplate, getSectionDefinition, mergeResumeTheme, parseResumeContent, } from '@/core-resume/model';
import { buildCoreResumePrintHtml } from '@/core-resume/print';
import { resolveTemplatePreset, resolveTemplateVariant } from '@/core-resume/templates';
import { createResume, createResumeVersionSnapshot, exportResumePdfByHtml, getResume, listResumeVersions, rollbackResumeVersion, updateResume, } from '@/api/resume';
import { getTemplateDetail } from '@/api/template';
import { aiGenerate, aiPolish } from '@/api/ai';
import { useUserStore } from '@/store/user';
const AI_POLISH_FIELD_MAP = {
    intention: 'intention',
    education: 'desc',
    summary: 'text',
    experience: 'desc',
    projects: 'desc',
    internship: 'desc',
    campus: 'desc',
    skills: 'name',
    awards: 'name',
    hobbies: 'text',
    custom: 'text',
};
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const previewRef = ref(null);
const documentState = ref(createEmptyDocument());
const saveStatus = ref('idle');
const exportingPdf = ref(false);
const creatingVersion = ref(false);
const stylePanelCollapsed = ref(false);
const collapsedSections = ref(new Set());
const currentResume = ref(null);
const versionDrawerVisible = ref(false);
const versionsLoading = ref(false);
const versionRecords = ref([]);
const rollingBackVersionId = ref(null);
const versionCompareVisible = ref(false);
const versionCompareTarget = ref(null);
const versionCompareData = ref(null);
const aiDialogVisible = ref(false);
const aiLoading = ref(false);
const aiApplying = ref(false);
const aiSuggestions = ref([]);
const selectedAiSuggestionIndex = ref(0);
const aiTokenUsed = ref(0);
const aiProvider = ref('');
const aiModel = ref('');
const aiExecutionMode = ref('');
const aiPromptPreview = ref('');
const aiTargetJobTitle = ref('');
const aiDialogState = ref({
    sectionId: '',
    itemIndex: 0,
    fieldKey: '',
    sectionType: '',
    sectionTitle: '',
    originalText: '',
    actionType: 'polish',
});
const saveTimer = ref(null);
const isBootstrapping = ref(true);
const isApplyingDraft = ref(false);
const lastSavedSnapshot = ref('');
const templateId = computed(() => String(route.query.templateId || ''));
const resumeId = computed(() => String(route.query.resumeId || route.params.resumeId || ''));
const draftStorageKey = computed(() => `core-resume:draft:${resumeId.value || `template:${templateId.value || 'default'}`}`);
const panelStorageKey = computed(() => `core-resume:panel:${templateId.value || 'default'}`);
const hiddenSections = computed(() => documentState.value.sections.filter((section) => !section.visible));
const visibleSectionsCount = computed(() => documentState.value.sections.filter((section) => section.visible).length);
const hasUnsavedChanges = computed(() => serializeDocument() !== lastSavedSnapshot.value);
const currentVersionSummary = computed(() => summarizeVersionContent(serializeDocument()));
const activeTemplatePreset = computed(() => resolveTemplatePreset(documentState.value));
const hasThemeOverrides = computed(() => Object.keys(documentState.value.themeOverrides || {}).length > 0);
const aiDialogTitle = computed(() => (aiDialogState.value.actionType === 'generate' ? 'AI补全建议' : 'AI润色建议'));
const aiDialogSubtitle = computed(() => aiDialogState.value.actionType === 'generate'
    ? '当前模块信息不完整，AI 会基于岗位和已填关键词补全一条可继续编辑的初稿。'
    : '选择一个方案应用，系统会自动保留润色前快照。');
const aiModeTag = computed(() => (aiDialogState.value.actionType === 'generate' ? '补全模式' : '润色模式'));
const aiModeTip = computed(() => aiDialogState.value.actionType === 'generate'
    ? '适合空白模块或只填了少量关键词的场景，系统会尽量保留你已写的信息，只补全缺失内容。'
    : '适合你已经写出初稿的场景，系统会在保留原意的基础上把表达改得更像可投递简历。');
const aiSourceLabel = computed(() => (aiDialogState.value.actionType === 'generate' ? '已填信息' : '原文'));
const aiResultLabel = computed(() => (aiDialogState.value.actionType === 'generate' ? 'AI补全结果' : '润色后'));
const aiEmptySourceText = computed(() => (aiDialogState.value.actionType === 'generate' ? '当前还没有可参考内容' : '暂无内容'));
const aiExecutionModeLabel = computed(() => {
    switch (aiExecutionMode.value) {
        case 'mock':
            return 'Mock 模式';
        case 'live':
            return 'Live 模式';
        case 'prepared':
            return 'Prepared 模式';
        default:
            return '未运行';
    }
});
const aiExecutionTip = computed(() => {
    switch (aiExecutionMode.value) {
        case 'live':
            return '当前请求已经走真实外部 provider。';
        case 'prepared':
            return '当前已切到可接外部 API 的准备模式。';
        case 'mock':
            return '当前仍是 mock 联调模式。';
        default:
            return '点击 AI 润色后会显示本次运行信息。';
    }
});
const saveStatusText = computed(() => {
    switch (saveStatus.value) {
        case 'saving':
            return '正在保存...';
        case 'saved':
            return '已保存';
        case 'error':
            return '保存失败，请稍后重试';
        default:
            return hasUnsavedChanges.value ? '有未保存改动，系统会自动保存' : '实时预览已就绪';
    }
});
onMounted(async () => {
    await userStore.initUserState();
    await initializeEditor();
    window.addEventListener('beforeunload', handleBeforeUnload);
});
onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    if (saveTimer.value) {
        clearTimeout(saveTimer.value);
    }
});
watch(documentState, () => {
    if (isBootstrapping.value) {
        return;
    }
    persistDraft();
    queueAutoSave();
}, { deep: true });
watch(stylePanelCollapsed, (value) => {
    localStorage.setItem(panelStorageKey.value, value ? 'collapsed' : 'expanded');
});
async function initializeEditor() {
    documentState.value = createEmptyDocument();
    stylePanelCollapsed.value = localStorage.getItem(panelStorageKey.value) === 'collapsed';
    if (templateId.value) {
        await loadTemplatePreset(templateId.value);
    }
    if (resumeId.value) {
        await loadExistingResume(resumeId.value);
    }
    restoreDraft();
    lastSavedSnapshot.value = serializeDocument();
    isBootstrapping.value = false;
}
async function loadTemplatePreset(id) {
    try {
        const detail = await getTemplateDetail(id);
        const templateData = parseTemplatePayload(detail.templateData);
        const templateTheme = extractThemeFromTemplate(templateData);
        documentState.value.templateTheme = templateTheme;
        documentState.value.theme = mergeResumeTheme(templateTheme, documentState.value.themeOverrides, documentState.value.theme);
        documentState.value.templateId = id;
        documentState.value.templateName = detail.name || '模板';
        applyTemplateVariant(templateData);
    }
    catch (error) {
        console.error('加载模板失败:', error);
        ElMessage.warning('模板样式加载失败，已使用默认模板继续编辑');
    }
}
async function loadExistingResume(id) {
    try {
        const response = await getResume(id, userStore.user?.id);
        applyResumeResponse(response);
        await refreshVersions();
    }
    catch (error) {
        console.error('加载简历失败:', error);
        ElMessage.error('简历加载失败，请稍后重试');
    }
}
function applyResumeResponse(response) {
    currentResume.value = {
        id: response.id,
        title: response.title,
        version: response.version,
        templateId: response.templateId,
    };
    const parsed = parseResumeContent(response.content);
    if (!parsed) {
        return;
    }
    const shouldPreserveSelectedTemplate = Boolean(templateId.value);
    documentState.value = ensureAllSections({
        ...documentState.value,
        ...parsed,
        theme: shouldPreserveSelectedTemplate
            ? mergeResumeTheme(documentState.value.templateTheme, parsed.themeOverrides, documentState.value.theme)
            : (parsed.theme || documentState.value.theme),
        templateTheme: shouldPreserveSelectedTemplate
            ? documentState.value.templateTheme
            : parsed.templateTheme,
        themeOverrides: parsed.themeOverrides,
        templateId: shouldPreserveSelectedTemplate
            ? (templateId.value || documentState.value.templateId)
            : (parsed.templateId || String(response.templateId || templateId.value || '')),
        templateName: shouldPreserveSelectedTemplate
            ? documentState.value.templateName
            : (parsed.templateName || documentState.value.templateName),
        templateVariant: shouldPreserveSelectedTemplate
            ? documentState.value.templateVariant
            : parsed.templateVariant,
    });
    if (!shouldPreserveSelectedTemplate) {
        applyTemplateVariant();
    }
}
function updateSectionTitle(section, value) {
    section.title = value.trim() || getSectionDefinition(section.type).title;
}
function toggleSectionVisibility(type) {
    const section = documentState.value.sections.find((item) => item.type === type);
    if (!section) {
        return;
    }
    if (section.visible) {
        hideSection(section);
    }
    else {
        showSection(section);
    }
}
function showSection(section) {
    section.visible = true;
    collapsedSections.value.delete(section.id);
}
function hideSection(section) {
    if (visibleSectionsCount.value <= 1) {
        ElMessage.warning('至少保留一个显示中的内容模块');
        return;
    }
    section.visible = false;
    collapsedSections.value.add(section.id);
}
function resetSection(section) {
    const definition = getSectionDefinition(section.type);
    section.title = definition.title;
    section.items = [createSectionItem(section.type)];
    section.visible = true;
    collapsedSections.value.delete(section.id);
}
function toggleCollapse(sectionId) {
    const next = new Set(collapsedSections.value);
    if (next.has(sectionId)) {
        next.delete(sectionId);
    }
    else {
        next.add(sectionId);
    }
    collapsedSections.value = next;
}
function moveSection(index, offset) {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= documentState.value.sections.length) {
        return;
    }
    const sections = [...documentState.value.sections];
    const [current] = sections.splice(index, 1);
    sections.splice(nextIndex, 0, current);
    documentState.value.sections = sections;
}
function addItem(section) {
    section.items.push(createSectionItem(section.type));
}
function removeItem(section, itemIndex) {
    if (!canRemoveItem(section)) {
        return;
    }
    section.items.splice(itemIndex, 1);
}
function canManageItems(section) {
    return getSectionDefinition(section.type).allowMultiple;
}
function canAiPolishSection(section) {
    return Boolean(AI_POLISH_FIELD_MAP[section.type]);
}
function canRemoveItem(section) {
    return canManageItems(section) && section.items.length > 1;
}
function canMoveItem(section) {
    return canManageItems(section) && section.items.length > 1;
}
function moveItem(section, itemIndex, offset) {
    const nextIndex = itemIndex + offset;
    if (nextIndex < 0 || nextIndex >= section.items.length) {
        return;
    }
    const items = [...section.items];
    const [current] = items.splice(itemIndex, 1);
    items.splice(nextIndex, 0, current);
    section.items = items;
}
function readTextValue(item, key) {
    const value = item[key];
    return typeof value === 'string' ? value : '';
}
function writeTextValue(item, key, value) {
    item[key] = value;
}
function resolveTargetJobTitle(section, item) {
    const fromItem = [
        section.type === 'intention' ? readTextValue(item, 'intention') : '',
        readTextValue(item, 'role'),
        readTextValue(item, 'name'),
    ].find((value) => value.trim());
    return fromItem?.trim() || documentState.value.profile.title || '';
}
function getAiEntryLabel(section, itemIndex) {
    const fieldKey = AI_POLISH_FIELD_MAP[section.type];
    if (!fieldKey) {
        return 'AI辅助';
    }
    const item = section.items[itemIndex];
    return readTextValue(item, fieldKey).trim() ? 'AI润色' : 'AI补全';
}
async function openAiPolish(section, itemIndex) {
    const fieldKey = AI_POLISH_FIELD_MAP[section.type];
    if (!fieldKey) {
        ElMessage.warning('当前模块暂不支持 AI 润色');
        return;
    }
    const item = section.items[itemIndex];
    const originalText = readTextValue(item, fieldKey).trim();
    const actionType = originalText ? 'polish' : 'generate';
    aiDialogState.value = {
        sectionId: section.id,
        itemIndex,
        fieldKey,
        sectionType: section.type,
        sectionTitle: section.title,
        originalText,
        actionType,
    };
    aiTargetJobTitle.value = resolveTargetJobTitle(section, item);
    aiDialogVisible.value = true;
    if (actionType === 'generate') {
        await requestAiGenerate(section.type);
        return;
    }
    await requestAiPolish(originalText, section.type);
}
async function rerunAiPolish() {
    if (!aiDialogState.value.sectionType) {
        return;
    }
    if (aiDialogState.value.actionType === 'generate') {
        await requestAiGenerate(aiDialogState.value.sectionType);
        return;
    }
    if (!aiDialogState.value.originalText) {
        return;
    }
    await requestAiPolish(aiDialogState.value.originalText, aiDialogState.value.sectionType);
}
async function requestAiPolish(inputText, sectionType) {
    aiLoading.value = true;
    aiSuggestions.value = [];
    selectedAiSuggestionIndex.value = 0;
    aiTokenUsed.value = 0;
    aiProvider.value = '';
    aiModel.value = '';
    aiExecutionMode.value = '';
    aiPromptPreview.value = '';
    try {
        const response = await aiPolish({
            inputText,
            sectionType,
            jobTitle: aiTargetJobTitle.value,
        });
        aiSuggestions.value = (response.data.suggestions || [])
            .map(normalizeAiSuggestion)
            .filter((suggestion) => suggestion.text);
        aiTokenUsed.value = response.data.tokenUsed || 0;
        aiProvider.value = response.data.provider || '';
        aiModel.value = response.data.model || '';
        aiExecutionMode.value = response.data.executionMode || '';
        aiPromptPreview.value = response.data.promptPreview || '';
    }
    catch (error) {
        console.error('AI 润色失败:', error);
        ElMessage.error('AI 润色失败，请稍后重试');
    }
    finally {
        aiLoading.value = false;
    }
}
async function requestAiGenerate(sectionType) {
    aiLoading.value = true;
    aiSuggestions.value = [];
    selectedAiSuggestionIndex.value = 0;
    aiTokenUsed.value = 0;
    aiProvider.value = '';
    aiModel.value = '';
    aiExecutionMode.value = '';
    aiPromptPreview.value = '';
    try {
        const contextText = buildAiGenerateContext();
        const response = await aiGenerate({
            jobTitle: aiTargetJobTitle.value || documentState.value.profile.title || '目标岗位',
            sectionType,
            contextText,
        });
        aiSuggestions.value = buildGenerateSuggestions(response.data, sectionType);
        aiTokenUsed.value = response.data.tokenUsed || 0;
        aiProvider.value = response.data.provider || '';
        aiModel.value = response.data.model || '';
        aiExecutionMode.value = response.data.executionMode || '';
        aiPromptPreview.value = response.data.promptPreview || '';
    }
    catch (error) {
        console.error('AI 生成失败:', error);
        ElMessage.error('AI 生成失败，请稍后重试');
    }
    finally {
        aiLoading.value = false;
    }
}
function buildAiGenerateContext() {
    const state = aiDialogState.value;
    const section = documentState.value.sections.find((item) => item.id === state.sectionId);
    const targetItem = section?.items[state.itemIndex];
    if (!section || !targetItem) {
        return '';
    }
    const definition = getSectionDefinition(section.type);
    const parts = definition.fields
        .map((field) => {
        if (field.type === 'dateRange') {
            const range = normalizeDuration(targetItem[field.key]);
            const value = formatDurationText(range);
            return value ? `${field.label}：${value}` : '';
        }
        const value = readTextValue(targetItem, field.key).trim();
        return value ? `${field.label}：${value}` : '';
    })
        .filter(Boolean);
    return parts.join('\n');
}
function getAiApplyLabel(suggestion) {
    if (aiDialogState.value.actionType === 'generate') {
        return suggestion.fieldValues ? '一键填入整条内容' : '填入当前内容';
    }
    return '替换当前内容';
}
function buildGenerateSuggestions(data, sectionType) {
    const firstProject = Array.isArray(data.projects) ? data.projects[0] : null;
    const firstExperience = Array.isArray(data.experiences) ? data.experiences[0] : null;
    const projectDesc = firstProject?.desc || firstProject?.content || '';
    const experienceDesc = firstExperience?.desc || firstExperience?.content || '';
    const projectTitle = firstProject?.name ? `项目示例：${firstProject.name}` : '项目示例';
    const experienceTitle = firstExperience?.company ? `经历示例：${firstExperience.company}` : '经历示例';
    const skillsText = Array.isArray(data.skills) ? data.skills.filter(Boolean).join('、') : '';
    const suggestionMap = {
        intention: [
            { reason: '根据目标岗位生成求职意向。', text: data.intention || aiTargetJobTitle.value || documentState.value.profile.title || '目标岗位' },
        ],
        summary: [
            { reason: '生成适合放在自我评价中的职业摘要。', text: data.summary || '' },
        ],
        skills: [
            { reason: '生成与目标岗位匹配的技能关键词。', text: skillsText },
        ],
        projects: [
            buildProjectSuggestion(`${projectTitle} · 成果导向初稿`, firstProject, projectDesc || data.summary),
        ],
        experience: [
            buildExperienceSuggestion(`${experienceTitle} · 成果导向初稿`, firstExperience, experienceDesc || data.summary || projectDesc),
        ],
        internship: [
            buildExperienceSuggestion('生成一段可继续细化的实习成果描述初稿。', firstExperience, experienceDesc || data.summary || projectDesc),
        ],
        campus: [
            buildExperienceSuggestion('生成一段可继续细化的校园成果描述初稿。', firstExperience, experienceDesc || data.summary || projectDesc, 'org'),
        ],
        custom: [
            { reason: '生成一段可继续编辑的自定义内容。', text: data.summary || experienceDesc || projectDesc || skillsText },
        ],
    };
    return (suggestionMap[sectionType] || [
        { reason: '生成一段可直接填入的内容初稿。', text: data.summary || projectDesc || skillsText },
    ]).filter((suggestion) => suggestion.text);
}
function buildExperienceSuggestion(reason, record, fallbackText, organizationKey = 'company') {
    if (!record) {
        return { reason, text: fallbackText };
    }
    const existingFieldValues = getCurrentAiSeedFieldValues();
    const duration = mergeDuration(normalizeDuration(record.duration), normalizeDuration(existingFieldValues.duration));
    const organizationValue = preferSeedValue(record[organizationKey], existingFieldValues[organizationKey]);
    const roleValue = preferSeedValue(record.role, existingFieldValues.role);
    const descValue = preferSeedValue(record.desc, existingFieldValues.desc, fallbackText);
    return {
        reason,
        text: buildStructuredSuggestionText([
            organizationValue,
            roleValue,
            formatDurationText(duration),
            descValue,
        ]),
        fieldValues: {
            [organizationKey]: organizationValue,
            role: roleValue,
            duration,
            desc: descValue,
        },
    };
}
function buildProjectSuggestion(reason, record, fallbackText) {
    if (!record) {
        return { reason, text: fallbackText };
    }
    const existingFieldValues = getCurrentAiSeedFieldValues();
    const duration = mergeDuration(normalizeDuration(record.duration), normalizeDuration(existingFieldValues.duration));
    const nameValue = preferSeedValue(record.name, existingFieldValues.name);
    const roleValue = preferSeedValue(record.role, existingFieldValues.role);
    const descValue = preferSeedValue(record.desc, existingFieldValues.desc, fallbackText);
    return {
        reason,
        text: buildStructuredSuggestionText([
            nameValue,
            roleValue,
            formatDurationText(duration),
            descValue,
        ]),
        fieldValues: {
            name: nameValue,
            role: roleValue,
            duration,
            desc: descValue,
        },
    };
}
function buildStructuredSuggestionText(parts) {
    return parts.filter((part) => String(part || '').trim()).join('\n');
}
function normalizeDuration(value) {
    if (!value || typeof value !== 'object') {
        return { start: '', end: '' };
    }
    return {
        start: String(value.start || ''),
        end: String(value.end || ''),
    };
}
function mergeDuration(primary, fallback) {
    return {
        start: primary.start || fallback.start || '',
        end: primary.end || fallback.end || '',
    };
}
function preferSeedValue(primary, fallback, finalFallback = '') {
    return String(primary || fallback || finalFallback || '');
}
function formatDurationText(duration) {
    return [duration.start, duration.end].filter(Boolean).join(' - ');
}
function getCurrentAiSeedFieldValues() {
    const state = aiDialogState.value;
    const section = documentState.value.sections.find((item) => item.id === state.sectionId);
    const targetItem = section?.items[state.itemIndex];
    if (!targetItem) {
        return {};
    }
    return Object.entries(targetItem).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
            if (value.trim()) {
                acc[key] = value.trim();
            }
            return acc;
        }
        const duration = normalizeDuration(value);
        if (duration.start || duration.end) {
            acc[key] = duration;
        }
        return acc;
    }, {});
}
function normalizeAiSuggestion(suggestion) {
    return {
        reason: suggestion.reason,
        text: htmlToPlainText(suggestion.html),
    };
}
function htmlToPlainText(html) {
    if (!html) {
        return '';
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
    doc.querySelectorAll('li').forEach((node) => {
        const text = node.textContent?.trim() || '';
        node.replaceWith(`• ${text}\n`);
    });
    doc.querySelectorAll('p').forEach((node) => {
        const text = node.textContent?.trim() || '';
        node.replaceWith(`${text}\n`);
    });
    doc.querySelectorAll('div').forEach((node) => {
        if (!node.children.length) {
            const text = node.textContent?.trim() || '';
            node.replaceWith(`${text}\n`);
        }
    });
    const text = doc.body.textContent || '';
    return text
        .replace(/\u00a0/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+\n/g, '\n')
        .trim();
}
async function applyAiSuggestion(suggestion) {
    if (!userStore.user?.id) {
        ElMessage.warning('请先登录后再使用 AI 润色');
        return;
    }
    const state = aiDialogState.value;
    if (!state.sectionId || !state.fieldKey) {
        return;
    }
    aiApplying.value = true;
    try {
        if (!currentResume.value || hasUnsavedChanges.value) {
            await saveResumeInternal(false);
        }
        if (currentResume.value) {
            await createResumeVersionSnapshot(String(currentResume.value.id), userStore.user.id, `AI润色前快照：${state.sectionTitle}`);
        }
        const section = documentState.value.sections.find((item) => item.id === state.sectionId);
        const targetItem = section?.items[state.itemIndex];
        if (!section || !targetItem) {
            ElMessage.warning('未找到需要回填的内容项');
            return;
        }
        if (suggestion.fieldValues && state.actionType === 'generate') {
            applyAiFieldValues(targetItem, suggestion.fieldValues);
        }
        else {
            writeTextValue(targetItem, state.fieldKey, suggestion.text);
        }
        await saveResumeInternal(false);
        await refreshVersions();
        aiDialogVisible.value = false;
        ElMessage.success('AI 建议已应用，原内容已保存为版本快照');
    }
    catch (error) {
        console.error('应用 AI 建议失败:', error);
        ElMessage.error('应用 AI 建议失败，请稍后重试');
    }
    finally {
        aiApplying.value = false;
    }
}
function applyAiFieldValues(item, fieldValues) {
    Object.entries(fieldValues).forEach(([key, value]) => {
        if (typeof value === 'string') {
            writeTextValue(item, key, value);
            return;
        }
        item[key] = {
            start: value.start || '',
            end: value.end || '',
        };
    });
}
function readRangeValue(item, key, field) {
    const value = item[key];
    if (!value || typeof value !== 'object') {
        return '';
    }
    const range = value;
    return range[field] || '';
}
function writeRangeValue(item, key, field, value) {
    const current = item[key] && typeof item[key] === 'object'
        ? item[key]
        : { start: '', end: '' };
    const range = {
        start: current.start || '',
        end: current.end || '',
    };
    range[field] = value;
    item[key] = range;
}
function updateThemeValue(key, value) {
    if (value === null || value === undefined) {
        return;
    }
    const nextOverrides = {
        ...(documentState.value.themeOverrides || {}),
        [key]: value,
    };
    documentState.value.themeOverrides = nextOverrides;
    documentState.value.theme = mergeResumeTheme(documentState.value.templateTheme, nextOverrides, documentState.value.theme);
}
function resetThemeOverrides() {
    documentState.value.themeOverrides = undefined;
    documentState.value.theme = mergeResumeTheme(documentState.value.templateTheme, undefined, documentState.value.theme);
    ElMessage.success('已恢复模板默认样式');
}
async function saveResume() {
    await saveResumeInternal(true);
}
async function openVersionDrawer() {
    versionDrawerVisible.value = true;
    await refreshVersions();
}
async function saveResumeInternal(notify) {
    if (!userStore.user?.id) {
        if (notify) {
            ElMessage.warning('请先登录后再保存');
        }
        return;
    }
    const title = buildResumeTitle(documentState.value.profile);
    const content = JSON.stringify({
        ...documentState.value,
        schema: 'core-resume/v1',
        templateId: documentState.value.templateId || templateId.value || undefined,
    });
    saveStatus.value = 'saving';
    try {
        if (currentResume.value) {
            const updated = await updateResume(String(currentResume.value.id), {
                title,
                content,
                version: currentResume.value.version,
                templateId: documentState.value.templateId ? Number(documentState.value.templateId) : undefined,
            }, userStore.user.id);
            currentResume.value = {
                id: updated.id,
                title: updated.title,
                version: updated.version,
                templateId: updated.templateId,
            };
        }
        else {
            const created = await createResume(documentState.value.templateId, title, userStore.user.id, content);
            currentResume.value = {
                id: Number(created.resumeId),
                title,
                version: 1,
                templateId: documentState.value.templateId ? Number(documentState.value.templateId) : undefined,
            };
            const url = new URL(window.location.href);
            url.searchParams.set('resumeId', created.resumeId);
            window.history.replaceState({}, '', url.toString());
        }
        await refreshVersions();
        saveStatus.value = 'saved';
        lastSavedSnapshot.value = serializeDocument();
        if (notify) {
            ElMessage.success('简历已保存');
        }
    }
    catch (error) {
        console.error('保存简历失败:', error);
        saveStatus.value = 'error';
        if (notify) {
            ElMessage.error('保存失败，请稍后重试');
        }
    }
}
async function refreshVersions() {
    if (!currentResume.value?.id || !userStore.user?.id) {
        versionRecords.value = [];
        return;
    }
    versionsLoading.value = true;
    try {
        const versions = await listResumeVersions(String(currentResume.value.id), userStore.user.id);
        versionRecords.value = versions.map(buildVersionRecord);
    }
    catch (error) {
        console.error('获取版本记录失败:', error);
        if (versionDrawerVisible.value) {
            ElMessage.error('版本记录加载失败');
        }
    }
    finally {
        versionsLoading.value = false;
    }
}
async function createManualVersion() {
    if (!userStore.user?.id) {
        ElMessage.warning('请先登录后再保存版本');
        return;
    }
    if (!currentResume.value || hasUnsavedChanges.value) {
        await saveResumeInternal(false);
    }
    if (!currentResume.value) {
        ElMessage.warning('请先保存简历内容后再创建版本');
        return;
    }
    creatingVersion.value = true;
    try {
        let remark = '';
        try {
            const result = await ElMessageBox.prompt('给这个版本留一句备注，后面会更容易识别。', '保存为版本', {
                confirmButtonText: '保存版本',
                cancelButtonText: '跳过备注',
                inputPlaceholder: '例如：投递前调整项目经历 / 保留时间轴版本文案',
                inputValue: '',
            });
            remark = result.value?.trim() || '';
        }
        catch (error) {
            const action = error === 'cancel' || (typeof error === 'string' && error === 'cancel');
            if (!action) {
                throw error;
            }
        }
        await createResumeVersionSnapshot(String(currentResume.value.id), userStore.user.id, remark || undefined);
        await refreshVersions();
        versionDrawerVisible.value = true;
        ElMessage.success('已创建一个新的简历版本');
    }
    catch (error) {
        console.error('创建版本失败:', error);
        ElMessage.error('创建版本失败，请稍后重试');
    }
    finally {
        creatingVersion.value = false;
    }
}
async function rollbackToVersion(versionId) {
    if (!currentResume.value || !userStore.user?.id) {
        return;
    }
    const targetVersion = versionRecords.value.find((item) => item.id === versionId);
    if (!targetVersion) {
        ElMessage.warning('未找到要回滚的版本');
        return;
    }
    try {
        await ElMessageBox.confirm(`将回滚到 v${targetVersion.sourceVersion}。当前内容会先自动保存为新快照，确保你可以再恢复回来。\n\n${targetVersion.summaryTitle}\n${targetVersion.summaryMeta}`, '确认回滚版本', {
            confirmButtonText: '确认回滚',
            cancelButtonText: '取消',
            type: 'warning',
        });
    }
    catch {
        return;
    }
    rollingBackVersionId.value = versionId;
    try {
        const response = await rollbackResumeVersion(String(currentResume.value.id), versionId, userStore.user.id);
        applyResumeResponse(response);
        lastSavedSnapshot.value = serializeDocument();
        persistDraft();
        await refreshVersions();
        ElMessage.success('已回滚到所选版本');
    }
    catch (error) {
        console.error('回滚版本失败:', error);
        ElMessage.error('回滚版本失败，请稍后重试');
    }
    finally {
        rollingBackVersionId.value = null;
    }
}
function openVersionCompare(version) {
    const targetDocument = parseVersionDocument(version.content);
    if (!targetDocument) {
        ElMessage.warning('该版本内容暂时无法解析，无法进行对比');
        return;
    }
    const currentDocument = ensureAllSections(JSON.parse(serializeDocument()));
    versionCompareTarget.value = version;
    versionCompareData.value = buildVersionComparePayload(currentDocument, targetDocument);
    versionCompareVisible.value = true;
}
async function exportPdf() {
    const sheet = previewRef.value?.sheetRef;
    if (!sheet) {
        ElMessage.warning('预览内容尚未准备好');
        return;
    }
    exportingPdf.value = true;
    try {
        const exportTitle = buildResumeTitle(documentState.value.profile);
        const html = buildCoreResumePrintHtml(sheet.outerHTML, exportTitle);
        const { url } = await exportResumePdfByHtml(html);
        await downloadPdf(url, `${sanitizeFilename(exportTitle)}.pdf`);
    }
    catch (error) {
        console.error('导出 PDF 失败:', error);
        ElMessage.error('导出失败，请稍后重试');
    }
    finally {
        exportingPdf.value = false;
    }
}
function parseTemplatePayload(payload) {
    if (!payload) {
        return {};
    }
    if (typeof payload === 'object') {
        return payload;
    }
    if (typeof payload !== 'string') {
        return {};
    }
    try {
        return JSON.parse(payload);
    }
    catch {
        return {};
    }
}
function openTemplateCenter() {
    const targetResumeId = currentResume.value?.id || Number(resumeId.value || 0);
    if (targetResumeId) {
        router.push(`/templates?resumeId=${targetResumeId}`);
        return;
    }
    router.push('/templates');
}
function applyTemplateVariant(templateData) {
    const next = resolveTemplateVariant(documentState.value, templateData);
    documentState.value.templateVariant = next;
}
function queueAutoSave() {
    if (isApplyingDraft.value) {
        return;
    }
    if (!userStore.user?.id || !hasUnsavedChanges.value) {
        return;
    }
    if (saveTimer.value) {
        clearTimeout(saveTimer.value);
    }
    saveTimer.value = setTimeout(() => {
        saveResumeInternal(false);
    }, 1200);
}
function handleBeforeUnload(event) {
    if (!hasUnsavedChanges.value || saveStatus.value === 'saving') {
        return;
    }
    event.preventDefault();
    event.returnValue = '';
}
function persistDraft() {
    localStorage.setItem(draftStorageKey.value, serializeDocument());
}
function restoreDraft() {
    const raw = localStorage.getItem(draftStorageKey.value);
    if (!raw) {
        return;
    }
    try {
        const parsed = JSON.parse(raw);
        const restored = ensureAllSections(parsed);
        const shouldPreserveSelectedTemplate = Boolean(templateId.value);
        isApplyingDraft.value = true;
        documentState.value = {
            ...documentState.value,
            ...restored,
            theme: shouldPreserveSelectedTemplate
                ? mergeResumeTheme(documentState.value.templateTheme, restored.themeOverrides, documentState.value.theme)
                : restored.theme,
            templateTheme: shouldPreserveSelectedTemplate
                ? documentState.value.templateTheme
                : restored.templateTheme,
            themeOverrides: restored.themeOverrides,
            templateId: shouldPreserveSelectedTemplate
                ? (documentState.value.templateId || templateId.value)
                : (restored.templateId || documentState.value.templateId),
            templateName: shouldPreserveSelectedTemplate
                ? documentState.value.templateName
                : (restored.templateName || documentState.value.templateName),
            templateVariant: shouldPreserveSelectedTemplate
                ? documentState.value.templateVariant
                : restored.templateVariant,
        };
        applyTemplateVariant();
        ElMessage.info('已恢复本地草稿');
    }
    catch (error) {
        console.error('恢复本地草稿失败:', error);
    }
    finally {
        isApplyingDraft.value = false;
    }
}
function serializeDocument() {
    return JSON.stringify({
        ...documentState.value,
        schema: 'core-resume/v1',
        templateId: documentState.value.templateId || templateId.value || undefined,
    });
}
async function downloadPdf(url, filename) {
    if (!url) {
        throw new Error('PDF export did not return a file url');
    }
    if (url.startsWith('data:application/pdf;base64,')) {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        triggerDownload(objectUrl, filename);
        URL.revokeObjectURL(objectUrl);
        return;
    }
    triggerDownload(url, filename);
}
function triggerDownload(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function sanitizeFilename(value) {
    const normalized = value
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
    return normalized || 'resume-export';
}
function formatVersionTime(value) {
    if (!value) {
        return '--';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}
function getVersionSourceLabel(sourceType) {
    switch (sourceType) {
        case 'manual':
            return '手动保存';
        case 'rollback':
            return '回滚前快照';
        case 'save':
        default:
            return '保存前快照';
    }
}
function buildVersionRecord(version) {
    const summary = summarizeVersionContent(version.content);
    return {
        id: version.id,
        resumeId: version.resumeId,
        userId: version.userId,
        sourceVersion: version.sourceVersion,
        sourceType: version.sourceType,
        remark: version.remark,
        createTime: version.createTime,
        content: version.content,
        summaryTitle: summary.title,
        summaryMeta: summary.meta,
    };
}
function parseVersionDocument(content) {
    if (!content) {
        return null;
    }
    try {
        const parsed = parseResumeContent(content);
        if (!parsed) {
            return null;
        }
        return ensureAllSections(parsed);
    }
    catch (error) {
        console.error('解析版本内容失败:', error);
        return null;
    }
}
function buildVersionComparePayload(currentDocument, targetDocument) {
    return {
        profileDiffs: buildProfileDiffs(currentDocument, targetDocument),
        sectionDiffs: buildSectionDiffs(currentDocument, targetDocument),
        currentFilledSections: countFilledSections(currentDocument.sections),
        targetFilledSections: countFilledSections(targetDocument.sections),
    };
}
function buildProfileDiffs(currentDocument, targetDocument) {
    const profileFields = [
        { key: 'name', label: '姓名' },
        { key: 'title', label: '目标职位' },
        { key: 'phone', label: '电话' },
        { key: 'email', label: '邮箱' },
        { key: 'gender', label: '性别' },
        { key: 'age', label: '年龄' },
        { key: 'yearsOfExperience', label: '工作年限' },
        { key: 'site', label: '个人主页' },
    ];
    return profileFields.reduce((diffs, field) => {
        const currentValue = normalizeCompareValue(currentDocument.profile[field.key]);
        const targetValue = normalizeCompareValue(targetDocument.profile[field.key]);
        if (currentValue === targetValue) {
            return diffs;
        }
        diffs.push({
            key: field.key,
            label: field.label,
            currentValue,
            targetValue,
        });
        return diffs;
    }, []);
}
function buildSectionDiffs(currentDocument, targetDocument) {
    return CORE_SECTION_DEFINITIONS.reduce((diffs, definition) => {
        const currentSection = currentDocument.sections.find((section) => section.type === definition.type);
        const targetSection = targetDocument.sections.find((section) => section.type === definition.type);
        const currentSummary = buildSectionCompareSummary(currentSection);
        const targetSummary = buildSectionCompareSummary(targetSection);
        if (currentSummary.visible === targetSummary.visible
            && currentSummary.filledCount === targetSummary.filledCount
            && currentSummary.preview === targetSummary.preview) {
            return diffs;
        }
        diffs.push({
            key: definition.type,
            title: definition.title,
            summary: buildSectionCompareMeta(currentSummary, targetSummary),
            currentValue: formatSectionCompareValue(currentSummary),
            targetValue: formatSectionCompareValue(targetSummary),
            changeType: resolveVersionDiffType(currentSummary, targetSummary),
        });
        return diffs;
    }, []);
}
function buildSectionCompareSummary(section) {
    return {
        visible: Boolean(section?.visible),
        filledCount: countFilledItems(section),
        preview: buildSectionPreview(section),
    };
}
function buildSectionCompareMeta(currentSummary, targetSummary) {
    const summaryParts = [];
    if (currentSummary.visible !== targetSummary.visible) {
        summaryParts.push(`显示状态：${currentSummary.visible ? '当前显示' : '当前隐藏'} / ${targetSummary.visible ? '历史显示' : '历史隐藏'}`);
    }
    if (currentSummary.filledCount !== targetSummary.filledCount) {
        summaryParts.push(`已填写条目：${currentSummary.filledCount} vs ${targetSummary.filledCount}`);
    }
    if (currentSummary.preview !== targetSummary.preview) {
        summaryParts.push('内容摘要不同');
    }
    return summaryParts.join(' · ');
}
function formatSectionCompareValue(summary) {
    return [
        `状态：${summary.visible ? '显示' : '隐藏'}`,
        `已填写条目：${summary.filledCount}`,
        `摘要：${summary.preview}`,
    ].join('\n');
}
function resolveVersionDiffType(currentSummary, targetSummary) {
    const currentHasContent = currentSummary.filledCount > 0;
    const targetHasContent = targetSummary.filledCount > 0;
    if (currentHasContent && !targetHasContent) {
        return 'added';
    }
    if (!currentHasContent && targetHasContent) {
        return 'removed';
    }
    return 'changed';
}
function buildSectionPreview(section) {
    if (!section) {
        return '未找到该模块';
    }
    const preview = section.items
        .map((item) => formatSectionItem(item))
        .filter(Boolean)
        .slice(0, 2)
        .join(' ｜ ');
    return preview || '未填写';
}
function formatSectionItem(item) {
    const parts = Object.values(item)
        .map((value) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return [value.start?.trim(), value.end?.trim()].filter(Boolean).join(' - ');
    })
        .filter(Boolean);
    return parts.join(' / ');
}
function countFilledSections(sections) {
    return sections.filter((section) => countFilledItems(section) > 0).length;
}
function countFilledItems(section) {
    if (!section) {
        return 0;
    }
    return section.items.filter((item) => hasSectionContent(item)).length;
}
function normalizeCompareValue(value) {
    return value?.trim() || '未填写';
}
function getVersionDiffLabel(changeType) {
    switch (changeType) {
        case 'added':
            return '当前新增';
        case 'removed':
            return '当前缺失';
        case 'changed':
        default:
            return '内容变化';
    }
}
function summarizeVersionContent(content) {
    if (!content) {
        return {
            title: '暂无版本内容摘要',
            meta: '未识别到可预览内容',
        };
    }
    try {
        const parsed = parseResumeContent(content);
        if (!parsed?.sections || !parsed.profile) {
            return {
                title: '版本内容摘要暂不可用',
                meta: '仍可直接回滚到该版本',
            };
        }
        const visibleSections = parsed.sections.filter((section) => section.visible);
        const nonEmptySections = visibleSections.filter((section) => section.items.some((item) => hasSectionContent(item)));
        const profileSummary = [parsed.profile.name, parsed.profile.title].filter(Boolean).join(' · ');
        const sectionSummary = nonEmptySections
            .slice(0, 3)
            .map((section) => section.title)
            .join(' / ');
        return {
            title: profileSummary || '未命名版本',
            meta: [
                nonEmptySections.length ? `${nonEmptySections.length} 个已填写模块` : '内容较少',
                sectionSummary || '暂无模块摘要',
            ].join(' · '),
        };
    }
    catch (error) {
        console.error('解析版本摘要失败:', error);
        return {
            title: '版本内容解析失败',
            meta: '仍可直接回滚到该版本',
        };
    }
}
function hasSectionContent(item) {
    return Object.values(item).some((value) => {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return Boolean(value.start?.trim() || value.end?.trim());
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['core-editor-page']} */ ;
/** @type {__VLS_StyleScopedClasses['style-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['style-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['style-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['style-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['style-header']} */ ;
/** @type {__VLS_StyleScopedClasses['style-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['style-header']} */ ;
/** @type {__VLS_StyleScopedClasses['style-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['style-header']} */ ;
/** @type {__VLS_StyleScopedClasses['style-header']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['style-header']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['style-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['version-drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-draft-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-block-header']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-block-header']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-columns']} */ ;
/** @type {__VLS_StyleScopedClasses['version-diff-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['version-diff-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['version-diff-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-mode-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-text-block']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-suggestion-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-compare-pane']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-compare-pane']} */ ;
/** @type {__VLS_StyleScopedClasses['core-editor-page']} */ ;
/** @type {__VLS_StyleScopedClasses['style-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['core-editor-page']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['style-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['field-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-comparison-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['item-editor-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title-group']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "core-editor-page" },
    ...{ class: ({ 'style-panel-is-collapsed': __VLS_ctx.stylePanelCollapsed }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "editor-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "editor-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-title-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-with-help" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_0 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    content: "模块不会被删除，只会隐藏；后续可以随时恢复显示。",
    placement: "top",
}));
const __VLS_2 = __VLS_1({
    content: "模块不会被删除，只会隐藏；后续可以随时恢复显示。",
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "help-dot" },
});
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "card-badge" },
});
(__VLS_ctx.visibleSectionsCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-chips" },
});
for (const [definition] of __VLS_getVForSourceType((__VLS_ctx.CORE_SECTION_DEFINITIONS))) {
    const __VLS_4 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onClick': {} },
        key: (definition.type),
        size: "small",
        type: (__VLS_ctx.hiddenSections.some((section) => section.type === definition.type) ? 'primary' : 'default'),
        plain: true,
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onClick': {} },
        key: (definition.type),
        size: "small",
        type: (__VLS_ctx.hiddenSections.some((section) => section.type === definition.type) ? 'primary' : 'default'),
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onClick: (...[$event]) => {
            __VLS_ctx.toggleSectionVisibility(definition.type);
        }
    };
    __VLS_7.slots.default;
    (__VLS_ctx.hiddenSections.some((section) => section.type === definition.type) ? `显示${definition.title}` : `隐藏${definition.title}`);
    var __VLS_7;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "editor-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-title-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "card-badge" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_12 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.documentState.profile.name),
    placeholder: "请输入姓名",
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.documentState.profile.name),
    placeholder: "请输入姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_16 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.documentState.profile.title),
    placeholder: "请输入职位",
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.documentState.profile.title),
    placeholder: "请输入职位",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_20 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.documentState.profile.phone),
    placeholder: "请输入电话",
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.documentState.profile.phone),
    placeholder: "请输入电话",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_24 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.documentState.profile.email),
    placeholder: "请输入邮箱",
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.documentState.profile.email),
    placeholder: "请输入邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_28 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.documentState.profile.gender),
    placeholder: "可选",
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.documentState.profile.gender),
    placeholder: "可选",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_32 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.documentState.profile.age),
    placeholder: "可选",
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.documentState.profile.age),
    placeholder: "可选",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_36 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.documentState.profile.yearsOfExperience),
    placeholder: "例如：3年",
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.documentState.profile.yearsOfExperience),
    placeholder: "例如：3年",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_40 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.documentState.profile.site),
    placeholder: "可选",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.documentState.profile.site),
    placeholder: "可选",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
for (const [section, sectionIndex] of __VLS_getVForSourceType((__VLS_ctx.documentState.sections))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        key: (section.id),
        ...{ class: "editor-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title-group" },
    });
    const __VLS_44 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (section.title),
        size: "small",
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (section.title),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_48;
    let __VLS_49;
    let __VLS_50;
    const __VLS_51 = {
        'onUpdate:modelValue': (...[$event]) => {
            __VLS_ctx.updateSectionTitle(section, $event);
        }
    };
    var __VLS_47;
    const __VLS_52 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        modelValue: (section.visible),
        inlinePrompt: true,
        activeText: "显示",
        inactiveText: "隐藏",
    }));
    const __VLS_54 = __VLS_53({
        modelValue: (section.visible),
        inlinePrompt: true,
        activeText: "显示",
        inactiveText: "隐藏",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-actions" },
    });
    const __VLS_56 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        disabled: (!section.visible || __VLS_ctx.visibleSectionsCount <= 1),
    }));
    const __VLS_58 = __VLS_57({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        disabled: (!section.visible || __VLS_ctx.visibleSectionsCount <= 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_60;
    let __VLS_61;
    let __VLS_62;
    const __VLS_63 = {
        onClick: (...[$event]) => {
            __VLS_ctx.hideSection(section);
        }
    };
    __VLS_59.slots.default;
    var __VLS_59;
    const __VLS_64 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        disabled: (section.visible),
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        disabled: (section.visible),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_68;
    let __VLS_69;
    let __VLS_70;
    const __VLS_71 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showSection(section);
        }
    };
    __VLS_67.slots.default;
    var __VLS_67;
    const __VLS_72 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_76;
    let __VLS_77;
    let __VLS_78;
    const __VLS_79 = {
        onClick: (...[$event]) => {
            __VLS_ctx.resetSection(section);
        }
    };
    __VLS_75.slots.default;
    var __VLS_75;
    const __VLS_80 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        disabled: (sectionIndex === 0),
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        disabled: (sectionIndex === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_84;
    let __VLS_85;
    let __VLS_86;
    const __VLS_87 = {
        onClick: (...[$event]) => {
            __VLS_ctx.moveSection(sectionIndex, -1);
        }
    };
    __VLS_83.slots.default;
    var __VLS_83;
    const __VLS_88 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        disabled: (sectionIndex === __VLS_ctx.documentState.sections.length - 1),
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        disabled: (sectionIndex === __VLS_ctx.documentState.sections.length - 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_92;
    let __VLS_93;
    let __VLS_94;
    const __VLS_95 = {
        onClick: (...[$event]) => {
            __VLS_ctx.moveSection(sectionIndex, 1);
        }
    };
    __VLS_91.slots.default;
    var __VLS_91;
    const __VLS_96 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_100;
    let __VLS_101;
    let __VLS_102;
    const __VLS_103 = {
        onClick: (...[$event]) => {
            __VLS_ctx.toggleCollapse(section.id);
        }
    };
    __VLS_99.slots.default;
    (__VLS_ctx.collapsedSections.has(section.id) ? '展开' : '收起');
    var __VLS_99;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-body" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (section.visible && !__VLS_ctx.collapsedSections.has(section.id)) }, null, null);
    for (const [item, itemIndex] of __VLS_getVForSourceType((section.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`${section.id}-${itemIndex}`),
            ...{ class: "item-editor" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "item-editor-toolbar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (section.title);
        (itemIndex + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "item-editor-actions" },
        });
        if (__VLS_ctx.canAiPolishSection(section)) {
            const __VLS_104 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
                ...{ 'onClick': {} },
                text: true,
                type: "primary",
                size: "small",
            }));
            const __VLS_106 = __VLS_105({
                ...{ 'onClick': {} },
                text: true,
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_105));
            let __VLS_108;
            let __VLS_109;
            let __VLS_110;
            const __VLS_111 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.canAiPolishSection(section)))
                        return;
                    __VLS_ctx.openAiPolish(section, itemIndex);
                }
            };
            __VLS_107.slots.default;
            (__VLS_ctx.getAiEntryLabel(section, itemIndex));
            var __VLS_107;
        }
        if (__VLS_ctx.canMoveItem(section)) {
            const __VLS_112 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
                ...{ 'onClick': {} },
                text: true,
                size: "small",
                disabled: (itemIndex === 0),
            }));
            const __VLS_114 = __VLS_113({
                ...{ 'onClick': {} },
                text: true,
                size: "small",
                disabled: (itemIndex === 0),
            }, ...__VLS_functionalComponentArgsRest(__VLS_113));
            let __VLS_116;
            let __VLS_117;
            let __VLS_118;
            const __VLS_119 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.canMoveItem(section)))
                        return;
                    __VLS_ctx.moveItem(section, itemIndex, -1);
                }
            };
            __VLS_115.slots.default;
            var __VLS_115;
        }
        if (__VLS_ctx.canMoveItem(section)) {
            const __VLS_120 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
                ...{ 'onClick': {} },
                text: true,
                size: "small",
                disabled: (itemIndex === section.items.length - 1),
            }));
            const __VLS_122 = __VLS_121({
                ...{ 'onClick': {} },
                text: true,
                size: "small",
                disabled: (itemIndex === section.items.length - 1),
            }, ...__VLS_functionalComponentArgsRest(__VLS_121));
            let __VLS_124;
            let __VLS_125;
            let __VLS_126;
            const __VLS_127 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.canMoveItem(section)))
                        return;
                    __VLS_ctx.moveItem(section, itemIndex, 1);
                }
            };
            __VLS_123.slots.default;
            var __VLS_123;
        }
        if (__VLS_ctx.canRemoveItem(section)) {
            const __VLS_128 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
                ...{ 'onClick': {} },
                text: true,
                type: "danger",
                size: "small",
            }));
            const __VLS_130 = __VLS_129({
                ...{ 'onClick': {} },
                text: true,
                type: "danger",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_129));
            let __VLS_132;
            let __VLS_133;
            let __VLS_134;
            const __VLS_135 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.canRemoveItem(section)))
                        return;
                    __VLS_ctx.removeItem(section, itemIndex);
                }
            };
            __VLS_131.slots.default;
            var __VLS_131;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "field-grid" },
        });
        for (const [field] of __VLS_getVForSourceType((__VLS_ctx.getSectionDefinition(section.type).fields))) {
            (field.key);
            if (field.type === 'text') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "field-block" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (field.label);
                const __VLS_136 = {}.ElInput;
                /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
                // @ts-ignore
                const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (__VLS_ctx.readTextValue(item, field.key)),
                    placeholder: (field.placeholder || `请输入${field.label}`),
                }));
                const __VLS_138 = __VLS_137({
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (__VLS_ctx.readTextValue(item, field.key)),
                    placeholder: (field.placeholder || `请输入${field.label}`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_137));
                let __VLS_140;
                let __VLS_141;
                let __VLS_142;
                const __VLS_143 = {
                    'onUpdate:modelValue': (...[$event]) => {
                        if (!(field.type === 'text'))
                            return;
                        __VLS_ctx.writeTextValue(item, field.key, $event);
                    }
                };
                var __VLS_139;
            }
            else if (field.type === 'textarea') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                    ...{ class: "field-block field-block-full" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (field.label);
                const __VLS_144 = {}.ElInput;
                /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
                // @ts-ignore
                const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (__VLS_ctx.readTextValue(item, field.key)),
                    type: "textarea",
                    rows: (4),
                    placeholder: (field.placeholder || `请输入${field.label}`),
                }));
                const __VLS_146 = __VLS_145({
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (__VLS_ctx.readTextValue(item, field.key)),
                    type: "textarea",
                    rows: (4),
                    placeholder: (field.placeholder || `请输入${field.label}`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_145));
                let __VLS_148;
                let __VLS_149;
                let __VLS_150;
                const __VLS_151 = {
                    'onUpdate:modelValue': (...[$event]) => {
                        if (!!(field.type === 'text'))
                            return;
                        if (!(field.type === 'textarea'))
                            return;
                        __VLS_ctx.writeTextValue(item, field.key, $event);
                    }
                };
                var __VLS_147;
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "field-block field-block-full" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (field.label);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "date-range-row" },
                });
                const __VLS_152 = {}.ElInput;
                /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
                // @ts-ignore
                const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (__VLS_ctx.readRangeValue(item, field.key, 'start')),
                    placeholder: "开始时间，例如 2022-01",
                }));
                const __VLS_154 = __VLS_153({
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (__VLS_ctx.readRangeValue(item, field.key, 'start')),
                    placeholder: "开始时间，例如 2022-01",
                }, ...__VLS_functionalComponentArgsRest(__VLS_153));
                let __VLS_156;
                let __VLS_157;
                let __VLS_158;
                const __VLS_159 = {
                    'onUpdate:modelValue': (...[$event]) => {
                        if (!!(field.type === 'text'))
                            return;
                        if (!!(field.type === 'textarea'))
                            return;
                        __VLS_ctx.writeRangeValue(item, field.key, 'start', $event);
                    }
                };
                var __VLS_155;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "date-range-sep" },
                });
                const __VLS_160 = {}.ElInput;
                /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
                // @ts-ignore
                const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (__VLS_ctx.readRangeValue(item, field.key, 'end')),
                    placeholder: "结束时间，例如 2024-06 / 至今",
                }));
                const __VLS_162 = __VLS_161({
                    ...{ 'onUpdate:modelValue': {} },
                    modelValue: (__VLS_ctx.readRangeValue(item, field.key, 'end')),
                    placeholder: "结束时间，例如 2024-06 / 至今",
                }, ...__VLS_functionalComponentArgsRest(__VLS_161));
                let __VLS_164;
                let __VLS_165;
                let __VLS_166;
                const __VLS_167 = {
                    'onUpdate:modelValue': (...[$event]) => {
                        if (!!(field.type === 'text'))
                            return;
                        if (!!(field.type === 'textarea'))
                            return;
                        __VLS_ctx.writeRangeValue(item, field.key, 'end', $event);
                    }
                };
                var __VLS_163;
            }
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-footer" },
    });
    if (__VLS_ctx.getSectionDefinition(section.type).allowMultiple) {
        const __VLS_168 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
            ...{ 'onClick': {} },
            size: "small",
        }));
        const __VLS_170 = __VLS_169({
            ...{ 'onClick': {} },
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
        let __VLS_172;
        let __VLS_173;
        let __VLS_174;
        const __VLS_175 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.getSectionDefinition(section.type).allowMultiple))
                    return;
                __VLS_ctx.addItem(section);
            }
        };
        __VLS_171.slots.default;
        (section.title);
        var __VLS_171;
    }
}
if (__VLS_ctx.hiddenSections.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "editor-card hidden-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-badge" },
    });
    (__VLS_ctx.hiddenSections.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hidden-sections" },
    });
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.hiddenSections))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (section.id),
            ...{ class: "hidden-section-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (section.title);
        const __VLS_176 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
            ...{ 'onClick': {} },
            size: "small",
        }));
        const __VLS_178 = __VLS_177({
            ...{ 'onClick': {} },
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_177));
        let __VLS_180;
        let __VLS_181;
        let __VLS_182;
        const __VLS_183 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.hiddenSections.length))
                    return;
                __VLS_ctx.showSection(section);
            }
        };
        __VLS_179.slots.default;
        var __VLS_179;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "preview-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.documentState.templateName || '默认模板');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "template-meta-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "card-badge" },
});
(__VLS_ctx.activeTemplatePreset.label);
if (__VLS_ctx.activeTemplatePreset.description) {
    const __VLS_184 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        content: (__VLS_ctx.activeTemplatePreset.description),
        placement: "bottom",
    }));
    const __VLS_186 = __VLS_185({
        content: (__VLS_ctx.activeTemplatePreset.description),
        placement: "bottom",
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "help-link" },
    });
    var __VLS_187;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.saveStatusText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar-actions" },
});
const __VLS_188 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.creatingVersion),
}));
const __VLS_190 = __VLS_189({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.creatingVersion),
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
let __VLS_192;
let __VLS_193;
let __VLS_194;
const __VLS_195 = {
    onClick: (__VLS_ctx.createManualVersion)
};
__VLS_191.slots.default;
var __VLS_191;
const __VLS_196 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    ...{ 'onClick': {} },
    disabled: (!__VLS_ctx.currentResume),
}));
const __VLS_198 = __VLS_197({
    ...{ 'onClick': {} },
    disabled: (!__VLS_ctx.currentResume),
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
let __VLS_200;
let __VLS_201;
let __VLS_202;
const __VLS_203 = {
    onClick: (__VLS_ctx.openVersionDrawer)
};
__VLS_199.slots.default;
var __VLS_199;
const __VLS_204 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    ...{ 'onClick': {} },
}));
const __VLS_206 = __VLS_205({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
let __VLS_208;
let __VLS_209;
let __VLS_210;
const __VLS_211 = {
    onClick: (__VLS_ctx.openTemplateCenter)
};
__VLS_207.slots.default;
var __VLS_207;
const __VLS_212 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.saveStatus === 'saving'),
}));
const __VLS_214 = __VLS_213({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.saveStatus === 'saving'),
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
let __VLS_216;
let __VLS_217;
let __VLS_218;
const __VLS_219 = {
    onClick: (__VLS_ctx.saveResume)
};
__VLS_215.slots.default;
var __VLS_215;
const __VLS_220 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.exportingPdf),
}));
const __VLS_222 = __VLS_221({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.exportingPdf),
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
let __VLS_224;
let __VLS_225;
let __VLS_226;
const __VLS_227 = {
    onClick: (__VLS_ctx.exportPdf)
};
__VLS_223.slots.default;
var __VLS_223;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-stage" },
});
/** @type {[typeof CoreResumePreview, ]} */ ;
// @ts-ignore
const __VLS_228 = __VLS_asFunctionalComponent(CoreResumePreview, new CoreResumePreview({
    ref: "previewRef",
    document: (__VLS_ctx.documentState),
}));
const __VLS_229 = __VLS_228({
    ref: "previewRef",
    document: (__VLS_ctx.documentState),
}, ...__VLS_functionalComponentArgsRest(__VLS_228));
/** @type {typeof __VLS_ctx.previewRef} */ ;
var __VLS_231 = {};
var __VLS_230;
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "style-panel" },
    ...{ class: ({ collapsed: __VLS_ctx.stylePanelCollapsed }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "style-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-with-help" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_233 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
    content: "这里仅保留影响预览观感的关键样式项，复杂模板样式仍以模板本身为准。",
    placement: "left",
}));
const __VLS_235 = __VLS_234({
    content: "这里仅保留影响预览观感的关键样式项，复杂模板样式仍以模板本身为准。",
    placement: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_234));
__VLS_236.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "help-dot" },
});
var __VLS_236;
const __VLS_237 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_239 = __VLS_238({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_238));
let __VLS_241;
let __VLS_242;
let __VLS_243;
const __VLS_244 = {
    onClick: (...[$event]) => {
        __VLS_ctx.stylePanelCollapsed = !__VLS_ctx.stylePanelCollapsed;
    }
};
__VLS_240.slots.default;
(__VLS_ctx.stylePanelCollapsed ? '展开' : '收起');
var __VLS_240;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "style-body" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.stylePanelCollapsed) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "style-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "style-state" },
});
(__VLS_ctx.hasThemeOverrides ? '已应用手动微调' : '当前使用模板默认样式');
const __VLS_245 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
    ...{ 'onClick': {} },
    size: "small",
    disabled: (!__VLS_ctx.hasThemeOverrides),
}));
const __VLS_247 = __VLS_246({
    ...{ 'onClick': {} },
    size: "small",
    disabled: (!__VLS_ctx.hasThemeOverrides),
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
let __VLS_249;
let __VLS_250;
let __VLS_251;
const __VLS_252 = {
    onClick: (__VLS_ctx.resetThemeOverrides)
};
__VLS_248.slots.default;
var __VLS_248;
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (...[$event]) => {
            __VLS_ctx.updateThemeValue('primaryColor', $event.target.value);
        } },
    value: (__VLS_ctx.documentState.theme.primaryColor),
    ...{ class: "native-color" },
    type: "color",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_253 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.fontFamily),
}));
const __VLS_255 = __VLS_254({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.fontFamily),
}, ...__VLS_functionalComponentArgsRest(__VLS_254));
let __VLS_257;
let __VLS_258;
let __VLS_259;
const __VLS_260 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.updateThemeValue('fontFamily', $event);
    }
};
__VLS_256.slots.default;
const __VLS_261 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({
    label: "微软雅黑",
    value: "'Microsoft YaHei', 'PingFang SC', sans-serif",
}));
const __VLS_263 = __VLS_262({
    label: "微软雅黑",
    value: "'Microsoft YaHei', 'PingFang SC', sans-serif",
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
const __VLS_265 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({
    label: "思源黑体",
    value: "'Source Han Sans SC', 'Microsoft YaHei', sans-serif",
}));
const __VLS_267 = __VLS_266({
    label: "思源黑体",
    value: "'Source Han Sans SC', 'Microsoft YaHei', sans-serif",
}, ...__VLS_functionalComponentArgsRest(__VLS_266));
const __VLS_269 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({
    label: "苹方",
    value: "'PingFang SC', 'Microsoft YaHei', sans-serif",
}));
const __VLS_271 = __VLS_270({
    label: "苹方",
    value: "'PingFang SC', 'Microsoft YaHei', sans-serif",
}, ...__VLS_functionalComponentArgsRest(__VLS_270));
var __VLS_256;
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_273 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.headingFontFamily),
}));
const __VLS_275 = __VLS_274({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.headingFontFamily),
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
let __VLS_277;
let __VLS_278;
let __VLS_279;
const __VLS_280 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.updateThemeValue('headingFontFamily', $event);
    }
};
__VLS_276.slots.default;
const __VLS_281 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({
    label: "微软雅黑",
    value: "'Microsoft YaHei', 'PingFang SC', sans-serif",
}));
const __VLS_283 = __VLS_282({
    label: "微软雅黑",
    value: "'Microsoft YaHei', 'PingFang SC', sans-serif",
}, ...__VLS_functionalComponentArgsRest(__VLS_282));
const __VLS_285 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_286 = __VLS_asFunctionalComponent(__VLS_285, new __VLS_285({
    label: "思源黑体",
    value: "'Source Han Sans SC', 'Microsoft YaHei', sans-serif",
}));
const __VLS_287 = __VLS_286({
    label: "思源黑体",
    value: "'Source Han Sans SC', 'Microsoft YaHei', sans-serif",
}, ...__VLS_functionalComponentArgsRest(__VLS_286));
const __VLS_289 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({
    label: "苹方",
    value: "'PingFang SC', 'Microsoft YaHei', sans-serif",
}));
const __VLS_291 = __VLS_290({
    label: "苹方",
    value: "'PingFang SC', 'Microsoft YaHei', sans-serif",
}, ...__VLS_functionalComponentArgsRest(__VLS_290));
var __VLS_276;
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_293 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_294 = __VLS_asFunctionalComponent(__VLS_293, new __VLS_293({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.sectionSpacing),
    min: (12),
    max: (40),
}));
const __VLS_295 = __VLS_294({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.sectionSpacing),
    min: (12),
    max: (40),
}, ...__VLS_functionalComponentArgsRest(__VLS_294));
let __VLS_297;
let __VLS_298;
let __VLS_299;
const __VLS_300 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.updateThemeValue('sectionSpacing', $event);
    }
};
var __VLS_296;
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_301 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_302 = __VLS_asFunctionalComponent(__VLS_301, new __VLS_301({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.itemSpacing),
    min: (8),
    max: (30),
}));
const __VLS_303 = __VLS_302({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.itemSpacing),
    min: (8),
    max: (30),
}, ...__VLS_functionalComponentArgsRest(__VLS_302));
let __VLS_305;
let __VLS_306;
let __VLS_307;
const __VLS_308 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.updateThemeValue('itemSpacing', $event);
    }
};
var __VLS_304;
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_309 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.fontSize),
    min: (12),
    max: (18),
}));
const __VLS_311 = __VLS_310({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.fontSize),
    min: (12),
    max: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_310));
let __VLS_313;
let __VLS_314;
let __VLS_315;
const __VLS_316 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.updateThemeValue('fontSize', $event);
    }
};
var __VLS_312;
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "field-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_317 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.lineHeight),
    min: (1.4),
    max: (2),
    step: (0.1),
}));
const __VLS_319 = __VLS_318({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.documentState.theme.lineHeight),
    min: (1.4),
    max: (2),
    step: (0.1),
}, ...__VLS_functionalComponentArgsRest(__VLS_318));
let __VLS_321;
let __VLS_322;
let __VLS_323;
const __VLS_324 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.updateThemeValue('lineHeight', $event);
    }
};
var __VLS_320;
const __VLS_325 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({
    modelValue: (__VLS_ctx.aiDialogVisible),
    title: (__VLS_ctx.aiDialogTitle),
    width: "860px",
    destroyOnClose: true,
}));
const __VLS_327 = __VLS_326({
    modelValue: (__VLS_ctx.aiDialogVisible),
    title: (__VLS_ctx.aiDialogTitle),
    width: "860px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_326));
__VLS_328.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-dialog" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-dialog-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.aiDialogState.sectionTitle || '当前模块');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "ai-dialog-subtitle" },
});
(__VLS_ctx.aiDialogSubtitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-dialog-actions" },
});
const __VLS_329 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({
    ...{ 'onClick': {} },
    size: "small",
    loading: (__VLS_ctx.aiLoading),
}));
const __VLS_331 = __VLS_330({
    ...{ 'onClick': {} },
    size: "small",
    loading: (__VLS_ctx.aiLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_330));
let __VLS_333;
let __VLS_334;
let __VLS_335;
const __VLS_336 = {
    onClick: (__VLS_ctx.rerunAiPolish)
};
__VLS_332.slots.default;
var __VLS_332;
const __VLS_337 = {}.ElPopover;
/** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
// @ts-ignore
const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
    placement: "bottom-end",
    width: "420px",
    trigger: "click",
}));
const __VLS_339 = __VLS_338({
    placement: "bottom-end",
    width: "420px",
    trigger: "click",
}, ...__VLS_functionalComponentArgsRest(__VLS_338));
__VLS_340.slots.default;
{
    const { reference: __VLS_thisSlot } = __VLS_340.slots;
    const __VLS_341 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({
        size: "small",
    }));
    const __VLS_343 = __VLS_342({
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_342));
    __VLS_344.slots.default;
    var __VLS_344;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-runtime-popover" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-runtime-meta" },
});
if (__VLS_ctx.aiProvider) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-badge" },
    });
    (__VLS_ctx.aiProvider);
}
if (__VLS_ctx.aiModel) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-badge ai-runtime-badge" },
    });
    (__VLS_ctx.aiModel);
}
if (__VLS_ctx.aiExecutionMode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-badge ai-runtime-badge" },
    });
    (__VLS_ctx.aiExecutionModeLabel);
}
if (__VLS_ctx.aiTokenUsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-badge" },
    });
    (__VLS_ctx.aiTokenUsed);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-runtime-tip" },
});
(__VLS_ctx.aiExecutionTip);
if (__VLS_ctx.aiPromptPreview) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-prompt-preview" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "ai-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-text-block compact" },
    });
    (__VLS_ctx.aiPromptPreview);
}
var __VLS_340;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-target-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_345 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.aiTargetJobTitle),
    size: "small",
    placeholder: "例如：前端工程师 / 产品经理",
    clearable: true,
}));
const __VLS_347 = __VLS_346({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.aiTargetJobTitle),
    size: "small",
    placeholder: "例如：前端工程师 / 产品经理",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_346));
let __VLS_349;
let __VLS_350;
let __VLS_351;
const __VLS_352 = {
    onKeyup: (__VLS_ctx.rerunAiPolish)
};
var __VLS_348;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-mode-tip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "ai-mode-tag" },
});
(__VLS_ctx.aiModeTag);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.aiModeTip);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ai-suggestion-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.aiLoading) }, null, null);
if (!__VLS_ctx.aiLoading && !__VLS_ctx.aiSuggestions.length) {
    const __VLS_353 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_354 = __VLS_asFunctionalComponent(__VLS_353, new __VLS_353({
        description: "暂无可用建议",
    }));
    const __VLS_355 = __VLS_354({
        description: "暂无可用建议",
    }, ...__VLS_functionalComponentArgsRest(__VLS_354));
}
for (const [suggestion, suggestionIndex] of __VLS_getVForSourceType((__VLS_ctx.aiSuggestions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (`${suggestionIndex}-${suggestion.reason}`),
        ...{ class: "ai-suggestion-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-suggestion-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedAiSuggestionIndex = suggestionIndex;
            } },
        ...{ class: "ai-suggestion-selector" },
        type: "button",
        ...{ class: ({ active: __VLS_ctx.selectedAiSuggestionIndex === suggestionIndex }) },
    });
    (suggestionIndex + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (suggestion.reason);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-comparison-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-compare-pane original" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "ai-label" },
    });
    (__VLS_ctx.aiSourceLabel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-text-block" },
    });
    (__VLS_ctx.aiDialogState.originalText || __VLS_ctx.aiEmptySourceText);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-compare-pane polished" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "ai-label" },
    });
    (__VLS_ctx.aiResultLabel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-text-block" },
    });
    (suggestion.text);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ai-suggestion-actions" },
    });
    const __VLS_357 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_358 = __VLS_asFunctionalComponent(__VLS_357, new __VLS_357({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        loading: (__VLS_ctx.aiApplying),
    }));
    const __VLS_359 = __VLS_358({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        loading: (__VLS_ctx.aiApplying),
    }, ...__VLS_functionalComponentArgsRest(__VLS_358));
    let __VLS_361;
    let __VLS_362;
    let __VLS_363;
    const __VLS_364 = {
        onClick: (...[$event]) => {
            __VLS_ctx.applyAiSuggestion(suggestion);
        }
    };
    __VLS_360.slots.default;
    (__VLS_ctx.getAiApplyLabel(suggestion));
    var __VLS_360;
}
var __VLS_328;
const __VLS_365 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_366 = __VLS_asFunctionalComponent(__VLS_365, new __VLS_365({
    modelValue: (__VLS_ctx.versionDrawerVisible),
    title: "版本记录",
    size: "420px",
    destroyOnClose: true,
}));
const __VLS_367 = __VLS_366({
    modelValue: (__VLS_ctx.versionDrawerVisible),
    title: "版本记录",
    size: "420px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_366));
__VLS_368.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "version-drawer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "version-drawer-header" },
});
const __VLS_369 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_370 = __VLS_asFunctionalComponent(__VLS_369, new __VLS_369({
    content: "版本会保存当前简历内容，后续可从版本记录中回滚。",
    placement: "bottom",
}));
const __VLS_371 = __VLS_370({
    content: "版本会保存当前简历内容，后续可从版本记录中回滚。",
    placement: "bottom",
}, ...__VLS_functionalComponentArgsRest(__VLS_370));
__VLS_372.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "help-link" },
});
var __VLS_372;
const __VLS_373 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_374 = __VLS_asFunctionalComponent(__VLS_373, new __VLS_373({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
    loading: (__VLS_ctx.creatingVersion),
    disabled: (!__VLS_ctx.currentResume),
}));
const __VLS_375 = __VLS_374({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
    loading: (__VLS_ctx.creatingVersion),
    disabled: (!__VLS_ctx.currentResume),
}, ...__VLS_functionalComponentArgsRest(__VLS_374));
let __VLS_377;
let __VLS_378;
let __VLS_379;
const __VLS_380 = {
    onClick: (__VLS_ctx.createManualVersion)
};
__VLS_376.slots.default;
var __VLS_376;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "version-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.versionsLoading) }, null, null);
if (!__VLS_ctx.versionsLoading && !__VLS_ctx.versionRecords.length) {
    const __VLS_381 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_382 = __VLS_asFunctionalComponent(__VLS_381, new __VLS_381({
        description: "暂无历史版本",
    }));
    const __VLS_383 = __VLS_382({
        description: "暂无历史版本",
    }, ...__VLS_functionalComponentArgsRest(__VLS_382));
}
for (const [version] of __VLS_getVForSourceType((__VLS_ctx.versionRecords))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (version.id),
        ...{ class: "version-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-item-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (version.sourceVersion);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "version-source" },
    });
    (__VLS_ctx.getVersionSourceLabel(version.sourceType));
    if (__VLS_ctx.currentResume && version.sourceVersion === __VLS_ctx.currentResume.version - 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "version-current" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "version-time" },
    });
    (__VLS_ctx.formatVersionTime(version.createTime));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-item-summary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "version-summary-title" },
    });
    (version.summaryTitle);
    if (version.remark) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "version-summary-remark" },
        });
        (version.remark);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "version-summary-meta" },
    });
    (version.summaryMeta);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-item-actions" },
    });
    const __VLS_385 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_386 = __VLS_asFunctionalComponent(__VLS_385, new __VLS_385({
        ...{ 'onClick': {} },
        size: "small",
        text: true,
        type: "primary",
    }));
    const __VLS_387 = __VLS_386({
        ...{ 'onClick': {} },
        size: "small",
        text: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_386));
    let __VLS_389;
    let __VLS_390;
    let __VLS_391;
    const __VLS_392 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openVersionCompare(version);
        }
    };
    __VLS_388.slots.default;
    var __VLS_388;
    const __VLS_393 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_394 = __VLS_asFunctionalComponent(__VLS_393, new __VLS_393({
        ...{ 'onClick': {} },
        size: "small",
        loading: (__VLS_ctx.rollingBackVersionId === version.id),
    }));
    const __VLS_395 = __VLS_394({
        ...{ 'onClick': {} },
        size: "small",
        loading: (__VLS_ctx.rollingBackVersionId === version.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_394));
    let __VLS_397;
    let __VLS_398;
    let __VLS_399;
    const __VLS_400 = {
        onClick: (...[$event]) => {
            __VLS_ctx.rollbackToVersion(version.id);
        }
    };
    __VLS_396.slots.default;
    var __VLS_396;
}
var __VLS_368;
const __VLS_401 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_402 = __VLS_asFunctionalComponent(__VLS_401, new __VLS_401({
    modelValue: (__VLS_ctx.versionCompareVisible),
    title: "版本对比",
    width: "880px",
    destroyOnClose: true,
}));
const __VLS_403 = __VLS_402({
    modelValue: (__VLS_ctx.versionCompareVisible),
    title: "版本对比",
    width: "880px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_402));
__VLS_404.slots.default;
if (__VLS_ctx.versionCompareTarget && __VLS_ctx.versionCompareData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-dialog" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-hero" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "version-compare-tag" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.currentVersionSummary.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.currentVersionSummary.meta);
    if (__VLS_ctx.hasUnsavedChanges) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "version-compare-draft-tip" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-hero" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "version-compare-tag" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.versionCompareTarget.sourceVersion);
    (__VLS_ctx.getVersionSourceLabel(__VLS_ctx.versionCompareTarget.sourceType));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.versionCompareTarget.summaryTitle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "version-compare-time" },
    });
    (__VLS_ctx.formatVersionTime(__VLS_ctx.versionCompareTarget.createTime));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-stats" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-stat" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.versionCompareData.profileDiffs.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-stat" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.versionCompareData.sectionDiffs.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-stat" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.versionCompareData.currentFilledSections);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-stat" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.versionCompareData.targetFilledSections);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-block-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.versionCompareData.profileDiffs.length ? '只展示发生变化的字段' : '当前稿与该版本一致');
    if (!__VLS_ctx.versionCompareData.profileDiffs.length) {
        const __VLS_405 = {}.ElEmpty;
        /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_406 = __VLS_asFunctionalComponent(__VLS_405, new __VLS_405({
            description: "个人信息没有变化",
        }));
        const __VLS_407 = __VLS_406({
            description: "个人信息没有变化",
        }, ...__VLS_functionalComponentArgsRest(__VLS_406));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "version-compare-grid" },
        });
        for (const [diff] of __VLS_getVForSourceType((__VLS_ctx.versionCompareData.profileDiffs))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`profile-${diff.key}`),
                ...{ class: "version-compare-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "version-compare-card-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (diff.label);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "version-diff-badge changed" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "version-compare-columns" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "version-compare-column-label" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (diff.currentValue);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "version-compare-column-label" },
            });
            (__VLS_ctx.versionCompareTarget.sourceVersion);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (diff.targetValue);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-compare-block-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.versionCompareData.sectionDiffs.length ? '优先展示显示状态、条目数量和内容摘要差异' : '模块内容一致');
    if (!__VLS_ctx.versionCompareData.sectionDiffs.length) {
        const __VLS_409 = {}.ElEmpty;
        /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_410 = __VLS_asFunctionalComponent(__VLS_409, new __VLS_409({
            description: "模块内容没有变化",
        }));
        const __VLS_411 = __VLS_410({
            description: "模块内容没有变化",
        }, ...__VLS_functionalComponentArgsRest(__VLS_410));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "version-compare-section-list" },
        });
        for (const [diff] of __VLS_getVForSourceType((__VLS_ctx.versionCompareData.sectionDiffs))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (diff.key),
                ...{ class: "version-compare-section" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "version-compare-card-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "version-compare-section-title" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (diff.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "version-compare-section-summary" },
            });
            (diff.summary);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "version-diff-badge" },
                ...{ class: (diff.changeType) },
            });
            (__VLS_ctx.getVersionDiffLabel(diff.changeType));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "version-compare-columns" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "version-compare-column-label" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (diff.currentValue);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "version-compare-column-label" },
            });
            (__VLS_ctx.versionCompareTarget.sourceVersion);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (diff.targetValue);
        }
    }
}
var __VLS_404;
/** @type {__VLS_StyleScopedClasses['core-editor-page']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['title-with-help']} */ ;
/** @type {__VLS_StyleScopedClasses['help-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['module-chips']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['field-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title-group']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['section-body']} */ ;
/** @type {__VLS_StyleScopedClasses['item-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['item-editor-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['item-editor-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['field-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block-full']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block-full']} */ ;
/** @type {__VLS_StyleScopedClasses['date-range-row']} */ ;
/** @type {__VLS_StyleScopedClasses['date-range-sep']} */ ;
/** @type {__VLS_StyleScopedClasses['section-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden-sections']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden-section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['template-meta-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['help-link']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['style-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['style-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title-with-help']} */ ;
/** @type {__VLS_StyleScopedClasses['help-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['style-body']} */ ;
/** @type {__VLS_StyleScopedClasses['style-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['style-state']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['native-color']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['field-block']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-dialog-header']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-dialog-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-dialog-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-runtime-popover']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-runtime-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-runtime-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-runtime-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['card-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-runtime-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-prompt-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-label']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-text-block']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-target-row']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-mode-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-mode-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-suggestion-list']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-suggestion-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-suggestion-head']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-suggestion-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-comparison-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-compare-pane']} */ ;
/** @type {__VLS_StyleScopedClasses['original']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-label']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-text-block']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-compare-pane']} */ ;
/** @type {__VLS_StyleScopedClasses['polished']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-label']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-text-block']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-suggestion-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['version-drawer']} */ ;
/** @type {__VLS_StyleScopedClasses['version-drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['help-link']} */ ;
/** @type {__VLS_StyleScopedClasses['version-list']} */ ;
/** @type {__VLS_StyleScopedClasses['version-item']} */ ;
/** @type {__VLS_StyleScopedClasses['version-item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['version-source']} */ ;
/** @type {__VLS_StyleScopedClasses['version-current']} */ ;
/** @type {__VLS_StyleScopedClasses['version-time']} */ ;
/** @type {__VLS_StyleScopedClasses['version-item-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['version-summary-title']} */ ;
/** @type {__VLS_StyleScopedClasses['version-summary-remark']} */ ;
/** @type {__VLS_StyleScopedClasses['version-summary-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['version-item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-header']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-draft-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-time']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-block']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-block-header']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-card']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['version-diff-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['changed']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-columns']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-column-label']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-column-label']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-block']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-block-header']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-section-list']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-section']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-section-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['version-diff-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-columns']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-column-label']} */ ;
/** @type {__VLS_StyleScopedClasses['version-compare-column-label']} */ ;
// @ts-ignore
var __VLS_232 = __VLS_231;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CoreResumePreview: CoreResumePreview,
            CORE_SECTION_DEFINITIONS: CORE_SECTION_DEFINITIONS,
            getSectionDefinition: getSectionDefinition,
            previewRef: previewRef,
            documentState: documentState,
            saveStatus: saveStatus,
            exportingPdf: exportingPdf,
            creatingVersion: creatingVersion,
            stylePanelCollapsed: stylePanelCollapsed,
            collapsedSections: collapsedSections,
            currentResume: currentResume,
            versionDrawerVisible: versionDrawerVisible,
            versionsLoading: versionsLoading,
            versionRecords: versionRecords,
            rollingBackVersionId: rollingBackVersionId,
            versionCompareVisible: versionCompareVisible,
            versionCompareTarget: versionCompareTarget,
            versionCompareData: versionCompareData,
            aiDialogVisible: aiDialogVisible,
            aiLoading: aiLoading,
            aiApplying: aiApplying,
            aiSuggestions: aiSuggestions,
            selectedAiSuggestionIndex: selectedAiSuggestionIndex,
            aiTokenUsed: aiTokenUsed,
            aiProvider: aiProvider,
            aiModel: aiModel,
            aiExecutionMode: aiExecutionMode,
            aiPromptPreview: aiPromptPreview,
            aiTargetJobTitle: aiTargetJobTitle,
            aiDialogState: aiDialogState,
            hiddenSections: hiddenSections,
            visibleSectionsCount: visibleSectionsCount,
            hasUnsavedChanges: hasUnsavedChanges,
            currentVersionSummary: currentVersionSummary,
            activeTemplatePreset: activeTemplatePreset,
            hasThemeOverrides: hasThemeOverrides,
            aiDialogTitle: aiDialogTitle,
            aiDialogSubtitle: aiDialogSubtitle,
            aiModeTag: aiModeTag,
            aiModeTip: aiModeTip,
            aiSourceLabel: aiSourceLabel,
            aiResultLabel: aiResultLabel,
            aiEmptySourceText: aiEmptySourceText,
            aiExecutionModeLabel: aiExecutionModeLabel,
            aiExecutionTip: aiExecutionTip,
            saveStatusText: saveStatusText,
            updateSectionTitle: updateSectionTitle,
            toggleSectionVisibility: toggleSectionVisibility,
            showSection: showSection,
            hideSection: hideSection,
            resetSection: resetSection,
            toggleCollapse: toggleCollapse,
            moveSection: moveSection,
            addItem: addItem,
            removeItem: removeItem,
            canAiPolishSection: canAiPolishSection,
            canRemoveItem: canRemoveItem,
            canMoveItem: canMoveItem,
            moveItem: moveItem,
            readTextValue: readTextValue,
            writeTextValue: writeTextValue,
            getAiEntryLabel: getAiEntryLabel,
            openAiPolish: openAiPolish,
            rerunAiPolish: rerunAiPolish,
            getAiApplyLabel: getAiApplyLabel,
            applyAiSuggestion: applyAiSuggestion,
            readRangeValue: readRangeValue,
            writeRangeValue: writeRangeValue,
            updateThemeValue: updateThemeValue,
            resetThemeOverrides: resetThemeOverrides,
            saveResume: saveResume,
            openVersionDrawer: openVersionDrawer,
            createManualVersion: createManualVersion,
            rollbackToVersion: rollbackToVersion,
            openVersionCompare: openVersionCompare,
            exportPdf: exportPdf,
            openTemplateCenter: openTemplateCenter,
            formatVersionTime: formatVersionTime,
            getVersionSourceLabel: getVersionSourceLabel,
            getVersionDiffLabel: getVersionDiffLabel,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
