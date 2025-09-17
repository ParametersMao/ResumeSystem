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
        <div class="candidate-content" v-html="s"></div>
        <div class="candidate-actions">
          <el-button size="small" type="success" @click="$emit('apply', s)">应用</el-button>
          <el-button size="small" type="danger" @click="remove(idx)">删除</el-button>
        </div>
      </div>
      <div v-if="!suggestions.length" class="empty">暂无候选，点击上方“重新生成”。</div>
    </div>
  </div>
  <div v-else class="ai-panel-collapsed"></div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue'

interface Props {
  visible: boolean
  inputText: string | undefined
}

const props = defineProps<Props>()

const suggestions = ref<string[]>([])

function mockGenerate(text: string): string[] {
  if (!text || !text.trim()) return []
  const base = text.replace(/\n/g, ' ').trim()
  return [
    `【精简版】${base.substring(0, 60)}…`,
    `【结果导向】在该经历中，我主导完成：${base.substring(0, 50)}…，带来可量化提升。`,
    `【行动-影响】通过…（行动），实现…（影响）。${base.substring(0, 40)}…`,
    `【要点列举】<ul><li>${base.slice(0, 20)}</li><li>${base.slice(20, 40)}</li><li>${base.slice(40, 60)}</li></ul>`,
    `【岗位匹配】围绕目标岗位需求，突出：${base.substring(0, 50)}…`
  ]
}

function refresh() {
  suggestions.value = mockGenerate(String(props.inputText || ''))
}

function remove(index: number) {
  suggestions.value.splice(index, 1)
}

watch(() => props.inputText, (t) => {
  if (t && t.toString().trim()) {
    suggestions.value = mockGenerate(String(t))
  } else {
    suggestions.value = []
  }
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
.candidate-content { font-size: 14px; line-height: 1.6; }
.candidate-actions { margin-top: 8px; display: flex; gap: 8px; }
.empty { color: #9ca3af; font-size: 12px; padding: 16px; text-align: center; }
</style>


