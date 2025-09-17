<template>
  <div class="personal-info-section">
    <!-- 根据配置选择不同的布局模式 -->
    <component 
      :is="layoutComponent" 
      :data="data" 
      :config="config" 
      :styles="styles"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted } from 'vue'
import CenterLayout from './personal/CenterLayout.vue'
import TableLayout from './personal/TableLayout.vue'
import CardLayout from './personal/CardLayout.vue'

interface Props {
  data: any
  config?: any
  styles?: any
}

const props = defineProps<Props>()

// 调试信息
onMounted(() => {
  console.log('PersonalInfoSection - props.data:', props.data)
  console.log('PersonalInfoSection - props.config:', props.config)
})

// 根据配置选择布局组件
const layoutComponent = computed(() => {
  const layoutType = props.config?.layout || 'center'
  
  const layoutMap = {
    'center': CenterLayout,
    'table': TableLayout, 
    'card': CardLayout
  }
  
  return layoutMap[layoutType] || CenterLayout
})
</script>
