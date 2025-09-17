<template>
  <div class="internship-section">
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
import TimelineLayout from './experience/TimelineLayout.vue'
import SimpleLayout from './experience/SimpleLayout.vue'

interface Props {
  data: any
  config?: any
  styles?: any
}

const props = defineProps<Props>()

const layoutComponent = computed(() => {
  const layoutType = props.config?.layout || 'simple'
  const layoutMap = {
    'timeline': TimelineLayout,
    'simple': SimpleLayout
  }
  return layoutMap[layoutType] || SimpleLayout
})
</script>


