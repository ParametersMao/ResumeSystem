<template>
  <div class="projects-section">
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
import TimelineLayout from './projects/TimelineLayout.vue'
import SimpleLayout from './projects/SimpleLayout.vue'

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
    'timeline': TimelineLayout,
    'simple': SimpleLayout
  }
  
  return layoutMap[layoutType] || SimpleLayout
})
</script>
