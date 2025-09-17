<template>
  <div class="progress-layout">
    <!-- 模块标题 -->
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '专业技能' }}
      <div v-if="config?.titleStyle === 'ribbon'" class="title-ribbon-arrow" :style="arrowStyle"></div>
    </div>
    
    <!-- 技能网格 -->
    <div class="skills-grid" :style="gridStyle">
      <div 
        v-for="(skill, index) in data?.items || []" 
        :key="index"
        class="skill-item"
        :style="itemStyle"
      >
        <div class="skill-name" :style="nameStyle">
          {{ getSkillName(skill) }}
        </div>
        <div class="skill-progress" :style="progressStyle">
          <div 
            class="skill-progress-bar" 
            :style="progressBarStyle(getSkillLevel(skill))"
          ></div>
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

const getSkillName = (skill: any) => {
  if (typeof skill === 'string') return skill
  return skill?.name || skill?.category || '技能'
}

const getSkillLevel = (skill: any) => {
  if (typeof skill === 'string') return 80 // 默认进度
  return skill?.level || skill?.progress || 80
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

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.config?.columns || 3}, 1fr)`,
  gap: props.config?.gap || '20px',
  marginTop: '15px',
  ...props.config?.gridStyle
}))

const itemStyle = computed(() => ({
  marginBottom: '15px',
  ...props.config?.itemStyle
}))

const nameStyle = computed(() => ({
  fontWeight: 'bold',
  marginBottom: '5px',
  fontSize: '14px',
  color: props.styles?.colors?.text || '#333',
  ...props.config?.nameStyle
}))

const progressStyle = computed(() => ({
  width: '100%',
  height: '6px',
  backgroundColor: '#e0e0e0',
  borderRadius: '3px',
  overflow: 'hidden',
  ...props.config?.progressStyle
}))

const progressBarStyle = (level: number) => computed(() => ({
  height: '100%',
  backgroundColor: props.styles?.colors?.primary || '#4a90a4',
  borderRadius: '3px',
  width: `${level}%`,
  transition: 'width 0.3s ease',
  ...props.config?.progressBarStyle
}))
</script>

<style scoped>
.title-ribbon-arrow {
  content: '';
  position: absolute;
  right: -15px;
  top: 0;
  width: 0;
  height: 0;
}
</style>
