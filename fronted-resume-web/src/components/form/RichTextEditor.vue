<template>
  <div class="rich-text-editor">
    <div class="rte-toolbar">
      <div class="left-tools">
        <label v-if="label" class="field-label">
          {{ label }}
          <span v-if="required" class="required">*</span>
        </label>
      </div>
      <div class="right-tools">
        <el-popover placement="bottom" trigger="click" width="200">
          <div class="icon-grid">
            <span
              v-for="icon in ICON_PRESETS"
              :key="icon"
              class="icon-item"
              @click="insertIcon(icon)"
            >
              {{ icon }}
            </span>
          </div>
          <template #reference>
            <el-button size="small" class="icon-btn">插入图标</el-button>
          </template>
        </el-popover>
        <el-button size="small" class="ai-btn" @click="emitAi">AI润色</el-button>
      </div>
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
import { ref, onBeforeUnmount, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor-next/editor-for-vue'
import '@wangeditor-next/editor/dist/css/style.css'
import { createEmptyRichText, normalizeRichTextValue } from '@/utils/richText'
import type { RichTextValue } from '@/types/resume'

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

const ICON_PRESETS = ['✔️', '⭐', '🔥', '💡', '🚀', '📌', '🎯', '💼']

const editorRef = ref<any>()
const valueHtml = ref('')
const currentValue = ref<RichTextValue>(createEmptyRichText())

const toolbarConfig = {
  excludeKeys: ['uploadImage', 'uploadVideo', 'insertTable', 'codeBlock', 'insertLink']
}

const editorConfig = {
  placeholder: props.placeholder,
  MENU_CONF: {}
}

watch(
  () => props.modelValue,
  (newValue) => {
    const normalized = normalizeRichTextValue(newValue)
    currentValue.value = normalized
    if (normalized.html !== valueHtml.value) {
      valueHtml.value = normalized.html
      if (editorRef.value && typeof editorRef.value.setHtml === 'function') {
        const html = normalized.html || '<p><br></p>'
        if (editorRef.value.getHtml() !== html) {
          editorRef.value.setHtml(html)
        }
      }
    }
  },
  { immediate: true, deep: true }
)

function handleCreated(editor: any) {
  editorRef.value = editor
  if (currentValue.value.html) {
    editor.setHtml(currentValue.value.html)
  }
}

function handleChange(editor: any) {
  const html = editor.getHtml()
  const text = editor.getText()
  const json = Array.isArray(editor.children) ? editor.children : []
  const normalized = normalizeRichTextValue({ html, text, json })
  currentValue.value = normalized
  valueHtml.value = normalized.html
  emit('update:modelValue', normalized)
}

function emitAi() {
  const html = editorRef.value?.getHtml?.() || valueHtml.value || ''
  emit('ai', html)
}

function insertIcon(icon: string) {
  if (!editorRef.value) return
  editorRef.value.insertText?.(`${icon} `)
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (!editor) return
  editor.destroy?.()
})
</script>

<style scoped>
.rich-text-editor {
  margin-bottom: 16px;
}

.field-label {
  display: block;
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

.right-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.icon-item {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.icon-item:hover {
  background: #f3f4f6;
}

.editor-toolbar {
  border-bottom: 1px solid #e5e7eb;
}

.editor-content {
  height: v-bind('props.height + "px"');
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.editor-content::-webkit-scrollbar {
  display: none;
}

:deep(.w-e-text-container) {
  background-color: #fff;
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

:deep(.w-e-scroll) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.w-e-scroll::-webkit-scrollbar) {
  display: none;
}
</style>
