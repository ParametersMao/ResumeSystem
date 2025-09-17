<template>
  <div class="simple-layout">
    <!-- 模块标题 -->
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '专业技能' }}
    </div>
    
    <!-- 简单列表 -->
    <div class="simple-container" :style="containerStyle">
      <div class="skills-list" :style="listStyle">
        {{ skillsList }}
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

const skillsList = computed(() => {
  const skills = props.data?.items || []
  const skillNames = skills.map((skill: any) => {
    if (typeof skill === 'string') return skill
    return skill?.name || skill?.category || '技能'
  })
  return skillNames.join(' · ')
})

const titleStyle = computed(() => ({
  fontSize: props.config?.titleStyle?.fontSize || '18px',
  fontWeight: props.config?.titleStyle?.fontWeight || '600',
  color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
  textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
  marginBottom: props.data?.style?.paragraphSpacing || '15px',
  borderBottom: `2px solid ${props.styles?.colors?.primary || '#333'}`,
  paddingBottom: '6px',
  ...props.config?.titleStyle?.customStyle
}))

const containerStyle = computed(() => ({
  padding: props.config?.padding,
  ...props.config?.containerStyle
}))

const listStyle = computed(() => ({
  fontSize: props.config?.listStyle?.fontSize || '15px',
  lineHeight: props.config?.listStyle?.lineHeight || '1.6',
  color: props.config?.listStyle?.color || props.styles?.colors?.text || '#333',
  marginBottom: props.data?.style?.elementSpacing || props.styles?.spacing?.elementMargin || '15px',
  ...props.config?.listStyle?.customStyle
}))
</script>
