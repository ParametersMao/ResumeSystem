<template>
  <div class="custom-section">
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '自定义模块' }}
    </div>
    
    <div class="section-content" :style="contentStyle">
      <div v-if="data?.items?.length" class="items-list">
        <div 
          v-for="(item, index) in data.items" 
          :key="index" 
          class="item" 
          :style="itemStyle"
        >
          <!-- 仅按配置的字段顺序渲染 -->
          <div 
            v-for="field in (config?.fields || [])"
            :key="field.name"
            class="field"
          >
            <strong v-if="field.label">{{ field.label }}：</strong>
            <span v-if="field.type === 'dateRange'" class="field-date-range">
              {{ formatDateRange(item[field.name]) }}
            </span>
            <span v-else-if="!isRichTextField(field)" class="field-text">
              {{ formatPlain(item[field.name]) }}
            </span>
            <span v-else class="field-rich" v-html="renderRich(item[field.name])"></span>
          </div>
          

        </div>
      </div>
      <div v-else class="empty-state">
        暂无内容
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

interface Props {
  data: any
  config?: any
  styles?: any
}

const props = defineProps<Props>()

const titleStyle = computed(() => ({
  fontSize: props.config?.titleStyle?.fontSize || '18px',
  fontWeight: props.config?.titleStyle?.fontWeight || '600',
  color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
  marginBottom: props.config?.titleStyle?.marginBottom || '15px',
  borderBottom: props.config?.titleStyle?.borderBottom || `2px solid ${props.styles?.colors?.primary || '#333'}`,
  paddingBottom: '6px',
  ...props.config?.titleStyle?.customStyle
}))

const contentStyle = computed(() => ({
  fontSize: props.config?.contentStyle?.fontSize || '14px',
  lineHeight: props.config?.contentStyle?.lineHeight || '1.6',
  color: props.config?.contentStyle?.color || props.styles?.colors?.text || '#666',
  ...props.config?.contentStyle?.customStyle
}))

const itemStyle = computed(() => ({
  marginBottom: props.config?.itemStyle?.marginBottom || '15px',
  padding: props.config?.itemStyle?.padding || '10px',
  border: props.config?.itemStyle?.border || '1px solid #f0f0f0',
  borderRadius: props.config?.itemStyle?.borderRadius || '4px',
  ...props.config?.itemStyle?.customStyle
}))

// 工具：判断是否富文本字段
function isRichTextField(field: any): boolean {
  return field?.type === 'textarea' && field?.richText === true
}

// 工具：渲染富文本内容（兼容多种结构）
function renderRich(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    if (typeof value.html === 'string') return value.html
    if (Array.isArray(value.json)) return convertJsonToHtml(value.json)
    if (Array.isArray(value.ops)) return value.ops.map((op: any) => op.insert).join('')
  }
  return ''
}

// 工具：普通文本格式化
function formatPlain(val: any): string {
  if (val == null) return ''
  if (typeof val === 'object') {
    return ''
  }
  return String(val)
}

// 工具：格式化时间区间
function formatDateRange(val: any): string {
  if (!val || typeof val !== 'object') return ''
  const { start, end } = val
  if (start && end) {
    return `${start} - ${end}`
  } else if (start) {
    return start
  } else if (end) {
    return end
  }
  return ''
}

// 简易 JSON -> HTML 转换
function convertJsonToHtml(jsonData: any[]): string {
  if (!Array.isArray(jsonData)) return ''
  return jsonData
    .map((node: any) => {
      if (typeof node === 'string') return node
      const { type, children } = node || {}
      const childrenHtml = children ? convertJsonToHtml(children) : ''
      switch (type) {
        case 'paragraph':
          return `<p>${childrenHtml}</p>`
        case 'header': {
          const level = node.level || 1
          return `<h${level}>${childrenHtml}</h${level}>`
        }
        case 'list-item':
          return `<li>${childrenHtml}</li>`
        case 'bulleted-list':
          return `<ul>${childrenHtml}</ul>`
        case 'numbered-list':
          return `<ol>${childrenHtml}</ol>`
        default:
          return childrenHtml
      }
    })
    .join('')
}
</script>
