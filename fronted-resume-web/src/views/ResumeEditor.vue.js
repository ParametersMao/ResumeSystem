import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Plus, Delete, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getTemplateDetail } from '@/api/template';
import { createResume, getResume, updateResume } from '@/api/resume';
import { useUserStore } from '@/store/user';
// 路由参数
const route = useRoute();
const templateId = route.query.templateId;
const resumeId = route.query.resumeId;
// 用户状态
const userStore = useUserStore();
// 响应式数据
const resume = ref(null);
const templateData = ref({});
const settingsCollapsed = ref(true);
const saveStatus = ref('idle');
const templateType = ref('single-column');
// 个人信息数据
const profileData = ref({
    basic: {
        name: '张三',
        title: '前端工程师',
        contacts: {
            email: 'zhangsan@example.com',
            phone: '13800138000',
            site: 'https://example.com'
        }
    },
    summary: '拥有3+年前端经验，熟悉 Vue3/TypeScript，关注性能与体验。',
    experience: [
        {
            company: '示例公司A',
            role: '前端工程师',
            start: '2022-01',
            end: '2023-12',
            desc: '负责核心业务前端研发与性能优化。'
        }
    ],
    education: [
        {
            school: '北京大学',
            degree: '计算机科学 本科',
            start: '2016-09',
            end: '2020-06'
        }
    ],
    skills: ['JavaScript', 'TypeScript', 'Vue3', 'Vite', 'Pinia'],
    projects: [
        {
            name: '在线简历平台',
            role: '前端负责人',
            date: '2023',
            desc: '搭建在线编辑与导出能力。'
        }
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
// 间距数值（用于输入控件）
const spacingValues = ref({
    section: 25,
    element: 15
});
// 技能输入
const showSkillInput = ref(false);
const newSkill = ref('');
const skillInputRef = ref();
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
const previewHtml = computed(() => {
    return generatePreviewHtml(templateData.value, profileData.value);
});
// 初始化
onMounted(async () => {
    if (templateId) {
        await loadTemplate();
    }
    if (resumeId) {
        await loadResume();
    }
});
// 加载模板
async function loadTemplate() {
    try {
        const template = await getTemplateDetail(templateId);
        console.log('简历编辑器获取到的模板详情:', template); // 调试日志
        templateData.value = template.templateData || {};
        console.log('简历编辑器解析后的模板数据:', templateData.value); // 调试日志
        console.log('简历编辑器模板颜色配置:', templateData.value?.styles?.colors); // 调试日志
        // 加载模板类型
        if (templateData.value.templateType) {
            templateType.value = templateData.value.templateType;
        }
        // 更新样式配置，使用正确的合并逻辑
        if (templateData.value.styles) {
            // 合并颜色配置
            if (templateData.value.styles.colors) {
                Object.assign(templateStyles.value.colors, templateData.value.styles.colors);
            }
            // 合并字体配置
            if (templateData.value.styles.fonts) {
                Object.assign(templateStyles.value.fonts, templateData.value.styles.fonts);
            }
            // 合并间距配置
            if (templateData.value.styles.spacing) {
                Object.assign(templateStyles.value.spacing, templateData.value.styles.spacing);
                spacingValues.value.section = parseInt(templateData.value.styles.spacing.sectionMargin) || 25;
                spacingValues.value.element = parseInt(templateData.value.styles.spacing.elementMargin) || 15;
            }
        }
        console.log('简历编辑器更新后的templateStyles:', templateStyles.value); // 调试日志
    }
    catch (error) {
        ElMessage.error('模板加载失败');
        console.error('Template load error:', error);
    }
}
// 加载简历
async function loadResume() {
    try {
        const resumeData = await getResume(resumeId, userStore.user?.id);
        resume.value = resumeData;
        // 解析简历内容
        if (resumeData.content) {
            const content = typeof resumeData.content === 'string'
                ? JSON.parse(resumeData.content)
                : resumeData.content;
            if (content.profile) {
                profileData.value = { ...profileData.value, ...content.profile };
            }
            if (content.styles) {
                Object.assign(templateStyles.value, content.styles);
            }
            // 加载模板类型
            if (content.templateType) {
                templateType.value = content.templateType;
            }
            else if (content.templateData?.templateType) {
                templateType.value = content.templateData.templateType;
            }
        }
        ElMessage.success('简历加载成功');
    }
    catch (error) {
        ElMessage.error('简历加载失败');
        console.error('Resume load error:', error);
    }
}
// 生成预览HTML
function generatePreviewHtml(templateData, profile) {
    console.log('简历编辑器 generatePreviewHtml 接收到的 templateData:', templateData); // 调试日志
    const styles = templateData?.styles || {};
    const sections = templateData?.sections || {};
    // 获取模板类型（支持三列布局）
    const templateType = templateData?.templateType || 'single-column';
    // 简化逻辑：用户样式设置始终优先，模板数据作为结构配置
    console.log('styles.colors:', styles.colors); // 额外调试
    console.log('templateStyles.value:', templateStyles.value); // 调试当前设置
    // 使用用户当前的样式设置（右侧面板的设置始终有效）
    const colors = templateStyles.value.colors;
    const fonts = templateStyles.value.fonts;
    const spacing = templateStyles.value.spacing;
    console.log('简历编辑器提取出的颜色配置:', colors); // 调试日志
    console.log('简历编辑器提取出的字体配置:', fonts); // 调试日志
    console.log('简历模板类型:', templateType); // 调试日志
    const basic = profile.basic || {};
    const contacts = basic.contacts || {};
    const summary = profile.summary || '';
    const exps = Array.isArray(profile.experience) ? profile.experience : [];
    const edus = Array.isArray(profile.education) ? profile.education : [];
    const skills = Array.isArray(profile.skills) ? profile.skills : [];
    const projects = Array.isArray(profile.projects) ? profile.projects : [];
    // 获取各部分配置
    const headerConfig = sections.header || {};
    const summaryConfig = sections.summary || {};
    const skillsConfig = sections.skills || {};
    const experienceConfig = sections.experience || {};
    const educationConfig = sections.education || {};
    const projectsConfig = sections.projects || {};
    // 生成标题样式函数
    const getSectionTitleStyle = (sectionConfig) => {
        const titleStyle = sectionConfig.titleStyle || {};
        return `font-size: ${titleStyle.fontSize || '22px'}; 
            font-weight: ${titleStyle.fontWeight || '600'}; 
            color: ${titleStyle.color || colors.primary};
            border-bottom: ${titleStyle.borderBottom || `2px solid ${colors.primary}`};
            padding-bottom: 6px;
            margin-bottom: ${spacing.elementMargin || '15px'};`;
    };
    return `
  <div style="padding: 20px; font-family: ${fonts.body}; color: ${colors.text}; background-color: ${colors.background};">
    <div style="background: ${colors.background}; padding: 30px; border-radius: 6px; max-width: 860px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      
      <!-- 头部信息 -->
      <div style="text-align: center; margin-bottom: ${spacing.sectionMargin || '25px'};">
        <div style="font-size: 32px; font-weight: 700; color: ${colors.primary};">${basic.name || '张三'}</div>
        <div style="font-size: 18px; font-weight: 400; color: ${colors.text};">${basic.title || '前端工程师'}</div>
        <div style="margin-top: 10px; font-size: 14px; color: ${colors.text}; opacity: 0.8;">
          ${contacts.email || 'zhangsan@example.com'} · ${contacts.phone || '13800138000'} · ${contacts.site || 'https://example.com'}
        </div>
      </div>

      <!-- 个人概述 -->
      ${summaryConfig.enabled !== false && summary ? `
      <div style="margin: ${spacing.sectionMargin || '25px'} 0;">
        <div style="${getSectionTitleStyle(summaryConfig)}">${summaryConfig.title || '个人概述'}</div>
        <div style="font-size: ${summaryConfig.contentStyle?.fontSize || '15px'}; 
                    line-height: ${summaryConfig.contentStyle?.lineHeight || '1.6'}; 
                    color: ${colors.text};">
          ${summary}
        </div>
      </div>` : ''}

      <!-- 专业技能 -->
      ${skillsConfig.enabled !== false && skills.length ? `
      <div style="margin: ${spacing.sectionMargin || '25px'} 0;">
        <div style="${getSectionTitleStyle(skillsConfig)}">${skillsConfig.title || '专业技能'}</div>
        <div>
          ${skills.map((s) => `
            <span style="display: inline-block; 
                         background: ${skillsConfig.itemStyle?.backgroundColor || colors.secondary}; 
                         color: ${skillsConfig.itemStyle?.color || colors.text}; 
                         padding: ${skillsConfig.itemStyle?.padding || '8px 12px'}; 
                         margin: ${skillsConfig.itemStyle?.margin || '6px'}; 
                         border-radius: ${skillsConfig.itemStyle?.borderRadius || '20px'}; 
                         font-size: ${skillsConfig.itemStyle?.fontSize || '14px'};">
              ${s}
            </span>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- 工作经验 -->
      ${experienceConfig.enabled !== false && exps.length ? `
      <div style="margin: ${spacing.sectionMargin || '25px'} 0;">
        <div style="${getSectionTitleStyle(experienceConfig)}">${experienceConfig.title || '工作经验'}</div>
        ${exps.map((e) => `
          <div style="margin: ${spacing.elementMargin || '15px'} 0;">
            <div style="font-size: ${experienceConfig.itemStyle?.company?.fontSize || '18px'}; 
                        font-weight: ${experienceConfig.itemStyle?.company?.fontWeight || '600'}; 
                        color: ${experienceConfig.itemStyle?.company?.color || colors.text};">
              ${e.company || '示例公司A'}
            </div>
            <div style="font-size: ${experienceConfig.itemStyle?.position?.fontSize || '16px'}; 
                        font-weight: ${experienceConfig.itemStyle?.position?.fontWeight || '500'}; 
                        color: ${experienceConfig.itemStyle?.position?.color || colors.primary};">
              ${e.role || '前端工程师'}
            </div>
            <div style="font-size: ${experienceConfig.itemStyle?.date?.fontSize || '14px'}; 
                        color: ${experienceConfig.itemStyle?.date?.color || colors.text}; 
                        opacity: 0.7; margin: 5px 0;">
              ${e.start || '2022-01'} - ${e.end || '2023-12'}
            </div>
            <div style="font-size: ${experienceConfig.itemStyle?.description?.fontSize || '14px'}; 
                        line-height: ${experienceConfig.itemStyle?.description?.lineHeight || '1.5'}; 
                        color: ${colors.text};">
              ${e.desc || '负责核心业务前端研发与性能优化。'}
            </div>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- 项目经历 -->
      ${projectsConfig.enabled !== false && projects.length ? `
      <div style="margin: ${spacing.sectionMargin || '25px'} 0;">
        <div style="${getSectionTitleStyle(projectsConfig)}">${projectsConfig.title || '项目经历'}</div>
        ${projects.map((p) => `
          <div style="margin: ${spacing.elementMargin || '15px'} 0;">
            <div style="font-size: ${projectsConfig.itemStyle?.name?.fontSize || '18px'}; 
                        font-weight: ${projectsConfig.itemStyle?.name?.fontWeight || '600'}; 
                        color: ${projectsConfig.itemStyle?.name?.color || colors.text};">
              ${p.name || '在线简历平台'}
            </div>
            <div style="font-size: ${projectsConfig.itemStyle?.role?.fontSize || '16px'}; 
                        font-weight: ${projectsConfig.itemStyle?.role?.fontWeight || '500'}; 
                        color: ${projectsConfig.itemStyle?.role?.color || colors.primary};">
              ${p.role || '前端负责人'}
            </div>
            <div style="font-size: ${projectsConfig.itemStyle?.date?.fontSize || '14px'}; 
                        color: ${projectsConfig.itemStyle?.date?.color || colors.text}; 
                        opacity: 0.7; margin: 5px 0;">
              ${p.date || '2023'}
            </div>
            <div style="font-size: ${projectsConfig.itemStyle?.description?.fontSize || '14px'}; 
                        line-height: ${projectsConfig.itemStyle?.description?.lineHeight || '1.5'}; 
                        color: ${colors.text};">
              ${p.desc || '搭建在线编辑与导出能力。'}
            </div>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- 教育背景 -->
      ${educationConfig.enabled !== false && edus.length ? `
      <div style="margin: ${spacing.sectionMargin || '25px'} 0;">
        <div style="${getSectionTitleStyle(educationConfig)}">${educationConfig.title || '教育背景'}</div>
        ${edus.map((ed) => `
          <div style="margin: ${spacing.elementMargin || '15px'} 0;">
            <div style="font-size: ${educationConfig.itemStyle?.institution?.fontSize || '18px'}; 
                        font-weight: ${educationConfig.itemStyle?.institution?.fontWeight || '600'}; 
                        color: ${educationConfig.itemStyle?.institution?.color || colors.text};">
              ${ed.school || '北京大学'}
            </div>
            <div style="font-size: ${educationConfig.itemStyle?.degree?.fontSize || '16px'}; 
                        font-weight: ${educationConfig.itemStyle?.degree?.fontWeight || '500'}; 
                        color: ${educationConfig.itemStyle?.degree?.color || colors.primary};">
              ${ed.degree || '计算机科学 本科'}
            </div>
            <div style="font-size: ${educationConfig.itemStyle?.date?.fontSize || '14px'}; 
                        color: ${educationConfig.itemStyle?.date?.color || colors.text}; 
                        opacity: 0.7; margin: 5px 0;">
              ${ed.start || '2016-09'} - ${ed.end || '2020-06'}
            </div>
          </div>
        `).join('')}
      </div>` : ''}

    </div>
  </div>`;
}
// 工作经历操作
function addExperience() {
    profileData.value.experience.push({
        company: '',
        role: '',
        start: '',
        end: '',
        desc: ''
    });
}
function removeExperience(index) {
    profileData.value.experience.splice(index, 1);
}
// 技能操作
function addSkill() {
    showSkillInput.value = true;
    nextTick(() => {
        skillInputRef.value?.focus();
    });
}
function confirmSkill() {
    if (newSkill.value.trim()) {
        profileData.value.skills.push(newSkill.value.trim());
        newSkill.value = '';
    }
    showSkillInput.value = false;
}
function removeSkill(index) {
    profileData.value.skills.splice(index, 1);
}
// 项目经历操作
function addProject() {
    profileData.value.projects.push({
        name: '',
        role: '',
        date: '',
        desc: ''
    });
}
function removeProject(index) {
    profileData.value.projects.splice(index, 1);
}
// 教育背景操作
function addEducation() {
    profileData.value.education.push({
        school: '',
        degree: '',
        start: '',
        end: ''
    });
}
function removeEducation(index) {
    profileData.value.education.splice(index, 1);
}
// 设置面板操作
function toggleSettings() {
    settingsCollapsed.value = !settingsCollapsed.value;
}
function updatePreview() {
    // 预览会自动更新，因为使用了计算属性
}
function updateSpacing() {
    templateStyles.value.spacing.sectionMargin = spacingValues.value.section + 'px';
    templateStyles.value.spacing.elementMargin = spacingValues.value.element + 'px';
}
function updateTemplateType(type) {
    console.log('更新模板类型:', type);
    if (templateData.value) {
        templateData.value.templateType = type;
    }
    // 当切换到三列布局时，自动为每个章节分配列位置
    if (type === 'three-column') {
        // 确保初始化 sections 数组
        if (!templateData.value.sections) {
            templateData.value.sections = [];
        }
        const sections = templateData.value.sections;
        // 简单分配策略：均匀分配到三列
        sections.forEach((section, index) => {
            if (!section.style)
                section.style = {};
            // 基于索引分配列，实现均匀分配
            const columnIndex = index % 3 + 1;
            section.style.gridColumn = `${columnIndex} / ${columnIndex + 1}`;
        });
    }
}
// 保存和导出
async function saveResume() {
    if (!userStore.user?.id) {
        ElMessage.error('请先登录');
        return;
    }
    saveStatus.value = 'saving';
    try {
        const content = {
            profile: profileData.value,
            styles: templateStyles.value,
            templateData: templateData.value,
            templateType: templateType.value
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
            const title = `基于${templateData.value?.templateName || '模板'}的简历`;
            const result = await createResume(templateId, title, userStore.user.id, JSON.stringify(content));
            // 更新当前简历ID
            if (result.resumeId) {
                resume.value = { id: parseInt(result.resumeId), title, version: 1 };
                // 更新URL，添加resumeId参数
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('resumeId', result.resumeId);
                window.history.replaceState({}, '', newUrl.toString());
            }
        }
        saveStatus.value = 'saved';
        ElMessage.success('保存成功');
        // 3秒后清除保存状态
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
function exportPdf() {
    // TODO: 实现PDF导出
    ElMessage.info('导出功能开发中...');
}
// 自动保存（防抖）
let saveTimer = null;
watch([profileData, templateStyles], () => {
    if (saveTimer) {
        clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(() => {
        if (resume.value?.id) {
            // 只有已存在的简历才自动保存
            saveResume();
        }
    }, 2000); // 2秒防抖
}, { deep: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['editor-header']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-header']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-group']} */ ;
/** @type {__VLS_StyleScopedClasses['color-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['color-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['spacing-control']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-left']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-panel']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "resume-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.resume?.title || '未命名简历');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "save-status" },
});
(__VLS_ctx.saveStatusText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "edit-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.profileData.basic.name),
    placeholder: "请输入姓名",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.profileData.basic.name),
    placeholder: "请输入姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
const __VLS_4 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    modelValue: (__VLS_ctx.profileData.basic.title),
    placeholder: "请输入目标职位",
}));
const __VLS_6 = __VLS_5({
    modelValue: (__VLS_ctx.profileData.basic.title),
    placeholder: "请输入目标职位",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
const __VLS_8 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.profileData.basic.contacts.email),
    placeholder: "请输入邮箱",
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.profileData.basic.contacts.email),
    placeholder: "请输入邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
const __VLS_12 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.profileData.basic.contacts.phone),
    placeholder: "请输入电话",
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.profileData.basic.contacts.phone),
    placeholder: "请输入电话",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
const __VLS_16 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.profileData.basic.contacts.site),
    placeholder: "请输入网站地址",
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.profileData.basic.contacts.site),
    placeholder: "请输入网站地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "edit-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_20 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.profileData.summary),
    type: "textarea",
    rows: (4),
    placeholder: "请输入个人简介",
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.profileData.summary),
    type: "textarea",
    rows: (4),
    placeholder: "请输入个人简介",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "edit-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
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
    onClick: (__VLS_ctx.addExperience)
};
__VLS_27.slots.default;
const __VLS_32 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
var __VLS_35;
var __VLS_27;
for (const [exp, index] of __VLS_getVForSourceType((__VLS_ctx.profileData.experience))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "item-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (index + 1);
    const __VLS_40 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        text: true,
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_44;
    let __VLS_45;
    let __VLS_46;
    const __VLS_47 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeExperience(index);
        }
    };
    __VLS_43.slots.default;
    const __VLS_48 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
    const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    const __VLS_52 = {}.Delete;
    /** @type {[typeof __VLS_components.Delete, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
    const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
    var __VLS_51;
    var __VLS_43;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_56 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        modelValue: (exp.company),
        placeholder: "公司名称",
    }));
    const __VLS_58 = __VLS_57({
        modelValue: (exp.company),
        placeholder: "公司名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_60 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        modelValue: (exp.role),
        placeholder: "职位",
    }));
    const __VLS_62 = __VLS_61({
        modelValue: (exp.role),
        placeholder: "职位",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_64 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        modelValue: (exp.start),
        placeholder: "2023-01",
    }));
    const __VLS_66 = __VLS_65({
        modelValue: (exp.start),
        placeholder: "2023-01",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_68 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        modelValue: (exp.end),
        placeholder: "2024-01",
    }));
    const __VLS_70 = __VLS_69({
        modelValue: (exp.end),
        placeholder: "2024-01",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_72 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        modelValue: (exp.desc),
        type: "textarea",
        rows: (3),
        placeholder: "请描述工作内容和成果",
    }));
    const __VLS_74 = __VLS_73({
        modelValue: (exp.desc),
        type: "textarea",
        rows: (3),
        placeholder: "请描述工作内容和成果",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "edit-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_76 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}));
const __VLS_78 = __VLS_77({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onClick: (__VLS_ctx.addSkill)
};
__VLS_79.slots.default;
const __VLS_84 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
var __VLS_87;
var __VLS_79;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "skills-container" },
});
for (const [skill, index] of __VLS_getVForSourceType((__VLS_ctx.profileData.skills))) {
    const __VLS_92 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        ...{ 'onClose': {} },
        key: (index),
        closable: true,
        ...{ class: "skill-tag" },
    }));
    const __VLS_94 = __VLS_93({
        ...{ 'onClose': {} },
        key: (index),
        closable: true,
        ...{ class: "skill-tag" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    let __VLS_96;
    let __VLS_97;
    let __VLS_98;
    const __VLS_99 = {
        onClose: (...[$event]) => {
            __VLS_ctx.removeSkill(index);
        }
    };
    __VLS_95.slots.default;
    (skill);
    var __VLS_95;
}
if (__VLS_ctx.showSkillInput) {
    const __VLS_100 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        ...{ 'onKeyup': {} },
        ...{ 'onBlur': {} },
        ref: "skillInputRef",
        modelValue: (__VLS_ctx.newSkill),
        size: "small",
        ...{ class: "skill-input" },
    }));
    const __VLS_102 = __VLS_101({
        ...{ 'onKeyup': {} },
        ...{ 'onBlur': {} },
        ref: "skillInputRef",
        modelValue: (__VLS_ctx.newSkill),
        size: "small",
        ...{ class: "skill-input" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    let __VLS_104;
    let __VLS_105;
    let __VLS_106;
    const __VLS_107 = {
        onKeyup: (__VLS_ctx.confirmSkill)
    };
    const __VLS_108 = {
        onBlur: (__VLS_ctx.confirmSkill)
    };
    /** @type {typeof __VLS_ctx.skillInputRef} */ ;
    var __VLS_109 = {};
    var __VLS_103;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "edit-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_111 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}));
const __VLS_113 = __VLS_112({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
let __VLS_115;
let __VLS_116;
let __VLS_117;
const __VLS_118 = {
    onClick: (__VLS_ctx.addProject)
};
__VLS_114.slots.default;
const __VLS_119 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({}));
const __VLS_121 = __VLS_120({}, ...__VLS_functionalComponentArgsRest(__VLS_120));
__VLS_122.slots.default;
const __VLS_123 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({}));
const __VLS_125 = __VLS_124({}, ...__VLS_functionalComponentArgsRest(__VLS_124));
var __VLS_122;
var __VLS_114;
for (const [project, index] of __VLS_getVForSourceType((__VLS_ctx.profileData.projects))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "item-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (index + 1);
    const __VLS_127 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        text: true,
    }));
    const __VLS_129 = __VLS_128({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    let __VLS_131;
    let __VLS_132;
    let __VLS_133;
    const __VLS_134 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeProject(index);
        }
    };
    __VLS_130.slots.default;
    const __VLS_135 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({}));
    const __VLS_137 = __VLS_136({}, ...__VLS_functionalComponentArgsRest(__VLS_136));
    __VLS_138.slots.default;
    const __VLS_139 = {}.Delete;
    /** @type {[typeof __VLS_components.Delete, ]} */ ;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({}));
    const __VLS_141 = __VLS_140({}, ...__VLS_functionalComponentArgsRest(__VLS_140));
    var __VLS_138;
    var __VLS_130;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_143 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({
        modelValue: (project.name),
        placeholder: "项目名称",
    }));
    const __VLS_145 = __VLS_144({
        modelValue: (project.name),
        placeholder: "项目名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_144));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_147 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
        modelValue: (project.role),
        placeholder: "项目角色",
    }));
    const __VLS_149 = __VLS_148({
        modelValue: (project.role),
        placeholder: "项目角色",
    }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_151 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({
        modelValue: (project.date),
        placeholder: "2023",
    }));
    const __VLS_153 = __VLS_152({
        modelValue: (project.date),
        placeholder: "2023",
    }, ...__VLS_functionalComponentArgsRest(__VLS_152));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_155 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({
        modelValue: (project.desc),
        type: "textarea",
        rows: (3),
        placeholder: "请描述项目内容和技术栈",
    }));
    const __VLS_157 = __VLS_156({
        modelValue: (project.desc),
        type: "textarea",
        rows: (3),
        placeholder: "请描述项目内容和技术栈",
    }, ...__VLS_functionalComponentArgsRest(__VLS_156));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "edit-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_159 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}));
const __VLS_161 = __VLS_160({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_160));
let __VLS_163;
let __VLS_164;
let __VLS_165;
const __VLS_166 = {
    onClick: (__VLS_ctx.addEducation)
};
__VLS_162.slots.default;
const __VLS_167 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({}));
const __VLS_169 = __VLS_168({}, ...__VLS_functionalComponentArgsRest(__VLS_168));
__VLS_170.slots.default;
const __VLS_171 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
// @ts-ignore
const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({}));
const __VLS_173 = __VLS_172({}, ...__VLS_functionalComponentArgsRest(__VLS_172));
var __VLS_170;
var __VLS_162;
for (const [edu, index] of __VLS_getVForSourceType((__VLS_ctx.profileData.education))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "item-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (index + 1);
    const __VLS_175 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        text: true,
    }));
    const __VLS_177 = __VLS_176({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    let __VLS_179;
    let __VLS_180;
    let __VLS_181;
    const __VLS_182 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeEducation(index);
        }
    };
    __VLS_178.slots.default;
    const __VLS_183 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({}));
    const __VLS_185 = __VLS_184({}, ...__VLS_functionalComponentArgsRest(__VLS_184));
    __VLS_186.slots.default;
    const __VLS_187 = {}.Delete;
    /** @type {[typeof __VLS_components.Delete, ]} */ ;
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({}));
    const __VLS_189 = __VLS_188({}, ...__VLS_functionalComponentArgsRest(__VLS_188));
    var __VLS_186;
    var __VLS_178;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_191 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
        modelValue: (edu.school),
        placeholder: "学校名称",
    }));
    const __VLS_193 = __VLS_192({
        modelValue: (edu.school),
        placeholder: "学校名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_195 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({
        modelValue: (edu.degree),
        placeholder: "计算机科学 本科",
    }));
    const __VLS_197 = __VLS_196({
        modelValue: (edu.degree),
        placeholder: "计算机科学 本科",
    }, ...__VLS_functionalComponentArgsRest(__VLS_196));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_199 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
        modelValue: (edu.start),
        placeholder: "2016-09",
    }));
    const __VLS_201 = __VLS_200({
        modelValue: (edu.start),
        placeholder: "2016-09",
    }, ...__VLS_functionalComponentArgsRest(__VLS_200));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    const __VLS_203 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({
        modelValue: (edu.end),
        placeholder: "2020-06",
    }));
    const __VLS_205 = __VLS_204({
        modelValue: (edu.end),
        placeholder: "2020-06",
    }, ...__VLS_functionalComponentArgsRest(__VLS_204));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-actions" },
});
const __VLS_207 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({
    ...{ 'onClick': {} },
    size: "small",
}));
const __VLS_209 = __VLS_208({
    ...{ 'onClick': {} },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_208));
let __VLS_211;
let __VLS_212;
let __VLS_213;
const __VLS_214 = {
    onClick: (__VLS_ctx.saveResume)
};
__VLS_210.slots.default;
var __VLS_210;
const __VLS_215 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}));
const __VLS_217 = __VLS_216({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_216));
let __VLS_219;
let __VLS_220;
let __VLS_221;
const __VLS_222 = {
    onClick: (__VLS_ctx.exportPdf)
};
__VLS_218.slots.default;
var __VLS_218;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.iframe, __VLS_intrinsicElements.iframe)({
    ref: "previewIframe",
    srcdoc: (__VLS_ctx.previewHtml),
    ...{ class: "preview-iframe" },
    sandbox: "allow-same-origin",
});
/** @type {typeof __VLS_ctx.previewIframe} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-panel" },
    ...{ class: ({ collapsed: __VLS_ctx.settingsCollapsed }) },
});
if (!__VLS_ctx.settingsCollapsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    const __VLS_223 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
        ...{ 'onClick': {} },
        text: true,
        ...{ class: "toggle-btn" },
    }));
    const __VLS_225 = __VLS_224({
        ...{ 'onClick': {} },
        text: true,
        ...{ class: "toggle-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_224));
    let __VLS_227;
    let __VLS_228;
    let __VLS_229;
    const __VLS_230 = {
        onClick: (__VLS_ctx.toggleSettings)
    };
    __VLS_226.slots.default;
    const __VLS_231 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({}));
    const __VLS_233 = __VLS_232({}, ...__VLS_functionalComponentArgsRest(__VLS_232));
    __VLS_234.slots.default;
    const __VLS_235 = {}.ArrowRight;
    /** @type {[typeof __VLS_components.ArrowRight, ]} */ ;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({}));
    const __VLS_237 = __VLS_236({}, ...__VLS_functionalComponentArgsRest(__VLS_236));
    var __VLS_234;
    var __VLS_226;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-content" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.settingsCollapsed) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
const __VLS_239 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.templateType),
    ...{ style: {} },
}));
const __VLS_241 = __VLS_240({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.templateType),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_240));
let __VLS_243;
let __VLS_244;
let __VLS_245;
const __VLS_246 = {
    onChange: (__VLS_ctx.updateTemplateType)
};
__VLS_242.slots.default;
const __VLS_247 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
    label: "单列布局",
    value: "single-column",
}));
const __VLS_249 = __VLS_248({
    label: "单列布局",
    value: "single-column",
}, ...__VLS_functionalComponentArgsRest(__VLS_248));
const __VLS_251 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({
    label: "双列布局",
    value: "two-column",
}));
const __VLS_253 = __VLS_252({
    label: "双列布局",
    value: "two-column",
}, ...__VLS_functionalComponentArgsRest(__VLS_252));
const __VLS_255 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
    label: "三列布局",
    value: "three-column",
}));
const __VLS_257 = __VLS_256({
    label: "三列布局",
    value: "three-column",
}, ...__VLS_functionalComponentArgsRest(__VLS_256));
var __VLS_242;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "color-picker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.updatePreview) },
    type: "color",
});
(__VLS_ctx.templateStyles.colors.primary);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "color-picker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.updatePreview) },
    type: "color",
});
(__VLS_ctx.templateStyles.colors.text);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
const __VLS_259 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.templateStyles.fonts.body),
}));
const __VLS_261 = __VLS_260({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.templateStyles.fonts.body),
}, ...__VLS_functionalComponentArgsRest(__VLS_260));
let __VLS_263;
let __VLS_264;
let __VLS_265;
const __VLS_266 = {
    onChange: (__VLS_ctx.updatePreview)
};
__VLS_262.slots.default;
const __VLS_267 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
    label: "默认字体",
    value: "Open Sans, sans-serif",
}));
const __VLS_269 = __VLS_268({
    label: "默认字体",
    value: "Open Sans, sans-serif",
}, ...__VLS_functionalComponentArgsRest(__VLS_268));
const __VLS_271 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({
    label: "微软雅黑",
    value: "Microsoft YaHei, sans-serif",
}));
const __VLS_273 = __VLS_272({
    label: "微软雅黑",
    value: "Microsoft YaHei, sans-serif",
}, ...__VLS_functionalComponentArgsRest(__VLS_272));
const __VLS_275 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({
    label: "苹方",
    value: "PingFang SC, sans-serif",
}));
const __VLS_277 = __VLS_276({
    label: "苹方",
    value: "PingFang SC, sans-serif",
}, ...__VLS_functionalComponentArgsRest(__VLS_276));
var __VLS_262;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "spacing-control" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
const __VLS_279 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_280 = __VLS_asFunctionalComponent(__VLS_279, new __VLS_279({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.spacingValues.section),
    min: (10),
    max: (50),
}));
const __VLS_281 = __VLS_280({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.spacingValues.section),
    min: (10),
    max: (50),
}, ...__VLS_functionalComponentArgsRest(__VLS_280));
let __VLS_283;
let __VLS_284;
let __VLS_285;
const __VLS_286 = {
    onChange: (__VLS_ctx.updateSpacing)
};
var __VLS_282;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "spacing-control" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
const __VLS_287 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.spacingValues.element),
    min: (5),
    max: (30),
}));
const __VLS_289 = __VLS_288({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.spacingValues.element),
    min: (5),
    max: (30),
}, ...__VLS_functionalComponentArgsRest(__VLS_288));
let __VLS_291;
let __VLS_292;
let __VLS_293;
const __VLS_294 = {
    onChange: (__VLS_ctx.updateSpacing)
};
var __VLS_290;
if (__VLS_ctx.settingsCollapsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-toggle-collapsed" },
    });
    const __VLS_295 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_296 = __VLS_asFunctionalComponent(__VLS_295, new __VLS_295({
        ...{ 'onClick': {} },
        text: true,
        ...{ class: "toggle-btn-collapsed" },
    }));
    const __VLS_297 = __VLS_296({
        ...{ 'onClick': {} },
        text: true,
        ...{ class: "toggle-btn-collapsed" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_296));
    let __VLS_299;
    let __VLS_300;
    let __VLS_301;
    const __VLS_302 = {
        onClick: (__VLS_ctx.toggleSettings)
    };
    __VLS_298.slots.default;
    const __VLS_303 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_304 = __VLS_asFunctionalComponent(__VLS_303, new __VLS_303({}));
    const __VLS_305 = __VLS_304({}, ...__VLS_functionalComponentArgsRest(__VLS_304));
    __VLS_306.slots.default;
    const __VLS_307 = {}.ArrowLeft;
    /** @type {[typeof __VLS_components.ArrowLeft, ]} */ ;
    // @ts-ignore
    const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({}));
    const __VLS_309 = __VLS_308({}, ...__VLS_functionalComponentArgsRest(__VLS_308));
    var __VLS_306;
    var __VLS_298;
}
/** @type {__VLS_StyleScopedClasses['resume-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-left']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-header']} */ ;
/** @type {__VLS_StyleScopedClasses['save-status']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-content']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-section']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-container']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-input']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-right']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-container']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-iframe']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-header']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-content']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-group']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-group']} */ ;
/** @type {__VLS_StyleScopedClasses['color-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['color-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-group']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-group']} */ ;
/** @type {__VLS_StyleScopedClasses['spacing-control']} */ ;
/** @type {__VLS_StyleScopedClasses['spacing-control']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-toggle-collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-btn-collapsed']} */ ;
// @ts-ignore
var __VLS_110 = __VLS_109;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Plus: Plus,
            Delete: Delete,
            ArrowLeft: ArrowLeft,
            ArrowRight: ArrowRight,
            resume: resume,
            settingsCollapsed: settingsCollapsed,
            templateType: templateType,
            profileData: profileData,
            templateStyles: templateStyles,
            spacingValues: spacingValues,
            showSkillInput: showSkillInput,
            newSkill: newSkill,
            skillInputRef: skillInputRef,
            saveStatusText: saveStatusText,
            previewHtml: previewHtml,
            addExperience: addExperience,
            removeExperience: removeExperience,
            addSkill: addSkill,
            confirmSkill: confirmSkill,
            removeSkill: removeSkill,
            addProject: addProject,
            removeProject: removeProject,
            addEducation: addEducation,
            removeEducation: removeEducation,
            toggleSettings: toggleSettings,
            updatePreview: updatePreview,
            updateSpacing: updateSpacing,
            updateTemplateType: updateTemplateType,
            saveResume: saveResume,
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
