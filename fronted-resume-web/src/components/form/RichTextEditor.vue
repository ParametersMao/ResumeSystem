<template>
  <div class="rich-text-editor">
    <div class="rte-toolbar">
      <label v-if="label" class="field-label">
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>
      <el-button size="small" class="ai-btn" @click="emitAi">AI润色</el-button>
    </div>

    <div class="editor-container">
      <Toolbar
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        class="editor-toolbar"
      />
      <Editor
        :defaultConfig="editorConfig"
        v-model="valueHtml"
        @onCreated="handleCreated"
        @onChange="handleChange"
        class="editor-content"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor-next/editor-for-vue'
import '@wangeditor-next/editor/dist/css/style.css'

interface Props {
  modelValue: any
  label?: string
  required?: boolean
  placeholder?: string
  height?: number
}

interface Emits {
  (e: 'update:modelValue', value: any): void
  (e: 'ai', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  placeholder: '请输入内容...'
})

const emit = defineEmits<Emits>()

// 编辑器实例
const editorRef = ref()

// 内容值 - 支持HTML和JSON两种格式
const valueHtml = ref('')

// 工具栏配置
const toolbarConfig = {
  excludeKeys: [
    'uploadImage',
    'uploadVideo', 
    'insertTable',
    'codeBlock',
    'insertLink'
  ]
}

// 编辑器配置
const editorConfig = {
  placeholder: props.placeholder,
  MENU_CONF: {}
}

// 监听props变化，同步到编辑器
watch(() => props.modelValue, (newValue) => {
  if (newValue && typeof newValue === 'object') {
    // 如果是JSON格式，转换为HTML
    try {
      if (Array.isArray(newValue)) {
        // wangeditor的JSON格式是数组
        editorRef.value?.setHtml(convertJsonToHtml(newValue))
      } else if (newValue.html) {
        valueHtml.value = newValue.html
      }
    } catch (error) {
      console.warn('富文本内容解析失败:', error)
      valueHtml.value = ''
    }
  } else if (typeof newValue === 'string') {
    valueHtml.value = newValue
  }
}, { immediate: true })

// 编辑器创建完成
function handleCreated(editor: any) {
  editorRef.value = editor
}

// 内容变化处理
function handleChange(editor: any) {
  const html = editor.getHtml()
  const json = editor.children // wangeditor-next的JSON格式
  
  // 发送包含HTML和JSON的对象
  emit('update:modelValue', {
    html: html,
    json: json,
    text: editor.getText() // 纯文本
  })
}

function emitAi() {
  const html = editorRef.value?.getHtml?.() || valueHtml.value || ''
  emit('ai', html)
}

// JSON转HTML的简单实现（可以根据需要扩展）
function convertJsonToHtml(jsonData: any[]): string {
  if (!Array.isArray(jsonData)) return ''
  
  return jsonData.map(node => {
    if (typeof node === 'string') return node
    
    const { type, children } = node
    const childrenHtml = children ? convertJsonToHtml(children) : ''
    
    switch (type) {
      case 'paragraph':
        return `<p>${childrenHtml}</p>`
      case 'header':
        const level = node.level || 1
        return `<h${level}>${childrenHtml}</h${level}>`
      case 'list-item':
        return `<li>${childrenHtml}</li>`
      case 'bulleted-list':
        return `<ul>${childrenHtml}</ul>`
      case 'numbered-list':
        return `<ol>${childrenHtml}</ol>`
      default:
        return childrenHtml
    }
  }).join('')
}

// 组件销毁前清理
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style scoped>
.rich-text-editor {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

.editor-container {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.rte-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.ai-btn { margin-left: 8px; }

.editor-toolbar {
  border-bottom: 1px solid #e5e7eb;
}

.editor-content {
  height: v-bind('props.height + "px"');
  overflow-y: auto;
  
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.editor-content::-webkit-scrollbar {
  display: none; /* WebKit */
}

/* 自定义编辑器样式 */
:deep(.w-e-text-container) {
  background-color: #fff;
  /* 隐藏编辑器内部滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.w-e-text-container::-webkit-scrollbar) {
  display: none;
}

:deep(.w-e-text-placeholder) {
  color: #9ca3af;
}

:deep(.w-e-toolbar) {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

/* 隐藏编辑器滚动条的所有可能容器 */
:deep(.w-e-scroll) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.w-e-scroll::-webkit-scrollbar) {
  display: none;
}
</style>
