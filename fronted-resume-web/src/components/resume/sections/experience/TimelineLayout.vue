<template>
  <div class="timeline-layout">
    <!-- 模块标题 -->
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '工作经历' }}
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
            <div class="company" :style="companyStyle">
              {{ item.company || '' }}
            </div>
            <div class="position" :style="positionStyle">
              {{ item.role || '' }}
            </div>
          </div>
          <div class="timeline-date" :style="dateStyle">
            {{ item.start || '' }} - {{ item.end || '' }}
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

interface Props {
  data: any
  config?: any
  styles?: any
}

const props = defineProps<Props>()

// 渲染富文本描述（兼容多种存储结构）
const renderDescription = (desc: any) => {
  if (typeof desc === 'string') return desc
  if (desc && typeof desc === 'object') {
    if (desc.html && typeof desc.html === 'string') return desc.html
    if (Array.isArray(desc.json)) return convertJsonToHtml(desc.json)
    if (Array.isArray(desc.ops)) return desc.ops.map((op: any) => op.insert).join('')
  }
  return ''
}

// 简易 JSON -> HTML 转换（与富文本组件保持一致）
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
  marginBottom: props.data?.style?.elementSpacing || '20px',
  paddingBottom: '15px',
  borderBottom: props.config?.itemSeparator === 'dashed' ? '1px dashed #f0f0f0' : '1px solid #f0f0f0',
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

const companyStyle = computed(() => ({
  fontSize: '16px',
  fontWeight: '600',
  color: props.styles?.colors?.text || '#333',
  marginBottom: '5px',
  ...props.config?.companyStyle
}))

const positionStyle = computed(() => ({
  fontSize: '14px',
  color: props.styles?.colors?.text || '#333',
  marginBottom: '8px',
  ...props.config?.positionStyle
}))

const dateStyle = computed(() => ({
  fontSize: '14px',
  color: props.styles?.colors?.primary || '#4a90a4',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  marginLeft: '20px',
  ...props.config?.dateStyle
}))

const descriptionStyle = computed(() => ({
  fontSize: '14px',
  lineHeight: '1.6',
  color: props.styles?.colors?.text || '#333',
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
</style>
