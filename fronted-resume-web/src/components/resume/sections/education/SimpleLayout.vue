<template>
  <div class="simple-layout">
    <!-- 模块标题 -->
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '教育背景' }}
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
          <div class="school" :style="schoolStyle">
            {{ item.school || '' }}
          </div>
          <div class="date" :style="dateStyle">
            {{ (item.duration && item.duration.start) || '' }} - {{ (item.duration && item.duration.end) || '' }}
          </div>
        </div>
        <div class="degree" :style="degreeStyle">
          {{ item.degree || '' }}
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
  padding: props.config?.padding,
  ...props.config?.containerStyle
}))

const itemStyle = computed(() => ({
  marginBottom: props.data?.style?.elementSpacing || props.styles?.spacing?.elementMargin || '15px',
  paddingBottom: '15px',
  borderBottom: props.config?.itemSeparator === 'dashed' ? '1px dashed #e2e8f0' : '1px solid #e2e8f0',
  ...props.config?.itemStyle
}))

const headerStyle = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  ...props.config?.headerStyle
}))

const schoolStyle = computed(() => ({
  fontSize: '18px',
  fontWeight: '600',
  color: props.styles?.colors?.text || '#334155',
  ...props.config?.schoolStyle
}))

const dateStyle = computed(() => ({
  fontSize: '14px',
  color: props.styles?.colors?.text || '#64748b',
  fontWeight: '500',
  ...props.config?.dateStyle
}))

const degreeStyle = computed(() => ({
  fontSize: '16px',
  color: props.styles?.colors?.primary || '#2c5aa0',
  fontWeight: '500',
  ...props.config?.degreeStyle
}))
</script>

<style scoped>
.simple-item:last-child {
  border-bottom: none;
}
</style>
