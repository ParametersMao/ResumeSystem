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
          :resume-data="resumeData"
          @ai="onAiFromSection"
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
          <div class="preview-container">
            <DynamicResumePreview 
              :resume-data="resumeData"
              :template-data="templateData"
              :extra-styles="templateStyles"
              :custom-css="customCss"
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

// 组件导入
import SimpleSectionEditor from '@/components/editor/SimpleSectionEditor.vue'
import StylePanel from '@/components/editor/StylePanel.vue'
import CustomSectionConfig from '@/components/editor/CustomSectionConfig.vue'
import AiPolishPanel from '@/components/editor/AiPolishPanel.vue'
import ModuleListEditor from '@/components/editor/ModuleListEditor.vue'

// 类型和工具导入
import type { ResumeData, TemplateData, TemplateDataV2, TemplateStyles, ResumeSection } from '@/types/resume'
import { getTemplateDetail } from '@/api/template'
import { createResume, getResume, updateResume } from '@/api/resume'
import { useUserStore } from '@/store/user'
import DynamicResumePreview from '@/components/resume/DynamicResumePreview.vue'
import { 
  transformProfileDataToSections, 
  transformSectionsToProfileData, 
  createNewSection,
  reorderSections
} from '@/utils/dataTransform'
import { ResumeRenderEngine } from '@/utils/renderEngine'
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
      // 新格式：直接使用 sections 数组
      try {
        // 回填 profile（包含 basic 和 summary）
        if (parsedTemplateData.profile) {
          // 确保 profile.basic 存在
          if (parsedTemplateData.profile.basic) {
            resumeData.value.profile.basic = {
              name: parsedTemplateData.profile.basic.name || '',
              title: parsedTemplateData.profile.basic.title || '',
              contacts: {
                email: parsedTemplateData.profile.basic.contacts?.email || '',
                phone: parsedTemplateData.profile.basic.contacts?.phone || '',
                site: parsedTemplateData.profile.basic.contacts?.site || ''
              }
            }
          }
          
          // 确保 profile.summary 存在
          if (parsedTemplateData.profile.summary) {
            resumeData.value.profile.summary = parsedTemplateData.profile.summary
          }
          
          console.log('成功回填 profile 数据:', resumeData.value.profile)
        }
        // 回填 sections，保留所有模块包括 basic，保留顺序/可见性/items/title/style/config
        resumeData.value.sections = parsedTemplateData.sections
          .filter((s: any) => s && s.type)  // 只过滤掉无效的模块
          .map((s: any, idx: number) => ({
            id: s.id || `${s.type}-${Date.now()}-${idx}`,
            type: s.type,
            title: s.title || s.config?.title || '',
            visible: s.visible !== false,
            order: typeof s.order === 'number' ? s.order : idx + 1,
            items: Array.isArray(s.items) ? s.items : [],
            config: s.config,
            style: s.style
          }))
        
        console.log('成功回填新格式模板数据到 resumeData:', resumeData.value)
      } catch (sectionError) {
        console.error('回填新格式模板数据时出错:', sectionError)
      }
    } else if (parsedTemplateData?.layout && Array.isArray(parsedTemplateData.layout)) {
      // 旧格式：根据 layout 数组创建 sections
      try {
        // 回填 profile（如果有的话）
        if (parsedTemplateData.profile) {
          resumeData.value.profile = parsedTemplateData.profile
        }
        
        // 根据 layout 创建 sections
        const newSections: any[] = []
        parsedTemplateData.layout.forEach((moduleConfig: any, index: number) => {
          if (moduleConfig.visible && moduleConfig.type !== 'basic') {
            // 跳过 basic 类型（对应基本信息，通过 profile 处理）
            const section = createNewSection(moduleConfig.type as any, newSections)
            section.title = moduleConfig.config?.title || getDefaultSectionTitle(moduleConfig.type)
            section.order = moduleConfig.order || index
            section.visible = moduleConfig.visible !== false
            section.config = moduleConfig.config || {}
            newSections.push(section)
          }
        })
        
        // 更新 resumeData.sections
        resumeData.value.sections = newSections
        
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
  const titleMap: Record<string, string> = {
    'experience': '工作经验',
    'education': '教育背景', 
    'projects': '项目经历',
    'skills': '专业技能',
    'intention': '求职意向',
    'internship': '实习经历',
    'campus': '校园经历',
    'awards': '荣誉证书',
    'summary': '自我评价',
    'hobbies': '兴趣爱好',
    'custom': '自定义模块'
  }
  return titleMap[type] || type
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
    { id: `summary-${Date.now() + 2}`, type: 'summary', title: '自我评价', visible: true, order: 9, items: [], config: { fields: [{ name: 'text', label: '自我评价', type: 'textarea', richText: true }] } },
    { id: `hobbies-${Date.now() + 3}`, type: 'hobbies', title: '兴趣爱好', visible: false, order: 10, items: [], config: { fields: [{ name: 'text', label: '兴趣爱好', type: 'text' }] } },
    createNewSection('custom', orderSeed)
  ]
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
  resumeData.value.sections = reorderSections(resumeData.value.sections, idx, target)
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

// 保存简历
async function saveResume() {
  if (!userStore.user?.id) {
    ElMessage.error('请先登录')
    return
  }
  
  saveStatus.value = 'saving'
  
  try {
    // 生成导出HTML（与 JSON 一并保存）
    const engine = new ResumeRenderEngine(templateData.value || { styles: templateStyles.value } as any, templateStyles.value)
    const html = engine.generateHtml(resumeData.value)

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

function exportPdf() {
  ElMessage.info('导出功能开发中...')
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
  width: 50%;
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
  width: 50%;
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
.resume-editor.ai-open .editor-left { width: 40%; }
.resume-editor.ai-open .editor-right { width: 60%; }

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
    width: 45%;
    min-width: 420px;
  }
  
  .editor-right {
    width: 55%;
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
