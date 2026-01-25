<template>
  <div class="resume-editor" :class="{ 'ai-open': aiVisible }">
    <!-- 左侧编辑区域 -->
    <div class="editor-left">
      <div class="editor-header">
        <h2>{{ displayTitle }}</h2>
        <div class="save-status">{{ saveStatusText }}</div>
      </div>
      
      <div class="editor-content">
        <!-- 动态模块列表 -->
        <ModuleListEditor 
          ref="moduleListRef"
          :resume-data="resumeData"
          @ai="onAiFromSection"
          :highlighted-section-id="highlightedSectionId"
          @highlight="handleEditorHighlight"
          @clear-highlight="clearEditorHighlight"
          @select="handleEditorSelect"
        />
        
        <!-- 自定义模块配置弹窗 -->
        <CustomSectionConfig
          v-model:visible="showCustomConfig"
          @confirm="confirmCustomSection"
          @cancel="showCustomConfig = false"
          @closed="showCustomConfig = false"
        />
      </div>
    </div>

    <!-- 中间 AI 润色 + 预览区域（两列） -->
    <div class="editor-right">
      <div class="ai-and-preview" :class="{ 'with-ai': aiVisible }">
        <div v-if="aiVisible" class="ai-column">
          <AiPolishPanel
            :visible="aiVisible"
            :input-text="currentRichText"
            @apply="applyAiSuggestion"
            @close="aiVisible = false"
          />
        </div>
        <div class="preview-column">
          <div class="preview-header">
            <h3>实时预览</h3>
            <div class="preview-actions">
              <el-button size="small" @click="saveResume">保存</el-button>
              <el-button size="small" type="primary" @click="exportPdf">导出PDF</el-button>
            </div>
          </div>
          <div class="preview-container" ref="previewContainerRef">
            <NewResumePreview 
              :resume-data="resumeData"
              :template-data="templateData"
              :template-type="templateData?.templateType || 'single-column'"
              :extra-styles="templateStyles"
              :custom-css="customCss"
              :key="`preview-${Date.now()}`"
              :highlighted-section-id="highlightedSectionId"
              @section-hover="handlePreviewHighlight"
              @section-select="handlePreviewSelect"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧样式设置面板 -->
    <StylePanel
      v-model="templateStyles"
      :collapsed="settingsCollapsed"
      @toggle="toggleSettings"
      @update="updatePreview"
      @update:customCss="customCss = $event"
    />

    <!-- 收起状态的箭头按钮 -->
    <div v-if="settingsCollapsed" class="settings-toggle-collapsed">
      <el-button 
        text 
        @click="toggleSettings"
        class="toggle-btn-collapsed"
      >
        <el-icon>
          <ArrowLeft />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// 组件导入
import SimpleSectionEditor from '@/components/editor/SimpleSectionEditor.vue'
import StylePanel from '@/components/editor/StylePanel.vue'
import CustomSectionConfig from '@/components/editor/CustomSectionConfig.vue'
import AiPolishPanel from '@/components/editor/AiPolishPanel.vue'
import ModuleListEditor from '@/components/editor/ModuleListEditor.vue'

// 类型和工具导入
import type { ResumeData, TemplateData, TemplateDataV2, TemplateStyles, ResumeSection, ModuleType } from '@/types/resume'
import { getTemplateDetail } from '@/api/template'
import { createResume, getResume, updateResume } from '@/api/resume'
import { useUserStore } from '@/store/user'
import NewResumePreview from '@/components/resume/NewResumePreview.vue'
import { 
  transformProfileDataToSections, 
  transformSectionsToProfileData, 
  createNewSection,
  reorderSections
} from '@/utils/dataTransform'
import { createEmptyRichText, normalizeSectionRichText } from '@/utils/richText'
import { adaptLegacyTemplateData, adaptLegacyResumeData } from '@/utils/templateAdapter'
import { applyTemplateToResume } from '@/utils/templateMapper'
import { isBasicSection, getCanonicalSectionType } from '@/utils/sectionType'
import { exportResumeWithPagedjs } from '@/utils/pagedExport'
import { DEFAULT_SECTION_TITLES, SECTION_TYPE_OPTIONS } from '@/config/sectionTypes'
// 已移除 moduleStateManager 依赖，统一以 resumeData.sections 为数据源

// 其他组件已在上面导入

// 路由参数
const route = useRoute()
const templateId = route.query.templateId as string
const resumeId = route.query.resumeId as string

// 用户状态
const userStore = useUserStore()

// 响应式数据
const resume = ref<any>(null)
const templateData = ref<TemplateDataV2 | null>(null)
const templateMetaName = ref<string>('')
const settingsCollapsed = ref(true)
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const showCustomConfig = ref(false)
const customCss = ref<string>('')
const aiVisible = ref(false)
const currentRichText = ref<string>('')
const aiTarget = ref<{ sectionId: string; itemIndex: number; fieldName: string } | null>(null)
const highlightedSectionId = ref<string | null>(null)
const moduleListRef = ref<InstanceType<typeof ModuleListEditor> | null>(null)
const previewContainerRef = ref<HTMLElement | null>(null)

// 简历数据 - 新的结构
const resumeData = ref<ResumeData>({
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
})

// 模板样式
const templateStyles = ref<TemplateStyles>({
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
})

interface BasicSectionOverrides {
  title?: string
  visible?: boolean
  config?: Record<string, any>
  style?: Record<string, any>
  order?: number
}

function extractOverridesFromSection(section?: ResumeSection | null): BasicSectionOverrides | undefined {
  if (!section) return undefined
  return {
    title: section.title,
    visible: section.visible,
    config: section.config,
    style: section.style,
    order: section.order
  }
}

function buildBasicSection(overrides?: BasicSectionOverrides): ResumeSection {
  const sections = resumeData.value.sections || []
  const existing = sections.find((section) => isBasicSection(section.type))
  const base: ResumeSection = existing
    ? { ...existing, type: 'basic' }
    : {
        id: `basic-${Date.now()}`,
        type: 'basic',
        title: '个人信息',
        visible: true,
        order: 0,
        items: [],
        config: {}
      }

  if (overrides?.title) base.title = overrides.title
  if (overrides?.visible !== undefined) base.visible = overrides.visible
  if (overrides?.config) {
    base.config = { ...overrides.config }
  } else if (!base.config) {
    base.config = {}
  }
  if (overrides?.style) {
    base.style = { ...overrides.style }
  } else if (!base.style) {
    base.style = {}
  }
  if (overrides?.order !== undefined) {
    base.order = overrides.order
  }

  return base
}

function setSectionsKeepingBasic(
  sectionsInput: ResumeSection[] | undefined,
  explicitOverrides?: BasicSectionOverrides
) {
  const sections = Array.isArray(sectionsInput) ? sectionsInput : []
  const inlineBasic = explicitOverrides ? undefined : sections.find((section) => isBasicSection(section.type))
  const overrides = explicitOverrides || extractOverridesFromSection(inlineBasic)
  const filteredSections = sections.filter((section) => !isBasicSection(section.type))
  const basicSection = buildBasicSection(overrides)
  const normalized = [basicSection, ...filteredSections].map((section, index) => ({
    ...section,
    type: isBasicSection(section.type) ? 'basic' : section.type,
    order: index
  }))
  resumeData.value.sections = normalized
  return normalized
}

// 计算属性
const saveStatusText = computed(() => {
  const statusMap = {
    idle: '',
    saving: '保存中...',
    saved: '已保存',
    error: '保存失败'
  }
  return statusMap[saveStatus.value]
})

// 显示在编辑页左上角的标题：已有简历标题 > 基于模板名的默认标题 > 占位
const displayTitle = computed(() => {
  const existing = resume.value?.title
  if (existing) return existing
  const tplName = templateMetaName.value || templateData.value?.templateName
  return tplName ? `基于${tplName}的简历` : '未命名简历'
})

// 动态设置浏览器标签页标题（只显示模板名称）
watch([templateMetaName, templateData], () => {
  const tplName = templateMetaName.value || templateData.value?.templateName
  if (tplName) {
    document.title = tplName
  } else if (resume.value?.title) {
    document.title = resume.value.title
  } else {
    document.title = '简历编辑器'
  }
}, { immediate: true })

// 预览HTML生成 - 已替换为DynamicResumePreview组件
// const previewHtml = computed(() => {
//   const renderEngine = new ResumeRenderEngine(templateData.value, templateStyles.value)
//   return renderEngine.generateHtml(resumeData.value)
// })

// 初始化
onMounted(async () => {
  if (templateId) {
    await loadTemplate()
  }
  if (resumeId) {
    await loadResume()
  } else if (!templateId) {
    // 只有在没有模板ID且没有简历ID时才创建默认模块
    initializeDefaultSections()
  }
})

// 加载模板
async function loadTemplate() {
  try {
    const template = await getTemplateDetail(templateId)
    console.log('加载模板详情:', template)
    const rootTplName = (template as any)?.name || (template as any)?.templateName
    if (rootTplName) {
      templateMetaName.value = rootTplName
    }
    
    // 处理模板数据（对齐 middle-resume 的多重容错策略）
    function safeParseTemplateData(input: any): any {
      if (!input) return {}
      if (typeof input === 'object') return input
      let str = String(input)
      // 1) 直接解析
      try { return JSON.parse(str) } catch {}
      // 2) 清理 BOM 与前后空白再试
      try {
        let cleaned = str.replace(/^\uFEFF/, '').replace(/^\s+/, '').replace(/\s+$/, '')
        return JSON.parse(cleaned)
      } catch {}
      // 3) 从第一个 { 截取到最后一个 } 再试
      try {
        const first = str.indexOf('{')
        const last = str.lastIndexOf('}')
        if (first !== -1 && last > first) {
          const sliced = str.slice(first, last + 1)
          return JSON.parse(sliced)
        }
      } catch {}
      // 4) 兜底：尝试按对象字面量宽松解析（兼容单引号/尾逗号）
      try {
        const first = str.indexOf('{')
        const last = str.lastIndexOf('}')
        const sliced = (first !== -1 && last > first) ? str.slice(first, last + 1) : str
        const obj = (new Function('return (' + sliced + ')'))()
        if (obj && typeof obj === 'object') return obj
      } catch {}
      // 5) 最终兜底：返回空对象
      return {}
    }

    const parsedTemplateData = safeParseTemplateData(template.templateData)
    if (!parsedTemplateData || Object.keys(parsedTemplateData).length === 0) {
      ElMessage.error('模板数据格式错误，无法加载')
      console.error('Raw templateData:', template.templateData)
      return
    }
    

    
    // 设置模板数据
    templateData.value = parsedTemplateData
    
    // 更新样式配置（模板样式）
    if (parsedTemplateData?.styles) {
      Object.assign(templateStyles.value.colors, parsedTemplateData.styles.colors)
      Object.assign(templateStyles.value.fonts, parsedTemplateData.styles.fonts)
      Object.assign(templateStyles.value.spacing, parsedTemplateData.styles.spacing)
    }
    // 同步全局样式（新模板 globalStyles → 简历数据的 globalStyles）
    if (parsedTemplateData?.globalStyles) {
      resumeData.value.globalStyles = parsedTemplateData.globalStyles
    }
    
    // 处理两种模板格式：新格式(sections) 和 旧格式(layout)
    if (parsedTemplateData?.sections && Array.isArray(parsedTemplateData.sections)) {
      try {
        mergeTemplateProfile(parsedTemplateData.profile)
        const mergedSections = applyTemplateToResume(
          parsedTemplateData.sections,
          resumeData.value.sections
        )
        const completedSections = ensureAllStandardSections(mergedSections)
        setSectionsKeepingBasic(completedSections)
        console.log('成功回填新格式模板数据到 resumeData:', completedSections)
      } catch (sectionError) {
        console.error('回填新格式模板数据时出错:', sectionError)
      }
    } else if (parsedTemplateData?.layout && Array.isArray(parsedTemplateData.layout)) {
      // 旧格式：根据 layout 数组创建 sections
      try {
        mergeTemplateProfile(parsedTemplateData.profile)
        
        // 根据 layout 创建 sections
        const newSections: ResumeSection[] = []
        let basicOverrides: BasicSectionOverrides | undefined

        parsedTemplateData.layout.forEach((moduleConfig: any, index: number) => {
          if (!moduleConfig) return

          const canonicalType = getCanonicalSectionType(moduleConfig.type) || moduleConfig.type

          if (isBasicSection(canonicalType)) {
            basicOverrides = {
              title: moduleConfig.title || moduleConfig.config?.title || '基本信息',
              visible: moduleConfig.visible !== false,
              config: moduleConfig.config,
              style: moduleConfig.style,
              order: moduleConfig.order ?? index
            }
            return
          }

          const sectionType = canonicalType as ModuleType
          const section = createNewSection(sectionType, newSections)
          section.title = moduleConfig.config?.title || getDefaultSectionTitle(sectionType)
          section.order = typeof moduleConfig.order === 'number' ? moduleConfig.order : index
          section.visible = moduleConfig.visible !== false
          section.config = moduleConfig.config || section.config
          section.style = moduleConfig.style || section.style
          newSections.push(section)
        })
        
        const normalizedSections = newSections.map(section => normalizeSectionRichText(section))
        const completedSections = ensureAllStandardSections(normalizedSections)
        setSectionsKeepingBasic(completedSections, basicOverrides)
        
        console.log('成功根据 layout 创建 sections:', newSections)
      } catch (layoutError) {
        console.error('根据 layout 创建 sections 时出错:', layoutError)
      }
    } else {
      // 兜底：创建默认模块
      console.log('模板格式不支持，使用默认模块')
      initializeDefaultSections()
    }

    console.log('模板加载完成:', parsedTemplateData)
    
    // 模板加载成功，清除可能的错误信息
    ElMessage.success('模板加载成功')
  } catch (error) {
    ElMessage.error('模板加载失败')
    console.error('Template load error:', error)
  }
}

// 获取模块类型的默认标题
function getDefaultSectionTitle(type: string): string {
  return DEFAULT_SECTION_TITLES[type] || type
}

const STANDARD_SECTION_TYPES = SECTION_TYPE_OPTIONS.map(option => option.value) as ModuleType[]

function buildPlaceholderSection(type: ModuleType, visible: boolean, order: number): ResumeSection {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const base: ResumeSection = {
    id,
    type,
    title: getDefaultSectionTitle(type),
    visible,
    order,
    items: []
  }

  if (type === 'custom') {
    base.config = {
      fields: [
        { name: 'title', label: '标题', type: 'text', required: true },
        { name: 'content', label: '内容', type: 'textarea', required: false }
      ]
    }
  }

  return base
}

function ensureAllStandardSections(sectionsInput: ResumeSection[]): ResumeSection[] {
  const sections = Array.isArray(sectionsInput) ? [...sectionsInput] : []
  const existingTypes = new Set<string>()

  sections.forEach((section) => {
    const canonical = getCanonicalSectionType(section.type) || section.type
    if (!canonical || canonical === 'basic') return
    existingTypes.add(canonical)
  })

  let maxOrder = Math.max(-1, ...sections.map(section => section.order || 0))

  STANDARD_SECTION_TYPES.forEach((type) => {
    if (type === 'basic') return
    if (existingTypes.has(type)) return
    maxOrder += 1
    sections.push(buildPlaceholderSection(type, false, maxOrder))
  })

  return sections
}

function mergeTemplateProfile(templateProfile: any) {
  if (!templateProfile) return
  const target = resumeData.value.profile

  if (!target.basic) {
    target.basic = {
      name: '',
      title: '',
      contacts: {
        email: '',
        phone: '',
        site: ''
      }
    }
  }

  const templateBasic = templateProfile.basic || {}
  target.basic.name = target.basic.name || templateBasic.name || ''
  target.basic.title = target.basic.title || templateBasic.title || ''
  const targetContacts = target.basic.contacts || {}
  const templateContacts = templateBasic.contacts || {}
  target.basic.contacts = {
    email: targetContacts.email || templateContacts.email || '',
    phone: targetContacts.phone || templateContacts.phone || '',
    site: targetContacts.site || templateContacts.site || ''
  }

  if (!target.summary && templateProfile.summary) {
    target.summary = templateProfile.summary
  }
}



// 加载简历
async function loadResume() {
  try {
    const resumeData_api = await getResume(resumeId, userStore.user?.id)
    resume.value = resumeData_api
    
    // 解析简历内容
    if (resumeData_api.content) {
      const content = typeof resumeData_api.content === 'string' 
        ? JSON.parse(resumeData_api.content) 
        : resumeData_api.content
      
      if (content.profile) {
        // 如果是新格式的数据
        if (content.sections) {
          resumeData.value = content as ResumeData
        } else {
          // 如果是旧格式，转换为新格式
          resumeData.value = transformProfileDataToSections(content.profile)
        }
      }
      
      if (content.styles) {
        Object.assign(templateStyles.value, content.styles)
      }

      const normalizedSections = Array.isArray(resumeData.value.sections)
        ? resumeData.value.sections.map(section => normalizeSectionRichText(section))
        : []
      const completedSections = ensureAllStandardSections(normalizedSections)
      setSectionsKeepingBasic(completedSections)
    }
    
    ElMessage.success('简历加载成功')
  } catch (error) {
    ElMessage.error('简历加载失败')
    console.error('Resume load error:', error)
  }
}

// 初始化默认模块
function initializeDefaultSections() {
  const orderSeed: ResumeSection[] = []
  const seq = (n: number) => Array.from({ length: n }).map((_, i) => ({ id: `seed-${i}`, order: i } as unknown as ResumeSection))
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
  ]
  setSectionsKeepingBasic([...resumeData.value.sections])
}

// 添加新模块
function addSection(type: 'experience' | 'education' | 'skills' | 'projects' | 'custom') {
  if (type === 'custom') {
    showCustomConfig.value = true
    return
  }
  
  const newSection = createNewSection(type, resumeData.value.sections)
  resumeData.value.sections.push(newSection)
  
  ElMessage.success(`已添加${newSection.title}模块`)
}

// 确认自定义模块配置
function confirmCustomSection(config: any) {
  const newSection = createNewSection('custom', resumeData.value.sections, config.title)
  newSection.config = {
    fields: config.fields
  }
  
  resumeData.value.sections.push(newSection)
  showCustomConfig.value = false
  
  ElMessage.success(`已添加${config.title}模块`)
}

// 删除模块
function removeSection(sectionId: string) {
  const index = resumeData.value.sections.findIndex(s => s.id === sectionId)
  if (index > -1) {
    const section = resumeData.value.sections[index]
    resumeData.value.sections.splice(index, 1)
    ElMessage.success(`已删除${section.title}模块`)
  }
}

// 移动模块顺序
function moveSection(sectionId: string, delta: 1 | -1) {
  const idx = resumeData.value.sections.findIndex(s => s.id === sectionId)
  if (idx === -1) return
  const target = idx + delta
  if (target < 0 || target >= resumeData.value.sections.length) return
  const reordered = reorderSections(resumeData.value.sections, idx, target)
  setSectionsKeepingBasic(reordered)
}

// 设置面板操作
function toggleSettings() {
  settingsCollapsed.value = !settingsCollapsed.value
}

function updatePreview() {
  // 预览会自动更新，因为使用了计算属性
}

// 供子组件触发 AI 面板
;(window as any).__RTE_AI_TRIGGER__ = (html: string) => triggerAiFor(html)

// AI 润色：从外部触发（后续与富文本编辑器集成时调用）
function onAiFromSection(payload: { sectionId: string; itemIndex: number; fieldName: string; html: string }) {
  aiTarget.value = { sectionId: payload.sectionId, itemIndex: payload.itemIndex, fieldName: payload.fieldName }
  triggerAiFor(payload.html)
}

function triggerAiFor(text: any) {
  if (!text) { aiVisible.value = false; return }
  const html = typeof text === 'string' ? text : (text.html || '')
  currentRichText.value = html
  aiVisible.value = !!(html && html.trim())
}

function applyAiSuggestion(html: string) {
  // 精准回填：写回触发AI的具体模块/条目/字段
  if (!aiTarget.value) return
  const { sectionId, itemIndex, fieldName } = aiTarget.value
  const sec = resumeData.value.sections.find(s => s.id === sectionId)
  if (!sec || !sec.items?.[itemIndex]) return
  
  // 类型断言，确保fieldName可以作为索引
  const item = sec.items[itemIndex] as any
  item[fieldName] = { html }
}

function handleEditorHighlight(sectionId: string) {
  highlightedSectionId.value = sectionId
}

function clearEditorHighlight() {
  highlightedSectionId.value = null
}

function handleEditorSelect(sectionId: string) {
  highlightedSectionId.value = sectionId
}

function handlePreviewHighlight(sectionId: string | null) {
  highlightedSectionId.value = sectionId
  if (sectionId) {
    moduleListRef.value?.scrollToSection(sectionId)
  }
}

function handlePreviewSelect(sectionId: string) {
  highlightedSectionId.value = sectionId
  moduleListRef.value?.scrollToSection(sectionId)
}

// 保存简历
async function saveResume() {
  if (!userStore.user?.id) {
    ElMessage.error('请先登录')
    return
  }
  
  saveStatus.value = 'saving'
  
  try {
    // 生成导出HTML（与 JSON 一并保存）
    // 使用新版渲染引擎
    const adaptedTemplate = adaptLegacyTemplateData(
      templateData.value,
      'single-column',
      templateStyles.value
    )
    const adaptedResumeData = adaptLegacyResumeData(resumeData.value)
    
    // 创建一个临时div来渲染HTML以便导出
    const tempDiv = document.createElement('div')
    const tempStyleElement = document.createElement('style')
    
    // 注入基本样式确保导出页面可用
    tempStyleElement.textContent = `
      body, html { margin: 0; padding: 0; font-family: 'Microsoft YaHei', sans-serif; }
      .resume-container { max-width: 860px; margin: 0 auto; padding: 30px; background: white; }
      .resume-section { margin-bottom: 20px; }
      .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: ${templateStyles.value.colors?.primary || '#2f80ed'}; }
      .section-content { font-size: 14px; line-height: 1.6; }
    `
    
    // 使用Renderer生成HTML并应用样式
    const html = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '  <meta charset="utf-8">',
      '  <title>' + (resumeData.value.profile?.basic?.name || '简历') + '</title>',
      '  ' + tempStyleElement.outerHTML,
      '</head>',
      '<body>',
      '  <div class="resume-container">',
      '    ' + tempDiv.innerHTML,
      '  </div>',
      '</body>',
      '</html>'
    ].join('\n')

    const content = {
      profile: resumeData.value.profile,
      sections: resumeData.value.sections,
      templateData: templateData.value,
      templateName: templateMetaName.value || templateData.value?.templateName,
      html
    }
    
    if (resume.value?.id) {
      // 更新现有简历
      await updateResume(
        resume.value.id.toString(), 
        {
          title: resume.value.title,
          content: JSON.stringify(content),
          version: resume.value.version
        },
        userStore.user.id
      )
    } else {
      // 创建新简历
      const title = `基于${(templateMetaName.value || templateData.value?.templateName || '模板')}的简历`
      const result = await createResume(
        templateId,
        title,
        userStore.user.id,
        JSON.stringify(content)
      )
      
      if (result.resumeId) {
        resume.value = { id: parseInt(result.resumeId), title, version: 1 }
        
        // 更新URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('resumeId', result.resumeId)
        window.history.replaceState({}, '', newUrl.toString())
      }
    }
    
    saveStatus.value = 'saved'
    ElMessage.success('保存成功')
    
    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 3000)
    
  } catch (error) {
    saveStatus.value = 'error'
    ElMessage.error('保存失败')
    console.error('Save error:', error)
    
    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 3000)
  }
}

async function exportPdf() {
  const container = previewContainerRef.value
  if (!container) {
    ElMessage.error('未找到预览区域')
    return
  }
  try {
    const filename = `${resumeData.value.profile?.basic?.name || '我的简历'}`
    await exportResumeWithPagedjs({ container, title: filename })
    ElMessage.success('已打开打印窗口，请选择保存为 PDF')
  } catch (e) {
    console.error('export pdf error', e)
    // 回退到截图导出，避免阻断导出流程
    const scale = 2
    const canvas = await html2canvas(container, { scale, useCORS: true })
    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    const filename = `${resumeData.value.profile?.basic?.name || '我的简历'}.pdf`
    pdf.save(filename)
    ElMessage.success('PDF 导出成功')
  } catch (fallbackError) {
    ElMessage.error('导出失败')
    console.error('export pdf fallback error', fallbackError)
  }
}

// 自动保存（防抖）
let saveTimer: number | null = null
watch([resumeData, templateStyles], () => {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  
  saveTimer = setTimeout(() => {
    if (resume.value?.id) {
      saveResume()
    }
  }, 2000)
}, { deep: true })

// 监听模板数据变化，确保模块状态管理同步
watch(templateData, (newTemplate) => {
  // 模板变化时，样式已在 loadTemplate 中合并，此处无需额外状态同步
}, { immediate: true })
</script>

<style scoped>
.resume-editor {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.editor-left {
  width: 30%;
  min-width: 480px;
  background: white;
  overflow-y: auto;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.editor-left::-webkit-scrollbar {
  display: none; /* WebKit */
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  padding: 16px 20px;
  margin: 0;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.editor-header h2 {
  margin: 0;
  color: #333;
}

.save-status {
  font-size: 14px;
  color: #666;
}

.editor-content {
  flex: 1;
  padding: 20px 24px 20px 20px; /* 右侧增加更多边距，避免挤到滚动条 */
  overflow-y: auto;
}

.sections-container {
  margin: 20px 0;
}

.add-section {
  margin-top: 20px;
  text-align: center;
}

.add-section-btn {
  width: 100%;
  height: 48px;
  border: 2px dashed #d1d5db;
  background: #f9fafb;
  color: #6b7280;
  font-size: 16px;
}

.add-section-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.editor-right {
  width: 70%;
  display: flex;
  flex-direction: column;
  background: white;
}

/* 中间区域：默认无 AI 时为单列预览；有 AI 时变为两列 */
.ai-and-preview { height: 100%; }
.ai-and-preview.with-ai {
  display: grid;
  grid-template-columns: 35% 65%;
}

.ai-column { border-right: 1px solid #e5e7eb; overflow: hidden; }
.preview-column { display: flex; flex-direction: column; }

/* 打开 AI 时，左侧与右侧整体也需要收缩以让出空间 */
.resume-editor.ai-open .editor-left { width: 25%; }
.resume-editor.ai-open .editor-right { width: 75%; }

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.preview-header h3 {
  margin: 0;
  color: #333;
}

.preview-container {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
  overflow-y: auto;
  
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.preview-container::-webkit-scrollbar {
  display: none; /* WebKit */
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  
  /* 隐藏iframe内部滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.preview-iframe::-webkit-scrollbar {
  display: none; /* WebKit */
}

/* 收起状态的箭头按钮 */
.settings-toggle-collapsed {
  position: fixed;
  right: 10px;
  top: 73px;
  z-index: 100;
}

.toggle-btn-collapsed {
  width: 32px;
  height: 32px;
  padding: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn-collapsed:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

/* 响应式 */
@media (max-width: 1200px) {
  .editor-left {
    width: 30%;
    min-width: 420px;
  }
  
  .editor-right {
    width: 70%;
  }
}

@media (max-width: 1000px) {
  .resume-editor {
    flex-direction: column;
  }
  
  .editor-left {
    width: 100%;
    height: 60vh;
    min-width: unset;
  }
  
  .editor-right {
    width: 100%;
    height: 40vh;
  }
}
</style>
