<template>
  <div class="template-management">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="模板名称">
          <el-input
            v-model="searchForm.templateName"
            placeholder="请输入模板名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="searchForm.description"
            placeholder="请输入描述关键词"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="版式">
          <el-select v-model="searchForm.templateVariant" placeholder="请选择版式" clearable style="width: 160px">
            <el-option label="经典单栏" value="classic" />
            <el-option label="侧栏双栏" value="sidebar" />
            <el-option label="时间轴版" value="timeline" />
            <el-option label="聚焦封面" value="spotlight" />
            <el-option label="ATS 极简" value="ats" />
            <el-option label="高管黑金" value="executive" />
            <el-option label="紧凑信息流" value="compact" />
            <el-option label="编辑创意" value="editorial" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch(getSearchParams())">搜索</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
        <el-form-item label="场景标签">
          <el-input v-model="searchForm.industryTags" placeholder="例如：校招,技术" clearable style="width: 220px" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 模板列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>模板列表</span>
          <el-button
            v-if="canWrite"
            type="primary"
            :disabled="editingTemplateId !== null || submitLoading"
            @click="handleAdd"
          >
            新增模板
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="templateList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="templateName" label="模板名称" width="150" />
        <el-table-column prop="templateVariant" label="版式" width="120">
          <template #default="{ row }">
            <el-tag type="primary">
              {{ getTemplateVariantLabel(row.templateVariant) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="layoutKey" label="布局 Key" min-width="190" />
        <el-table-column prop="recommendWeight" label="推荐权重" width="110" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="预览图" width="120">
          <template #default="{ row }">
            <el-button 
              v-if="row.previewImage" 
              type="primary" 
              size="small" 
              @click="showPreviewImage(row)"
            >
              查看图片
            </el-button>
            <span v-else class="no-image">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">
              {{ row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button
                v-if="canWrite"
                type="primary"
                size="small"
                :loading="editingTemplateId === row.id"
                :disabled="(editingTemplateId !== null && editingTemplateId !== row.id) || submitLoading"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button type="success" size="small" @click="handlePreview(row)">预览</el-button>
              <el-button
                v-if="canWrite"
                :type="row.status ? 'warning' : 'success'"
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.status ? '禁用' : '启用' }}
              </el-button>
              <el-button v-if="canWrite" type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 模板编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="!submitLoading"
      :close-on-press-escape="!submitLoading"
      :show-close="!submitLoading"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :disabled="submitLoading"
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="模板版式" prop="templateVariant">
          <el-select v-model="form.templateVariant" placeholder="请选择模板版式" @change="handleVariantChange">
            <el-option label="经典单栏" value="classic" />
            <el-option label="侧栏双栏" value="sidebar" />
            <el-option label="时间轴版" value="timeline" />
            <el-option label="聚焦封面" value="spotlight" />
            <el-option label="ATS 极简" value="ats" />
            <el-option label="高管黑金" value="executive" />
            <el-option label="紧凑信息流" value="compact" />
            <el-option label="编辑创意" value="editorial" />
          </el-select>
        </el-form-item>
        <el-form-item label="布局 Key" prop="layoutKey">
          <el-select v-model="form.layoutKey" placeholder="请选择具体模板布局" filterable style="width: 100%" @change="handleLayoutKeyChange">
            <el-option
              v-for="option in TEMPLATE_LAYOUT_OPTIONS"
              :key="option.key"
              :label="option.label"
              :value="option.key"
            />
          </el-select>
          <div class="layout-contract-tip">
            头像默认开启；位置、尺寸和裁切锚点由布局 Key 的统一契约决定。
          </div>
        </el-form-item>
        <el-form-item label="场景标签">
          <el-input
            v-model="form.industryTags"
            placeholder="多个标签用英文逗号分隔，例如：校招,前端,产品"
          />
        </el-form-item>
        <el-form-item label="推荐权重">
          <el-input-number v-model="form.recommendWeight" :min="0" :step="10" />
        </el-form-item>
        <el-form-item label="预览图" prop="previewImage">
          <div class="asset-tools">
            <el-upload
              class="upload-demo"
              action="#"
              :auto-upload="false"
              :on-change="handleImageChange"
              :show-file-list="false"
            >
              <el-button type="primary">选择图片</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传 jpg/png 文件，且不超过 5MB
                </div>
              </template>
            </el-upload>
            <div class="spec-actions">
              <el-button plain @click="openTemplateSpecDialog">查看 JSON 规范</el-button>
              <el-button @click="applyTemplateSpec(form.templateVariant)">套用当前版式示例</el-button>
            </div>
          </div>
          <div v-if="form.previewImage" class="preview-image">
            <el-image
              :src="form.previewImage"
              style="width: 200px; height: 150px"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="模板数据" prop="templateData">
          <el-input
            v-model="form.templateData"
            type="textarea"
            :rows="10"
            placeholder="请输入模板JSON数据"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="submitLoading" @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            :disabled="!formReadyForSubmit || editingTemplateId !== null"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="模板预览"
      width="90%"
      top="5vh"
      fullscreen
    >
      <div class="preview-content">
        <div v-if="generatedHtml && generatedHtml.length > 0" class="template-preview">
          <el-tabs>
            <el-tab-pane label="渲染效果">
              <div class="iframe-container">
                <iframe
                  ref="previewIframe"
                  class="preview-iframe"
                  :srcdoc="generatedHtml"
                  sandbox="allow-scripts allow-same-origin"
                  width="100%"
                  height="800"
                ></iframe>
              </div>
            </el-tab-pane>
            <el-tab-pane label="模板数据">
              <el-card class="template-data-card">
                <pre>{{ JSON.stringify(currentTemplateData, null, 2) }}</pre>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-else class="preview-placeholder">
          模板数据为空，无法预览
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="specDialogVisible"
      title="模板 JSON 规范"
      width="820px"
      top="6vh"
    >
      <div class="spec-dialog">
        <div class="spec-toolbar">
          <el-radio-group v-model="specVariant">
            <el-radio-button label="classic">经典单栏</el-radio-button>
            <el-radio-button label="sidebar">侧栏双栏</el-radio-button>
            <el-radio-button label="timeline">时间轴版</el-radio-button>
            <el-radio-button label="spotlight">聚焦封面</el-radio-button>
            <el-radio-button label="ats">ATS 极简</el-radio-button>
            <el-radio-button label="executive">高管黑金</el-radio-button>
            <el-radio-button label="compact">紧凑信息流</el-radio-button>
            <el-radio-button label="editorial">编辑创意</el-radio-button>
          </el-radio-group>
          <div class="spec-toolbar-actions">
            <el-tooltip content="示例会自动写入 layout.key、统一头像预设、variant 和 theme.variant；可继续补充颜色、字体、区块配置和封面图。" placement="bottom">
              <span class="help-link">规范说明</span>
            </el-tooltip>
            <el-button @click="copyCurrentSpec">复制示例</el-button>
            <el-button type="primary" @click="applyTemplateSpec(specVariant)">套用到编辑表单</el-button>
          </div>
        </div>
        <el-card class="template-data-card">
          <pre>{{ currentSpecJson }}</pre>
        </el-card>
      </div>
    </el-dialog>
    
    <!-- 预览图片对话框 -->
    <el-dialog
      v-model="imagePreviewVisible"
      title="预览图片"
      width="50%"
      top="10vh"
    >
      <div class="image-preview-content">
        <el-image
          v-if="currentPreviewImage"
          :src="currentPreviewImage"
          style="max-width: 100%; max-height: 500px"
          fit="contain"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, UploadFile } from 'element-plus'
import type { Template } from '@/types'
import { getTemplateList, getTemplateDetail, createTemplate, updateTemplate, deleteTemplate } from '@/api/template'
import { useTable } from '@/hooks/useTable'
import { formatDate } from '@/utils/common'
import { useUserStore } from '@/store/modules/user'

type TemplateVariant = 'classic' | 'sidebar' | 'timeline' | 'spotlight' | 'ats' | 'executive' | 'compact' | 'editorial'
type TemplateLayoutKey =
  | 'qm-blue-top-photo'
  | 'qm-sidebar-profile'
  | 'qm-classic-centered'
  | 'qm-ribbon-compact'
  | 'qm-timeline-icons'
  | 'qm-table-formal'
  | 'qm-minimal-ats'
  | 'qm-executive-business'
  | 'qm-asymmetric-profile'
  | 'qm-student-editorial'
  | 'qm-spotlight-featured'

const userStore = useUserStore()
const canWrite = computed(() => userStore.user?.role !== 'viewer')

const TEMPLATE_AVATAR_PRESETS: Readonly<Record<TemplateLayoutKey, Readonly<Record<string, any>>>> = {
  'qm-blue-top-photo': avatarPreset('header-right', 'square', 96, 120),
  'qm-sidebar-profile': avatarPreset('sidebar-top', 'square', 104, 130),
  'qm-classic-centered': avatarPreset('header-right', 'square', 88, 110),
  'qm-ribbon-compact': avatarPreset('default', 'square', 96, 120),
  'qm-timeline-icons': avatarPreset('meta-card', 'square', 88, 110),
  'qm-table-formal': avatarPreset('header-right', 'square', 78, 98),
  'qm-minimal-ats': avatarPreset('header-right', 'square', 72, 90),
  'qm-executive-business': avatarPreset('header-right', 'square', 96, 120),
  'qm-asymmetric-profile': avatarPreset('header-right', 'square', 104, 130),
  'qm-student-editorial': avatarPreset('header-right', 'square', 88, 110),
  'qm-spotlight-featured': avatarPreset('meta-card', 'rounded', 96, 120),
}

const TEMPLATE_LAYOUT_OPTIONS: ReadonlyArray<{ key: TemplateLayoutKey; label: string; variant: TemplateVariant }> = [
  { key: 'qm-blue-top-photo', label: '蓝色右上证件照', variant: 'ats' },
  { key: 'qm-sidebar-profile', label: '左栏头像信息版', variant: 'sidebar' },
  { key: 'qm-classic-centered', label: '居中标题头像版', variant: 'classic' },
  { key: 'qm-ribbon-compact', label: '深蓝横条标题版', variant: 'compact' },
  { key: 'qm-timeline-icons', label: '图标时间轴版', variant: 'timeline' },
  { key: 'qm-table-formal', label: '正式表格信息版', variant: 'classic' },
  { key: 'qm-minimal-ats', label: '技术开发 ATS 单栏', variant: 'ats' },
  { key: 'qm-executive-business', label: '商务高管深色版', variant: 'executive' },
  { key: 'qm-asymmetric-profile', label: '非对称能力叙事版', variant: 'editorial' },
  { key: 'qm-student-editorial', label: '应届校招项目版', variant: 'editorial' },
  { key: 'qm-spotlight-featured', label: '产品运营成果版', variant: 'spotlight' },
]

const DEFAULT_LAYOUT_BY_VARIANT: Readonly<Record<TemplateVariant, TemplateLayoutKey>> = {
  classic: 'qm-classic-centered',
  sidebar: 'qm-sidebar-profile',
  timeline: 'qm-timeline-icons',
  spotlight: 'qm-spotlight-featured',
  ats: 'qm-minimal-ats',
  executive: 'qm-executive-business',
  compact: 'qm-ribbon-compact',
  editorial: 'qm-student-editorial',
}

function avatarPreset(placement: string, shape: string, width: number, height: number) {
  return Object.freeze({
    enabled: true,
    placement,
    shape,
    width,
    height,
    objectPosition: 'center 20%',
  })
}

function isTemplateLayoutKey(value: unknown): value is TemplateLayoutKey {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TEMPLATE_AVATAR_PRESETS, value)
}

function resolveTemplateLayoutKey(
  explicitLayoutKey: unknown,
  templateData: unknown,
  variant: TemplateVariant,
): TemplateLayoutKey {
  const parsed = typeof templateData === 'string' ? safeParseTemplateData(templateData) : templateData
  const candidate = [
    explicitLayoutKey,
    (parsed as any)?.layout?.key,
    (parsed as any)?.layoutKey,
    (parsed as any)?.key,
  ].find(isTemplateLayoutKey)
  return isTemplateLayoutKey(candidate) ? candidate : DEFAULT_LAYOUT_BY_VARIANT[variant]
}

function handleVariantChange(value: TemplateVariant) {
  form.layoutKey = DEFAULT_LAYOUT_BY_VARIANT[value]
}

function handleLayoutKeyChange(value: TemplateLayoutKey) {
  const option = TEMPLATE_LAYOUT_OPTIONS.find((item) => item.key === value)
  if (option) form.templateVariant = option.variant
}

// 搜索表单
const searchForm = reactive({
  templateName: '',
  description: '',
  status: null as boolean | null,
  industryTags: '',
  templateVariant: '' as TemplateVariant | ''
})

const {
  loading,
  dataList: templateList,
  pagination,
  handleSearch,
  handleReset,
  refresh,
  getData
} = useTable<Template>({
  fetchData: getTemplateList
})

// 瀵硅瘽妗?
const dialogVisible = ref(false)
const dialogTitle = ref('')
const previewVisible = ref(false)
const imagePreviewVisible = ref(false)
const specDialogVisible = ref(false)
const currentPreviewImage = ref('')
const formRef = ref<FormInstance>()
const specVariant = ref<TemplateVariant>('classic')
const editingTemplateId = ref<number | null>(null)
const submitLoading = ref(false)
const formReadyForSubmit = ref(false)

// 表单
const form = reactive({
  id: 0,
  templateName: '',
  description: '',
  industryTags: '',
  templateVariant: 'classic' as TemplateVariant,
  layoutKey: 'qm-classic-centered' as TemplateLayoutKey,
  recommendWeight: 0,
  previewImage: '',
  templateData: '' as any,
  status: 'active' as 'active' | 'inactive'
})

function resolveTemplateVariantFromData(templateData: unknown): TemplateVariant {
  let parsed = templateData
  if (typeof templateData === 'string') {
    try {
      parsed = templateData.trim() ? JSON.parse(templateData) : {}
    } catch {
      parsed = {}
    }
  }
  const variant = [
    (parsed as any)?.layout?.variant,
    (parsed as any)?.theme?.variant,
    (parsed as any)?.variant,
  ].find(isTemplateVariant)

  if (isTemplateVariant(variant)) {
    return variant
  }

  return 'classic'
}

const TEMPLATE_SPEC_MAP: Record<TemplateVariant, Record<string, any>> = {
  classic: {
    variant: 'classic',
    layoutKey: 'qm-classic-centered',
    recommendWeight: 0,
    meta: {
      recommendWeight: 0,
    },
    profile: {
      avatar: TEMPLATE_AVATAR_PRESETS['qm-classic-centered'],
    },
    layout: {
      key: 'qm-classic-centered',
      variant: 'classic',
      avatar: TEMPLATE_AVATAR_PRESETS['qm-classic-centered'],
    },
    theme: {
      variant: 'classic',
      colors: {
        primary: '#2563eb',
      },
      typography: {
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      },
      spacing: {
        sectionSpacing: 24,
        itemSpacing: 14,
      },
    },
  },
  sidebar: {
    variant: 'sidebar',
    layoutKey: 'qm-sidebar-profile',
    recommendWeight: 0,
    meta: {
      recommendWeight: 0,
    },
    profile: {
      avatar: TEMPLATE_AVATAR_PRESETS['qm-sidebar-profile'],
    },
    layout: {
      key: 'qm-sidebar-profile',
      variant: 'sidebar',
      sidebarWidth: 250,
      avatar: TEMPLATE_AVATAR_PRESETS['qm-sidebar-profile'],
    },
    theme: {
      variant: 'sidebar',
      colors: {
        primary: '#0f4c81',
      },
      typography: {
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      },
      spacing: {
        sectionSpacing: 24,
        itemSpacing: 14,
      },
    },
  },
  timeline: {
    variant: 'timeline',
    layoutKey: 'qm-timeline-icons',
    recommendWeight: 0,
    meta: {
      recommendWeight: 0,
    },
    profile: {
      avatar: TEMPLATE_AVATAR_PRESETS['qm-timeline-icons'],
    },
    layout: {
      key: 'qm-timeline-icons',
      variant: 'timeline',
      emphasis: 'experience',
      avatar: TEMPLATE_AVATAR_PRESETS['qm-timeline-icons'],
    },
    theme: {
      variant: 'timeline',
      colors: {
        primary: '#0f766e',
      },
      typography: {
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      },
      spacing: {
        sectionSpacing: 28,
        itemSpacing: 16,
      },
    },
  },
  spotlight: {
    variant: 'spotlight',
    layoutKey: 'qm-spotlight-featured',
    recommendWeight: 0,
    meta: {
      recommendWeight: 0,
    },
    profile: {
      avatar: TEMPLATE_AVATAR_PRESETS['qm-spotlight-featured'],
    },
    layout: {
      key: 'qm-spotlight-featured',
      variant: 'spotlight',
      emphasis: 'brand',
      avatar: TEMPLATE_AVATAR_PRESETS['qm-spotlight-featured'],
    },
    theme: {
      variant: 'spotlight',
      colors: {
        primary: '#7c3aed',
      },
      typography: {
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      },
      spacing: {
        sectionSpacing: 24,
        itemSpacing: 14,
      },
    },
  },
  ats: {
    variant: 'ats',
    layoutKey: 'qm-minimal-ats',
    recommendWeight: 0,
    meta: { recommendWeight: 0 },
    profile: { avatar: TEMPLATE_AVATAR_PRESETS['qm-minimal-ats'] },
    layout: { key: 'qm-minimal-ats', variant: 'ats', emphasis: 'readability', avatar: TEMPLATE_AVATAR_PRESETS['qm-minimal-ats'] },
    theme: {
      variant: 'ats',
      colors: { primary: '#111827' },
      typography: { fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
      spacing: { sectionSpacing: 18, itemSpacing: 10 },
    },
  },
  executive: {
    variant: 'executive',
    layoutKey: 'qm-executive-business',
    recommendWeight: 0,
    meta: { recommendWeight: 0 },
    profile: { avatar: TEMPLATE_AVATAR_PRESETS['qm-executive-business'] },
    layout: { key: 'qm-executive-business', variant: 'executive', emphasis: 'leadership', avatar: TEMPLATE_AVATAR_PRESETS['qm-executive-business'] },
    theme: {
      variant: 'executive',
      colors: { primary: '#92400e' },
      typography: { fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
      spacing: { sectionSpacing: 26, itemSpacing: 14 },
    },
  },
  compact: {
    variant: 'compact',
    layoutKey: 'qm-ribbon-compact',
    recommendWeight: 0,
    meta: { recommendWeight: 0 },
    profile: { avatar: TEMPLATE_AVATAR_PRESETS['qm-ribbon-compact'] },
    layout: { key: 'qm-ribbon-compact', variant: 'compact', emphasis: 'dense', avatar: TEMPLATE_AVATAR_PRESETS['qm-ribbon-compact'] },
    theme: {
      variant: 'compact',
      colors: { primary: '#334155' },
      typography: { fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
      spacing: { sectionSpacing: 14, itemSpacing: 8 },
    },
  },
  editorial: {
    variant: 'editorial',
    layoutKey: 'qm-student-editorial',
    recommendWeight: 0,
    meta: { recommendWeight: 0 },
    profile: { avatar: TEMPLATE_AVATAR_PRESETS['qm-student-editorial'] },
    layout: { key: 'qm-student-editorial', variant: 'editorial', emphasis: 'creative', avatar: TEMPLATE_AVATAR_PRESETS['qm-student-editorial'] },
    theme: {
      variant: 'editorial',
      colors: { primary: '#e11d48' },
      typography: { fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
      spacing: { sectionSpacing: 28, itemSpacing: 16 },
    },
  },
}

// 表单验证规则
const rules = {
  templateName: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  templateVariant: [
    { required: true, message: '请选择模板版式', trigger: 'change' }
  ],
  layoutKey: [
    { required: true, message: '请选择布局 Key', trigger: 'change' }
  ],
  templateData: [
    { required: true, message: '请输入模板数据', trigger: 'blur' },
    { validator: validateTemplateData, trigger: 'blur' }
  ]
}

// 新增模板
const handleAdd = () => {
  if (editingTemplateId.value !== null || submitLoading.value) return

  dialogTitle.value = '新增模板'
  form.id = 0
  form.templateName = ''
  form.description = ''
  form.industryTags = ''
  form.templateVariant = 'classic'
  form.layoutKey = 'qm-classic-centered'
  form.recommendWeight = 0
  form.previewImage = ''
  form.templateData = JSON.stringify(TEMPLATE_SPEC_MAP.classic, null, 2)
  form.status = 'active'
  formReadyForSubmit.value = true
  dialogVisible.value = true
}

// 编辑模板
const handleEdit = async (row: Template) => {
  if (editingTemplateId.value !== null || submitLoading.value) return

  editingTemplateId.value = row.id
  formReadyForSubmit.value = false

  try {
    const response = await getTemplateDetail(row.id)
    const templateDetail = response.data

    if (!templateDetail || templateDetail.id !== row.id) {
      throw new Error('服务端返回的模板详情与当前记录不匹配')
    }

    const templateData = requireNonEmptyTemplateData(templateDetail.templateData)
    const templateVariant = isTemplateVariant(templateDetail.templateVariant)
      ? templateDetail.templateVariant
      : resolveTemplateVariantFromData(templateData)
    const layoutKey = resolveTemplateLayoutKey(templateDetail.layoutKey, templateData, templateVariant)

    Object.assign(form, {
      id: templateDetail.id,
      templateName: templateDetail.templateName ?? '',
      description: templateDetail.description ?? row.description ?? '',
      industryTags: templateDetail.industryTags ?? row.industryTags ?? '',
      templateVariant,
      layoutKey,
      recommendWeight: templateDetail.recommendWeight ?? readRecommendWeight(templateData),
      previewImage: templateDetail.previewImage ?? row.previewImage ?? '',
      templateData: JSON.stringify(templateData, null, 2),
      status: (templateDetail.status ?? row.status) ? 'active' : 'inactive',
    })

    dialogTitle.value = '编辑模板'
    formReadyForSubmit.value = true
    dialogVisible.value = true
    await nextTick()
    formRef.value?.clearValidate()
  } catch (error) {
    console.error('加载模板详情失败:', error)
    ElMessage.error('模板详情加载失败，已阻止打开编辑表单')
  } finally {
    editingTemplateId.value = null
  }
}

// 当前预览的模板数据
const currentTemplateData = ref({})
// 生成的 HTML 内容
const generatedHtml = ref('')
const currentSpecJson = computed(() => JSON.stringify(TEMPLATE_SPEC_MAP[specVariant.value], null, 2))

function parseTemplateData(templateData: unknown): Record<string, any> {
  if (!templateData) {
    return {}
  }

  if (typeof templateData !== 'string') {
    return templateData as Record<string, any>
  }

  const candidates = [
    templateData,
    templateData
      .replace(/^\s+/, '')
      .replace(/\s+$/, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/g, ' ')
      .trim(),
  ]

  const firstBraceIndex = templateData.indexOf('{')
  if (firstBraceIndex > 0) {
    candidates.push(templateData.substring(firstBraceIndex))
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {
      // Try the next tolerant parsing strategy.
    }
  }

  throw new Error('模板 JSON 解析失败')
}

function requireNonEmptyTemplateData(templateData: unknown): Record<string, any> {
  const parsed = parseTemplateData(templateData)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed).length === 0) {
    throw new Error('模板 JSON 必须是非空对象')
  }
  return parsed
}

function validateTemplateData(
  _rule: unknown,
  value: unknown,
  callback: (error?: Error) => void,
) {
  try {
    requireNonEmptyTemplateData(value)
    callback()
  } catch (error) {
    callback(error instanceof Error ? error : new Error('模板 JSON 格式无效'))
  }
}

// 预览模板
const handlePreview = async (row: Template) => {
  try {
    const response = await getTemplateDetail(row.id)
    const templateDetail = response.data
    const templateDataObj = parseTemplateData(templateDetail.templateData)
    currentTemplateData.value = templateDataObj
    generatePreviewHtml(templateDataObj)
    previewVisible.value = true
  } catch (error) {
    ElMessage.error('获取模板详情失败，无法预览')
    console.error('获取模板详情失败:', error)
  }
}

// 生成预览 HTML
const generatePreviewHtml = (templateData: any) => {
  try {
    // 支持新旧两种模板数据结构
    let profile: any, sections, globalStyles, colors: { primary: string; text: string; secondary: string; background: string }, fonts, spacing: any;

    if (templateData?.profile && Array.isArray(templateData?.sections)) {
      // 新数据结构：profile + sections 数组
      profile = templateData.profile;
      sections = templateData.sections;
      globalStyles = templateData.globalStyles || {};
      colors = globalStyles.themeColor 
        ? { primary: globalStyles.themeColor, text: '#2c3e50', secondary: '#f0f8ff', background: '#ffffff' } 
        : { primary: '#3498db', text: '#2c3e50', secondary: '#f0f8ff', background: '#ffffff' };
      fonts = globalStyles.fontFamily ? { body: globalStyles.fontFamily } : { body: 'Arial, sans-serif' };
      spacing = globalStyles.paragraphSpacing ? { sectionMargin: globalStyles.paragraphSpacing, elementMargin: globalStyles.elementSpacing || '10px' } : { sectionMargin: '25px', elementMargin: '15px' };
    } else {
      // 旧数据结构：styles + sections 对象
      const styles = templateData?.styles || {};
      sections = templateData?.sections || {};
      colors = styles.colors || { primary: '#3498db', secondary: '#f0f8ff', text: '#2c3e50', background: '#ffffff' };
      fonts = styles.fonts || { heading: 'Montserrat, sans-serif', body: 'Open Sans, sans-serif' };
      spacing = styles.spacing || { sectionMargin: '25px', elementMargin: '15px' };
      
      // 模拟旧结构的profile数据
      profile = {
        basic: {
          name: '张三',
          title: '高级前端工程师',
          contacts: {
            email: 'zhangsan@example.com',
            phone: '13800138000',
            site: 'https://zhangsan.dev'
          }
        },
        summary: '拥有5年前端开发经验，专注 React 和 Vue，擅长构建高性能、可扩展的 Web 应用。',
        experience: [
          {
            company: 'ABC科技有限公司',
            role: '高级前端工程师',
            start: '2020-06',
            end: '至今',
            desc: '负责核心产品前端架构与开发，优化性能并推动关键项目交付。'
          },
          {
            company: 'XYZ互联网公司',
            role: '前端工程师',
            start: '2018-03',
            end: '2020-05',
            desc: '参与电商平台前端开发，完成响应式设计和可复用组件建设。'
          }
        ],
        education: [
          {
            school: '北京大学',
            degree: '计算机科学 硕士',
            start: '2015-09',
            end: '2018-06'
          },
          {
            school: '南京大学',
            degree: '软件工程 学士',
            start: '2011-09',
            end: '2015-06'
          }
        ],
        skills: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Webpack', 'CSS3', 'HTML5'],
        projects: [
          {
            name: '企业资源管理系统',
            role: '前端负责人',
            date: '2021-01 - 2021-06',
            desc: '设计并实现基于 React 的企业管理系统前端，包含数据可视化和实时通知能力。'
          },
          {
            name: '移动端电商平台',
            role: '前端开发',
            date: '2019-05 - 2019-12',
            desc: '使用 Vue 开发移动电商平台，完成购物车、支付流程和商品搜索等核心功能。'
          }
        ]
      };
    }

    // 从 profile 中提取数据
    const basic = profile?.basic || {};
    const contacts = basic.contacts || {};
    const summary = profile?.summary || '';
    const exps = Array.isArray(profile?.experience) ? profile.experience : [];
    const edus = Array.isArray(profile?.education) ? profile.education : [];
    const skills = Array.isArray(profile?.skills) ? profile.skills : [];
    const projects = Array.isArray(profile?.projects) ? profile.projects : [];
    
    // 澶勭悊鏂版暟鎹粨鏋勭殑sections数组
    let sectionsConfig: Record<string, any> = {};
    if (Array.isArray(sections)) {
      // 新结构：sections 是数组，转换为配置对象
      sections.forEach(section => {
        if (section.type && section.config) {
          sectionsConfig[section.type] = section.config;
        }
      });
    } else {
      // 旧结构：sections鏄璞?
      sectionsConfig = sections as Record<string, any>;
    }
    
    // 获取各部分配置
    const headerConfig = sectionsConfig.header || {};
    const summaryConfig = sectionsConfig.summary || {};
    const skillsConfig = sectionsConfig.skills || {};
    const experienceConfig = sectionsConfig.experience || {};
    const educationConfig = sectionsConfig.education || {};
    const projectsConfig = sectionsConfig.projects || {};

    // 生成头部样式
    const headerNameStyle = headerConfig.elements?.[0] ? 
      `font-size: ${headerConfig.elements[0].fontSize || '32px'}; 
       font-weight: ${headerConfig.elements[0].fontWeight || '700'}; 
       color: ${headerConfig.elements[0].color || colors.primary};` :
      `font-size: 32px; font-weight: 700; color: ${colors.primary};`;

    const headerTitleStyle = headerConfig.elements?.[1] ? 
      `font-size: ${headerConfig.elements[1].fontSize || '18px'}; 
       font-weight: ${headerConfig.elements[1].fontWeight || '400'}; 
       color: ${headerConfig.elements[1].color || colors.text};` :
      `font-size: 18px; font-weight: 400; color: ${colors.text};`;

    // 生成标题样式函数
    const getSectionTitleStyle = (sectionConfig: any) => {
      const titleStyle = sectionConfig.titleStyle || {};
      return `font-size: ${titleStyle.fontSize || '22px'}; 
              font-weight: ${titleStyle.fontWeight || '600'}; 
              color: ${titleStyle.color || colors.primary};
              border-bottom: ${titleStyle.borderBottom || `2px solid ${colors.primary}`};
              padding-bottom: 6px;
              margin-bottom: ${spacing.elementMargin || '15px'};`;
    };
    
    // 生成 HTML 内容
    let htmlContent = '';
    
    // 处理新数据结构：遍历 sections 数组，按 order 排序
    if (Array.isArray(sections)) {
      const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
      
      sortedSections.forEach(section => {
        if (section.visible === false) return; // 跳过隐藏模块
        
        const sectionStyle = section.style || {};
        const sectionConfig = section.config || {};
        
        // 根据模块类型生成内容
        switch (section.type) {
          case 'basic':
            if (profile?.basic) {
              const basic = profile.basic;
              const contacts = basic.contacts || {};
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '个人信息'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'};">
                    <div style="text-align: center; margin-bottom: 15px;">
                      <div style="font-size: 24px; font-weight: 600; color: ${colors.primary}; margin-bottom: 8px;">${basic.name || '姓名'}</div>
                      <div style="font-size: 18px; color: ${colors.text || '#333'}; margin-bottom: 8px;">${basic.title || '职位'}</div>
                    </div>
                    <div style="text-align: center; font-size: 14px; color: ${colors.text || '#333'}; opacity: 0.8;">
                      ${contacts.email || ''} ${contacts.phone ? '· ' + contacts.phone : ''} ${contacts.site ? '· ' + contacts.site : ''}
                    </div>
                  </div>
                </div>`;
              
              // 如果有 summary，也在 basic 模块中显示
              if (profile.summary) {
                htmlContent += `
                  <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                    <div style="${getSectionTitleStyle({ title: '个人概述' })}">个人概述</div>
                    <div style="padding: ${sectionStyle.padding || '0'}; font-size: 15px; line-height: 1.6; color: ${colors.text || '#333'};">
                      ${profile.summary}
                    </div>
                  </div>`;
              }
            }
            break;
            
          case 'skills':
            if (section.items && section.items.length > 0) {
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '技能特长'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}; text-align: center;">
                    ${section.items.map((skill: string) => `
                      <span style="display: inline-block; 
                                   background: ${sectionStyle.itemSeparator === 'dashed' ? '#f0f8ff' : '#e8f4fd'}; 
                                   color: ${colors.text || '#333'}; 
                                   padding: 8px 12px; 
                                   margin: 6px; 
                                   border-radius: 20px; 
                                   font-size: 14px;">
                        ${skill}
                      </span>
                    `).join('')}
                  </div>
                </div>`;
            }
            break;
            
          case 'intention':
            if (section.items && section.items.length > 0) {
              const intention = section.items[0]?.intention || '';
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '求职意向'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}; font-size: 15px; line-height: 1.6; color: ${colors.text || '#333'};">
                    ${intention}
                  </div>
                </div>`;
            }
            break;
            
          case 'education':
            if (section.items && section.items.length > 0) {
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '教育背景'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}">
                    ${section.items.map((edu: any) => `
                      <div style="margin: ${spacing.elementMargin || '15px'} 0;">
                        <div style="font-size: 18px; font-weight: 600; color: ${sectionStyle.titleColor || colors.primary};">
                          ${edu.school || '学校名称'}
                        </div>
                        <div style="font-size: 16px; color: ${colors.text || '#333'}; margin: 5px 0;">
                          ${edu.degree || '学位专业'}
                        </div>
                        <div style="font-size: 14px; color: ${colors.text || '#333'}; opacity: 0.7;">
                          ${edu.duration?.start || ''} - ${edu.duration?.end || ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>`;
            }
            break;
            
          case 'experience':
            if (section.items && section.items.length > 0) {
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '工作经验'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}">
                    ${section.items.map((exp: any) => `
                      <div style="margin: ${spacing.elementMargin || '15px'} 0;">
                        <div style="font-size: 18px; font-weight: 600; color: ${colors.text || '#333'};">
                          ${exp.company || '公司名称'}
                        </div>
                        <div style="font-size: 16px; color: ${colors.primary}; margin: 5px 0;">
                          ${exp.role || '职位'}
                        </div>
                        <div style="font-size: 14px; color: ${colors.text || '#333'}; opacity: 0.7; margin: 5px 0;">
                          ${exp.duration?.start || ''} - ${exp.duration?.end || ''}
                        </div>
                        <div style="font-size: 14px; line-height: 1.5; color: ${colors.text || '#333'}; margin-top: 8px;">
                          ${exp.desc?.html || exp.desc || ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>`;
            }
            break;
            
          case 'projects':
            if (section.items && section.items.length > 0) {
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '项目经验'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}">
                    ${section.items.map((proj: any) => `
                      <div style="margin: ${spacing.elementMargin || '15px'} 0;">
                        <div style="font-size: 18px; font-weight: 600; color: ${colors.text || '#333'};">
                          ${proj.name || '项目名称'}
                        </div>
                        <div style="font-size: 16px; color: ${colors.primary}; margin: 5px 0;">
                          ${proj.role || '项目角色'}
                        </div>
                        <div style="font-size: 14px; color: ${colors.text || '#333'}; opacity: 0.7; margin: 5px 0;">
                          ${proj.duration?.start || ''} - ${proj.duration?.end || ''}
                        </div>
                        <div style="font-size: 14px; line-height: 1.5; color: ${colors.text || '#333'}; margin-top: 8px;">
                          ${proj.desc?.html || proj.desc || ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>`;
            }
            break;
            
          case 'awards':
            if (section.items && section.items.length > 0) {
              // 检查是否配置了网格列数
              const gridCols = sectionConfig.gridTemplateColumns || 'repeat(2, 1fr)';
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '荣誉证书'}</div>
                  <div style="display: grid; grid-template-columns: ${gridCols}; gap: 15px; padding: ${sectionStyle.padding || '0'}">
                    ${section.items.map((award: any) => `
                      <div style="padding: 12px; border: 1px solid #e0e0e0; border-radius: 6px;">
                        <div style="font-size: 16px; font-weight: 600; color: ${colors.text || '#333'};">
                          ${award.name || '证书名称'}
                        </div>
                        <div style="font-size: 14px; color: ${colors.text || '#333'}; opacity: 0.7; margin: 5px 0;">
                          ${award.org || '颁发机构'}
                        </div>
                        <div style="font-size: 12px; color: ${colors.text || '#333'}; opacity: 0.5;">
                          ${award.date || '获得时间'}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>`;
            }
            break;
            
          case 'hobbies':
            if (section.items && section.items.length > 0) {
              const hobby = section.items[0]?.text || '';
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '兴趣爱好'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}; font-size: 15px; line-height: 1.6; color: ${colors.text || '#333'};">
                    ${hobby}
                  </div>
                </div>`;
            }
            break;
            
          case 'custom':
            if (section.items && section.items.length > 0) {
              const custom = section.items[0];
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${custom.title || sectionConfig.title || '自定义模块'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}; font-size: 15px; line-height: 1.6; color: ${colors.text || '#333'};">
                    ${custom.content || ''}
                  </div>
                </div>`;
            }
            break;
        }
      });
    }
    
    // 如果没有新数据结构，使用旧的 HTML 生成逻辑
    if (!htmlContent) {
      htmlContent = `
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
                ${e.company || '示例公司 A'}
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
      `;
    }
    
    // 判断是否使用网格布局：只有新数据结构且明确设置 gridColumn 的模块才使用
    const useGridLayout = Array.isArray(sections) && sections.some(section => section.style?.gridColumn);
    
    const html = `
  <div style="padding: 20px; font-family: ${fonts.body}; color: ${colors.text || '#333'}; background-color: ${colors.background || '#fff'};">
    <div style="background: ${colors.background || '#fff'}; padding: 30px; border-radius: 6px; max-width: 860px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); ${useGridLayout ? 'display: grid; grid-template-columns: 1fr 2fr; gap: 20px;' : ''}">
      ${htmlContent}
    </div>
  </div>`;

    generatedHtml.value = html;
  } catch (error) {
    console.error('生成预览 HTML 失败:', error);
    // 生成失败时使用默认模板。
    const defaultHtml = `<div style="padding: 20px; text-align: center; background-color: #1e1e20; color: #E5EAF3;">
      <h2 style="color: #F56C6C;">模板数据解析失败</h2>
      <p>无法根据提供的模板数据生成预览，请检查模板数据格式是否正确。</p>
      <pre style="text-align: left; background: #2b2b2b; padding: 10px; border-radius: 5px; color: #E5EAF3;">${JSON.stringify(error, null, 2)}</pre>
    </div>`;
    generatedHtml.value = defaultHtml;
  }
}

// 显示预览图
const showPreviewImage = (row: Template) => {
  if (row.previewImage) {
    currentPreviewImage.value = row.previewImage
    imagePreviewVisible.value = true
  }
}

// 切换状态
const handleToggleStatus = async (row: Template) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status ? '禁用' : '启用'}该模板吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await updateTemplate(row.id, { status: !row.status })
    ElMessage.success('操作成功')
    refresh()
  } catch {
    // 用户取消
  }
}

// 删除模板
const handleDelete = async (row: Template) => {
  try {
    await ElMessageBox.confirm('确定要删除该模板吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteTemplate(row.id)
    ElMessage.success('删除成功')
    refresh()
  } catch {
    // 用户取消
  }
}

// 图片上传处理
const handleImageChange = (file: UploadFile) => {
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.previewImage = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

const openTemplateSpecDialog = () => {
  specVariant.value = form.templateVariant
  specDialogVisible.value = true
}

const applyTemplateSpec = (variant: TemplateVariant) => {
  form.templateVariant = variant
  form.layoutKey = DEFAULT_LAYOUT_BY_VARIANT[variant]
  form.recommendWeight = readRecommendWeight(TEMPLATE_SPEC_MAP[variant])
  form.templateData = JSON.stringify(TEMPLATE_SPEC_MAP[variant], null, 2)
  ElMessage.success('已将示例模板 JSON 写入编辑表单')
}

const copyCurrentSpec = async () => {
  try {
    await navigator.clipboard.writeText(currentSpecJson.value)
    ElMessage.success('模板规范示例已复制')
  } catch (error) {
    console.error('复制模板规范失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value || submitLoading.value) return
  if (!formReadyForSubmit.value) {
    ElMessage.error('模板详情尚未完整加载，已阻止提交')
    return
  }

  submitLoading.value = true

  try {
    await formRef.value.validate()
    const normalizedTemplateData = normalizeTemplateDataWithVariant(form.templateData, form.templateVariant, form.layoutKey)

    const data = {
      templateName: form.templateName,
      description: form.description,
      industryTags: sanitizeIndustryTags(form.industryTags),
      templateVariant: form.templateVariant,
      recommendWeight: Math.max(0, Number(form.recommendWeight) || 0),
      templateData: JSON.stringify(normalizedTemplateData, null, 2),
      previewImage: form.previewImage,
      status: form.status === 'active'
    }

    if (form.id === 0) {
      await createTemplate(data)
      ElMessage.success('新增成功')
    } else {
      await updateTemplate(form.id, data)
      ElMessage.success('编辑成功')
    }
    
    dialogVisible.value = false
    refresh()
  } catch (error) {
    console.error('模板提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 瀵硅瘽妗嗗叧闂?
const handleDialogClose = () => {
  formReadyForSubmit.value = false
  formRef.value?.resetFields()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.limit = size
  getData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getData()
}

// 处理搜索参数
const getSearchParams = () => {
  const params: Record<string, any> = {}
  
  if (searchForm.templateName) {
    params.templateName = searchForm.templateName
  }
  
  if (searchForm.description) {
    params.description = searchForm.description
  }
  
  if (searchForm.status !== null) {
    params.status = searchForm.status
  }

  if (searchForm.industryTags.trim()) {
    params.industryTags = sanitizeIndustryTags(searchForm.industryTags)
  }

  if (searchForm.templateVariant) {
    params.templateVariant = searchForm.templateVariant
  }
  
  return params
}

// 重置搜索表单
const resetSearchForm = () => {
  searchForm.templateName = ''
  searchForm.description = ''
  searchForm.status = null
  searchForm.industryTags = ''
  searchForm.templateVariant = ''
  handleReset()
}

function sanitizeIndustryTags(value: string) {
  return value
    .replace(/，/g, ',')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(',')
}

function splitIndustryTags(value?: string) {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function normalizeTemplateDataWithVariant(
  templateData: string,
  templateVariant: TemplateVariant,
  layoutKey: TemplateLayoutKey,
) {
  const parsed = requireNonEmptyTemplateData(templateData)
  const recommendWeight = Math.max(0, Number(form.recommendWeight) || 0)
  const avatar = { ...TEMPLATE_AVATAR_PRESETS[layoutKey] }
  parsed.variant = templateVariant
  parsed.layoutKey = layoutKey
  parsed.recommendWeight = recommendWeight
  parsed.meta = {
    ...(typeof parsed.meta === 'object' && parsed.meta ? parsed.meta : {}),
    recommendWeight,
  }
  parsed.layout = {
    ...(typeof parsed.layout === 'object' && parsed.layout ? parsed.layout : {}),
    key: layoutKey,
    variant: templateVariant,
    avatar,
  }
  parsed.profile = {
    ...(typeof parsed.profile === 'object' && parsed.profile ? parsed.profile : {}),
    avatar,
  }
  parsed.theme = {
    ...(typeof parsed.theme === 'object' && parsed.theme ? parsed.theme : {}),
    variant: templateVariant,
  }
  return parsed
}

function safeParseTemplateData(templateData: string) {
  if (!templateData.trim()) {
    return {}
  }

  try {
    const parsed = JSON.parse(templateData)
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

function readTemplateVariant(templateData: unknown): TemplateVariant {
  const parsed = typeof templateData === 'string' ? safeParseTemplateData(templateData) : templateData
  const variant = [
    (parsed as any)?.layout?.variant,
    (parsed as any)?.theme?.variant,
    (parsed as any)?.variant,
  ].find(isTemplateVariant)

  if (isTemplateVariant(variant)) {
    return variant
  }

  return 'classic'
}

function isTemplateVariant(value: unknown): value is TemplateVariant {
  return (
    value === 'classic' ||
    value === 'sidebar' ||
    value === 'timeline' ||
    value === 'spotlight' ||
    value === 'ats' ||
    value === 'executive' ||
    value === 'compact' ||
    value === 'editorial'
  )
}

function getTemplateVariantLabel(value: unknown) {
  const labels: Record<TemplateVariant, string> = {
    classic: '经典单栏',
    sidebar: '侧栏双栏',
    timeline: '时间轴版',
    spotlight: '聚焦封面',
    ats: 'ATS 极简',
    executive: '高管黑金',
    compact: '紧凑信息流',
    editorial: '编辑创意',
  }
  return isTemplateVariant(value) ? labels[value] : labels.classic
}

function readRecommendWeight(templateData: unknown) {
  const parsed = typeof templateData === 'string' ? safeParseTemplateData(templateData) : templateData
  const candidate = [
    (parsed as any)?.meta?.recommendWeight,
    (parsed as any)?.recommendWeight,
  ].find((value) => value !== undefined && value !== null)

  const value = Number(candidate)
  if (!Number.isFinite(value) || value < 0) {
    return 0
  }

  return Math.floor(value)
}

onMounted(() => {
  handleSearch(getSearchParams())
})
</script>

<style scoped>
.template-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-image {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-image {
  margin-top: 10px;
}

.asset-tools {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.spec-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preview-content {
  min-height: 400px;
}

.spec-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.spec-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.spec-toolbar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.help-link {
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: help;
}

.layout-contract-tip {
  width: 100%;
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.preview-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  border-radius: 4px;
}

.template-preview {
  padding: 10px;
}

.template-data-card {
  margin-top: 10px;
  margin-bottom: 20px;
}

.template-data-card pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 10px;
  background-color: var(--el-fill-color);
  border-radius: 4px;
  max-height: 600px;
  overflow-y: auto;
}

.iframe-container {
  width: 100%;
  padding: 10px 0;
}

.preview-iframe {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background-color: var(--el-bg-color);
}

.image-preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.action-btns {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}
</style> 
