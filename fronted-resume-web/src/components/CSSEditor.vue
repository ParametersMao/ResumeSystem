<template>
  <div class="css-editor">
    <div class="editor-header">
      <h3>自定义CSS编辑器</h3>
      <div class="editor-actions">
        <el-button size="small" @click="resetCSS">重置</el-button>
        <el-button size="small" type="primary" @click="applyCSS">应用</el-button>
      </div>
    </div>
    
    <div class="editor-content">
      <el-input
        v-model="cssCode"
        type="textarea"
        :rows="15"
        placeholder="在这里输入自定义CSS代码..."
        class="css-textarea"
      />
      
      <div class="editor-help">
        <h4>使用说明：</h4>
        <ul>
          <li><code>.resume-renderer</code> - 整个简历预览容器（新版引擎）</li>
          <li><code>.resume-content</code> - 简历内容区域</li>
          <li><code>.resume-section</code> - 单个模块容器</li>
          <li><code>.skill-tag</code> - 技能标签</li>
          <li><code>.timeline-item</code> - 时间线项目</li>
        </ul>
        
        <h4>示例：</h4>
        <div class="example-code">
          <pre><code>.resume-renderer {
  border: 2px solid #3498db;
  border-radius: 10px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.resume-content {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.skill-tag {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  margin: 2px;
}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'apply', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const cssCode = ref(props.modelValue || '')

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  cssCode.value = newValue || ''
})

// 监听内部值变化
watch(cssCode, (newValue) => {
  emit('update:modelValue', newValue)
})

// 应用CSS
function applyCSS() {
  emit('apply', cssCode.value)
}

// 重置CSS
function resetCSS() {
  cssCode.value = ''
  emit('update:modelValue', '')
  emit('apply', '')
}
</script>

<style scoped>
.css-editor {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.editor-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.editor-content {
  padding: 16px;
}

.css-textarea {
  margin-bottom: 16px;
}

.css-textarea :deep(.el-textarea__inner) {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.editor-help {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
}

.editor-help h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.editor-help ul {
  margin: 8px 0;
  padding-left: 20px;
}

.editor-help li {
  margin: 4px 0;
}

.editor-help code {
  background: #e9ecef;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.example-code {
  margin-top: 12px;
}

.example-code pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
}

.example-code code {
  background: none;
  padding: 0;
  color: inherit;
}
</style>
