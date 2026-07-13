<template>
  <div class="knowledge-page">
    <div class="page-header">
      <div>
        <h2>AI 知识库</h2>
        <p>上传原始资料后，系统会自动解析、切块和向量化，无需准备向量文件。</p>
      </div>
      <div class="header-actions">
        <el-button @click="searchVisible = true">检索测试</el-button>
        <el-button v-if="canWrite" type="primary" @click="uploadVisible = true">上传文档</el-button>
      </div>
    </div>

    <div class="metric-grid">
      <el-card v-for="item in metricCards" :key="item.label" shadow="never" class="metric-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </el-card>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="关键词">
          <el-input v-model="filters.search" placeholder="文档名称" clearable @keyup.enter="loadDocuments" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filters.category" clearable placeholder="全部分类">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部状态">
            <el-option label="可用" value="ready" />
            <el-option label="处理中" value="indexing" />
            <el-option label="失败" value="failed" />
            <el-option label="已停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="资料来源">
          <el-select v-model="filters.sourceType" clearable placeholder="全部来源" style="width: 190px">
            <el-option v-for="item in sourceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadDocuments">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="documents">
        <el-table-column prop="name" label="文档" min-width="190">
          <template #default="{ row }">
            <strong>{{ row.name }}</strong>
            <div class="muted">{{ row.fileName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="110">
          <template #default="{ row }">{{ categoryLabel(row.category) }}</template>
        </el-table-column>
        <el-table-column prop="sourceType" label="资料来源" min-width="150">
          <template #default="{ row }">
            <el-tooltip :content="sourceTypeDescription(row.sourceType)" placement="top">
              <el-tag effect="plain">{{ sourceTypeLabel(row.sourceType) }}</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="105">
          <template #default="{ row }">
            <el-tooltip :content="row.errorMessage || statusLabel(row.status)" placement="top">
              <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="chunkCount" label="切块数" width="90" />
        <el-table-column prop="fileSize" label="大小" width="100">
          <template #default="{ row }">{{ formatSize(row.fileSize) }}</template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="175" />
        <el-table-column label="启用" width="80">
          <template #default="{ row }">
            <el-switch
              :model-value="Boolean(row.enabled)"
              :disabled="!canWrite || row.status === 'indexing' || row.status === 'failed'"
              @change="(value: string | number | boolean) => handleToggle(row, value === true)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canWrite" link type="primary" @click="handleReindex(row)">重建索引</el-button>
            <el-button link type="primary" @click="openSource(row)">原文件</el-button>
            <el-button v-if="canWrite" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="limit"
          :total="total"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @change="loadDocuments"
        />
      </div>
    </el-card>

    <el-dialog v-model="uploadVisible" title="上传知识文档" width="560px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="选择文件">
          <el-upload
            :auto-upload="false"
            :limit="1"
            accept=".pdf,.docx,.txt,.md,.markdown"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-button>选择 PDF / DOCX / TXT / Markdown</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="显示名称">
          <el-input v-model="uploadForm.name" placeholder="留空则使用文件名" />
        </el-form-item>
        <el-form-item label="资料来源" required>
          <el-select v-model="uploadForm.sourceType" style="width: 100%">
            <el-option
              v-for="item in sourceTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="source-option">
                <strong>{{ item.label }}</strong>
                <span>{{ item.description }}</span>
              </div>
            </el-option>
          </el-select>
          <p class="source-help">{{ sourceTypeDescription(uploadForm.sourceType) }}</p>
        </el-form-item>
        <el-form-item label="资料分类">
          <el-select v-model="uploadForm.category">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="uploadForm.description" type="textarea" :rows="3" placeholder="可选，说明资料用途或适用岗位" />
        </el-form-item>
        <el-alert
          v-if="uploadForm.sourceType === 'resume-exemplar'"
          title="优秀简历样例仅用于结构与表达参考，不应复制个人经历或身份信息。"
          type="warning"
          :closable="false"
          show-icon
          class="exemplar-alert"
        />
        <div v-if="uploadForm.sourceType === 'resume-exemplar'" class="compliance-checks">
          <el-checkbox v-model="uploadForm.licensed">我确认已获得该简历用于本知识库的明确授权</el-checkbox>
          <el-checkbox v-model="uploadForm.piiReviewed">我确认已完成人工 PII 脱敏复核（姓名、联系方式、证件、地址等）</el-checkbox>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">上传并索引</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="searchVisible" title="知识库检索测试" width="720px">
      <el-form label-position="top">
        <el-form-item label="测试问题">
          <el-input v-model="searchForm.query" type="textarea" :rows="3" placeholder="例如：高级前端工程师的项目经历应突出哪些能力？" />
        </el-form-item>
        <el-form-item label="限定分类">
          <el-select v-model="searchForm.category" clearable placeholder="不限定">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" :loading="searching" @click="handleSearch">开始检索</el-button>
      <div v-if="searchResults.length" class="search-results">
        <div v-for="item in searchResults" :key="`${item.documentId}-${item.chunkIndex}`" class="result-card">
          <div class="result-title">
            <strong>{{ item.documentName }}</strong>
            <el-tag size="small">{{ item.score }}</el-tag>
          </div>
          <div class="score-breakdown">
            <span>{{ item.retrievalMethod || 'dense' }}</span>
            <span>Dense {{ item.denseScore ?? '-' }}</span>
            <span>Lexical {{ item.lexicalScore ?? '-' }}</span>
          </div>
          <p>{{ item.text }}</p>
        </div>
      </div>
      <el-empty v-else-if="searched && !searching" description="没有检索到相关内容" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import {
  deleteKnowledgeDocument,
  downloadKnowledgeDocument,
  getKnowledgeMetrics,
  getKnowledgeDocuments,
  reindexKnowledgeDocument,
  searchKnowledge,
  toggleKnowledgeDocument,
  uploadKnowledgeDocument,
  type KnowledgeDocument,
  type KnowledgeSourceType
} from '@/api/knowledge'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const canWrite = computed(() => userStore.user?.role !== 'viewer')

const sourceTypeOptions: Array<{ value: KnowledgeSourceType; label: string; description: string }> = [
  { value: 'standard', label: '标准与写作规范', description: '权威简历写作、ATS、事实表达和版式规范，作为全局基础知识。' },
  { value: 'role-framework', label: '岗位能力框架', description: '岗位职责、能力模型和通用 JD 规范，用于理解岗位要求，不对应某次私人投递。' },
  { value: 'resume-exemplar', label: '授权优秀简历样例', description: '仅上传已获授权且完成人工 PII 脱敏复核的优秀简历，用于学习结构与表达方式。' }
]

const categoryOptions = [
  { label: '通用规范', value: 'general' },
  { label: '岗位 JD', value: 'job' },
  { label: '行业知识', value: 'industry' },
  { label: '优秀简历样例', value: 'resume-example' },
  { label: '写作规范', value: 'writing-guide' }
]

const loading = ref(false)
const uploading = ref(false)
const searching = ref(false)
const searched = ref(false)
const uploadVisible = ref(false)
const searchVisible = ref(false)
const documents = ref<KnowledgeDocument[]>([])
const searchResults = ref<any[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const selectedFile = ref<File | null>(null)
const filters = reactive<{ search: string; category: string; status: string; sourceType?: KnowledgeSourceType }>({ search: '', category: '', status: '', sourceType: undefined })
const uploadForm = reactive({
  name: '',
  category: 'general',
  description: '',
  sourceType: 'standard' as KnowledgeSourceType,
  licensed: false,
  piiReviewed: false
})
const searchForm = reactive({ query: '', category: '' })
const metrics = ref<Record<string, number | string>>({})
const metricCards = computed(() => [
  { label: '知识文档', value: total.value, hint: '后台持久化文档' },
  { label: '向量切块', value: Number(metrics.value.collection_points || 0), hint: 'Qdrant 当前存量' },
  { label: '检索次数', value: Number(metrics.value.searches || 0), hint: `命中 ${Number(metrics.value.search_hits || 0)} 条` },
  { label: '最近检索延迟', value: `${Number(metrics.value.last_search_ms || 0)} ms`, hint: Number(metrics.value.failures || 0) ? `失败 ${metrics.value.failures}` : '运行正常' }
])

async function loadDocuments() {
  loading.value = true
  try {
    const response = await getKnowledgeDocuments({
      page: page.value,
      limit: limit.value,
      search: filters.search || undefined,
      category: filters.category || undefined,
      status: filters.status || undefined,
      sourceType: filters.sourceType
    })
    documents.value = (response.data.list || []).map((document: KnowledgeDocument) => ({
      ...document,
      enabled: Boolean(document.enabled),
      licensed: Boolean(document.licensed),
      piiReviewed: Boolean(document.piiReviewed)
    }))
    total.value = Number(response.data.total || 0)
  } finally {
    loading.value = false
  }
}

async function loadMetrics() {
  try {
    const response = await getKnowledgeMetrics()
    metrics.value = response.data.rag || {}
  } catch {
    metrics.value = {}
  }
}

function resetFilters() {
  Object.assign(filters, { search: '', category: '', status: '', sourceType: undefined })
  page.value = 1
  loadDocuments()
}

function handleFileChange(file: UploadFile) {
  selectedFile.value = file.raw || null
}

function handleFileRemove() {
  selectedFile.value = null
}

async function handleUpload() {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  if (
    uploadForm.sourceType === 'resume-exemplar' &&
    (!uploadForm.licensed || !uploadForm.piiReviewed)
  ) {
    ElMessage.warning('上传优秀简历样例前，必须确认已获授权并完成 PII 脱敏复核')
    return
  }
  uploading.value = true
  try {
    const response = await uploadKnowledgeDocument({
      file: selectedFile.value,
      name: uploadForm.name,
      category: uploadForm.category,
      description: uploadForm.description,
      sourceType: uploadForm.sourceType,
      licensed: uploadForm.licensed,
      piiReviewed: uploadForm.piiReviewed
    })
    ElMessage.success(response.message)
    uploadVisible.value = false
    selectedFile.value = null
    Object.assign(uploadForm, {
      name: '',
      category: 'general',
      description: '',
      sourceType: 'standard',
      licensed: false,
      piiReviewed: false
    })
    await loadDocuments()
  } finally {
    uploading.value = false
  }
}

async function handleToggle(row: KnowledgeDocument, enabled: boolean) {
  await toggleKnowledgeDocument(row.id, enabled)
  row.enabled = enabled
  row.status = enabled ? 'ready' : 'disabled'
  ElMessage.success(enabled ? '文档已启用' : '文档已停用')
}

async function handleReindex(row: KnowledgeDocument) {
  const response = await reindexKnowledgeDocument(row.id)
  ElMessage.success(response.message)
  await loadDocuments()
}

async function handleDelete(row: KnowledgeDocument) {
  await ElMessageBox.confirm(`确定删除“${row.name}”及其全部向量索引吗？`, '删除知识文档', { type: 'warning' })
  await deleteKnowledgeDocument(row.id)
  ElMessage.success('知识文档已删除')
  await loadDocuments()
}

async function handleSearch() {
  if (!searchForm.query.trim()) {
    ElMessage.warning('请输入测试问题')
    return
  }
  searching.value = true
  searched.value = false
  try {
    const response = await searchKnowledge({
      query: searchForm.query,
      category: searchForm.category || undefined,
      limit: 5
    })
    searchResults.value = response.data.results || []
    searched.value = true
    await loadMetrics()
  } finally {
    searching.value = false
  }
}

async function openSource(row: KnowledgeDocument) {
  const response = await downloadKnowledgeDocument(row.id)
  const url = URL.createObjectURL(response as unknown as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = row.fileName
  link.click()
  URL.revokeObjectURL(url)
}

function categoryLabel(value: string) {
  return categoryOptions.find((item) => item.value === value)?.label || value
}

function sourceTypeLabel(value: KnowledgeSourceType) {
  return sourceTypeOptions.find((item) => item.value === value)?.label || value
}

function sourceTypeDescription(value: KnowledgeSourceType) {
  return sourceTypeOptions.find((item) => item.value === value)?.description || ''
}

function statusLabel(value: string) {
  return ({ ready: '可用', indexing: '处理中', failed: '失败', disabled: '已停用', pending: '等待中' } as Record<string, string>)[value] || value
}

function statusType(value: string) {
  return ({ ready: 'success', indexing: 'warning', failed: 'danger', disabled: 'info', pending: 'info' } as Record<string, any>)[value] || 'info'
}

function formatSize(value: number) {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

onMounted(() => Promise.all([loadDocuments(), loadMetrics()]))
</script>

<style scoped>
.knowledge-page { display: flex; flex-direction: column; gap: 18px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.page-header h2 { margin: 0 0 8px; font-size: 28px; }
.page-header p, .muted { margin: 0; color: var(--el-text-color-secondary); font-size: 13px; }
.header-actions { display: flex; gap: 10px; }
.metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.metric-card :deep(.el-card__body) { display: flex; min-height: 92px; flex-direction: column; gap: 7px; }
.metric-card span, .metric-card small { color: var(--el-text-color-secondary); }
.metric-card strong { color: var(--el-text-color-primary); font-size: 24px; }
.score-breakdown { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 8px; color: var(--el-text-color-secondary); font-size: 12px; }
.filter-card :deep(.el-card__body) { padding-bottom: 2px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 18px; }
.search-results { display: grid; gap: 12px; margin-top: 18px; max-height: 420px; overflow: auto; }
.result-card { padding: 14px 16px; border: 1px solid var(--el-border-color-light); border-radius: 10px; background: var(--el-fill-color-lighter); }
.result-card p { margin: 8px 0 0; line-height: 1.7; white-space: pre-wrap; }
.result-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.source-option { display: flex; flex-direction: column; gap: 2px; padding: 4px 0; }
.source-option span, .source-help { color: var(--el-text-color-secondary); font-size: 12px; }
.source-help { margin: 8px 0 0; line-height: 1.5; }
.exemplar-alert { margin-bottom: 12px; }
.compliance-checks { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--el-color-warning-light-5); border-radius: 8px; background: var(--el-color-warning-light-9); }
.compliance-checks :deep(.el-checkbox) { height: auto; white-space: normal; }
@media (max-width: 1000px) { .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
