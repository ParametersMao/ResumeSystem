<template>
  <div class="timeline-layout">
    <!-- 模块标题 -->
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '项目经历' }}
      <div v-if="config?.titleStyle === 'ribbon'" class="title-ribbon-arrow" :style="arrowStyle"></div>
    </div>
    
    <!-- 时间轴内容 -->
    <div class="timeline-container" :style="containerStyle">
      <div 
        v-for="(item, index) in data?.items || []" 
        :key="index"
        class="timeline-item"
        :style="itemStyle"
      >
        <div class="timeline-header" :style="headerStyle">
          <div class="timeline-content" :style="contentStyle">
            <div v-if="item.icon" class="icon-wrapper">
              {{ sanitizeIcon(item.icon) }}
            </div>
            <div class="text-block">
              <div class="project-name" :style="nameStyle">
                {{ item.name || '项目名称' }}
              </div>
              <div class="project-role" :style="roleStyle">
                {{ item.role || '项目角色' }}
              </div>
            </div>
          </div>
          <div class="timeline-date" :style="dateStyle">
            {{ formatDuration(item) }}
          </div>
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

// 渲染富文本描述（兼容多种存储结构）
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

const titleStyle = computed(() => {
  if (props.config?.titleStyle === 'ribbon') {
    return {
      position: 'relative',
      background: props.config?.titleConfig?.backgroundColor || props.styles?.colors?.primary || '#4a90a4',
      color: props.config?.titleConfig?.color || 'white',
      padding: props.config?.titleConfig?.padding || '12px 20px',
      margin: props.config?.titleConfig?.margin || '20px 0 15px 0',
      fontSize: props.config?.titleConfig?.fontSize || '18px',
      fontWeight: props.config?.titleConfig?.fontWeight || 'bold'
    }
  }
  return {
    fontSize: props.config?.titleStyle?.fontSize || '18px',
    fontWeight: props.config?.titleStyle?.fontWeight || '600',
    color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
    textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
    marginBottom: props.data?.style?.paragraphSpacing || '15px',
    borderBottom: `2px solid ${props.styles?.colors?.primary || '#333'}`,
    paddingBottom: '6px'
  }
})

const arrowStyle = computed(() => {
  const primaryColor = props.styles?.colors?.primary || '#4a90a4'
  return {
    content: '""',
    position: 'absolute',
    right: '-15px',
    top: '0',
    width: '0',
    height: '0',
    borderTop: `24px solid ${primaryColor}`,
    borderBottom: `24px solid ${primaryColor}`,
    borderRight: '15px solid transparent'
  }
})

const containerStyle = computed(() => ({
  marginBottom: '20px',
  padding: props.config?.padding,
  ...props.config?.containerStyle
}))

const itemStyle = computed(() => ({
  marginBottom: props.data?.style?.elementSpacing || '18px',
  paddingBottom: '12px',
  borderBottom: props.config?.itemSeparator === 'dashed'
    ? `1px dashed ${props.styles?.colors?.border || 'rgba(15, 23, 42, 0.12)'}`
    : `1px solid ${props.styles?.colors?.border || 'rgba(15, 23, 42, 0.12)'}`,
  ...props.config?.itemStyle
}))

const headerStyle = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '8px',
  ...props.config?.headerStyle
}))

const contentStyle = computed(() => ({
  flex: '1',
  ...props.config?.contentStyle
}))

const nameStyle = computed(() => ({
  fontSize: '16px',
  fontWeight: '600',
  color: props.styles?.colors?.text || '#111827',
  marginBottom: '5px',
  ...props.config?.nameStyle
}))

const roleStyle = computed(() => ({
  fontSize: '14px',
  color: props.styles?.colors?.primary || '#2563eb',
  marginBottom: '8px',
  ...props.config?.roleStyle
}))

const dateStyle = computed(() => ({
  fontSize: '14px',
  color: props.styles?.colors?.secondary || props.styles?.colors?.primary || '#2563eb',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  marginLeft: '20px',
  ...props.config?.dateStyle
}))

const descriptionStyle = computed(() => ({
  fontSize: '14px',
  lineHeight: '1.6',
  color: props.styles?.colors?.text || '#111827',
  ...props.config?.descriptionStyle
}))
</script>

<style scoped>
.timeline-item:last-child {
  border-bottom: none;
}

.title-ribbon-arrow {
  content: '';
  position: absolute;
  right: -15px;
  top: 0;
  width: 0;
  height: 0;
}

.icon-wrapper {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
}

.timeline-content {
  display: flex;
  align-items: center;
}

.text-block {
  flex: 1;
}
</style>
