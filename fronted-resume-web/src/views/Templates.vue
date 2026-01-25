<template>
  <div class="templates-page">
    <div class="page-content">
      <!-- 页面标题和操作区域 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">简历库</h1>
        </div>
        <div class="header-right">
          <el-button class="upload-btn" @click="triggerTemplateUpload" :loading="isUploadingTemplate">
            <el-icon><Upload /></el-icon>
            上传模板校验
          </el-button>
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

      <input
        ref="uploadInputRef"
        type="file"
        accept="application/json,.json,.template"
        class="hidden-file-input"
        @change="handleTemplateUpload"
      />

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
            <div class="preview-renderer">
              <NewResumePreview
                v-if="normalizedTemplateData"
                :resume-data="previewResumeData"
                :template-data="normalizedTemplateData"
                :template-type="normalizedTemplateType"
              />
              <el-empty v-else description="暂无可预览模板" />
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
              <pre class="template-data-content">{{ JSON.stringify(normalizedTemplateData || templateDataJson, null, 2) }}</pre>
            </el-card>
          </el-tab-pane>
          <el-tab-pane label="校验结果" name="validation">
            <div class="validation-panel">
              <template v-if="templateValidation">
                <el-result
                  v-if="templateValidation.success"
                  icon="success"
                  title="校验通过"
                  sub-title="模板结构符合规范，可正常使用。"
                />
                <div v-else class="issues-list">
                  <el-alert
                    type="error"
                    :closable="false"
                    title="模板存在以下格式问题："
                    class="issues-alert"
                  />
                  <ul>
                    <li v-for="(issue, idx) in templateValidation.issues" :key="idx">{{ issue }}</li>
                  </ul>
                </div>
              </template>
              <template v-else>
                <el-empty description="尚未进行校验" />
              </template>
              <template v-if="templateDiagnostics && templateDiagnostics.warnings.length">
                <div class="issues-list">
                  <el-alert
                    type="warning"
                    :closable="false"
                    title="模板兼容性提示："
                    class="issues-alert"
                  />
                  <ul>
                    <li v-for="(warning, idx) in templateDiagnostics.warnings" :key="`warn-${idx}`">
                      {{ warning.message }}（{{ warning.path }}）
                    </li>
                  </ul>
                </div>
              </template>
            </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, View, Plus, Picture, Upload } from '@element-plus/icons-vue'
import { fetchTemplates, getTemplateDetail } from '@/api/template'
import { type TemplateValidationResult } from '@/utils/templateSchema'
import { normalizeTemplateFile, normalizeTemplateData } from '@/utils/templateFile'
import { transformProfileDataToSections } from '@/utils/dataTransform'
import { type DiagnosticResult } from '@/utils/templateDiagnostics'
import NewResumePreview from '@/components/resume/NewResumePreview.vue'

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
const currentTemplateId = ref<string>('')
const autoUseAfterConfirm = ref(false)
const activeTab = ref('preview')
const profileJson = ref<string>(JSON.stringify({
  basic: { name: '张三', title: '前端工程师', contacts: { email: 'zhangsan@example.com', phone: '13800138000', site: 'https://example.com' } },
  summary: '拥有3+年前端经验，熟悉 Vue3/TypeScript，关注性能与体验。',
  experience: [ { company: '示例公司A', role: '前端工程师', start: '2022-01', end: '2023-12', desc: '负责核心业务前端研发与性能优化。' } ],
  education: [ { school: '北京大学', degree: '计算机科学 本科', start: '2016-09', end: '2020-06' } ],
  skills: ['JavaScript','TypeScript','Vue3','Vite','Pinia'],
  projects: [ { name: '在线简历平台', role: '前端负责人', date: '2023', desc: '搭建在线编辑与导出能力。' } ]
}, null, 2))
const templateDataJson = ref<any>(null)
const normalizedTemplateData = ref<any>(null)
const templateDiagnostics = ref<DiagnosticResult | null>(null)
const templateValidation = ref<TemplateValidationResult | null>(null)
const uploadInputRef = ref<HTMLInputElement | null>(null)
const isUploadingTemplate = ref(false)

const previewResumeData = computed(() => {
  const profile = safeParse(profileJson.value)
  return transformProfileDataToSections(profile || {})
})

const normalizedTemplateType = computed(() => {
  const layoutType = normalizedTemplateData.value?.layout?.type
  return layoutType || normalizedTemplateData.value?.templateType || 'single-column'
})

function openPreview(templateId: string) {
  currentTemplateId.value = templateId
  autoUseAfterConfirm.value = false
  activeTab.value = 'preview'
  templateValidation.value = null
  templateDiagnostics.value = null
  normalizedTemplateData.value = null
  loadTemplateAndRender()
}

function useTemplate(templateId: string) {
  // 在新标签页中打开编辑器
  const editorUrl = `/resume-editor?templateId=${templateId}`
  window.open(editorUrl, '_blank')
}

function triggerTemplateUpload() {
  uploadInputRef.value?.click()
}

async function handleTemplateUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    isUploadingTemplate.value = true
    const text = await file.text()
    const result = normalizeTemplateFile(text)
    templateDataJson.value = result.raw
    normalizedTemplateData.value = result.normalized
    templateValidation.value = result.validation
    templateDiagnostics.value = result.diagnostics

    if (templateValidation.value?.success) {
      ElMessage.success('模板校验通过，可以预览并使用该模板')
    } else {
      ElMessage.warning('模板结构存在问题，请检查校验结果')
    }
    if (result.format === 'old') {
      ElMessage.info('已检测到旧格式模板，系统已自动转换为新格式进行预览')
    }

    previewVisible.value = true
    currentTemplateId.value = ''
    activeTab.value = templateValidation.value?.success ? 'preview' : 'validation'
  } catch (error) {
    console.error('本地模板解析失败:', error)
    ElMessage.error('上传的模板文件解析失败，请确认 JSON 格式')
  } finally {
    isUploadingTemplate.value = false
    if (target) {
      target.value = ''
    }
  }
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
    
    const normalized = normalizeTemplateData(templateDataObj)
    templateDataJson.value = normalized.raw
    normalizedTemplateData.value = normalized.normalized
    templateDiagnostics.value = normalized.diagnostics
    templateValidation.value = normalized.validation
    if (templateValidation.value && !templateValidation.value.success) {
      ElMessage.warning('模板校验未通过，已列出问题，仍可预览。')
    }

    previewVisible.value = true
    
  } catch (error) {
    console.error('加载模板详情失败:', error)
    // 生成错误预览
    templateDataJson.value = null
    normalizedTemplateData.value = null
    previewVisible.value = true
  }
}

function safeParse(v: string) { try { return JSON.parse(v) } catch { return {} } }

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

.upload-btn {
  height: 40px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.hidden-file-input {
  display: none;
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

.preview-renderer {
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: auto;
  background: #f9fafb;
  padding: 16px;
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

.validation-panel {
  padding: 16px;
  min-height: 320px;
}

.issues-list {
  margin-top: 16px;
}

.issues-list ul {
  margin: 12px 0 0;
  padding-left: 22px;
  color: #c45656;
  line-height: 1.6;
  font-size: 13px;
}

.issues-alert {
  margin-bottom: 12px;
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

