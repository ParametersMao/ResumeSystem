<template>
  <div class="core-editor-page" :class="{ 'style-panel-is-collapsed': stylePanelCollapsed }">
    <aside class="editor-panel">
      <div class="panel-header">
        <div>
          <h2>模块化编辑区</h2>
        </div>
      </div>

      <section class="editor-card">
        <div class="card-title-row">
          <div class="title-with-help">
            <h3>模块管理</h3>
            <el-tooltip content="模块不会被删除，只会隐藏；后续可以随时恢复显示。" placement="top">
              <span class="help-dot">?</span>
            </el-tooltip>
          </div>
          <span class="card-badge">{{ visibleSectionsCount }} 个模块显示中</span>
        </div>
        <div class="module-chips">
          <el-button
            v-for="definition in CORE_SECTION_DEFINITIONS"
            :key="definition.type"
            size="small"
            :type="hiddenSections.some((section) => section.type === definition.type) ? 'primary' : 'default'"
            plain
            @click="toggleSectionVisibility(definition.type)"
          >
            {{ hiddenSections.some((section) => section.type === definition.type) ? `显示${definition.title}` : `隐藏${definition.title}` }}
          </el-button>
        </div>
      </section>

      <section class="editor-card">
        <div class="card-title-row">
          <h3>个人信息</h3>
          <span class="card-badge">固定模块</span>
        </div>
        <div class="field-grid">
          <label class="field-block">
            <span>姓名</span>
            <el-input v-model="documentState.profile.name" placeholder="请输入姓名" />
          </label>
          <label class="field-block">
            <span>目标职位</span>
            <el-input v-model="documentState.profile.title" placeholder="请输入职位" />
          </label>
          <label class="field-block">
            <span>电话</span>
            <el-input v-model="documentState.profile.phone" placeholder="请输入电话" />
          </label>
          <label class="field-block">
            <span>邮箱</span>
            <el-input v-model="documentState.profile.email" placeholder="请输入邮箱" />
          </label>
          <label class="field-block">
            <span>性别</span>
            <el-input v-model="documentState.profile.gender" placeholder="可选" />
          </label>
          <label class="field-block">
            <span>年龄</span>
            <el-input v-model="documentState.profile.age" placeholder="可选" />
          </label>
          <label class="field-block">
            <span>工作年限</span>
            <el-input v-model="documentState.profile.yearsOfExperience" placeholder="例如：3年" />
          </label>
          <label class="field-block">
            <span>个人主页</span>
            <el-input v-model="documentState.profile.site" placeholder="可选" />
          </label>
        </div>
      </section>

      <section
        v-for="(section, sectionIndex) in documentState.sections"
        :key="section.id"
        class="editor-card"
      >
        <div class="card-title-row">
          <div class="section-title-group">
            <el-input
              :model-value="section.title"
              size="small"
              @update:model-value="updateSectionTitle(section, $event)"
            />
            <el-switch v-model="section.visible" inline-prompt active-text="显示" inactive-text="隐藏" />
          </div>
          <div class="section-actions">
            <el-button text size="small" @click="hideSection(section)" :disabled="!section.visible || visibleSectionsCount <= 1">隐藏</el-button>
            <el-button text size="small" @click="showSection(section)" :disabled="section.visible">恢复</el-button>
            <el-button text size="small" @click="resetSection(section)">重置</el-button>
            <el-button text size="small" @click="moveSection(sectionIndex, -1)" :disabled="sectionIndex === 0">上移</el-button>
            <el-button
              text
              size="small"
              @click="moveSection(sectionIndex, 1)"
              :disabled="sectionIndex === documentState.sections.length - 1"
            >
              下移
            </el-button>
            <el-button text size="small" @click="toggleCollapse(section.id)">
              {{ collapsedSections.has(section.id) ? '展开' : '收起' }}
            </el-button>
          </div>
        </div>

        <div v-show="section.visible && !collapsedSections.has(section.id)" class="section-body">
          <div
            v-for="(item, itemIndex) in section.items"
            :key="`${section.id}-${itemIndex}`"
            class="item-editor"
          >
            <div class="item-editor-toolbar">
              <strong>{{ section.title }} {{ itemIndex + 1 }}</strong>
              <div class="item-editor-actions">
                <el-button
                  v-if="canAiPolishSection(section)"
                  text
                  type="primary"
                  size="small"
                  @click="openAiPolish(section, itemIndex)"
                >
                  {{ getAiEntryLabel(section, itemIndex) }}
                </el-button>
                <el-button
                  v-if="canMoveItem(section)"
                  text
                  size="small"
                  @click="moveItem(section, itemIndex, -1)"
                  :disabled="itemIndex === 0"
                >
                  上移
                </el-button>
                <el-button
                  v-if="canMoveItem(section)"
                  text
                  size="small"
                  @click="moveItem(section, itemIndex, 1)"
                  :disabled="itemIndex === section.items.length - 1"
                >
                  下移
                </el-button>
                <el-button
                  v-if="canRemoveItem(section)"
                  text
                  type="danger"
                  size="small"
                  @click="removeItem(section, itemIndex)"
                >
                  删除
                </el-button>
              </div>
            </div>

            <div class="field-grid">
              <template v-for="field in getSectionDefinition(section.type).fields" :key="field.key">
                <label v-if="field.type === 'text'" class="field-block">
                  <span>{{ field.label }}</span>
                  <el-input
                    :model-value="readTextValue(item, field.key)"
                    :placeholder="field.placeholder || `请输入${field.label}`"
                    @update:model-value="writeTextValue(item, field.key, $event)"
                  />
                </label>

                <label v-else-if="field.type === 'textarea'" class="field-block field-block-full">
                  <span>{{ field.label }}</span>
                  <el-input
                    :model-value="readTextValue(item, field.key)"
                    type="textarea"
                    :rows="4"
                    :placeholder="field.placeholder || `请输入${field.label}`"
                    @update:model-value="writeTextValue(item, field.key, $event)"
                  />
                </label>

                <div v-else class="field-block field-block-full">
                  <span>{{ field.label }}</span>
                  <div class="date-range-row">
                    <el-input
                      :model-value="readRangeValue(item, field.key, 'start')"
                      placeholder="开始时间，例如 2022-01"
                      @update:model-value="writeRangeValue(item, field.key, 'start', $event)"
                    />
                    <span class="date-range-sep">-</span>
                    <el-input
                      :model-value="readRangeValue(item, field.key, 'end')"
                      placeholder="结束时间，例如 2024-06 / 至今"
                      @update:model-value="writeRangeValue(item, field.key, 'end', $event)"
                    />
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="section-footer">
            <el-button
              v-if="getSectionDefinition(section.type).allowMultiple"
              size="small"
              @click="addItem(section)"
            >
              新增{{ section.title }}
            </el-button>
          </div>
        </div>
      </section>

      <section v-if="hiddenSections.length" class="editor-card hidden-card">
        <div class="card-title-row">
          <h3>已隐藏模块</h3>
          <span class="card-badge">{{ hiddenSections.length }} 个</span>
        </div>
        <div class="hidden-sections">
          <div v-for="section in hiddenSections" :key="section.id" class="hidden-section-item">
            <span>{{ section.title }}</span>
            <el-button size="small" @click="showSection(section)">恢复显示</el-button>
          </div>
        </div>
      </section>
    </aside>

    <main class="preview-panel">
      <div class="preview-toolbar">
        <div>
          <h2>{{ documentState.templateName || '默认模板' }}</h2>
          <div class="template-meta-row">
            <span class="card-badge">{{ activeTemplatePreset.label }}</span>
            <el-tooltip v-if="activeTemplatePreset.description" :content="activeTemplatePreset.description" placement="bottom">
              <span class="help-link">模板说明</span>
            </el-tooltip>
          </div>
          <p>{{ saveStatusText }}</p>
        </div>
        <div class="toolbar-actions">
          <el-button @click="createManualVersion" :loading="creatingVersion">保存为版本</el-button>
          <el-button @click="openVersionDrawer" :disabled="!currentResume">版本记录</el-button>
          <el-button @click="openTemplateCenter">更换模板</el-button>
          <el-button @click="saveResume" :loading="saveStatus === 'saving'">保存</el-button>
          <el-button type="primary" @click="exportPdf" :loading="exportingPdf">导出为 PDF</el-button>
        </div>
      </div>

      <div class="preview-stage">
        <CoreResumePreview ref="previewRef" :document="documentState" />
      </div>
    </main>

    <aside class="style-panel" :class="{ collapsed: stylePanelCollapsed }">
      <div class="style-header">
        <div>
          <div class="title-with-help">
            <h3>侧边样式参数</h3>
            <el-tooltip content="这里仅保留影响预览观感的关键样式项，复杂模板样式仍以模板本身为准。" placement="left">
              <span class="help-dot">?</span>
            </el-tooltip>
          </div>
        </div>
        <el-button text @click="stylePanelCollapsed = !stylePanelCollapsed">
          {{ stylePanelCollapsed ? '展开' : '收起' }}
        </el-button>
      </div>

      <div v-show="!stylePanelCollapsed" class="style-body">
        <div class="style-actions">
          <span class="style-state">{{ hasThemeOverrides ? '已应用手动微调' : '当前使用模板默认样式' }}</span>
          <el-button size="small" @click="resetThemeOverrides" :disabled="!hasThemeOverrides">恢复模板默认</el-button>
        </div>
        <label class="field-block">
          <span>主题颜色</span>
          <input :value="documentState.theme.primaryColor" class="native-color" type="color" @input="updateThemeValue('primaryColor', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="field-block">
          <span>正文字体</span>
          <el-select :model-value="documentState.theme.fontFamily" @update:model-value="updateThemeValue('fontFamily', $event)">
            <el-option label="微软雅黑" value="'Microsoft YaHei', 'PingFang SC', sans-serif" />
            <el-option label="思源黑体" value="'Source Han Sans SC', 'Microsoft YaHei', sans-serif" />
            <el-option label="苹方" value="'PingFang SC', 'Microsoft YaHei', sans-serif" />
          </el-select>
        </label>
        <label class="field-block">
          <span>标题字体</span>
          <el-select :model-value="documentState.theme.headingFontFamily" @update:model-value="updateThemeValue('headingFontFamily', $event)">
            <el-option label="微软雅黑" value="'Microsoft YaHei', 'PingFang SC', sans-serif" />
            <el-option label="思源黑体" value="'Source Han Sans SC', 'Microsoft YaHei', sans-serif" />
            <el-option label="苹方" value="'PingFang SC', 'Microsoft YaHei', sans-serif" />
          </el-select>
        </label>
        <label class="field-block">
          <span>模块间距</span>
          <el-input-number :model-value="documentState.theme.sectionSpacing" :min="12" :max="40" @update:model-value="updateThemeValue('sectionSpacing', $event)" />
        </label>
        <label class="field-block">
          <span>条目间距</span>
          <el-input-number :model-value="documentState.theme.itemSpacing" :min="8" :max="30" @update:model-value="updateThemeValue('itemSpacing', $event)" />
        </label>
        <label class="field-block">
          <span>字号</span>
          <el-input-number :model-value="documentState.theme.fontSize" :min="12" :max="18" @update:model-value="updateThemeValue('fontSize', $event)" />
        </label>
        <label class="field-block">
          <span>行高</span>
          <el-input-number :model-value="documentState.theme.lineHeight" :min="1.4" :max="2" :step="0.1" @update:model-value="updateThemeValue('lineHeight', $event)" />
        </label>
      </div>
    </aside>

    <el-dialog
      v-model="aiDialogVisible"
      :title="aiDialogTitle"
      width="860px"
      destroy-on-close
    >
      <div class="ai-dialog">
        <div class="ai-dialog-header">
          <div>
            <strong>{{ aiDialogState.sectionTitle || '当前模块' }}</strong>
            <span class="ai-dialog-subtitle">{{ aiDialogSubtitle }}</span>
          </div>
          <div class="ai-dialog-actions">
            <el-button size="small" @click="rerunAiPolish" :loading="aiLoading">重新生成</el-button>
            <el-popover placement="bottom-end" width="420px" trigger="click">
              <template #reference>
                <el-button size="small">运行详情</el-button>
              </template>
              <div class="ai-runtime-popover">
                <div class="ai-runtime-meta">
                  <span v-if="aiProvider" class="card-badge">{{ aiProvider }}</span>
                  <span v-if="aiModel" class="card-badge ai-runtime-badge">{{ aiModel }}</span>
                  <span v-if="aiExecutionMode" class="card-badge ai-runtime-badge">{{ aiExecutionModeLabel }}</span>
                  <span v-if="aiTokenUsed" class="card-badge">消耗 {{ aiTokenUsed }} tokens</span>
                </div>
                <div class="ai-runtime-tip">{{ aiExecutionTip }}</div>
                <div v-if="aiPromptPreview" class="ai-prompt-preview">
                  <span class="ai-label">Prompt 预览</span>
                  <div class="ai-text-block compact">{{ aiPromptPreview }}</div>
                </div>
              </div>
            </el-popover>
          </div>
        </div>

        <div class="ai-target-row">
          <span>目标岗位</span>
          <el-input
            v-model="aiTargetJobTitle"
            size="small"
            placeholder="例如：前端工程师 / 产品经理"
            clearable
            @keyup.enter="rerunAiPolish"
          />
        </div>

        <div class="ai-mode-tip">
          <span class="ai-mode-tag">{{ aiModeTag }}</span>
          <p>{{ aiModeTip }}</p>
        </div>

        <div v-loading="aiLoading" class="ai-suggestion-list">
          <el-empty v-if="!aiLoading && !aiSuggestions.length" description="暂无可用建议" />
          <div
            v-for="(suggestion, suggestionIndex) in aiSuggestions"
            :key="`${suggestionIndex}-${suggestion.reason}`"
            class="ai-suggestion-card"
          >
            <div class="ai-suggestion-head">
              <button
                class="ai-suggestion-selector"
                type="button"
                :class="{ active: selectedAiSuggestionIndex === suggestionIndex }"
                @click="selectedAiSuggestionIndex = suggestionIndex"
              >
                方案 {{ suggestionIndex + 1 }}
              </button>
              <span>{{ suggestion.reason }}</span>
            </div>
            <div class="ai-comparison-grid">
              <div class="ai-compare-pane original">
                <span class="ai-label">{{ aiSourceLabel }}</span>
                <div class="ai-text-block">{{ aiDialogState.originalText || aiEmptySourceText }}</div>
              </div>
              <div class="ai-compare-pane polished">
                <span class="ai-label">{{ aiResultLabel }}</span>
                <div class="ai-text-block">{{ suggestion.text }}</div>
              </div>
            </div>
            <div class="ai-suggestion-actions">
              <el-button
                type="primary"
                size="small"
                @click="applyAiSuggestion(suggestion)"
                :loading="aiApplying"
              >
                {{ getAiApplyLabel(suggestion) }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-drawer
      v-model="versionDrawerVisible"
      title="版本记录"
      size="420px"
      destroy-on-close
    >
      <div class="version-drawer">
        <div class="version-drawer-header">
          <el-tooltip content="版本会保存当前简历内容，后续可从版本记录中回滚。" placement="bottom">
            <span class="help-link">版本说明</span>
          </el-tooltip>
          <el-button
            size="small"
            type="primary"
            @click="createManualVersion"
            :loading="creatingVersion"
            :disabled="!currentResume"
          >
            保存为版本
          </el-button>
        </div>

        <div v-loading="versionsLoading" class="version-list">
          <el-empty v-if="!versionsLoading && !versionRecords.length" description="暂无历史版本" />
          <div
            v-for="version in versionRecords"
            :key="version.id"
            class="version-item"
          >
            <div class="version-item-header">
              <div>
                <strong>v{{ version.sourceVersion }}</strong>
                <span class="version-source">{{ getVersionSourceLabel(version.sourceType) }}</span>
                <span class="version-current" v-if="currentResume && version.sourceVersion === currentResume.version - 1">
                  上一版
                </span>
              </div>
              <span class="version-time">{{ formatVersionTime(version.createTime) }}</span>
            </div>
            <div class="version-item-summary">
              <p class="version-summary-title">{{ version.summaryTitle }}</p>
              <p v-if="version.remark" class="version-summary-remark">{{ version.remark }}</p>
              <p class="version-summary-meta">{{ version.summaryMeta }}</p>
            </div>
            <div class="version-item-actions">
              <el-button
                size="small"
                text
                type="primary"
                @click="openVersionCompare(version)"
              >
                对比当前稿
              </el-button>
              <el-button
                size="small"
                @click="rollbackToVersion(version.id)"
                :loading="rollingBackVersionId === version.id"
              >
                回滚到该版本
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <el-dialog
      v-model="versionCompareVisible"
      title="版本对比"
      width="880px"
      destroy-on-close
    >
      <div v-if="versionCompareTarget && versionCompareData" class="version-compare-dialog">
        <div class="version-compare-header">
          <div class="version-compare-hero">
            <span class="version-compare-tag">当前内容</span>
            <strong>{{ currentVersionSummary.title }}</strong>
            <p>{{ currentVersionSummary.meta }}</p>
            <span v-if="hasUnsavedChanges" class="version-compare-draft-tip">包含未保存修改</span>
          </div>
          <div class="version-compare-hero">
            <span class="version-compare-tag">对比版本</span>
            <strong>v{{ versionCompareTarget.sourceVersion }} · {{ getVersionSourceLabel(versionCompareTarget.sourceType) }}</strong>
            <p>{{ versionCompareTarget.summaryTitle }}</p>
            <span class="version-compare-time">{{ formatVersionTime(versionCompareTarget.createTime) }}</span>
          </div>
        </div>

        <div class="version-compare-stats">
          <div class="version-compare-stat">
            <span>个人信息差异</span>
            <strong>{{ versionCompareData.profileDiffs.length }}</strong>
          </div>
          <div class="version-compare-stat">
            <span>模块差异</span>
            <strong>{{ versionCompareData.sectionDiffs.length }}</strong>
          </div>
          <div class="version-compare-stat">
            <span>当前已填模块</span>
            <strong>{{ versionCompareData.currentFilledSections }}</strong>
          </div>
          <div class="version-compare-stat">
            <span>历史版本已填模块</span>
            <strong>{{ versionCompareData.targetFilledSections }}</strong>
          </div>
        </div>

        <div class="version-compare-block">
          <div class="version-compare-block-header">
            <h4>个人信息</h4>
            <span>{{ versionCompareData.profileDiffs.length ? '只展示发生变化的字段' : '当前稿与该版本一致' }}</span>
          </div>
          <el-empty
            v-if="!versionCompareData.profileDiffs.length"
            description="个人信息没有变化"
          />
          <div v-else class="version-compare-grid">
            <div
              v-for="diff in versionCompareData.profileDiffs"
              :key="`profile-${diff.key}`"
              class="version-compare-card"
            >
              <div class="version-compare-card-header">
                <strong>{{ diff.label }}</strong>
                <span class="version-diff-badge changed">已变更</span>
              </div>
              <div class="version-compare-columns">
                <div>
                  <span class="version-compare-column-label">当前</span>
                  <p>{{ diff.currentValue }}</p>
                </div>
                <div>
                  <span class="version-compare-column-label">v{{ versionCompareTarget.sourceVersion }}</span>
                  <p>{{ diff.targetValue }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="version-compare-block">
          <div class="version-compare-block-header">
            <h4>模块内容</h4>
            <span>{{ versionCompareData.sectionDiffs.length ? '优先展示显示状态、条目数量和内容摘要差异' : '模块内容一致' }}</span>
          </div>
          <el-empty
            v-if="!versionCompareData.sectionDiffs.length"
            description="模块内容没有变化"
          />
          <div v-else class="version-compare-section-list">
            <div
              v-for="diff in versionCompareData.sectionDiffs"
              :key="diff.key"
              class="version-compare-section"
            >
              <div class="version-compare-card-header">
                <div class="version-compare-section-title">
                  <strong>{{ diff.title }}</strong>
                  <span class="version-compare-section-summary">{{ diff.summary }}</span>
                </div>
                <span class="version-diff-badge" :class="diff.changeType">
                  {{ getVersionDiffLabel(diff.changeType) }}
                </span>
              </div>
              <div class="version-compare-columns">
                <div>
                  <span class="version-compare-column-label">当前</span>
                  <p>{{ diff.currentValue }}</p>
                </div>
                <div>
                  <span class="version-compare-column-label">v{{ versionCompareTarget.sourceVersion }}</span>
                  <p>{{ diff.targetValue }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CoreResumePreview from '@/components/core-resume/CoreResumePreview.vue'
import {
  buildResumeTitle,
  CoreDateRange,
  CoreResumeDocument,
  CoreResumeItem,
  CoreResumeSection,
  CoreSectionType,
  CoreResumeTheme,
  CORE_SECTION_DEFINITIONS,
  createEmptyDocument,
  createSectionItem,
  ensureAllSections,
  extractThemeFromTemplate,
  getSectionDefinition,
  mergeResumeTheme,
  parseResumeContent,
} from '@/core-resume/model'
import { buildCoreResumePrintHtml } from '@/core-resume/print'
import { resolveTemplatePreset, resolveTemplateVariant } from '@/core-resume/templates'
import {
  createResume,
  createResumeVersionSnapshot,
  exportResumePdfByHtml,
  getResume,
  listResumeVersions,
  rollbackResumeVersion,
  updateResume,
} from '@/api/resume'
import { getTemplateDetail } from '@/api/template'
import { aiGenerate, aiPolish, type AiGenerateResponse, type PolishSuggestion } from '@/api/ai'
import { useUserStore } from '@/store/user'

interface ResumeRecord {
  id: number
  title: string
  version: number
  templateId?: number
}

interface ResumeVersionRecord {
  id: number
  resumeId: number
  userId?: number
  sourceVersion: number
  sourceType?: string
  remark?: string
  createTime: string
  content?: string
  summaryTitle: string
  summaryMeta: string
}

interface VersionCompareField {
  key: string
  label: string
  currentValue: string
  targetValue: string
}

interface VersionCompareSection {
  key: string
  title: string
  summary: string
  currentValue: string
  targetValue: string
  changeType: 'changed' | 'added' | 'removed'
}

interface VersionComparePayload {
  profileDiffs: VersionCompareField[]
  sectionDiffs: VersionCompareSection[]
  currentFilledSections: number
  targetFilledSections: number
}

interface AiSuggestionOption {
  reason: string
  text: string
  fieldValues?: Record<string, string | CoreDateRange>
}

interface AiDialogState {
  sectionId: string
  itemIndex: number
  fieldKey: string
  sectionType: CoreSectionType | ''
  sectionTitle: string
  originalText: string
  actionType: 'polish' | 'generate'
}

const AI_POLISH_FIELD_MAP: Partial<Record<CoreSectionType, string>> = {
  intention: 'intention',
  education: 'desc',
  summary: 'text',
  experience: 'desc',
  projects: 'desc',
  internship: 'desc',
  campus: 'desc',
  skills: 'name',
  awards: 'name',
  hobbies: 'text',
  custom: 'text',
}

type VariantAwareDocument = CoreResumeDocument & { templateVariant?: string }

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const previewRef = ref<InstanceType<typeof CoreResumePreview> | null>(null)
const documentState = ref<CoreResumeDocument>(createEmptyDocument())
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const exportingPdf = ref(false)
const creatingVersion = ref(false)
const stylePanelCollapsed = ref(false)
const collapsedSections = ref<Set<string>>(new Set())
const currentResume = ref<ResumeRecord | null>(null)
const versionDrawerVisible = ref(false)
const versionsLoading = ref(false)
const versionRecords = ref<ResumeVersionRecord[]>([])
const rollingBackVersionId = ref<number | null>(null)
const versionCompareVisible = ref(false)
const versionCompareTarget = ref<ResumeVersionRecord | null>(null)
const versionCompareData = ref<VersionComparePayload | null>(null)
const aiDialogVisible = ref(false)
const aiLoading = ref(false)
const aiApplying = ref(false)
const aiSuggestions = ref<AiSuggestionOption[]>([])
const selectedAiSuggestionIndex = ref(0)
const aiTokenUsed = ref(0)
const aiProvider = ref('')
const aiModel = ref('')
const aiExecutionMode = ref<'' | 'mock' | 'prepared' | 'live'>('')
const aiPromptPreview = ref('')
const aiTargetJobTitle = ref('')
const aiDialogState = ref<AiDialogState>({
  sectionId: '',
  itemIndex: 0,
  fieldKey: '',
  sectionType: '',
  sectionTitle: '',
  originalText: '',
  actionType: 'polish',
})
const saveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const isBootstrapping = ref(true)
const isApplyingDraft = ref(false)
const lastSavedSnapshot = ref('')

const templateId = computed(() => String(route.query.templateId || ''))
const resumeId = computed(() => String(route.query.resumeId || route.params.resumeId || ''))
const draftStorageKey = computed(() => `core-resume:draft:${resumeId.value || `template:${templateId.value || 'default'}`}`)
const panelStorageKey = computed(() => `core-resume:panel:${templateId.value || 'default'}`)
const hiddenSections = computed(() => documentState.value.sections.filter((section) => !section.visible))
const visibleSectionsCount = computed(() => documentState.value.sections.filter((section) => section.visible).length)
const hasUnsavedChanges = computed(() => serializeDocument() !== lastSavedSnapshot.value)
const currentVersionSummary = computed(() => summarizeVersionContent(serializeDocument()))
const activeTemplatePreset = computed(() => resolveTemplatePreset(documentState.value))
const hasThemeOverrides = computed(() => Object.keys(documentState.value.themeOverrides || {}).length > 0)
const aiDialogTitle = computed(() => (aiDialogState.value.actionType === 'generate' ? 'AI补全建议' : 'AI润色建议'))
const aiDialogSubtitle = computed(() =>
  aiDialogState.value.actionType === 'generate'
    ? '当前模块信息不完整，AI 会基于岗位和已填关键词补全一条可继续编辑的初稿。'
    : '选择一个方案应用，系统会自动保留润色前快照。',
)
const aiModeTag = computed(() => (aiDialogState.value.actionType === 'generate' ? '补全模式' : '润色模式'))
const aiModeTip = computed(() =>
  aiDialogState.value.actionType === 'generate'
    ? '适合空白模块或只填了少量关键词的场景，系统会尽量保留你已写的信息，只补全缺失内容。'
    : '适合你已经写出初稿的场景，系统会在保留原意的基础上把表达改得更像可投递简历。',
)
const aiSourceLabel = computed(() => (aiDialogState.value.actionType === 'generate' ? '已填信息' : '原文'))
const aiResultLabel = computed(() => (aiDialogState.value.actionType === 'generate' ? 'AI补全结果' : '润色后'))
const aiEmptySourceText = computed(() => (aiDialogState.value.actionType === 'generate' ? '当前还没有可参考内容' : '暂无内容'))
const aiExecutionModeLabel = computed(() => {
  switch (aiExecutionMode.value) {
    case 'mock':
      return 'Mock 模式'
    case 'live':
      return 'Live 模式'
    case 'prepared':
      return 'Prepared 模式'
    default:
      return '未运行'
  }
})
const aiExecutionTip = computed(() => {
  switch (aiExecutionMode.value) {
    case 'live':
      return '当前请求已经走真实外部 provider。'
    case 'prepared':
      return '当前已切到可接外部 API 的准备模式。'
    case 'mock':
      return '当前仍是 mock 联调模式。'
    default:
      return '点击 AI 润色后会显示本次运行信息。'
  }
})

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saving':
      return '正在保存...'
    case 'saved':
      return '已保存'
    case 'error':
      return '保存失败，请稍后重试'
    default:
      return hasUnsavedChanges.value ? '有未保存改动，系统会自动保存' : '实时预览已就绪'
  }
})

onMounted(async () => {
  await userStore.initUserState()
  await initializeEditor()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
  }
})

watch(
  documentState,
  () => {
    if (isBootstrapping.value) {
      return
    }
    persistDraft()
    queueAutoSave()
  },
  { deep: true },
)

watch(stylePanelCollapsed, (value) => {
  localStorage.setItem(panelStorageKey.value, value ? 'collapsed' : 'expanded')
})

async function initializeEditor() {
  documentState.value = createEmptyDocument()
  stylePanelCollapsed.value = localStorage.getItem(panelStorageKey.value) === 'collapsed'

  if (templateId.value) {
    await loadTemplatePreset(templateId.value)
  }

  if (resumeId.value) {
    await loadExistingResume(resumeId.value)
  }

  restoreDraft()
  lastSavedSnapshot.value = serializeDocument()
  isBootstrapping.value = false
}

async function loadTemplatePreset(id: string) {
  try {
    const detail = await getTemplateDetail(id)
    const templateData = parseTemplatePayload(detail.templateData)
    const templateTheme = extractThemeFromTemplate(templateData)
    documentState.value.templateTheme = templateTheme
    documentState.value.theme = mergeResumeTheme(
      templateTheme,
      documentState.value.themeOverrides,
      documentState.value.theme,
    )
    documentState.value.templateId = id
    documentState.value.templateName = detail.name || '模板'
    applyTemplateVariant(templateData)
  } catch (error) {
    console.error('加载模板失败:', error)
    ElMessage.warning('模板样式加载失败，已使用默认模板继续编辑')
  }
}

async function loadExistingResume(id: string) {
  try {
    const response = await getResume(id, userStore.user?.id)
    applyResumeResponse(response)
    await refreshVersions()
  } catch (error) {
    console.error('加载简历失败:', error)
    ElMessage.error('简历加载失败，请稍后重试')
  }
}

function applyResumeResponse(response: any) {
  currentResume.value = {
    id: response.id,
    title: response.title,
    version: response.version,
    templateId: response.templateId,
  }

  const parsed = parseResumeContent(response.content)
  if (!parsed) {
    return
  }

  const shouldPreserveSelectedTemplate = Boolean(templateId.value)
  documentState.value = ensureAllSections({
    ...documentState.value,
    ...parsed,
    theme: shouldPreserveSelectedTemplate
      ? mergeResumeTheme(
        documentState.value.templateTheme,
        parsed.themeOverrides,
        documentState.value.theme,
      )
      : (parsed.theme || documentState.value.theme),
    templateTheme: shouldPreserveSelectedTemplate
      ? documentState.value.templateTheme
      : parsed.templateTheme,
    themeOverrides: parsed.themeOverrides,
    templateId: shouldPreserveSelectedTemplate
      ? (templateId.value || documentState.value.templateId)
      : (parsed.templateId || String(response.templateId || templateId.value || '')),
    templateName: shouldPreserveSelectedTemplate
      ? documentState.value.templateName
      : (parsed.templateName || documentState.value.templateName),
    templateVariant: shouldPreserveSelectedTemplate
      ? documentState.value.templateVariant
      : parsed.templateVariant,
  })

  if (!shouldPreserveSelectedTemplate) {
    applyTemplateVariant()
  }
}

function updateSectionTitle(section: CoreResumeSection, value: string) {
  section.title = value.trim() || getSectionDefinition(section.type).title
}

function toggleSectionVisibility(type: CoreSectionType) {
  const section = documentState.value.sections.find((item) => item.type === type)
  if (!section) {
    return
  }
  if (section.visible) {
    hideSection(section)
  } else {
    showSection(section)
  }
}

function showSection(section: CoreResumeSection) {
  section.visible = true
  collapsedSections.value.delete(section.id)
}

function hideSection(section: CoreResumeSection) {
  if (visibleSectionsCount.value <= 1) {
    ElMessage.warning('至少保留一个显示中的内容模块')
    return
  }
  section.visible = false
  collapsedSections.value.add(section.id)
}

function resetSection(section: CoreResumeSection) {
  const definition = getSectionDefinition(section.type)
  section.title = definition.title
  section.items = [createSectionItem(section.type)]
  section.visible = true
  collapsedSections.value.delete(section.id)
}

function toggleCollapse(sectionId: string) {
  const next = new Set(collapsedSections.value)
  if (next.has(sectionId)) {
    next.delete(sectionId)
  } else {
    next.add(sectionId)
  }
  collapsedSections.value = next
}

function moveSection(index: number, offset: -1 | 1) {
  const nextIndex = index + offset
  if (nextIndex < 0 || nextIndex >= documentState.value.sections.length) {
    return
  }
  const sections = [...documentState.value.sections]
  const [current] = sections.splice(index, 1)
  sections.splice(nextIndex, 0, current)
  documentState.value.sections = sections
}

function addItem(section: CoreResumeSection) {
  section.items.push(createSectionItem(section.type))
}

function removeItem(section: CoreResumeSection, itemIndex: number) {
  if (!canRemoveItem(section)) {
    return
  }
  section.items.splice(itemIndex, 1)
}

function canManageItems(section: CoreResumeSection) {
  return getSectionDefinition(section.type).allowMultiple
}

function canAiPolishSection(section: CoreResumeSection) {
  return Boolean(AI_POLISH_FIELD_MAP[section.type])
}

function canRemoveItem(section: CoreResumeSection) {
  return canManageItems(section) && section.items.length > 1
}

function canMoveItem(section: CoreResumeSection) {
  return canManageItems(section) && section.items.length > 1
}

function moveItem(section: CoreResumeSection, itemIndex: number, offset: -1 | 1) {
  const nextIndex = itemIndex + offset
  if (nextIndex < 0 || nextIndex >= section.items.length) {
    return
  }
  const items = [...section.items]
  const [current] = items.splice(itemIndex, 1)
  items.splice(nextIndex, 0, current)
  section.items = items
}

function readTextValue(item: CoreResumeItem, key: string) {
  const value = item[key]
  return typeof value === 'string' ? value : ''
}

function writeTextValue(item: CoreResumeItem, key: string, value: string) {
  item[key] = value
}

function resolveTargetJobTitle(section: CoreResumeSection, item: CoreResumeItem) {
  const fromItem = [
    section.type === 'intention' ? readTextValue(item, 'intention') : '',
    readTextValue(item, 'role'),
    readTextValue(item, 'name'),
  ].find((value) => value.trim())

  return fromItem?.trim() || documentState.value.profile.title || ''
}

function getAiEntryLabel(section: CoreResumeSection, itemIndex: number) {
  const fieldKey = AI_POLISH_FIELD_MAP[section.type]
  if (!fieldKey) {
    return 'AI辅助'
  }

  const item = section.items[itemIndex]
  return readTextValue(item, fieldKey).trim() ? 'AI润色' : 'AI补全'
}

async function openAiPolish(section: CoreResumeSection, itemIndex: number) {
  const fieldKey = AI_POLISH_FIELD_MAP[section.type]
  if (!fieldKey) {
    ElMessage.warning('当前模块暂不支持 AI 润色')
    return
  }

  const item = section.items[itemIndex]
  const originalText = readTextValue(item, fieldKey).trim()
  const actionType = originalText ? 'polish' : 'generate'

  aiDialogState.value = {
    sectionId: section.id,
    itemIndex,
    fieldKey,
    sectionType: section.type,
    sectionTitle: section.title,
    originalText,
    actionType,
  }
  aiTargetJobTitle.value = resolveTargetJobTitle(section, item)
  aiDialogVisible.value = true
  if (actionType === 'generate') {
    await requestAiGenerate(section.type)
    return
  }
  await requestAiPolish(originalText, section.type)
}

async function rerunAiPolish() {
  if (!aiDialogState.value.sectionType) {
    return
  }
  if (aiDialogState.value.actionType === 'generate') {
    await requestAiGenerate(aiDialogState.value.sectionType)
    return
  }
  if (!aiDialogState.value.originalText) {
    return
  }
  await requestAiPolish(aiDialogState.value.originalText, aiDialogState.value.sectionType)
}

async function requestAiPolish(inputText: string, sectionType: CoreSectionType) {
  aiLoading.value = true
  aiSuggestions.value = []
  selectedAiSuggestionIndex.value = 0
  aiTokenUsed.value = 0
  aiProvider.value = ''
  aiModel.value = ''
  aiExecutionMode.value = ''
  aiPromptPreview.value = ''

  try {
    const response = await aiPolish({
      inputText,
      sectionType,
      jobTitle: aiTargetJobTitle.value,
    })
    aiSuggestions.value = (response.data.suggestions || [])
      .map(normalizeAiSuggestion)
      .filter((suggestion) => suggestion.text)
    aiTokenUsed.value = response.data.tokenUsed || 0
    aiProvider.value = response.data.provider || ''
    aiModel.value = response.data.model || ''
    aiExecutionMode.value = response.data.executionMode || ''
    aiPromptPreview.value = response.data.promptPreview || ''
  } catch (error) {
    console.error('AI 润色失败:', error)
    ElMessage.error('AI 润色失败，请稍后重试')
  } finally {
    aiLoading.value = false
  }
}

async function requestAiGenerate(sectionType: CoreSectionType) {
  aiLoading.value = true
  aiSuggestions.value = []
  selectedAiSuggestionIndex.value = 0
  aiTokenUsed.value = 0
  aiProvider.value = ''
  aiModel.value = ''
  aiExecutionMode.value = ''
  aiPromptPreview.value = ''

  try {
    const contextText = buildAiGenerateContext()
    const response = await aiGenerate({
      jobTitle: aiTargetJobTitle.value || documentState.value.profile.title || '目标岗位',
      sectionType,
      contextText,
    })
    aiSuggestions.value = buildGenerateSuggestions(response.data, sectionType)
    aiTokenUsed.value = response.data.tokenUsed || 0
    aiProvider.value = response.data.provider || ''
    aiModel.value = response.data.model || ''
    aiExecutionMode.value = response.data.executionMode || ''
    aiPromptPreview.value = response.data.promptPreview || ''
  } catch (error) {
    console.error('AI 生成失败:', error)
    ElMessage.error('AI 生成失败，请稍后重试')
  } finally {
    aiLoading.value = false
  }
}

function buildAiGenerateContext() {
  const state = aiDialogState.value
  const section = documentState.value.sections.find((item) => item.id === state.sectionId)
  const targetItem = section?.items[state.itemIndex]
  if (!section || !targetItem) {
    return ''
  }

  const definition = getSectionDefinition(section.type)
  const parts = definition.fields
    .map((field) => {
      if (field.type === 'dateRange') {
        const range = normalizeDuration(targetItem[field.key])
        const value = formatDurationText(range)
        return value ? `${field.label}：${value}` : ''
      }

      const value = readTextValue(targetItem, field.key).trim()
      return value ? `${field.label}：${value}` : ''
    })
    .filter(Boolean)

  return parts.join('\n')
}

function getAiApplyLabel(suggestion: AiSuggestionOption) {
  if (aiDialogState.value.actionType === 'generate') {
    return suggestion.fieldValues ? '一键填入整条内容' : '填入当前内容'
  }

  return '替换当前内容'
}

function buildGenerateSuggestions(data: AiGenerateResponse, sectionType: CoreSectionType): AiSuggestionOption[] {
  const firstProject = Array.isArray(data.projects) ? data.projects[0] : null
  const firstExperience = Array.isArray(data.experiences) ? data.experiences[0] : null
  const projectDesc = firstProject?.desc || firstProject?.content || ''
  const experienceDesc = firstExperience?.desc || firstExperience?.content || ''
  const projectTitle = firstProject?.name ? `项目示例：${firstProject.name}` : '项目示例'
  const experienceTitle = firstExperience?.company ? `经历示例：${firstExperience.company}` : '经历示例'
  const skillsText = Array.isArray(data.skills) ? data.skills.filter(Boolean).join('、') : ''

  const suggestionMap: Partial<Record<CoreSectionType, AiSuggestionOption[]>> = {
    intention: [
      { reason: '根据目标岗位生成求职意向。', text: data.intention || aiTargetJobTitle.value || documentState.value.profile.title || '目标岗位' },
    ],
    summary: [
      { reason: '生成适合放在自我评价中的职业摘要。', text: data.summary || '' },
    ],
    skills: [
      { reason: '生成与目标岗位匹配的技能关键词。', text: skillsText },
    ],
    projects: [
      buildProjectSuggestion(`${projectTitle} · 成果导向初稿`, firstProject, projectDesc || data.summary),
    ],
    experience: [
      buildExperienceSuggestion(`${experienceTitle} · 成果导向初稿`, firstExperience, experienceDesc || data.summary || projectDesc),
    ],
    internship: [
      buildExperienceSuggestion('生成一段可继续细化的实习成果描述初稿。', firstExperience, experienceDesc || data.summary || projectDesc),
    ],
    campus: [
      buildExperienceSuggestion('生成一段可继续细化的校园成果描述初稿。', firstExperience, experienceDesc || data.summary || projectDesc, 'org'),
    ],
    custom: [
      { reason: '生成一段可继续编辑的自定义内容。', text: data.summary || experienceDesc || projectDesc || skillsText },
    ],
  }

  return (suggestionMap[sectionType] || [
    { reason: '生成一段可直接填入的内容初稿。', text: data.summary || projectDesc || skillsText },
  ]).filter((suggestion) => suggestion.text)
}

function buildExperienceSuggestion(
  reason: string,
  record: Record<string, any> | null,
  fallbackText: string,
  organizationKey: 'company' | 'org' = 'company',
): AiSuggestionOption {
  if (!record) {
    return { reason, text: fallbackText }
  }

  const existingFieldValues = getCurrentAiSeedFieldValues()
  const duration = mergeDuration(normalizeDuration(record.duration), normalizeDuration(existingFieldValues.duration))
  const organizationValue = preferSeedValue(record[organizationKey], existingFieldValues[organizationKey])
  const roleValue = preferSeedValue(record.role, existingFieldValues.role)
  const descValue = preferSeedValue(record.desc, existingFieldValues.desc, fallbackText)
  return {
    reason,
    text: buildStructuredSuggestionText([
      organizationValue,
      roleValue,
      formatDurationText(duration),
      descValue,
    ]),
    fieldValues: {
      [organizationKey]: organizationValue,
      role: roleValue,
      duration,
      desc: descValue,
    },
  }
}

function buildProjectSuggestion(reason: string, record: Record<string, any> | null, fallbackText: string): AiSuggestionOption {
  if (!record) {
    return { reason, text: fallbackText }
  }

  const existingFieldValues = getCurrentAiSeedFieldValues()
  const duration = mergeDuration(normalizeDuration(record.duration), normalizeDuration(existingFieldValues.duration))
  const nameValue = preferSeedValue(record.name, existingFieldValues.name)
  const roleValue = preferSeedValue(record.role, existingFieldValues.role)
  const descValue = preferSeedValue(record.desc, existingFieldValues.desc, fallbackText)
  return {
    reason,
    text: buildStructuredSuggestionText([
      nameValue,
      roleValue,
      formatDurationText(duration),
      descValue,
    ]),
    fieldValues: {
      name: nameValue,
      role: roleValue,
      duration,
      desc: descValue,
    },
  }
}

function buildStructuredSuggestionText(parts: string[]) {
  return parts.filter((part) => String(part || '').trim()).join('\n')
}

function normalizeDuration(value: any): CoreDateRange {
  if (!value || typeof value !== 'object') {
    return { start: '', end: '' }
  }

  return {
    start: String(value.start || ''),
    end: String(value.end || ''),
  }
}

function mergeDuration(primary: CoreDateRange, fallback: CoreDateRange) {
  return {
    start: primary.start || fallback.start || '',
    end: primary.end || fallback.end || '',
  }
}

function preferSeedValue(primary: unknown, fallback: unknown, finalFallback = '') {
  return String(primary || fallback || finalFallback || '')
}

function formatDurationText(duration: CoreDateRange) {
  return [duration.start, duration.end].filter(Boolean).join(' - ')
}

function getCurrentAiSeedFieldValues() {
  const state = aiDialogState.value
  const section = documentState.value.sections.find((item) => item.id === state.sectionId)
  const targetItem = section?.items[state.itemIndex]
  if (!targetItem) {
    return {} as Record<string, string | CoreDateRange>
  }

  return Object.entries(targetItem).reduce<Record<string, string | CoreDateRange>>((acc, [key, value]) => {
    if (typeof value === 'string') {
      if (value.trim()) {
        acc[key] = value.trim()
      }
      return acc
    }

    const duration = normalizeDuration(value)
    if (duration.start || duration.end) {
      acc[key] = duration
    }
    return acc
  }, {})
}

function normalizeAiSuggestion(suggestion: PolishSuggestion): AiSuggestionOption {
  return {
    reason: suggestion.reason,
    text: htmlToPlainText(suggestion.html),
  }
}

function htmlToPlainText(html: string) {
  if (!html) {
    return ''
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  doc.querySelectorAll('br').forEach((node) => node.replaceWith('\n'))
  doc.querySelectorAll('li').forEach((node) => {
    const text = node.textContent?.trim() || ''
    node.replaceWith(`• ${text}\n`)
  })
  doc.querySelectorAll('p').forEach((node) => {
    const text = node.textContent?.trim() || ''
    node.replaceWith(`${text}\n`)
  })
  doc.querySelectorAll('div').forEach((node) => {
    if (!node.children.length) {
      const text = node.textContent?.trim() || ''
      node.replaceWith(`${text}\n`)
    }
  })

  const text = doc.body.textContent || ''
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}

async function applyAiSuggestion(suggestion: AiSuggestionOption) {
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录后再使用 AI 润色')
    return
  }

  const state = aiDialogState.value
  if (!state.sectionId || !state.fieldKey) {
    return
  }

  aiApplying.value = true
  try {
    if (!currentResume.value || hasUnsavedChanges.value) {
      await saveResumeInternal(false)
    }

    if (currentResume.value) {
      await createResumeVersionSnapshot(
        String(currentResume.value.id),
        userStore.user.id,
        `AI润色前快照：${state.sectionTitle}`,
      )
    }

    const section = documentState.value.sections.find((item) => item.id === state.sectionId)
    const targetItem = section?.items[state.itemIndex]
    if (!section || !targetItem) {
      ElMessage.warning('未找到需要回填的内容项')
      return
    }

    if (suggestion.fieldValues && state.actionType === 'generate') {
      applyAiFieldValues(targetItem, suggestion.fieldValues)
    } else {
      writeTextValue(targetItem, state.fieldKey, suggestion.text)
    }
    await saveResumeInternal(false)
    await refreshVersions()
    aiDialogVisible.value = false
    ElMessage.success('AI 建议已应用，原内容已保存为版本快照')
  } catch (error) {
    console.error('应用 AI 建议失败:', error)
    ElMessage.error('应用 AI 建议失败，请稍后重试')
  } finally {
    aiApplying.value = false
  }
}

function applyAiFieldValues(item: CoreResumeItem, fieldValues: Record<string, string | CoreDateRange>) {
  Object.entries(fieldValues).forEach(([key, value]) => {
    if (typeof value === 'string') {
      writeTextValue(item, key, value)
      return
    }

    item[key] = {
      start: value.start || '',
      end: value.end || '',
    }
  })
}

function readRangeValue(item: CoreResumeItem, key: string, field: 'start' | 'end') {
  const value = item[key]
  if (!value || typeof value !== 'object') {
    return ''
  }
  const range = value as { start?: string; end?: string }
  return range[field] || ''
}

function writeRangeValue(item: CoreResumeItem, key: string, field: 'start' | 'end', value: string) {
  const current = item[key] && typeof item[key] === 'object'
    ? (item[key] as { start?: string; end?: string })
    : { start: '', end: '' }
  const range = {
    start: current.start || '',
    end: current.end || '',
  }
  range[field] = value
  item[key] = range
}

function updateThemeValue<K extends keyof CoreResumeTheme>(key: K, value: CoreResumeTheme[K] | null | undefined) {
  if (value === null || value === undefined) {
    return
  }

  const nextOverrides = {
    ...(documentState.value.themeOverrides || {}),
    [key]: value,
  }

  documentState.value.themeOverrides = nextOverrides
  documentState.value.theme = mergeResumeTheme(
    documentState.value.templateTheme,
    nextOverrides,
    documentState.value.theme,
  )
}

function resetThemeOverrides() {
  documentState.value.themeOverrides = undefined
  documentState.value.theme = mergeResumeTheme(
    documentState.value.templateTheme,
    undefined,
    documentState.value.theme,
  )
  ElMessage.success('已恢复模板默认样式')
}

async function saveResume() {
  await saveResumeInternal(true)
}

async function openVersionDrawer() {
  versionDrawerVisible.value = true
  await refreshVersions()
}

async function saveResumeInternal(notify: boolean) {
  if (!userStore.user?.id) {
    if (notify) {
      ElMessage.warning('请先登录后再保存')
    }
    return
  }

  const title = buildResumeTitle(documentState.value.profile)
  const content = JSON.stringify({
    ...documentState.value,
    schema: 'core-resume/v1',
    templateId: documentState.value.templateId || templateId.value || undefined,
  })

  saveStatus.value = 'saving'

  try {
    if (currentResume.value) {
      const updated = await updateResume(
        String(currentResume.value.id),
        {
          title,
          content,
          version: currentResume.value.version,
          templateId: documentState.value.templateId ? Number(documentState.value.templateId) : undefined,
        },
        userStore.user.id,
      )
      currentResume.value = {
        id: updated.id,
        title: updated.title,
        version: updated.version,
        templateId: updated.templateId,
      }
    } else {
      const created = await createResume(
        documentState.value.templateId,
        title,
        userStore.user.id,
        content,
      )
      currentResume.value = {
        id: Number(created.resumeId),
        title,
        version: 1,
        templateId: documentState.value.templateId ? Number(documentState.value.templateId) : undefined,
      }
      const url = new URL(window.location.href)
      url.searchParams.set('resumeId', created.resumeId)
      window.history.replaceState({}, '', url.toString())
    }
    await refreshVersions()
    saveStatus.value = 'saved'
    lastSavedSnapshot.value = serializeDocument()
    if (notify) {
      ElMessage.success('简历已保存')
    }
  } catch (error) {
    console.error('保存简历失败:', error)
    saveStatus.value = 'error'
    if (notify) {
      ElMessage.error('保存失败，请稍后重试')
    }
  }
}

async function refreshVersions() {
  if (!currentResume.value || !userStore.user?.id) {
    versionRecords.value = []
    return
  }

  versionsLoading.value = true
  try {
    const versions = await listResumeVersions(String(currentResume.value.id), userStore.user.id)
    versionRecords.value = versions.map(buildVersionRecord)
  } catch (error) {
    console.error('鍔犺浇鐗堟湰璁板綍澶辫触:', error)
    if (versionDrawerVisible.value) {
      ElMessage.error('鐗堟湰璁板綍鍔犺浇澶辫触')
    }
  } finally {
    versionsLoading.value = false
  }
}

async function createManualVersion() {
  if (!userStore.user?.id) {
    ElMessage.warning('璇峰厛鐧诲綍鍚庡啀淇濆瓨鐗堟湰')
    return
  }

  if (!currentResume.value || hasUnsavedChanges.value) {
    await saveResumeInternal(false)
  }

  if (!currentResume.value) {
    ElMessage.warning('璇峰厛淇濆瓨绠€鍘嗗悗鍐嶅垱寤虹増鏈?')
    return
  }

  creatingVersion.value = true
  try {
    let remark = ''
    try {
      const result = await ElMessageBox.prompt('给这个版本留一句备注，后面会更容易识别。', '保存为版本', {
        confirmButtonText: '保存版本',
        cancelButtonText: '跳过备注',
        inputPlaceholder: '例如：投递前调整项目经历 / 保留时间轴版文案',
        inputValue: '',
      })
      remark = result.value?.trim() || ''
    } catch (error) {
      const action = error === 'cancel' || (typeof error === 'string' && error === 'cancel')
      if (!action) {
        throw error
      }
    }

    await createResumeVersionSnapshot(String(currentResume.value.id), userStore.user.id, remark || undefined)
    await refreshVersions()
    versionDrawerVisible.value = true
    ElMessage.success('宸蹭负褰撳墠绠€鍘嗗垱寤虹増鏈?')
  } catch (error) {
    console.error('鍒涘缓鐗堟湰澶辫触:', error)
    ElMessage.error('鍒涘缓鐗堟湰澶辫触锛岃绋嶅悗閲嶈瘯')
  } finally {
    creatingVersion.value = false
  }
}

async function rollbackToVersion(versionId: number) {
  if (!currentResume.value || !userStore.user?.id) {
    return
  }

  const targetVersion = versionRecords.value.find((item) => item.id === versionId)
  if (!targetVersion) {
    ElMessage.warning('未找到要回滚的版本')
    return
  }

  try {
    await ElMessageBox.confirm(
      `将回滚到 v${targetVersion.sourceVersion}。当前内容会先自动保存为新快照，确保你可以再恢复回来。\n\n${targetVersion.summaryTitle}\n${targetVersion.summaryMeta}`,
      '确认回滚版本',
      {
        confirmButtonText: '确认回滚',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch {
    return
  }

  rollingBackVersionId.value = versionId
  try {
    const response = await rollbackResumeVersion(String(currentResume.value.id), versionId, userStore.user.id)
    applyResumeResponse(response)
    lastSavedSnapshot.value = serializeDocument()
    persistDraft()
    await refreshVersions()
    ElMessage.success('宸插洖婊氬埌鎸囧畾鐗堟湰')
  } catch (error) {
    console.error('鍥炴粴鐗堟湰澶辫触:', error)
    ElMessage.error('鍥炴粴澶辫触锛岃绋嶅悗閲嶈瘯')
  } finally {
    rollingBackVersionId.value = null
  }
}

function openVersionCompare(version: ResumeVersionRecord) {
  const targetDocument = parseVersionDocument(version.content)
  if (!targetDocument) {
    ElMessage.warning('该版本内容暂时无法解析，无法进行对比')
    return
  }

  const currentDocument = ensureAllSections(JSON.parse(serializeDocument()))
  versionCompareTarget.value = version
  versionCompareData.value = buildVersionComparePayload(currentDocument, targetDocument)
  versionCompareVisible.value = true
}

async function exportPdf() {
  const sheet = previewRef.value?.sheetRef
  if (!sheet) {
    ElMessage.warning('预览内容尚未准备好')
    return
  }

  exportingPdf.value = true
  try {
    const exportTitle = buildResumeTitle(documentState.value.profile)
    const html = buildCoreResumePrintHtml(sheet.outerHTML, exportTitle)
    const { url } = await exportResumePdfByHtml(html)
    await downloadPdf(url, `${sanitizeFilename(exportTitle)}.pdf`)
  } catch (error) {
    console.error('导出 PDF 失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    exportingPdf.value = false
  }
}

function parseTemplatePayload(payload: unknown) {
  if (!payload) {
    return {}
  }
  if (typeof payload === 'object') {
    return payload
  }
  if (typeof payload !== 'string') {
    return {}
  }
  try {
    return JSON.parse(payload)
  } catch {
    return {}
  }
}

function openTemplateCenter() {
  const targetResumeId = currentResume.value?.id || Number(resumeId.value || 0)
  if (targetResumeId) {
    router.push(`/templates?resumeId=${targetResumeId}`)
    return
  }
  router.push('/templates')
}

function applyTemplateVariant(templateData?: unknown) {
  const next = resolveTemplateVariant(documentState.value as VariantAwareDocument, templateData)
  ;(documentState.value as VariantAwareDocument).templateVariant = next
}

function queueAutoSave() {
  if (isApplyingDraft.value) {
    return
  }
  if (!userStore.user?.id || !hasUnsavedChanges.value) {
    return
  }
  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
  }
  saveTimer.value = setTimeout(() => {
    saveResumeInternal(false)
  }, 1200)
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!hasUnsavedChanges.value || saveStatus.value === 'saving') {
    return
  }
  event.preventDefault()
  event.returnValue = ''
}

function persistDraft() {
  localStorage.setItem(draftStorageKey.value, serializeDocument())
}

function restoreDraft() {
  const raw = localStorage.getItem(draftStorageKey.value)
  if (!raw) {
    return
  }
  try {
    const parsed = JSON.parse(raw)
    const restored = ensureAllSections(parsed)
    const shouldPreserveSelectedTemplate = Boolean(templateId.value)
    isApplyingDraft.value = true
    documentState.value = {
      ...documentState.value,
      ...restored,
      theme: shouldPreserveSelectedTemplate
        ? mergeResumeTheme(
          documentState.value.templateTheme,
          restored.themeOverrides,
          documentState.value.theme,
        )
        : restored.theme,
      templateTheme: shouldPreserveSelectedTemplate
        ? documentState.value.templateTheme
        : restored.templateTheme,
      themeOverrides: restored.themeOverrides,
      templateId: shouldPreserveSelectedTemplate
        ? (documentState.value.templateId || templateId.value)
        : (restored.templateId || documentState.value.templateId),
      templateName: shouldPreserveSelectedTemplate
        ? documentState.value.templateName
        : (restored.templateName || documentState.value.templateName),
      templateVariant: shouldPreserveSelectedTemplate
        ? documentState.value.templateVariant
        : restored.templateVariant,
    }
    applyTemplateVariant()
    ElMessage.info('已恢复本地草稿')
  } catch (error) {
    console.error('恢复本地草稿失败:', error)
  } finally {
    isApplyingDraft.value = false
  }
}

function serializeDocument() {
  return JSON.stringify({
    ...documentState.value,
    schema: 'core-resume/v1',
    templateId: documentState.value.templateId || templateId.value || undefined,
  })
}

async function downloadPdf(url: string, filename: string) {
  if (!url) {
    throw new Error('PDF export did not return a file url')
  }

  if (url.startsWith('data:application/pdf;base64,')) {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    triggerDownload(objectUrl, filename)
    URL.revokeObjectURL(objectUrl)
    return
  }

  triggerDownload(url, filename)
}

function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function sanitizeFilename(value: string) {
  const normalized = value
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

  return normalized || 'resume-export'
}

function formatVersionTime(value: string) {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getVersionSourceLabel(sourceType?: string) {
  switch (sourceType) {
    case 'manual':
      return '手动保存'
    case 'rollback':
      return '回滚前快照'
    case 'save':
    default:
      return '保存前快照'
  }
}

function buildVersionRecord(version: any): ResumeVersionRecord {
  const summary = summarizeVersionContent(version.content)
  return {
    id: version.id,
    resumeId: version.resumeId,
    userId: version.userId,
    sourceVersion: version.sourceVersion,
    sourceType: version.sourceType,
    remark: version.remark,
    createTime: version.createTime,
    content: version.content,
    summaryTitle: summary.title,
    summaryMeta: summary.meta,
  }
}

function parseVersionDocument(content?: string) {
  if (!content) {
    return null
  }

  try {
    const parsed = parseResumeContent(content)
    if (!parsed) {
      return null
    }
    return ensureAllSections(parsed)
  } catch (error) {
    console.error('解析版本内容失败:', error)
    return null
  }
}

function buildVersionComparePayload(currentDocument: CoreResumeDocument, targetDocument: CoreResumeDocument): VersionComparePayload {
  return {
    profileDiffs: buildProfileDiffs(currentDocument, targetDocument),
    sectionDiffs: buildSectionDiffs(currentDocument, targetDocument),
    currentFilledSections: countFilledSections(currentDocument.sections),
    targetFilledSections: countFilledSections(targetDocument.sections),
  }
}

function buildProfileDiffs(currentDocument: CoreResumeDocument, targetDocument: CoreResumeDocument): VersionCompareField[] {
  const profileFields = [
    { key: 'name', label: '姓名' },
    { key: 'title', label: '目标职位' },
    { key: 'phone', label: '电话' },
    { key: 'email', label: '邮箱' },
    { key: 'gender', label: '性别' },
    { key: 'age', label: '年龄' },
    { key: 'yearsOfExperience', label: '工作年限' },
    { key: 'site', label: '个人主页' },
  ] as const

  return profileFields.reduce<VersionCompareField[]>((diffs, field) => {
      const currentValue = normalizeCompareValue(currentDocument.profile[field.key])
      const targetValue = normalizeCompareValue(targetDocument.profile[field.key])
      if (currentValue === targetValue) {
        return diffs
      }

      diffs.push({
        key: field.key,
        label: field.label,
        currentValue,
        targetValue,
      })
      return diffs
    }, [])
}

function buildSectionDiffs(currentDocument: CoreResumeDocument, targetDocument: CoreResumeDocument): VersionCompareSection[] {
  return CORE_SECTION_DEFINITIONS.reduce<VersionCompareSection[]>((diffs, definition) => {
      const currentSection = currentDocument.sections.find((section) => section.type === definition.type)
      const targetSection = targetDocument.sections.find((section) => section.type === definition.type)

      const currentSummary = buildSectionCompareSummary(currentSection)
      const targetSummary = buildSectionCompareSummary(targetSection)

      if (
        currentSummary.visible === targetSummary.visible
        && currentSummary.filledCount === targetSummary.filledCount
        && currentSummary.preview === targetSummary.preview
      ) {
        return diffs
      }

      diffs.push({
        key: definition.type,
        title: definition.title,
        summary: buildSectionCompareMeta(currentSummary, targetSummary),
        currentValue: formatSectionCompareValue(currentSummary),
        targetValue: formatSectionCompareValue(targetSummary),
        changeType: resolveVersionDiffType(currentSummary, targetSummary),
      })
      return diffs
    }, [])
}

function buildSectionCompareSummary(section?: CoreResumeSection) {
  return {
    visible: Boolean(section?.visible),
    filledCount: countFilledItems(section),
    preview: buildSectionPreview(section),
  }
}

function buildSectionCompareMeta(
  currentSummary: { visible: boolean; filledCount: number; preview: string },
  targetSummary: { visible: boolean; filledCount: number; preview: string },
) {
  const summaryParts = []

  if (currentSummary.visible !== targetSummary.visible) {
    summaryParts.push(`显示状态：${currentSummary.visible ? '当前显示' : '当前隐藏'} / ${targetSummary.visible ? '历史显示' : '历史隐藏'}`)
  }

  if (currentSummary.filledCount !== targetSummary.filledCount) {
    summaryParts.push(`已填写条目：${currentSummary.filledCount} vs ${targetSummary.filledCount}`)
  }

  if (currentSummary.preview !== targetSummary.preview) {
    summaryParts.push('内容摘要不同')
  }

  return summaryParts.join(' · ')
}

function formatSectionCompareValue(summary: { visible: boolean; filledCount: number; preview: string }) {
  return [
    `状态：${summary.visible ? '显示' : '隐藏'}`,
    `已填写条目：${summary.filledCount}`,
    `摘要：${summary.preview}`,
  ].join('\n')
}

function resolveVersionDiffType(
  currentSummary: { visible: boolean; filledCount: number; preview: string },
  targetSummary: { visible: boolean; filledCount: number; preview: string },
): 'changed' | 'added' | 'removed' {
  const currentHasContent = currentSummary.filledCount > 0
  const targetHasContent = targetSummary.filledCount > 0

  if (currentHasContent && !targetHasContent) {
    return 'added'
  }

  if (!currentHasContent && targetHasContent) {
    return 'removed'
  }

  return 'changed'
}

function buildSectionPreview(section?: CoreResumeSection) {
  if (!section) {
    return '未找到该模块'
  }

  const preview = section.items
    .map((item) => formatSectionItem(item))
    .filter(Boolean)
    .slice(0, 2)
    .join(' ｜ ')

  return preview || '未填写'
}

function formatSectionItem(item: CoreResumeItem) {
  const parts = Object.values(item)
    .map((value) => {
      if (typeof value === 'string') {
        return value.trim()
      }

      return [value.start?.trim(), value.end?.trim()].filter(Boolean).join(' - ')
    })
    .filter(Boolean)

  return parts.join(' / ')
}

function countFilledSections(sections: CoreResumeSection[]) {
  return sections.filter((section) => countFilledItems(section) > 0).length
}

function countFilledItems(section?: CoreResumeSection) {
  if (!section) {
    return 0
  }

  return section.items.filter((item) => hasSectionContent(item)).length
}

function normalizeCompareValue(value?: string) {
  return value?.trim() || '未填写'
}

function getVersionDiffLabel(changeType: 'changed' | 'added' | 'removed') {
  switch (changeType) {
    case 'added':
      return '当前新增'
    case 'removed':
      return '当前缺失'
    case 'changed':
    default:
      return '内容变化'
  }
}

function summarizeVersionContent(content?: string) {
  if (!content) {
    return {
      title: '暂无版本内容摘要',
      meta: '未识别到可预览内容',
    }
  }

  try {
    const parsed = parseResumeContent(content)
    if (!parsed?.sections || !parsed.profile) {
      return {
        title: '版本内容摘要暂不可用',
        meta: '仍可直接回滚到该版本',
      }
    }

    const visibleSections = parsed.sections.filter((section) => section.visible)
    const nonEmptySections = visibleSections.filter((section) =>
      section.items.some((item) => hasSectionContent(item)),
    )

    const profileSummary = [parsed.profile.name, parsed.profile.title].filter(Boolean).join(' · ')
    const sectionSummary = nonEmptySections
      .slice(0, 3)
      .map((section) => section.title)
      .join(' / ')

    return {
      title: profileSummary || '未命名版本',
      meta: [
        nonEmptySections.length ? `${nonEmptySections.length} 个已填写模块` : '内容较少',
        sectionSummary || '暂无模块摘要',
      ].join(' · '),
    }
  } catch (error) {
    console.error('解析版本摘要失败:', error)
    return {
      title: '版本内容解析失败',
      meta: '仍可直接回滚到该版本',
    }
  }
}

function hasSectionContent(item: CoreResumeItem) {
  return Object.values(item).some((value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0
    }

    return Boolean(value.start?.trim() || value.end?.trim())
  })
}
</script>

<style scoped>
.core-editor-page {
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr) 280px;
  height: 100vh;
  overflow: hidden;
  background: #f8fafc;
}

.core-editor-page.style-panel-is-collapsed {
  grid-template-columns: 420px minmax(0, 1fr) 88px;
}

.editor-panel,
.style-panel {
  padding: 20px;
  min-height: 0;
  overflow-y: auto;
  border-right: 1px solid #e2e8f0;
  background: #fff;
}

.style-panel {
  border-right: none;
  border-left: 1px solid #e2e8f0;
}

.style-panel.collapsed {
  padding-inline: 10px;
}

.style-panel.collapsed .style-header {
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.style-panel.collapsed .style-header p {
  display: none;
}

.style-panel.collapsed .style-header h3 {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  line-height: 1.1;
}

.style-panel.collapsed .style-header > div {
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.panel-header,
.preview-toolbar,
.style-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.panel-header h2,
.preview-toolbar h2,
.style-header h3 {
  margin: 0;
}

.panel-header p,
.preview-toolbar p,
.style-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.editor-card {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.card-title-row h3 {
  margin: 0;
}

.title-with-help {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.help-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #eef2ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  cursor: help;
}

.help-link {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  cursor: help;
}

.card-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
}

.template-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.section-actions,
.toolbar-actions,
.item-editor-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.module-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.style-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  margin-bottom: 14px;
}

.style-state {
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-block span {
  font-size: 13px;
  color: #334155;
  font-weight: 600;
}

.field-block-full {
  grid-column: 1 / -1;
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.item-editor {
  padding: 14px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.item-editor-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.date-range-row {
  display: grid;
  grid-template-columns: 1fr 20px 1fr;
  gap: 8px;
  align-items: center;
}

.date-range-sep {
  text-align: center;
  color: #94a3b8;
}

.section-footer {
  display: flex;
  justify-content: flex-start;
}

.hidden-card {
  background: #fff7ed;
  border-color: #fed7aa;
}

.hidden-sections {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hidden-section-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.75);
}

.preview-toolbar {
  padding: 20px 24px 0;
  position: relative;
  z-index: 30;
}

.preview-stage {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.native-color {
  width: 100%;
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #fff;
  padding: 4px;
}

.version-drawer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.version-drawer-header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 160px;
}

.version-item {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.version-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.version-current {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
}

.version-source {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #ede9fe;
  color: #6d28d9;
  font-size: 12px;
  font-weight: 600;
}

.version-time {
  color: #64748b;
  font-size: 12px;
}

.version-item-summary {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
}

.version-summary-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.version-summary-remark {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
}

.version-summary-meta {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.version-item-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.version-compare-dialog {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.version-compare-header {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.version-compare-hero,
.version-compare-stat,
.version-compare-card,
.version-compare-section {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.version-compare-tag {
  display: inline-flex;
  margin-bottom: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.version-compare-hero strong,
.version-compare-stat strong {
  display: block;
  color: #0f172a;
}

.version-compare-hero p {
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.6;
}

.version-compare-time,
.version-compare-draft-tip {
  display: inline-flex;
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.version-compare-draft-tip {
  color: #b45309;
}

.version-compare-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.version-compare-stat span {
  display: block;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 13px;
}

.version-compare-stat strong {
  font-size: 22px;
}

.version-compare-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-compare-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.version-compare-block-header h4 {
  margin: 0;
}

.version-compare-block-header span {
  color: #64748b;
  font-size: 13px;
}

.version-compare-grid,
.version-compare-section-list {
  display: grid;
  gap: 12px;
}

.version-compare-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.version-compare-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.version-compare-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.version-compare-column-label {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.version-compare-columns p {
  margin: 0;
  padding: 10px 12px;
  min-height: 72px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  white-space: pre-line;
  line-height: 1.7;
}

.version-compare-section-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.version-compare-section-summary {
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.version-diff-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.version-diff-badge.changed {
  background: #dbeafe;
  color: #1d4ed8;
}

.version-diff-badge.added {
  background: #dcfce7;
  color: #15803d;
}

.version-diff-badge.removed {
  background: #fee2e2;
  color: #b91c1c;
}

.ai-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.ai-dialog-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ai-runtime-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ai-dialog-subtitle {
  display: inline-flex;
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}

.ai-target-row {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.ai-mode-tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.ai-mode-tip p {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
}

.ai-mode-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.ai-runtime-badge {
  background: #e2e8f0;
  color: #334155;
}

.ai-suggestion-card {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.ai-runtime-popover {
  display: grid;
  gap: 12px;
}

.ai-label {
  display: inline-flex;
  margin-bottom: 10px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.ai-text-block {
  white-space: pre-wrap;
  line-height: 1.75;
  color: #0f172a;
}

.ai-text-block.compact {
  max-height: 180px;
  overflow: auto;
  padding: 10px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 12px;
}

.ai-runtime-tip {
  color: #64748b;
  font-size: 12px;
}

.ai-prompt-preview {
  display: grid;
  gap: 10px;
}

.ai-suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 180px;
}

.ai-suggestion-head {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  color: #475569;
  font-size: 13px;
}

.ai-suggestion-selector {
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  padding: 4px 12px;
  font-weight: 800;
  cursor: pointer;
}

.ai-suggestion-selector.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.ai-comparison-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
}

.ai-compare-pane {
  min-width: 0;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.ai-compare-pane.original {
  background: #f8fafc;
}

.ai-compare-pane.polished {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.ai-suggestion-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 1280px) {
  .core-editor-page {
    grid-template-columns: 380px minmax(0, 1fr);
  }

  .style-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 280px;
    z-index: 20;
    box-shadow: -12px 0 30px rgba(15, 23, 42, 0.14);
  }
}

@media (max-width: 900px) {
  .core-editor-page {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }

  .editor-panel,
  .style-panel {
    border: none;
    min-height: auto;
    overflow: visible;
  }

  .preview-panel,
  .preview-stage {
    min-height: auto;
    overflow: visible;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .ai-comparison-grid {
    grid-template-columns: 1fr;
  }

  .item-editor-toolbar,
  .card-title-row,
  .section-title-group {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
