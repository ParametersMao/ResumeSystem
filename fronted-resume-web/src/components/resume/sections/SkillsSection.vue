<template>
  <div class="skills-section">
    <component 
      :is="layoutComponent" 
      :data="data" 
      :config="config" 
      :styles="styles"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import ProgressLayout from './skills/ProgressLayout.vue'
import TagsLayout from './skills/TagsLayout.vue'
import SimpleLayout from './skills/SimpleLayout.vue'

interface Props {
  data: any
  config?: any
  styles?: any
}

const props = defineProps<Props>()

// 根据配置选择布局组件
const layoutComponent = computed(() => {
  const layoutType = props.config?.layout || 'simple'
  
  const layoutMap = {
    'progress': ProgressLayout,
    'tags': TagsLayout,
    'simple': SimpleLayout
  }
  
  return layoutMap[layoutType] || SimpleLayout
})
</script>
