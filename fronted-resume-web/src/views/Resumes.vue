<template>
  <div class="resumes-page">
    <div class="page-header">
      <div>
        <h1>我的简历</h1>
        <p>管理岗位版本，或从已有的 TXT、PDF、DOCX 简历安全导入。</p>
      </div>
      <div class="header-actions">
        <input ref="fileInput" class="file-input" type="file" accept=".txt,.pdf,.docx" @change="handleFileChange" />
        <el-button :loading="importing" @click="openFilePicker">导入旧简历</el-button>
        <el-button type="primary" @click="goCreate">新建简历</el-button>
      </div>
    </div>

    <div class="import-tip">
      <strong>导入不会覆盖原简历</strong>
      <span>系统先提取文本并标出识别结果，只有你确认后才会创建一份新的可编辑简历。</span>
    </div>

    <el-empty v-if="!loading && list.length === 0" description="还没有简历，可以从模板创建或导入已有文件" />

    <div v-else class="resume-grid" v-loading="loading">
      <el-card v-for="item in list" :key="item.id" class="resume-card" shadow="hover">
        <div class="resume-card-body">
          <div class="resume-meta">
            <h3>{{ item.title }}</h3>
            <p>模板：{{ item.templateName || '默认模板' }}</p>
            <p>更新时间：{{ formatDate(item.updateTime) }}</p>
          </div>
          <div class="resume-actions">
            <el-button size="small" :disabled="deletingId !== null" @click="goEdit(item.id)">继续编辑</el-button>
            <el-button size="small" :disabled="deletingId !== null" @click="goPreview(item.id)">预览</el-button>
            <el-button
              class="delete-resume-button"
              type="danger"
              plain
              size="small"
              :loading="deletingId === item.id"
              :disabled="deletingId !== null && deletingId !== item.id"
              :aria-label="`删除简历：${item.title}`"
              @click="confirmDelete(item)"
            >
              删除
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="limit"
        :total="total"
        :page-sizes="[8, 16, 24]"
        layout="total, sizes, prev, pager, next"
        @current-change="load"
        @size-change="load"
      />
    </div>

    <el-dialog v-model="importDialogVisible" title="核对导入结果" width="min(760px, 92vw)" destroy-on-close>
      <div v-if="importResult" class="import-review">
        <div class="import-summary">
          <div><span>文件</span><strong>{{ importResult.filename }}</strong></div>
          <div><span>格式</span><strong>{{ importResult.fileType.toUpperCase() }}</strong></div>
          <div><span>文本</span><strong>{{ importResult.characterCount }} 字符</strong></div>
          <div v-if="importResult.pageCount"><span>页数</span><strong>{{ importResult.pageCount }} 页</strong></div>
        </div>

        <el-alert
          v-for="warning in importResult.warnings"
          :key="warning"
          class="import-warning"
          :title="warning"
          type="warning"
          :closable="false"
          show-icon
        />

        <section class="profile-review">
          <h3>识别到的个人信息</h3>
          <div class="profile-grid">
            <el-input v-model="importResult.profile.name" placeholder="姓名（未识别可留空）" />
            <el-input v-model="importResult.profile.phone" placeholder="手机号（请核对）" />
            <el-input v-model="importResult.profile.email" placeholder="邮箱（请核对）" />
          </div>
        </section>

        <section>
          <h3>识别到的模块</h3>
          <div class="section-list">
            <div v-for="(section, index) in importResult.sections" :key="`${section.type}-${index}`" class="section-review-card">
              <div class="section-review-head">
                <strong>{{ section.title }}</strong>
                <el-tag :type="section.confidence === 'high' ? 'success' : 'warning'" size="small">
                  {{ section.confidence === 'high' ? '标题明确' : '需要核对' }}
                </el-tag>
              </div>
              <el-input v-model="section.text" type="textarea" :rows="4" resize="vertical" />
            </div>
          </div>
        </section>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creatingImported" @click="confirmImport">确认并创建新简历</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createResume,
  deleteResume,
  listMyResumes,
  parseResumeImport,
  type ResumeImportResult,
} from '@/api/resume'
import { createEmptyDocument, type CoreResumeDocument, type CoreResumeSection } from '@/core-resume/model'
import { useUserStore } from '@/store/user'

interface ResumeListItem {
  id: number
  title: string
  templateName?: string
  updateTime: string
}

const router = useRouter()
const userStore = useUserStore()
const list = ref<ResumeListItem[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(8)
const fileInput = ref<HTMLInputElement>()
const importing = ref(false)
const creatingImported = ref(false)
const deletingId = ref<number | null>(null)
const importDialogVisible = ref(false)
const importResult = ref<ResumeImportResult | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

onMounted(load)

async function ensureUser() {
  if (!userStore.user?.id) await userStore.initUserState()
  return userStore.user?.id
}

async function load() {
  const userId = await ensureUser()
  if (!userId) return
  loading.value = true
  try {
    const data = await listMyResumes(userId, page.value, limit.value)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件不能超过 10MB')
    return
  }
  importing.value = true
  try {
    importResult.value = await parseResumeImport(file)
    importDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '文件解析失败，请检查格式后重试')
  } finally {
    importing.value = false
  }
}

async function confirmImport() {
  if (!importResult.value) return
  const userId = await ensureUser()
  if (!userId) {
    ElMessage.warning('请先登录后再导入简历')
    return
  }
  creatingImported.value = true
  try {
    const document = buildImportedDocument(importResult.value)
    const baseName = importResult.value.filename.replace(/\.(txt|pdf|docx)$/i, '')
    const title = importResult.value.profile.name ? `${importResult.value.profile.name} - 导入简历` : `${baseName} - 导入`
    const created = await createResume(undefined, title, userId, JSON.stringify(document))
    ElMessage.success('已创建新的可编辑简历，请继续核对内容')
    importDialogVisible.value = false
    router.push(`/resume-editor?resumeId=${created.id}`)
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '创建简历失败')
  } finally {
    creatingImported.value = false
  }
}

function buildImportedDocument(result: ResumeImportResult): CoreResumeDocument {
  const document = createEmptyDocument()
  document.profile = {
    name: result.profile.name || '',
    title: '',
    avatar: '',
    phone: result.profile.phone || '',
    email: result.profile.email || '',
    gender: '',
    age: '',
    yearsOfExperience: '',
    site: '',
  }
  document.templateName = '导入简历 · 待选择模板'
  document.sections.forEach((section) => {
    section.visible = false
    section.items = []
  })

  for (const block of result.sections) {
    const section = document.sections.find((item) => item.type === block.type)
    if (!section || !block.text.trim()) continue
    section.visible = true
    appendImportedBlock(section, block.title, block.text)
  }
  return document
}

function appendImportedBlock(section: CoreResumeSection, title: string, text: string) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
  const first = lines[0] || ''
  const rest = lines.slice(1).join('\n') || first
  switch (section.type) {
    case 'education':
      section.items.push({ school: first, degree: '', duration: { start: '', end: '' }, desc: rest })
      break
    case 'experience':
    case 'internship':
      section.items.push({ company: first, role: '', duration: { start: '', end: '' }, desc: rest })
      break
    case 'projects':
      section.items.push({ name: first, role: '', duration: { start: '', end: '' }, desc: rest })
      break
    case 'campus':
      section.items.push({ org: first, role: '', duration: { start: '', end: '' }, desc: rest })
      break
    case 'skills':
      section.items.push(...lines.flatMap((line) => line.split(/[、，,；;|]/)).map((name) => ({ name: name.trim() })).filter((item) => item.name))
      break
    case 'awards':
      section.items.push(...lines.map((name) => ({ name, org: '', date: '' })))
      break
    case 'summary':
      section.items.push({ text })
      break
    case 'custom':
      section.items.push({ name: title, text })
      break
  }
}

function goCreate() { router.push('/templates') }
function goEdit(id: number) { router.push(`/resume-editor?resumeId=${id}`) }
function goPreview(id: number) { router.push(`/preview/${id}`) }

async function confirmDelete(item: ResumeListItem) {
  if (deletingId.value !== null) return

  try {
    await ElMessageBox.confirm(
      `删除“${item.title}”后，它会从简历列表中移除，绑定的私有 JD 和索引也会同步清理。当前无法从页面恢复，确定继续吗？`,
      '删除简历',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
      },
    )
  } catch {
    return
  }

  deletingId.value = item.id
  try {
    await deleteResume(item.id)
    if (list.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await load()
    ElMessage.success('简历已删除')
  } catch {
    // 请求层会统一展示网络、鉴权和服务端错误，避免这里重复弹窗。
    return
  } finally {
    deletingId.value = null
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}
</script>

<style scoped>
.resumes-page { min-height: 100vh; padding: 32px; background: radial-gradient(circle at top left, rgba(37, 99, 235, .12), transparent 30%), #f8fafc; }
.page-header { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 18px; }
.page-header h1 { margin: 0; }
.page-header p { margin: 6px 0 0; color: #64748b; }
.header-actions { display: flex; gap: 10px; }
.file-input { display: none; }
.import-tip { display: flex; gap: 10px; align-items: center; padding: 12px 16px; margin-bottom: 24px; border: 1px solid #dbeafe; border-radius: 12px; background: #eff6ff; color: #475569; font-size: 14px; }
.import-tip strong { color: #1d4ed8; }
.resume-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.resume-card { border-radius: 18px; }
.resume-card-body { display: flex; flex-direction: column; gap: 18px; }
.resume-meta h3 { margin: 0 0 8px; }
.resume-meta p { margin: 6px 0 0; color: #64748b; }
.resume-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.delete-resume-button { margin-left: auto; }
.pagination { display: flex; justify-content: center; margin-top: 24px; }
.import-review h3 { margin: 22px 0 12px; font-size: 16px; }
.import-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
.import-summary > div { display: flex; flex-direction: column; gap: 4px; padding: 12px; border-radius: 10px; background: #f8fafc; }
.import-summary span { color: #64748b; font-size: 12px; }
.import-warning { margin-top: 8px; }
.profile-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.section-list { display: grid; gap: 12px; max-height: 360px; overflow: auto; padding-right: 4px; }
.section-review-card { padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; }
.section-review-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
@media (max-width: 768px) {
  .resumes-page { padding: 20px; }
  .page-header, .import-tip { flex-direction: column; align-items: stretch; }
  .header-actions { display: grid; grid-template-columns: 1fr 1fr; }
  .import-summary, .profile-grid { grid-template-columns: 1fr 1fr; }
}
</style>
