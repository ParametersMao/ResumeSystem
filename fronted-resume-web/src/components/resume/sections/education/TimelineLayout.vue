<template>
  <div class="timeline-layout">
    <!-- 模块标题 -->
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '教育背景' }}
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
            <div class="school" :style="schoolStyle">
              {{ item.school || '' }}
            </div>
            <div class="degree" :style="degreeStyle">
              {{ item.degree || '' }}
            </div>
          </div>
          <div class="timeline-date" :style="dateStyle">
            {{ item.start || '' }} - {{ item.end || '' }}
          </div>
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
    marginBottom: '15px',
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
  ...props.config?.containerStyle
}))

const itemStyle = computed(() => ({
  marginBottom: '20px',
  paddingBottom: '15px',
  borderBottom: '1px solid #f0f0f0',
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

const schoolStyle = computed(() => ({
  fontSize: '16px',
  fontWeight: '600',
  color: props.styles?.colors?.text || '#333',
  marginBottom: '5px',
  ...props.config?.schoolStyle
}))

const degreeStyle = computed(() => ({
  fontSize: '14px',
  color: props.styles?.colors?.text || '#333',
  ...props.config?.degreeStyle
}))

const dateStyle = computed(() => ({
  fontSize: '14px',
  color: props.styles?.colors?.primary || '#4a90a4',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  marginLeft: '20px',
  ...props.config?.dateStyle
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
