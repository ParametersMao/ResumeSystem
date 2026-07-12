<template>
  <div class="templates-page">
    <header class="page-header">
      <div>
        <h1>选择信息结构</h1>
        <p>先看岗位场景和内容密度，再决定颜色。当前版式均可继续调整字体、主题色和间距。</p>
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
        <p>{{ visibleTemplates.length }} 个版式可用 · 预览、编辑器与 PDF 使用同一渲染结构</p>
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
          <div class="template-renderer-preview" aria-hidden="true">
            <div class="template-renderer-stage">
              <CoreResumePreview :document="getCardPreviewDocument(item)" />
            </div>
          </div>
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
            <span>{{ getTemplateScenario(item) }}</span>
          </div>
          <p class="template-description">{{ item.variantDescription || '结构清晰，适合中文简历编辑与 PDF 投递。' }}</p>
          <div v-if="getVisibleTags(item).length" class="template-tags">
            <span v-for="tag in getVisibleTags(item)" :key="tag">{{ tag }}</span>
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
import { createDemoDocument, ensureAllSections, extractLayoutFromTemplate, extractThemeFromTemplate, type CoreResumeDocument, type CoreTemplateLayoutKey, type CoreTemplateVariant } from '@/core-resume/model'
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
const CARD_PREVIEW_THEME_BY_LAYOUT: Partial<Record<CoreTemplateLayoutKey, string>> = {
  'qm-blue-top-photo': '#5272b7',
  'qm-sidebar-profile': '#5aa1d6',
  'qm-classic-centered': '#173e5f',
  'qm-ribbon-compact': '#1f4868',
  'qm-timeline-icons': '#5aa1d6',
  'qm-minimal-ats': '#163a59',
  'qm-executive-business': '#26364d',
  'qm-student-editorial': '#2f80a7',
  'qm-spotlight-featured': '#2e6cff',
  'qm-asymmetric-profile': '#386b78',
}

const TEMPLATE_SCENARIO_BY_VARIANT: Partial<Record<NonNullable<TemplateMeta['templateVariant']>, string>> = {
  classic: '通用职能 / 正式投递',
  sidebar: '信息丰富 / 资深候选人',
  timeline: '技术产品 / 项目经历',
  spotlight: '产品运营 / 成果导向',
  ats: 'ATS 系统 / 稳定解析',
  executive: '管理咨询 / 中高层',
  compact: '财务行政 / 一页高密度',
  editorial: '校招教育 / 应届生',
}
const TEMPLATE_SCENARIO_BY_LAYOUT: Partial<Record<CoreTemplateLayoutKey, string>> = {
  'qm-asymmetric-profile': '专业人才 / 资深职能',
}

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
const cardPreviewCache = new Map<string, CoreResumeDocument>()

const variantOptions: Array<{ value: VariantFilter; label: string }> = [
  { value: 'all', label: '全部版式' },
  { value: 'classic', label: '经典单栏' },
  { value: 'sidebar', label: '侧栏双栏' },
  { value: 'timeline', label: '时间轴版' },
  { value: 'spotlight', label: '成果导向' },
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
    const resolvedVariant = resolveTemplateVariant(detail, templateData)
    const extractedLayout = extractLayoutFromTemplate(templateData)
    const resolvedLayoutKey = detail.layoutKey || extractedLayout?.key
    previewDocument.value = createTemplatePreviewDocument(resolvedVariant, extractThemeFromTemplate(templateData), resolvedLayoutKey)
    previewDocument.value.templateLayout = detail.layoutKey
      ? { ...extractedLayout, key: detail.layoutKey }
      : extractedLayout
    previewDocument.value.templateId = templateId
    previewDocument.value.templateName = detail.name
    ;(previewDocument.value as VariantAwareDocument).templateVariant = resolvedVariant
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

function getTemplateScenario(item: TemplateCard) {
  if (item.layoutKey && TEMPLATE_SCENARIO_BY_LAYOUT[item.layoutKey]) {
    return TEMPLATE_SCENARIO_BY_LAYOUT[item.layoutKey]
  }
  return TEMPLATE_SCENARIO_BY_VARIANT[item.templateVariant || 'classic'] || '中文简历 / PDF 投递'
}

function getVisibleTags(item: TemplateCard) {
  const ignored = new Set(['全民简历', '蓝色', '深色', '正式', '简洁'])
  return (item.industryTags || []).filter((tag) => !ignored.has(tag)).slice(0, 3)
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

function getCardPreviewDocument(template: TemplateCard) {
  const cacheKey = [
    template.templateId,
    template.layoutKey || '',
    template.templateVariant || '',
    template.themeColor || '',
  ].join(':')
  const cached = cardPreviewCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const primaryColor = template.layoutKey
    ? CARD_PREVIEW_THEME_BY_LAYOUT[template.layoutKey] || template.themeColor
    : template.themeColor
  const variant = template.templateVariant || resolveTemplateVariant({
    templateName: template.name,
    templateLayout: template.layoutKey ? { key: template.layoutKey } : undefined,
  })
  const document = createTemplatePreviewDocument(variant, primaryColor ? { primaryColor } : undefined, template.layoutKey)
  document.templateId = template.templateId
  document.templateName = template.name
  document.templateLayout = template.layoutKey ? { key: template.layoutKey } : undefined
  document.templateVariant = variant

  cardPreviewCache.set(cacheKey, document)
  return document
}

function createTemplatePreviewDocument(
  variant: CoreTemplateVariant,
  themeOverrides?: Partial<CoreResumeDocument['theme']>,
  layoutKey?: CoreTemplateLayoutKey,
) {
  const document = ensureAllSections(createDemoDocument(themeOverrides))

  if (layoutKey === 'qm-asymmetric-profile') {
    document.profile = {
      ...document.profile,
      name: '沈清和',
      title: '品牌策略负责人',
      yearsOfExperience: '8年',
      email: 'qinghe@example.com',
      site: '',
    }
    updatePreviewSection(document, 'intention', '职业定位', [{ intention: '品牌策略 / 内容增长 / 杭州' }])
    updatePreviewSection(document, 'summary', '个人陈述', [{ text: '擅长从商业目标出发构建品牌叙事，并把策略转化为跨渠道内容与可衡量的增长成果。' }])
    updatePreviewSection(document, 'skills', '核心能力', [
      { name: '品牌策略', proficiency: '94', level: '精通' },
      { name: '内容增长', proficiency: '88', level: '熟练' },
      { name: '用户研究', proficiency: '82', level: '熟练' },
    ])
    updatePreviewSection(document, 'awards', '荣誉证书', [{ name: '年度品牌营销案例奖', org: '行业协会', date: '2024' }])
    updatePreviewSection(document, 'experience', '工作经历', [{
      company: '某消费科技公司', role: '品牌策略负责人', duration: { start: '2021-04', end: '至今' },
      desc: '重构品牌定位与年度内容矩阵，协调产品、市场和渠道团队完成 4 次重点发布，品牌搜索量提升 46%。',
    }])
    updatePreviewSection(document, 'projects', '代表项目', [{
      name: '新品类品牌升级', role: '项目负责人', duration: { start: '2023-02', end: '2023-10' },
      desc: '完成用户研究、价值主张与传播方案，推动核心渠道转化率提升 21%，沉淀可复用的品牌表达规范。',
    }])
    for (const section of document.sections) {
      section.visible = ['intention', 'education', 'skills', 'awards', 'summary', 'experience', 'projects'].includes(section.type)
    }
    return document
  }

  if (variant === 'editorial') {
    document.profile = {
      ...document.profile,
      name: '李妍',
      title: '产品运营实习生',
      yearsOfExperience: '应届生',
      email: 'liyan@example.com',
      site: '',
    }
    updatePreviewSection(document, 'intention', '求职意向', [{ intention: '产品运营 / 用户增长 / 上海' }])
    updatePreviewSection(document, 'education', '教育背景', [{
      school: '华东理工大学',
      degree: '信息管理与信息系统 本科',
      duration: { start: '2022-09', end: '2026-06' },
      desc: 'GPA 3.7/4.0（专业前 15%），主修数据分析、用户研究与产品设计。',
    }])
    updatePreviewSection(document, 'projects', '代表项目', [{
      name: '校园二手交易小程序',
      role: '产品负责人',
      duration: { start: '2024-09', end: '2025-01' },
      desc: '完成 42 名学生访谈、需求分层和原型测试，组织 4 人团队交付核心交易流程。',
    }])
    updatePreviewSection(document, 'internship', '实习经历', [{
      company: '某互联网教育平台',
      role: '产品运营实习生',
      duration: { start: '2025-03', end: '2025-09' },
      desc: '参与新用户激活流程优化，负责活动配置、数据复盘和用户访谈，形成 3 项可执行改进建议。',
    }])
    updatePreviewSection(document, 'campus', '校园经历', [{
      org: '校学生会新媒体中心',
      role: '内容组负责人',
      duration: { start: '2023-09', end: '2024-07' },
      desc: '统筹选题、排期与复盘，协调 6 名成员完成迎新季内容项目。',
    }])
    updatePreviewSection(document, 'skills', '技能工具', [
      { name: 'Excel / SQL', proficiency: '88', level: '熟练' },
      { name: 'Axure / Figma', proficiency: '82', level: '熟练' },
      { name: '英语 CET-6', proficiency: '76', level: '良好' },
    ])
    updatePreviewSection(document, 'awards', '荣誉证书', [{
      name: '全国大学生市场调查大赛 省级二等奖',
      org: '中国商业统计学会',
      date: '2025-05',
    }])
    updatePreviewSection(document, 'summary', '个人优势', [{ text: '能从用户研究和数据分析中提炼问题，并把结论转化为可执行的产品与运营方案。' }])
    const experienceSection = document.sections.find((section) => section.type === 'experience')
    if (experienceSection) experienceSection.visible = false
    const studentOrder = ['education', 'projects', 'internship', 'campus', 'skills', 'awards', 'summary', 'intention']
    document.sections.sort((left, right) =>
      studentOrder.indexOf(left.type) - studentOrder.indexOf(right.type),
    )
    return document
  }

  if (variant === 'spotlight') {
    document.profile = {
      ...document.profile,
      name: '周宁',
      title: '产品运营 / 用户增长',
      avatar: '',
      yearsOfExperience: '4年',
      email: 'zhouning@example.com',
      site: '',
    }
    updatePreviewSection(document, 'intention', '职业定位', [{ intention: '产品运营 / 用户增长 / 企业服务' }])
    updatePreviewSection(document, 'summary', '成果摘要', [{
      text: '围绕用户激活、留存和产品采用推进增长项目，擅长把用户研究、数据分析与跨团队落地连接起来。',
    }])
    updatePreviewSection(document, 'projects', '代表成果', [
      {
        name: '新用户激活链路重构', role: '项目负责人', duration: { start: '2024-03', end: '2024-08' },
        desc: '针对注册后首周流失问题，拆解关键行为并完成 3 轮 A/B 测试，推动产品与研发上线分层引导，首周激活率提升 18%。',
      },
      {
        name: '企业客户内容增长计划', role: '运营负责人', duration: { start: '2023-06', end: '2023-12' },
        desc: '重构选题、生产和复盘机制，联合销售沉淀行业案例，内容带来的有效线索增长 32%。',
      },
    ])
    updatePreviewSection(document, 'experience', '工作经历', [{
      company: '某企业服务公司', role: '高级产品运营', duration: { start: '2022-04', end: '至今' },
      desc: '负责核心产品采用与用户生命周期运营，搭建周度指标看板，协同产品、销售和客户成功推进增长实验。',
    }])
    updatePreviewSection(document, 'skills', '核心能力', [
      { name: '用户增长' }, { name: '数据分析' }, { name: 'A/B 测试' }, { name: '跨团队协作' },
    ])
    updatePreviewSection(document, 'education', '教育背景', [{
      school: '暨南大学', degree: '市场营销 本科', duration: { start: '2014-09', end: '2018-06' }, desc: '',
    }])
    return document
  }

  if (variant === 'executive') {
    document.profile = {
      ...document.profile,
      name: '陈哲',
      title: '业务运营总监',
      yearsOfExperience: '12年',
      email: 'chenzhe@example.com',
      site: '',
    }
    updatePreviewSection(document, 'intention', '职业定位', [{ intention: '业务运营总监 / 企业服务' }])
    updatePreviewSection(document, 'education', '教育背景', [{
      school: '中山大学',
      degree: '工商管理 硕士',
      duration: { start: '2010-09', end: '2013-06' },
      desc: '聚焦组织管理、商业分析与企业战略。',
    }])
    updatePreviewSection(document, 'experience', '管理经历', [
      {
        company: '某企业服务集团', role: '业务运营总监', duration: { start: '2020-06', end: '至今' },
        desc: '负责全国业务运营与经营分析，管理跨区域团队，推动交付流程标准化。',
      },
      {
        company: '某数字科技公司', role: '运营负责人', duration: { start: '2015-04', end: '2020-05' },
        desc: '从 0 到 1 建设运营体系，协同销售、产品与交付团队提升客户续约。',
      },
    ])
    updatePreviewSection(document, 'projects', '核心业绩', [{
      name: '全国交付体系升级', role: '项目负责人', duration: { start: '2023-02', end: '2023-12' },
      desc: '统一关键流程和经营看板，缩短跨部门协作链路并提升交付可预测性。',
    }])
    updatePreviewSection(document, 'skills', '核心能力', [
      { name: '经营分析' }, { name: '组织管理' }, { name: '流程建设' }, { name: '业务增长' },
    ])
    updatePreviewSection(document, 'summary', '管理理念', [{ text: '擅长将战略目标拆解为组织机制、过程指标和可复用的执行体系。' }])
    return document
  }

  if (variant === 'ats' || variant === 'timeline') {
    document.profile = {
      ...document.profile,
      name: '王晨',
      title: '前端工程师',
      yearsOfExperience: '5年',
      email: 'wangchen@example.com',
      site: 'github.com/wangchen',
    }
    updatePreviewSection(document, 'intention', '求职意向', [{ intention: '前端工程师 / Web 应用架构' }])
    updatePreviewSection(document, 'education', '教育背景', [{
      school: '南京邮电大学', degree: '软件工程 本科', duration: { start: '2015-09', end: '2019-06' },
      desc: '主修数据结构、计算机网络、数据库和软件工程。',
    }])
    updatePreviewSection(document, 'experience', '工作经历', [{
      company: '某企业服务公司', role: '高级前端工程师', duration: { start: '2021-05', end: '至今' },
      desc: '负责核心管理平台架构与性能治理，建设组件规范并推动前端工程化落地。',
    }])
    updatePreviewSection(document, 'projects', '项目经历', [{
      name: '企业级工作台重构', role: '前端负责人', duration: { start: '2023-03', end: '2024-01' },
      desc: '完成 Vue 3 与 TypeScript 技术升级，拆分公共模块并建立质量检查流程。',
    }])
    updatePreviewSection(document, 'skills', '专业技能', [
      { name: 'Vue 3 / TypeScript' }, { name: '工程化与性能优化' }, { name: 'Node.js' }, { name: '前端架构' },
    ])
    updatePreviewSection(document, 'summary', '个人优势', [{ text: '关注复杂业务的可维护性和交付效率，具备从需求拆解到稳定上线的完整经验。' }])
  }

  return document
}

function updatePreviewSection(
  document: CoreResumeDocument,
  type: CoreResumeDocument['sections'][number]['type'],
  title: string,
  items: CoreResumeDocument['sections'][number]['items'],
) {
  const section = document.sections.find((item) => item.type === type)
  if (!section) return
  section.title = title
  section.visible = true
  section.items = items
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
  min-height: 430px;
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
  position: relative;
  height: 220px;
  padding: 14px;
  background: linear-gradient(180deg, #f1f5f9, #ffffff);
  overflow: hidden;
}

.template-renderer-preview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.template-renderer-stage {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 820px;
  height: 1120px;
  pointer-events: none;
  transform: translateX(-50%) scale(0.23);
  transform-origin: top center;
}

.template-renderer-stage :deep(.core-preview-shell) {
  width: 820px;
  padding: 0;
  background: #ffffff;
}

.template-renderer-stage :deep(.resume-sheet) {
  margin: 0;
  box-shadow: none;
}

.template-cover img {
  display: none;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  background: #ffffff;
}

.template-cover-placeholder {
  display: none;
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

.template-cover > img,
.template-cover > .template-cover-placeholder {
  display: none;
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

.template-description {
  min-height: 44px;
  margin: 13px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.template-tags span {
  padding: 4px 8px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  color: #1d4ed8;
  background: #eff6ff;
  font-size: 11px;
  font-weight: 700;
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
