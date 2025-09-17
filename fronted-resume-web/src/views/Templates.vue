<template>
  <div class="templates-page">
    <div class="page-content">
      <!-- 页面标题和操作区域 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">简历库</h1>
        </div>
        <div class="header-right">
          <el-button type="warning" class="create-btn" @click="createProject">
            <el-icon><Plus /></el-icon>
            新建简历
          </el-button>
        </div>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input
          v-model="keyword"
          placeholder="搜索项目名称、描述或技术栈..."
          class="search-input"
          clearable
          @keyup.enter="load"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 模板网格 -->
      <div class="template-grid">
        <el-row :gutter="24">
          <el-col 
            v-for="t in list" 
            :key="t.templateId" 
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6" 
            :xl="6"
            class="template-col"
          >
            <el-card class="template-card" shadow="hover">
              <div class="template-preview">
                <img v-if="t.coverUrl" :src="t.coverUrl" alt="模板封面" />
                <div v-else class="preview-placeholder">
                  <el-icon size="40" color="#ccc"><Picture /></el-icon>
                  <span>封面</span>
                </div>
              </div>
              
              <div class="template-info">
                <h3 class="template-name">{{ t.name }}</h3>
                <p class="template-theme">主题：{{ t.themeColor }}</p>
              </div>
              
              <div class="template-actions">
                <el-button size="small" @click="openPreview(t.templateId)">
                  <el-icon><View /></el-icon>
                  预览
                </el-button>
                <el-button size="small" type="primary" @click="useTemplate(t.templateId)">
                  <el-icon><Plus /></el-icon>
                  使用
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="limit"
          :total="total"
          :page-sizes="[8, 16, 24, 32]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="load"
          @current-change="load"
        />
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="模板预览"
      width="90%"
      top="5vh"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="preview-content">
        <el-tabs v-model="activeTab" class="preview-tabs">
          <el-tab-pane label="渲染效果" name="preview">
            <div class="iframe-container">
              <iframe
                ref="previewIframe"
                class="preview-iframe"
                :srcdoc="previewHtml"
                sandbox="allow-scripts allow-same-origin"
                width="100%"
                height="600"
              ></iframe>
            </div>
          </el-tab-pane>
          <el-tab-pane label="可编辑数据" name="data">
            <div class="data-editor">
              <div class="data-header">
                <span>个人信息数据 (JSON格式)</span>
                <el-button size="small" @click="loadTemplateAndRender()">重置预览</el-button>
              </div>
              <el-input
                v-model="profileJson"
                type="textarea"
                :rows="20"
                placeholder="请输入JSON格式的个人信息数据"
                class="json-editor"
              />
              <div class="data-tip">
                修改左侧数据后会实时更新预览效果
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="模板数据" name="template">
            <el-card class="template-data-card">
              <pre class="template-data-content">{{ JSON.stringify(templateDataJson, null, 2) }}</pre>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="previewVisible = false">取消</el-button>
          <el-button @click="loadTemplateAndRender()">重置预览</el-button>
          <el-button type="primary" @click="confirmUse()">
            {{ autoUseAfterConfirm ? '确定使用' : '使用模板' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, View, Plus, Picture } from '@element-plus/icons-vue'
import { fetchTemplates, getTemplateDetail } from '@/api/template'
import { createResume, updateResume } from '@/api/resume'

const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(8)
const keyword = ref('')
const router = useRouter()

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

async function load() {
  const data = await fetchTemplates(page.value, limit.value, keyword.value)
  list.value = data.list
  total.value = data.total
}

// 预览与使用弹窗
const previewVisible = ref(false)
const previewHtml = ref('')
const currentTemplateId = ref<string>('')
const autoUseAfterConfirm = ref(false)
const activeTab = ref('preview')
const previewIframe = ref<HTMLIFrameElement>()
const profileJson = ref<string>(JSON.stringify({
  basic: { name: '张三', title: '前端工程师', contacts: { email: 'zhangsan@example.com', phone: '13800138000', site: 'https://example.com' } },
  summary: '拥有3+年前端经验，熟悉 Vue3/TypeScript，关注性能与体验。',
  experience: [ { company: '示例公司A', role: '前端工程师', start: '2022-01', end: '2023-12', desc: '负责核心业务前端研发与性能优化。' } ],
  education: [ { school: '北京大学', degree: '计算机科学 本科', start: '2016-09', end: '2020-06' } ],
  skills: ['JavaScript','TypeScript','Vue3','Vite','Pinia'],
  projects: [ { name: '在线简历平台', role: '前端负责人', date: '2023', desc: '搭建在线编辑与导出能力。' } ]
}, null, 2))
const templateDataJson = ref<any>(null)

function openPreview(templateId: string) {
  currentTemplateId.value = templateId
  autoUseAfterConfirm.value = false
  activeTab.value = 'preview'
  loadTemplateAndRender()
}

function useTemplate(templateId: string) {
  // 在新标签页中打开编辑器
  const editorUrl = `/resume-editor?templateId=${templateId}`
  window.open(editorUrl, '_blank')
}

async function loadTemplateAndRender() {
  if (!currentTemplateId.value) return
  
  try {
    const detail = await getTemplateDetail(currentTemplateId.value)
    console.log('用户端获取到的模板详情:', detail) // 调试日志
    
    // 解析模板数据
    let templateDataObj
    if (typeof detail.templateData === 'string') {
      templateDataObj = JSON.parse(detail.templateData)
    } else {
      templateDataObj = detail.templateData || {}
    }
    
    console.log('用户端解析后的模板数据:', templateDataObj) // 调试日志
    console.log('用户端模板颜色配置:', templateDataObj?.styles?.colors) // 调试日志
    
    templateDataJson.value = templateDataObj
    
    // 生成预览HTML
    previewHtml.value = generatePreviewHtml(templateDataObj, safeParse(profileJson.value))
    previewVisible.value = true
    
  } catch (error) {
    console.error('加载模板详情失败:', error)
    // 生成错误预览
    previewHtml.value = generateErrorPreview(error)
    previewVisible.value = true
  }
}

function generateErrorPreview(error: any) {
  return `
    <div style="padding: 40px; text-align: center; background-color: #ffffff; color: #333; font-family: 'Open Sans', sans-serif;">
      <h2 style="color: #e74c3c; margin-bottom: 20px; font-size: 24px;">模板预览失败</h2>
      <p style="margin-bottom: 20px; color: #666; font-size: 16px;">无法加载模板数据，请稍后重试或联系管理员。</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: left; font-family: 'Consolas', monospace; font-size: 12px; color: #666; border: 1px solid #e9ecef;">
        <strong>错误信息:</strong> ${error.message || '未知错误'}
      </div>
    </div>
  `
}

watch(profileJson, (v) => {
  try {
    if (!templateDataJson.value) return
    const p = JSON.parse(v)
    previewHtml.value = generatePreviewHtml(templateDataJson.value, p)
  } catch {}
})

function safeParse(v: string) { try { return JSON.parse(v) } catch { return {} } }

function generatePreviewHtml(templateData: any, profile: any) {
  console.log('用户端 generatePreviewHtml 接收到的 templateData:', templateData) // 调试日志
  
  const styles = templateData?.styles || {}
  const sections = templateData?.sections || {}
  
  // 正确处理颜色配置，确保使用真实的模板数据
  const defaultColors = { primary: '#3498db', secondary: '#f0f8ff', text: '#2c3e50', background: '#ffffff' }
  const colors = {
    primary: styles.colors?.primary || defaultColors.primary,
    secondary: styles.colors?.secondary || defaultColors.secondary, 
    text: styles.colors?.text || defaultColors.text,
    background: styles.colors?.background || defaultColors.background,
    accent: styles.colors?.accent || styles.colors?.primary || defaultColors.primary
  }
  
  // 正确处理字体配置
  const defaultFonts = { heading: 'Montserrat, sans-serif', body: 'Open Sans, sans-serif' }
  const fonts = {
    heading: styles.fonts?.heading || defaultFonts.heading,
    body: styles.fonts?.body || defaultFonts.body
  }
  
  // 正确处理间距配置
  const defaultSpacing = { sectionMargin: '25px', elementMargin: '15px' }
  const spacing = {
    sectionMargin: styles.spacing?.sectionMargin || defaultSpacing.sectionMargin,
    elementMargin: styles.spacing?.elementMargin || defaultSpacing.elementMargin
  }
  
  console.log('用户端提取出的颜色配置:', colors) // 调试日志
  console.log('用户端提取出的字体配置:', fonts) // 调试日志

  const basic = profile.basic || {}
  const contacts = basic.contacts || {}
  const summary = profile.summary || ''
  const exps = Array.isArray(profile.experience) ? profile.experience : []
  const edus = Array.isArray(profile.education) ? profile.education : []
  const skills = Array.isArray(profile.skills) ? profile.skills : []
  const projects = Array.isArray(profile.projects) ? profile.projects : []

  // 获取各部分配置
  const headerConfig = sections.header || {}
  const summaryConfig = sections.summary || {}
  const skillsConfig = sections.skills || {}
  const experienceConfig = sections.experience || {}
  const educationConfig = sections.education || {}
  const projectsConfig = sections.projects || {}

  // 生成头部样式
  const headerNameStyle = headerConfig.elements?.[0] ? 
    `font-size: ${headerConfig.elements[0].fontSize || '32px'}; 
     font-weight: ${headerConfig.elements[0].fontWeight || '700'}; 
     color: ${headerConfig.elements[0].color || colors.primary};` :
    `font-size: 32px; font-weight: 700; color: ${colors.primary};`

  const headerTitleStyle = headerConfig.elements?.[1] ? 
    `font-size: ${headerConfig.elements[1].fontSize || '18px'}; 
     font-weight: ${headerConfig.elements[1].fontWeight || '400'}; 
     color: ${headerConfig.elements[1].color || colors.text};` :
    `font-size: 18px; font-weight: 400; color: ${colors.text};`

  // 生成标题样式函数
  const getSectionTitleStyle = (sectionConfig: any) => {
    const titleStyle = sectionConfig.titleStyle || {}
    return `font-size: ${titleStyle.fontSize || '22px'}; 
            font-weight: ${titleStyle.fontWeight || '600'}; 
            color: ${titleStyle.color || colors.primary};
            border-bottom: ${titleStyle.borderBottom || `2px solid ${colors.primary}`};
            padding-bottom: 6px;
            margin-bottom: ${spacing.elementMargin || '15px'};`
  }

  return `
  <div style="padding: 20px; font-family: ${fonts.body}; color: ${colors.text}; background-color: ${colors.background};">
    <div style="background: ${colors.background}; padding: 30px; border-radius: 6px; max-width: 860px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      
      <!-- 头部信息 -->
      ${headerConfig.enabled !== false ? `
      <div style="text-align: center; margin-bottom: ${spacing.sectionMargin || '25px'};">
        <div style="${headerNameStyle}">${basic.name || '张三'}</div>
        <div style="${headerTitleStyle}">${basic.title || '前端工程师'}</div>
        <div style="margin-top: 10px; font-size: 14px; color: ${colors.text}; opacity: 0.8;">
          ${contacts.email || 'zhangsan@example.com'} · ${contacts.phone || '13800138000'} · ${contacts.site || 'https://example.com'}
        </div>
      </div>` : ''}

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
          ${skills.map((s: string) => `
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
        ${exps.map((e: any) => `
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
        ${projects.map((p: any) => `
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
        ${edus.map((ed: any) => `
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
  </div>`
}

async function confirmUse() {
  if (!currentTemplateId.value) return
  // 这个函数现在已被 useTemplate 替代，保留兼容性
  useTemplate(currentTemplateId.value)
  previewVisible.value = false
}

function createProject() {
  // 创建新项目的逻辑，暂时跳转到模板选择
  router.push('/templates')
}

function buildResumeFrom(tpl: any, profile: any, resumeId: string, templateId: string) {
  const theme = tpl?.styles?.colors?.primary || '#2e6cff'
  const fontFamily = (tpl?.styles?.fonts?.body) || 'Source Han Sans'
  const basic = profile?.basic || {}
  const exps = Array.isArray(profile?.experience) ? profile.experience : []
  const summary = profile?.summary || ''
  const sections: any[] = []
  if (summary) sections.push({ id: crypto.randomUUID(), type: 'summary', title: '个人简介', visible: true, items: [ { type:'summary', content: summary } ] })
  if (exps.length) sections.push({ id: crypto.randomUUID(), type: 'work', title: '工作经历', visible: true, items: exps.map((e:any)=>({ type:'work', company:e.company, role:e.role, start:e.start, end:e.end, highlights: e.desc? [e.desc]: [] })) })
  const margins: [number, number, number, number] = [48,48,48,48]
  return {
    resumeId,
    userId: 'u_1',
    templateId,
    meta: { title: basic.title ? `${basic.name || '我的'} - ${basic.title}` : (basic.name || '我的简历'), updatedAt: Date.now(), version: 1 },
    style: { themeColor: theme, fontFamily, fontSize: 12, lineHeight: 1.4, page: { margin: margins, columns: 1 as 1 } },
    sections
  }
}

onMounted(load)
</script>


<style scoped>
.templates-page {
  height: 100vh;
  background: #f7f8fa;
}

.page-content {
  height: 100%;
  padding: 32px;
  overflow-y: auto;
  width: 100%;
  max-width: none;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.create-btn {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  background: #ff6b35;
  border-color: #ff6b35;
}

.create-btn:hover {
  background: #e55a2b;
  border-color: #e55a2b;
}

.search-section {
  margin-bottom: 32px;
}

.search-input {
  width: 100%;
  max-width: 500px;
}

.search-icon {
  color: #9ca3af;
}

.template-grid {
  margin-bottom: 32px;
}

.template-col {
  margin-bottom: 24px;
}

.template-card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.template-card:hover {
  transform: translateY(-2px);
}

.template-preview {
  height: 200px;
  background: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  gap: 8px;
}

.template-info {
  margin-bottom: 16px;
}

.template-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.template-theme {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.template-actions .el-button {
  flex: 1;
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

/* 预览对话框样式 */
.preview-content {
  height: 70vh;
  min-height: 500px;
}

.preview-tabs {
  height: 100%;
}

.preview-tabs :deep(.el-tabs__content) {
  height: calc(100% - 55px);
  overflow: hidden;
}

.preview-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: auto;
}

.iframe-container {
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.preview-iframe {
  border: none;
  border-radius: 8px;
}

.data-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
}

.json-editor {
  flex: 1;
}

.json-editor :deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.data-tip {
  margin-top: 12px;
  color: #666;
  font-size: 12px;
}

.template-data-card {
  height: 100%;
}

.template-data-card :deep(.el-card__body) {
  height: 100%;
  overflow: auto;
}

.template-data-content {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #333;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  overflow: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-content {
    padding: 16px;
  }
  
  .search-section {
    text-align: center;
  }
  
  .search-section .el-input {
    width: 100% !important;
    max-width: 300px;
  }
}
</style>

