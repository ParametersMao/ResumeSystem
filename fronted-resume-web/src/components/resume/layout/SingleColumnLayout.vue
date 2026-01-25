<template>
  <div class="resume-layout single-column-layout" :style="containerStyle">
    <div class="resume-content" :style="contentStyle">
      <section 
        v-for="section in sortedSections" 
        :key="section.id"
        :class="['resume-section', `section-${section.type}`]"
        :style="getSectionStyle(section)"
      >
        <slot 
          :name="`section-${section.id}`" 
          :section="section"
          :section-style="getSectionStyleObj(section)"
        >
          <!-- 默认槽内容将由父组件控制 -->
          <component 
            :is="getSectionComponent(section)"
            :section="section" 
            :section-style="getSectionStyleObj(section)"
          />
        </slot>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

interface Props {
  layoutConfig: {
    type: string;
    container?: Record<string, string>;
    content?: Record<string, string>;
    custom?: any;
  };
  sections: any[];
  sectionStyles?: Record<string, any>;
}

const props = defineProps<Props>()

// 容器样式
const containerStyle = computed(() => {
  const config = props.layoutConfig?.container || {}
  return {
    width: '100%',
    ...config
  }
})

// 内容区样式
const contentStyle = computed(() => {
  const config = props.layoutConfig?.content || {}
  return {
    width: '100%',
    ...config
  }
})

// 按顺序排序的模块
const sortedSections = computed(() => {
  return [...props.sections].sort((a, b) => (a.order || 0) - (b.order || 0))
})

// 获取模块样式对象
function getSectionStyleObj(section: any): Record<string, any> {
  const sectionType = section.type
  const defaultStyle = props.sectionStyles?.[sectionType] || {}
  const sectionStyle = section.style || {}
  
  // 合并默认样式和模块自定义样式
  return {
    ...defaultStyle,
    ...sectionStyle
  }
}

// 获取模块样式字符串
function getSectionStyle(section: any): Record<string, string> {
  const styleObj = getSectionStyleObj(section)
  const result: Record<string, string> = {}
  
  // 只提取直接的CSS属性，不包括嵌套对象
  Object.keys(styleObj).forEach(key => {
    if (typeof styleObj[key] !== 'object' || styleObj[key] === null) {
      result[key] = styleObj[key]
    }
  })
  
  return result
}

// 获取模块对应的组件
function getSectionComponent(section: any) {
  return 'generic-section'
}
</script>

<style scoped>
.single-column-layout {
  width: 100%;
}
</style>