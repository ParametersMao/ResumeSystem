<template>
  <div class="ai-panel" v-if="visible">
    <div class="ai-header">
      <div class="title">AI润色显示区</div>
      <div class="actions">
        <el-button size="small" @click="$emit('close')">关闭</el-button>
        <el-button size="small" type="primary" @click="refresh">重新生成</el-button>
      </div>
    </div>

    <div class="hint">仅在富文本有内容并点击“AI润色”后显示候选结果</div>

    <div class="candidates">
      <div
        v-for="(s, idx) in suggestions"
        :key="idx"
        class="candidate"
      >
        <div class="candidate-meta">
          <el-tag size="small" type="info">{{ s.reason }}</el-tag>
        </div>
        <div class="candidate-content" v-html="s.html"></div>
        <div class="candidate-actions">
          <el-button size="small" type="success" @click="$emit('apply', s.html)">应用</el-button>
          <el-button size="small" type="danger" @click="remove(idx)">删除</el-button>
        </div>
      </div>
      <div v-if="loading" class="empty">生成中…</div>
      <div v-else-if="!suggestions.length" class="empty">暂无候选，点击上方“重新生成”。</div>
    </div>
  </div>
  <div v-else class="ai-panel-collapsed"></div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue'
import type { PolishSuggestion } from '@/api/ai'

interface Props {
  visible: boolean
  inputText: string | undefined
}

const props = defineProps<Props>()

const suggestions = ref<PolishSuggestion[]>([])
const loading = ref(false)

const MOCK_SUGGESTIONS: PolishSuggestion[] = [
  {
    reason: '版本一：技术硬核风（突出算法 / 架构能力）',
    html: '<p>负责智能体（Agent）架构设计与功能开发，参与多智能体协作流程搭建、工具调用逻辑实现与 prompt 工程优化。基于大模型接口完成感知、决策、执行闭环开发，优化智能体任务拆解与规划能力，提升复杂场景下的执行稳定性与任务完成率，具备从需求分析到落地调试的全流程实践经验。</p>'
  },
  {
    reason: '版本二：项目成果风（突出产出与业务价值）',
    html: '<p>参与企业级智能体产品的需求分析、原型设计与迭代开发，协助完成对话交互、任务自动化及外部工具集成等核心模块。通过流程优化与效果调优，提升智能体响应准确率与用户体验，输出可落地的技术方案与测试报告，具备较强的工程实践与问题解决能力。</p>'
  },
  {
    reason: '版本三：简洁专业风（通用、适配大多数简历）',
    html: '<p>担任智能体开发实习生，主要负责 Agent 功能实现、逻辑调试与效果优化。参与基于大模型的智能交互系统开发，熟悉智能体决策流程、工具调用机制与项目开发规范，能够独立完成分配的开发与验证任务，具备扎实的工程开发与协作能力。</p>'
  }
]

async function refresh() {
  const text = String(props.inputText || '')
  if (!text.trim()) {
    suggestions.value = []
    return
  }
  loading.value = true
  try {
    // 这里使用固定 mock 数据（仅用于 AI 润色展示区）
    await new Promise((r) => setTimeout(r, 200))
    suggestions.value = [...MOCK_SUGGESTIONS]
  } catch {
    suggestions.value = [...MOCK_SUGGESTIONS]
  } finally {
    loading.value = false
  }
}

function remove(index: number) {
  suggestions.value.splice(index, 1)
}

watch(() => props.inputText, (t) => {
  if (!t || !t.toString().trim()) {
    suggestions.value = []
    return
  }
  refresh()
}, { immediate: true })
</script>

<style scoped>
.ai-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
}
.ai-panel-collapsed { display: none; }
.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 12px;
  border-bottom: 1px solid #e5e7eb;
}
.title { font-weight: 600; }
.hint {
  font-size: 12px;
  color: #6b7280;
  padding: 8px 12px;
}
.candidates {
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.candidate {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px;
  background: #fafbfc;
}
.candidate-meta { margin-bottom: 8px; display: flex; justify-content: flex-start; }
.candidate-content { font-size: 14px; line-height: 1.6; }
.candidate-actions { margin-top: 8px; display: flex; gap: 8px; }
.empty { color: #9ca3af; font-size: 12px; padding: 16px; text-align: center; }
</style>


