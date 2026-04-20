<template>
  <div class="system-config-page">
    <div class="page-header">
      <div>
        <div class="title-with-help">
          <h2>AI 配置中心</h2>
          <el-tooltip content="统一管理 AI 服务商、模型参数、提示词模板和连通性检查；切换真实 API 时只需要改这里。" placement="bottom">
            <span class="help-dot">?</span>
          </el-tooltip>
        </div>
      </div>
      <div class="page-actions">
        <el-button @click="loadConfig" :loading="loading">刷新</el-button>
        <el-button @click="handleTestConnection" :loading="testingConnection">测试连接</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
      </div>
    </div>

    <el-alert
      :title="aiConfigStatus.label"
      :type="aiConfigStatus.type"
      :closable="false"
      class="page-alert"
    >
      <template #default>
        <el-tooltip :content="aiConfigStatus.message" placement="bottom">
          <span class="alert-detail-link">查看说明</span>
        </el-tooltip>
      </template>
    </el-alert>

    <el-alert
      v-if="connectionState.message"
      :title="connectionState.title"
      :type="connectionState.type"
      :closable="false"
      class="page-alert"
    >
      <template #default>
        <el-tooltip :content="connectionState.message" placement="bottom">
          <span class="alert-detail-link">连接详情</span>
        </el-tooltip>
      </template>
    </el-alert>

    <el-card shadow="never" class="config-card">
      <template #header>
        <div class="card-header">
          <span>运行时配置</span>
          <div class="status-tags">
            <el-tag :type="form.ai.enabled ? 'success' : 'info'">
              {{ form.ai.enabled ? '已启用' : '已停用' }}
            </el-tag>
            <el-tag :type="aiConfigStatus.type">{{ aiConfigStatus.label }}</el-tag>
            <el-tag v-if="connectionState.badge" :type="connectionState.type">{{ connectionState.badge }}</el-tag>
          </div>
        </div>
      </template>

      <el-form label-position="top" class="config-form">
        <div class="form-grid">
          <el-form-item label="AI 开关">
            <el-switch v-model="form.ai.enabled" />
          </el-form-item>

          <el-form-item label="Provider">
            <el-select v-model="form.ai.provider" placeholder="请选择 Provider">
              <el-option label="Mock（本地联调）" value="mock" />
              <el-option label="OpenAI Compatible" value="openai-compatible" />
              <el-option label="OpenAI" value="openai" />
              <el-option label="自定义 Provider" value="custom" />
            </el-select>
          </el-form-item>

          <el-form-item label="API Base URL">
            <el-input v-model="form.ai.apiBaseUrl" placeholder="例如 https://api.openai.com/v1" />
          </el-form-item>

          <el-form-item label="API Key">
            <el-input
              v-model="form.ai.apiKey"
              placeholder="留空时表示继续使用当前配置"
              show-password
            />
          </el-form-item>

          <el-form-item label="模型名称">
            <el-input v-model="form.ai.apiModel" placeholder="例如 gpt-4.1-mini / deepseek-chat" />
          </el-form-item>

          <el-form-item label="Temperature">
            <el-input-number v-model="form.ai.temperature" :min="0" :max="2" :step="0.1" />
          </el-form-item>

          <el-form-item label="每日总调用上限">
            <el-input-number v-model="form.ai.dailyLimit" :min="0" :step="10" />
          </el-form-item>

          <el-form-item label="单用户额度">
            <el-input-number v-model="form.ai.perUserLimit" :min="0" :step="1" />
          </el-form-item>
        </div>

        <el-divider />

        <div class="prompt-header">
          <div>
            <div class="title-with-help">
              <h3>提示词模板</h3>
              <el-tooltip placement="top">
                <template #content>
                  <span v-pre>支持占位符：{{input}}、{{sectionType}}、{{jobTitle}}。真实 API 调用时会读取这里的模板。</span>
                </template>
                <span class="help-dot">?</span>
              </el-tooltip>
            </div>
          </div>
          <div class="prompt-actions">
            <el-button @click="handlePreviewPrompt('polish')" :loading="previewing">预览润色 Prompt</el-button>
            <el-button @click="handlePreviewPrompt('generate')" :loading="previewing">预览生成 Prompt</el-button>
            <el-button @click="resetPromptTemplates">恢复默认模板</el-button>
          </div>
        </div>

        <el-form-item label="润色 Prompt 模板">
          <el-input
            v-model="form.ai.polishPromptTemplate"
            type="textarea"
            :rows="8"
            placeholder="请输入 AI 润色 Prompt 模板"
          />
        </el-form-item>

        <el-form-item label="生成 Prompt 模板">
          <el-input
            v-model="form.ai.generatePromptTemplate"
            type="textarea"
            :rows="6"
            placeholder="请输入 AI 生成 Prompt 模板"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="previewVisible" title="Prompt 预览" width="760px">
      <div class="preview-meta">
        <el-tag>{{ previewState.taskType === 'polish' ? '润色任务' : '生成任务' }}</el-tag>
        <el-tag type="info">{{ previewState.provider || '-' }}</el-tag>
        <el-tag type="warning">{{ previewState.model || '-' }}</el-tag>
        <el-tag :type="previewState.configReady ? 'success' : 'danger'">
          {{ previewState.configReady ? '配置完整' : '配置未完成' }}
        </el-tag>
        <el-tag :type="previewState.executionMode === 'mock' ? 'info' : 'success'">
          {{ previewState.executionMode === 'mock' ? 'Mock 模式' : 'Prepared 模式' }}
        </el-tag>
      </div>
      <el-input
        :model-value="previewState.promptPreview"
        type="textarea"
        :rows="14"
        readonly
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemConfig, previewAiPrompt, testAiConnection, updateSystemConfig } from '@/api/system-config'
import type { SystemConfigData } from '@/types'

const DEFAULT_POLISH_PROMPT_TEMPLATE =
  '你是一名专业简历顾问。请基于目标岗位 {{jobTitle}} 和模块类型 {{sectionType}}，对下面的简历内容进行润色，输出更适合求职简历的版本：\n{{input}}'

const DEFAULT_GENERATE_PROMPT_TEMPLATE =
  '你是一名专业简历顾问。请围绕目标岗位 {{jobTitle}} 生成简历摘要、技能关键词与项目示例，输出内容要简洁、职业、可直接用于简历。'

const defaultConfig = (): SystemConfigData => ({
  site: {
    siteName: '简历系统',
    siteLogo: '',
    contactEmail: 'support@example.com',
    contactPhone: '',
    icp: ''
  },
  email: {
    smtpHost: '',
    smtpPort: 465,
    smtpUser: '',
    smtpPass: '',
    fromName: '简历系统',
    fromEmail: '',
    encryption: 'ssl'
  },
  ai: {
    enabled: true,
    provider: 'mock',
    apiBaseUrl: '',
    apiKey: '',
    apiModel: 'mock-resume-polish',
    temperature: 0.7,
    dailyLimit: 500,
    perUserLimit: 20,
    polishPromptTemplate: DEFAULT_POLISH_PROMPT_TEMPLATE,
    generatePromptTemplate: DEFAULT_GENERATE_PROMPT_TEMPLATE
  }
})

const loading = ref(false)
const saving = ref(false)
const previewing = ref(false)
const testingConnection = ref(false)
const previewVisible = ref(false)
const previewState = reactive({
  taskType: 'polish' as 'polish' | 'generate',
  provider: '',
  model: '',
  promptPreview: '',
  executionMode: 'mock' as 'mock' | 'prepared' | 'live',
  configReady: true
})
const connectionState = reactive({
  title: '',
  message: '',
  badge: '',
  type: 'info' as 'success' | 'warning' | 'info' | 'error'
})
const form = reactive<SystemConfigData>(defaultConfig())

const aiConfigStatus = computed(() => {
  if (!form.ai.enabled) {
    return {
      label: 'AI 已停用',
      type: 'info' as const,
      message: '当前不会处理 AI 润色和 AI 生成请求。'
    }
  }

  if (form.ai.provider === 'mock') {
    return {
      label: 'Mock 联调模式',
      type: 'info' as const,
      message: '当前适合联调流程验证。后续切到真实服务时，再补齐 API Base URL、API Key 和模型即可。'
    }
  }

  const missingFields: string[] = []
  if (!form.ai.apiBaseUrl) missingFields.push('API Base URL')
  if (!form.ai.apiKey) missingFields.push('API Key')
  if (!form.ai.apiModel) missingFields.push('模型名称')

  if (missingFields.length) {
    return {
      label: '配置未完成',
      type: 'danger' as const,
      message: `当前 provider 已切到外部模式，但还缺少：${missingFields.join('、')}。这时运行时只会停留在 prepared 状态，不会真正发外部请求。`
    }
  }

  return {
    label: '配置已就绪',
    type: 'success' as const,
    message: '当前外部 provider 所需的关键字段已经补齐，可以先做连接测试，再决定是否投入真实联调。'
  }
})

function applyConfig(data: SystemConfigData) {
  const next = data || defaultConfig()
  Object.assign(form.site, next.site || {})
  Object.assign(form.email, next.email || {})
  Object.assign(form.ai, next.ai || {})
}

async function loadConfig() {
  loading.value = true
  try {
    const response = await getSystemConfig()
    applyConfig(response.data)
  } catch (error) {
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    const response = await updateSystemConfig({
      ai: { ...form.ai }
    })
    applyConfig(response.data)
    ElMessage.success('AI 配置已保存')
  } catch (error) {
    ElMessage.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

function resetPromptTemplates() {
  form.ai.polishPromptTemplate = DEFAULT_POLISH_PROMPT_TEMPLATE
  form.ai.generatePromptTemplate = DEFAULT_GENERATE_PROMPT_TEMPLATE
  ElMessage.success('已恢复默认 Prompt 模板')
}

async function handlePreviewPrompt(taskType: 'polish' | 'generate') {
  previewing.value = true
  try {
    const response = await previewAiPrompt({
      taskType,
      inputText: '负责前端页面开发和性能优化，推动项目按期交付。',
      sectionType: 'summary',
      jobTitle: '前端工程师'
    })
    Object.assign(previewState, response.data)
    previewVisible.value = true
  } catch (error) {
    ElMessage.error('预览 Prompt 失败')
  } finally {
    previewing.value = false
  }
}

async function handleTestConnection() {
  testingConnection.value = true
  try {
    const response = await testAiConnection({ ...form.ai })
    const data = response.data

    connectionState.message = data.message || ''
    connectionState.badge =
      data.status === 'success'
        ? '连通正常'
        : data.status === 'mock'
          ? 'Mock 模式'
          : data.status === 'incomplete'
            ? '待补配置'
            : '连接失败'

    if (data.success) {
      connectionState.title = '连接测试通过'
      connectionState.type = 'success'
      ElMessage.success('AI 连接测试通过')
    } else if (data.status === 'incomplete') {
      connectionState.title = '配置仍未完成'
      connectionState.type = 'warning'
      ElMessage.warning('请先补齐外部 provider 配置')
    } else {
      connectionState.title = '连接测试失败'
      connectionState.type = 'error'
      ElMessage.error('AI 连接测试失败')
    }

    if (data.endpoint) {
      connectionState.message = `${connectionState.message}\n测试地址：${data.endpoint}`
    }
  } catch (error) {
    connectionState.title = '连接测试失败'
    connectionState.message = '测试连接时发生异常，请稍后重试。'
    connectionState.badge = '连接失败'
    connectionState.type = 'error'
    ElMessage.error('测试连接失败')
  } finally {
    testingConnection.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.system-config-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
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
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 800;
  cursor: help;
}

.page-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.page-alert {
  margin-bottom: 4px;
}

.alert-detail-link {
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: help;
}

.config-card {
  border-radius: 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.status-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.prompt-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.prompt-header h3 {
  margin: 0;
}

@media (max-width: 960px) {
  .page-header,
  .prompt-header {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
