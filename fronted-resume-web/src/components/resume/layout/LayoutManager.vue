<template>
  <component 
    :is="layoutComponent" 
    :layout-config="layoutConfig"
    :sections="sections"
    :section-styles="sectionStyles"
  />
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import SingleColumnLayout from './SingleColumnLayout.vue'
import TwoColumnLayout from './TwoColumnLayout.vue'
import ThreeColumnLayout from './ThreeColumnLayout.vue'
import CustomLayout from './CustomLayout.vue'

interface Props {
  layoutConfig: {
    type: string;
    columns?: {
      count?: number;
      widths?: string[];
      gap?: string;
      leftStyle?: Record<string, string>;
      rightStyle?: Record<string, string>;
    };
    container?: Record<string, string>;
    content?: Record<string, string>;
    custom?: any;
  };
  sections: any[];
  sectionStyles?: Record<string, any>;
}

const props = defineProps<Props>()

// 布局组件映射
const layoutComponentMap: Record<string, any> = {
  'single-column': SingleColumnLayout,
  'two-column': TwoColumnLayout,
  'three-column': ThreeColumnLayout,
  'custom': CustomLayout
}

// 根据配置决定使用哪个布局组件
const layoutComponent = computed(() => {
  const layoutType = props.layoutConfig?.type || 'single-column'
  console.log('LayoutManager: 使用布局类型', layoutType, '配置:', props.layoutConfig)
  const component = layoutComponentMap[layoutType] || SingleColumnLayout
  console.log('LayoutManager: 选择的布局组件', layoutType, '=>', component.name || '未命名组件')
  return component
})
</script>
