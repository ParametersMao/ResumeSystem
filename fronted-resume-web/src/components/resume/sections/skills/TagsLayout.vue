<template>
  <div class="tags-layout">
    <!-- 模块标题 -->
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '技能专长' }}
    </div>
    
    <!-- 技能标签 -->
    <div class="tags-container" :style="containerStyle">
      <span 
        v-for="(skill, index) in data?.items || []" 
        :key="index"
        class="skill-tag"
        :style="tagStyle"
      >
        {{ getSkillName(skill) }}
      </span>
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

const getSkillName = (skill: any) => {
  if (typeof skill === 'string') return skill
  return skill?.name || skill?.category || '技能'
}

const titleStyle = computed(() => ({
  fontSize: props.config?.titleStyle?.fontSize || '20px',
  fontWeight: props.config?.titleStyle?.fontWeight || '600',
  color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#2c5aa0',
  marginBottom: '20px',
  borderBottom: props.config?.titleStyle?.borderBottom || `3px solid ${props.styles?.colors?.primary || '#2c5aa0'}`,
  paddingBottom: '8px',
  ...props.config?.titleStyle?.customStyle
}))

const containerStyle = computed(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: props.config?.gap || '10px',
  ...props.config?.containerStyle
}))

const tagStyle = computed(() => ({
  display: 'inline-block',
  backgroundColor: props.config?.tagStyle?.backgroundColor || '#f1f5f9',
  color: props.config?.tagStyle?.color || '#334155',
  padding: props.config?.tagStyle?.padding || '6px 14px',
  borderRadius: props.config?.tagStyle?.borderRadius || '20px',
  fontSize: props.config?.tagStyle?.fontSize || '14px',
  fontWeight: props.config?.tagStyle?.fontWeight || '500',
  border: props.config?.tagStyle?.border || 'none',
  cursor: 'default',
  transition: 'all 0.2s ease',
  ...props.config?.tagStyle?.customStyle
}))
</script>

<style scoped>
.skill-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
