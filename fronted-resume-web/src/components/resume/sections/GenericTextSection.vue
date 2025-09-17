<template>
  <div class="generic-text-section">
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || defaultTitle }}
    </div>
    <div class="section-content" :style="contentStyle">
      <div v-if="htmlContent" v-html="htmlContent"></div>
      <div v-else>{{ plainText }}</div>
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

const defaultTitle = computed(() => props.config?.fallbackTitle || '内容')
const fieldName = computed(() => props.config?.fieldName || 'text')

const raw = computed(() => {
  // 1) 直接字段（data.text 或 data.intention 等）
  if (props.data && typeof props.data === 'object') {
    const direct = (props.data as any)[fieldName.value]
    if (direct !== undefined) return direct
  }
  // 2) content 容器
  if (props.data?.content && typeof props.data.content === 'object') {
    const v = (props.data.content as any)[fieldName.value]
    if (v !== undefined) return v
  }
  // 3) items[0] 对象（object 单项模块）
  const items = (props.data as any)?.items
  if (Array.isArray(items) && items.length > 0 && items[0] && typeof items[0] === 'object') {
    const v = (items[0] as any)[fieldName.value]
    if (v !== undefined) return v
  }
  return ''
})

const htmlContent = computed(() => {
  const val = raw.value
  if (val && typeof val === 'object' && val.html) return val.html
  return ''
})
const plainText = computed(() => {
  const val = raw.value
  if (typeof val === 'string') return val
  if (val && typeof val === 'object' && val.text) return val.text
  return ''
})

const titleStyle = computed(() => ({
  fontSize: props.config?.titleStyle?.fontSize || '18px',
  fontWeight: props.config?.titleStyle?.fontWeight || '600',
  color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
  textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
  marginBottom: props.data?.style?.paragraphSpacing || '15px',
  borderBottom: props.config?.titleStyle?.borderBottom || `2px solid ${props.styles?.colors?.primary || '#333'}`,
  paddingBottom: '6px',
  ...props.config?.titleStyle?.customStyle
}))

const contentStyle = computed(() => ({
  fontSize: props.config?.contentStyle?.fontSize || '15px',
  lineHeight: props.config?.contentStyle?.lineHeight || '1.7',
  color: props.config?.contentStyle?.color || props.styles?.colors?.text || '#333',
  padding: props.config?.padding,
  ...props.config?.contentStyle?.customStyle
}))
</script>


