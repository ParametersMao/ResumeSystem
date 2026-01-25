<template>
  <div class="simple-layout">
    <!-- 模块标题 -->
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '项目经历' }}
    </div>
    
    <!-- 简单列表内容 -->
    <div class="simple-container" :style="containerStyle">
      <div 
        v-for="(item, index) in data?.items || []" 
        :key="index"
        class="simple-item"
        :style="itemStyle"
      >
        <div class="item-header" :style="headerStyle">
          <div class="icon-wrapper" v-if="item.icon">
            {{ sanitizeIcon(item.icon) }}
          </div>
          <div class="project-name" :style="nameStyle">
            {{ item.name || '项目名称' }}
          </div>
          <div class="date" :style="dateStyle">
            {{ formatDuration(item) }}
          </div>
        </div>
        <div class="project-role" :style="roleStyle">
          {{ item.role || '项目角色' }}
        </div>
        <div v-if="item.desc" class="description" :style="descriptionStyle">
          <div v-html="renderDescription(item.desc)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { normalizeRichTextValue } from '@/utils/richText'

interface Props {
  data: any
  config?: any
  styles?: any
}

const props = defineProps<Props>()

// 渲染富文本描述（兼容 { html, json, text } / Quill ops / string）
const renderDescription = (desc: any) => normalizeRichTextValue(desc).html

const sanitizeIcon = (icon: any) => {
  if (!icon) return ''
  const value = typeof icon === 'string' ? icon : icon?.text || ''
  return value?.slice(0, 2) || ''
}

const formatDuration = (item: any) => {
  const duration = item?.duration || {}
  const start = duration.start ?? item.start ?? ''
  const end = duration.end ?? item.end ?? ''
  const fallback = item.date || ''
  if (start && end) return `${start} - ${end}`
  if (start) return start
  if (end) return end
  return fallback
}

const titleStyle = computed(() => ({
  fontSize: props.config?.titleStyle?.fontSize || '20px',
  fontWeight: props.config?.titleStyle?.fontWeight || '600',
  color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#2c5aa0',
  textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
  marginBottom: props.data?.style?.paragraphSpacing || '20px',
  borderBottom: props.config?.titleStyle?.borderBottom || `3px solid ${props.styles?.colors?.primary || '#2c5aa0'}`,
  paddingBottom: '8px',
  ...props.config?.titleStyle?.customStyle
}))

const containerStyle = computed(() => ({
  display: 'block',
  padding: props.config?.padding,
  ...props.config?.containerStyle
}))

const itemStyle = computed(() => ({
  marginBottom: props.data?.style?.elementSpacing || props.styles?.spacing?.elementMargin || '15px',
  paddingBottom: '20px',
  borderBottom: props.config?.itemSeparator === 'dashed' ? '1px dashed #e2e8f0' : '1px solid #e2e8f0',
  ...props.config?.itemStyle
}))

const headerStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  ...props.config?.headerStyle
}))

const nameStyle = computed(() => ({
  fontSize: '18px',
  fontWeight: '600',
  color: props.styles?.colors?.text || '#334155',
  ...props.config?.nameStyle
}))

const dateStyle = computed(() => ({
  fontSize: '14px',
  color: props.styles?.colors?.text || '#64748b',
  fontWeight: '500',
  ...props.config?.dateStyle
}))

const roleStyle = computed(() => ({
  fontSize: '16px',
  color: props.styles?.colors?.primary || '#2c5aa0',
  fontWeight: '500',
  marginBottom: '10px',
  ...props.config?.roleStyle
}))

const descriptionStyle = computed(() => ({
  fontSize: '14px',
  lineHeight: '1.6',
  color: props.styles?.colors?.text || '#475569',
  ...props.config?.descriptionStyle
}))
</script>

<style scoped>
.simple-item:last-child {
  border-bottom: none;
}

.icon-wrapper {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.12);
  color: #2573d5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
</style>
