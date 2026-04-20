<template>
  <div class="templates-page">
    <header class="page-header">
      <div>
        <h1>模板中心</h1>
        <p>选择一个适合当前求职方向的版式，进入编辑器后可继续调整内容。</p>
      </div>
      <el-button type="primary" @click="openEditor()">使用默认模板</el-button>
    </header>

    <section class="filter-panel">
      <div class="filter-row">
        <span class="filter-label">版式</span>
        <div class="chip-group">
          <button
            v-for="option in variantOptions"
            :key="option.value"
            class="filter-chip"
            :class="{ active: activeVariant === option.value }"
            type="button"
            @click="selectVariant(option.value)"
          >
            {{ option.label }}
            <span>{{ getVariantCount(option.value) }}</span>
          </button>
        </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">范围</span>
        <div class="chip-group">
          <button
            v-for="option in scopeOptions"
            :key="option.value"
            class="filter-chip"
            :class="{ active: activeScope === option.value }"
            type="button"
            @click="selectScope(option.value)"
          >
            {{ option.label }}
            <span>{{ getScopeCount(option.value) }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="list-header">
      <div>
        <h2>{{ listTitle }}</h2>
        <p>{{ visibleTemplates.length }} 个模板可用</p>
      </div>
    </section>

    <div class="template-grid" v-loading="loading">
      <article
        v-for="item in pagedTemplates"
        :key="item.templateId"
        class="template-card"
        :class="{
          favorited: isFavorite(item.templateId),
          recent: isRecent(item.templateId),
        }"
      >
        <div class="template-cover">
          <img v-if="item.coverUrl" :src="item.coverUrl" :alt="`${item.name} 预览图`" />
          <div v-else class="template-cover-placeholder">
            {{ item.variantLabel || '模板预览' }}
          </div>
        </div>

        <div class="template-body">
          <div class="template-title-row">
            <h3>{{ item.name }}</h3>
            <span v-if="isFavorite(item.templateId)" class="status-badge">已收藏</span>
            <span v-else-if="isRecent(item.templateId)" class="status-badge muted">最近使用</span>
          </div>

          <div class="template-meta">
            <span>{{ item.variantLabel || '默认版式' }}</span>
            <span>使用 {{ item.useCount || 0 }} 次</span>
          </div>
        </div>

        <div class="template-actions">
          <el-button size="small" @click="toggleFavorite(item.templateId)">
            {{ isFavorite(item.templateId) ? '取消收藏' : '收藏' }}
          </el-button>
          <el-button size="small" @click="openPreview(item.templateId)">预览</el-button>
          <el-button size="small" type="primary" @click="openEditor(item.templateId)">使用模板</el-button>
        </div>
      </article>
    </div>

    <el-empty
      v-if="!loading && !pagedTemplates.length"
      :description="emptyDescription"
    />

    <div v-if="visibleTemplates.length > limit" class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="limit"
        :total="visibleTemplates.length"
        :page-sizes="[8, 16, 24]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <el-dialog v-model="previewVisible" title="模板预览" width="88%" top="4vh">
      <CoreResumePreview v-if="previewDocument" :document="previewDocument" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CoreResumePreview from '@/components/core-resume/CoreResumePreview.vue'
import { createDemoDocument, extractThemeFromTemplate, type CoreResumeDocument } from '@/core-resume/model'
import { getTemplateVariantLabel, resolveTemplateVariant } from '@/core-resume/templates'
import {
  addFavoriteTemplate,
  fetchTemplates,
  getTemplateDetail,
  listFavoriteTemplateIds,
  removeFavoriteTemplate,
  type TemplateMeta,
} from '@/api/template'
import { useUserStore } from '@/store/user'

type VariantAwareDocument = CoreResumeDocument & { templateVariant?: string }
type TemplateCard = TemplateMeta
type VariantFilter = 'all' | NonNullable<TemplateMeta['templateVariant']>
type ScopeFilter = 'all' | 'favorites' | 'recent'

const FAVORITE_TEMPLATE_STORAGE_KEY = 'resume-favorite-template-ids'
const RECENT_TEMPLATE_STORAGE_KEY = 'resume-recent-template-ids'
const RECENT_TEMPLATE_LIMIT = 8

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const list = ref<TemplateCard[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(8)
const activeVariant = ref<VariantFilter>('all')
const activeScope = ref<ScopeFilter>('all')
const favoriteTemplateIds = ref<string[]>(readStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY))
const recentTemplateIds = ref<string[]>(readStoredTemplateIds(RECENT_TEMPLATE_STORAGE_KEY).slice(0, RECENT_TEMPLATE_LIMIT))

const previewVisible = ref(false)
const previewDocument = ref<CoreResumeDocument | null>(null)

const variantOptions: Array<{ value: VariantFilter; label: string }> = [
  { value: 'all', label: '全部版式' },
  { value: 'classic', label: '经典单栏' },
  { value: 'sidebar', label: '侧栏双栏' },
  { value: 'timeline', label: '时间轴版' },
  { value: 'spotlight', label: '聚焦封面' },
  { value: 'ats', label: 'ATS 极简' },
  { value: 'executive', label: '高管黑金' },
  { value: 'compact', label: '紧凑信息流' },
  { value: 'editorial', label: '编辑创意' },
]

const scopeOptions: Array<{ value: ScopeFilter; label: string }> = [
  { value: 'all', label: '全部模板' },
  { value: 'favorites', label: '只看收藏' },
  { value: 'recent', label: '最近使用' },
]

const favoriteTemplateSet = computed(() => new Set(favoriteTemplateIds.value))
const recentTemplateSet = computed(() => new Set(recentTemplateIds.value))

const variantFilteredTemplates = computed(() => {
  if (activeVariant.value === 'all') {
    return [...list.value]
  }
  return list.value.filter((item) => item.templateVariant === activeVariant.value)
})

const visibleTemplates = computed(() => {
  let templates = [...variantFilteredTemplates.value]

  if (activeScope.value === 'favorites') {
    templates = templates.filter((item) => favoriteTemplateSet.value.has(item.templateId))
  }

  if (activeScope.value === 'recent') {
    const recentOrder = new Map(recentTemplateIds.value.map((templateId, index) => [templateId, index]))
    templates = templates
      .filter((item) => recentOrder.has(item.templateId))
      .sort((left, right) => (recentOrder.get(left.templateId) ?? 99) - (recentOrder.get(right.templateId) ?? 99))
  }

  return templates
})

const pagedTemplates = computed(() => {
  const start = (page.value - 1) * limit.value
  return visibleTemplates.value.slice(start, start + limit.value)
})

const listTitle = computed(() => {
  if (activeScope.value === 'favorites') {
    return '我的收藏'
  }
  if (activeScope.value === 'recent') {
    return '最近使用'
  }
  return activeVariant.value === 'all' ? '全部模板' : getTemplateVariantLabel(activeVariant.value)
})

const emptyDescription = computed(() => {
  if (activeScope.value === 'favorites') {
    return '还没有收藏模板，可以先回到全部模板挑选。'
  }
  if (activeScope.value === 'recent') {
    return '还没有最近使用记录，使用任意模板后会出现在这里。'
  }
  return '当前筛选条件下还没有模板。'
})

watch(
  () => userStore.isLoggedIn,
  () => {
    syncFavoriteTemplateIds()
  },
)

load()
syncFavoriteTemplateIds()

async function load() {
  loading.value = true
  try {
    const batchSize = 100
    const firstPage = await fetchTemplates(1, batchSize, '', [], 'recommended')
    const mergedList = [...firstPage.list]
    const totalPages = Math.max(1, Math.ceil(firstPage.total / batchSize))

    for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
      const nextPage = await fetchTemplates(currentPage, batchSize, '', [], 'recommended')
      mergedList.push(...nextPage.list)
    }

    list.value = mergedList
    page.value = 1
  } catch (error) {
    console.error('模板列表加载失败:', error)
    list.value = []
  } finally {
    loading.value = false
  }
}

async function syncFavoriteTemplateIds() {
  if (!userStore.isLoggedIn) {
    favoriteTemplateIds.value = readStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY)
    return
  }

  try {
    const serverFavoriteIds = await listFavoriteTemplateIds()
    const localFavoriteIds = readStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY)
    const missingLocalFavorites = localFavoriteIds.filter((templateId) => !serverFavoriteIds.includes(templateId))

    for (const templateId of missingLocalFavorites) {
      await addFavoriteTemplate(templateId)
    }

    favoriteTemplateIds.value = missingLocalFavorites.length
      ? await listFavoriteTemplateIds()
      : serverFavoriteIds

    writeStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY, favoriteTemplateIds.value)
  } catch (error) {
    console.error('模板收藏同步失败:', error)
    favoriteTemplateIds.value = readStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY)
  }
}

async function openPreview(templateId: string) {
  previewDocument.value = createDemoDocument()
  previewVisible.value = true

  try {
    const detail = await getTemplateDetail(templateId)
    const templateData = typeof detail.templateData === 'string'
      ? JSON.parse(detail.templateData)
      : detail.templateData
    previewDocument.value = createDemoDocument(extractThemeFromTemplate(templateData))
    previewDocument.value.templateId = templateId
    previewDocument.value.templateName = detail.name
    ;(previewDocument.value as VariantAwareDocument).templateVariant = resolveTemplateVariant(
      previewDocument.value as VariantAwareDocument,
      templateData,
    )
  } catch (error) {
    console.error('模板预览加载失败:', error)
  }
}

function openEditor(templateId?: string) {
  const resumeQuery = typeof route.query.resumeId === 'string' ? route.query.resumeId : ''
  const query = new URLSearchParams()

  if (templateId) {
    persistRecentTemplate(templateId)
  }

  if (resumeQuery) {
    query.set('resumeId', resumeQuery)
  }

  if (templateId) {
    query.set('templateId', templateId)
  }

  const queryString = query.toString()
  router.push(queryString ? `/resume-editor?${queryString}` : '/resume-editor')
}

function selectVariant(next: VariantFilter) {
  activeVariant.value = next
  page.value = 1
}

function selectScope(next: ScopeFilter) {
  activeScope.value = next
  page.value = 1
}

function getVariantCount(variant: VariantFilter) {
  if (variant === 'all') {
    return list.value.length
  }
  return list.value.filter((item) => item.templateVariant === variant).length
}

function getScopeCount(scope: ScopeFilter) {
  if (scope === 'favorites') {
    return variantFilteredTemplates.value.filter((item) => favoriteTemplateSet.value.has(item.templateId)).length
  }
  if (scope === 'recent') {
    return variantFilteredTemplates.value.filter((item) => recentTemplateSet.value.has(item.templateId)).length
  }
  return variantFilteredTemplates.value.length
}

function handlePageChange(nextPage: number) {
  page.value = nextPage
}

function handleSizeChange(nextSize: number) {
  limit.value = nextSize
  page.value = 1
}

async function toggleFavorite(templateId: string) {
  const wasFavorite = isFavorite(templateId)
  const nextFavoriteIds = wasFavorite
    ? favoriteTemplateIds.value.filter((item) => item !== templateId)
    : [templateId, ...favoriteTemplateIds.value.filter((item) => item !== templateId)]

  favoriteTemplateIds.value = nextFavoriteIds
  writeStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY, nextFavoriteIds)

  if (!userStore.isLoggedIn) {
    return
  }

  try {
    if (wasFavorite) {
      await removeFavoriteTemplate(templateId)
    } else {
      await addFavoriteTemplate(templateId)
    }
  } catch (error) {
    console.error('模板收藏保存失败:', error)
    favoriteTemplateIds.value = wasFavorite
      ? [templateId, ...favoriteTemplateIds.value.filter((item) => item !== templateId)]
      : favoriteTemplateIds.value.filter((item) => item !== templateId)
    writeStoredTemplateIds(FAVORITE_TEMPLATE_STORAGE_KEY, favoriteTemplateIds.value)
  }
}

function isFavorite(templateId: string) {
  return favoriteTemplateSet.value.has(templateId)
}

function isRecent(templateId: string) {
  return recentTemplateIds.value.includes(templateId)
}

function persistRecentTemplate(templateId: string) {
  recentTemplateIds.value = [
    templateId,
    ...recentTemplateIds.value.filter((item) => item !== templateId),
  ].slice(0, RECENT_TEMPLATE_LIMIT)

  writeStoredTemplateIds(RECENT_TEMPLATE_STORAGE_KEY, recentTemplateIds.value)
}

function readStoredTemplateIds(storageKey: string) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((item) => String(item))
      .filter(Boolean)
  } catch {
    return []
  }
}

function writeStoredTemplateIds(storageKey: string, templateIds: string[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(templateIds))
  }
}
</script>

<style scoped>
.templates-page {
  min-height: 100vh;
  padding: 34px;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 30%),
    #f8fafc;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 22px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  letter-spacing: -0.04em;
  color: #0f172a;
}

.page-header p {
  margin: 8px 0 0;
  color: #64748b;
}

.filter-panel {
  display: grid;
  gap: 16px;
  padding: 18px;
  margin-bottom: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.05);
}

.filter-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 14px;
  align-items: flex-start;
}

.filter-label {
  padding-top: 8px;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  height: 36px;
  padding: 0 14px;
  border: 1px solid #dbe3ef;
  border-radius: 999px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.filter-chip span {
  color: #94a3b8;
  font-size: 12px;
}

.filter-chip:hover,
.filter-chip.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}

.filter-chip.active span {
  color: #2563eb;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}

.list-header h2 {
  margin: 0;
  font-size: 22px;
  color: #0f172a;
}

.list-header p {
  margin: 5px 0 0;
  color: #64748b;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  min-height: 260px;
}

.template-card {
  display: flex;
  flex-direction: column;
  min-height: 390px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.template-card:hover {
  transform: translateY(-3px);
  border-color: rgba(37, 99, 235, 0.38);
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.1);
}

.template-card.favorited {
  border-color: rgba(245, 158, 11, 0.45);
}

.template-cover {
  height: 178px;
  padding: 18px;
  background: linear-gradient(180deg, #f1f5f9, #ffffff);
}

.template-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.template-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #e2e8f0;
  color: #64748b;
  font-weight: 700;
}

.template-body {
  flex: 1;
  padding: 18px 18px 12px;
}

.template-title-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.template-title-row h3 {
  min-height: 44px;
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  line-height: 1.25;
}

.status-badge {
  flex: 0 0 auto;
  padding: 4px 9px;
  border-radius: 999px;
  background: #fffbeb;
  color: #b45309;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.muted {
  background: #f3e8ff;
  color: #7c3aed;
}

.template-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.template-meta span {
  padding: 5px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.template-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1.25fr;
  gap: 8px;
  padding: 0 18px 18px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 960px) {
  .templates-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
  }

  .filter-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .filter-label {
    padding-top: 0;
  }

  .template-actions {
    grid-template-columns: 1fr;
  }
}
</style>
