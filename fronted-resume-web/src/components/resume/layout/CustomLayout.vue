<template>
  <div class="resume-layout custom-layout" :style="containerStyle">
    <div class="resume-content" :style="contentStyle">
      <!-- 基于Schema的自定义布局 -->
      <component 
        v-if="layoutSchema"
        :is="schemaComponent"
        :schema="layoutSchema"
        :sections="sortedSections"
        :section-styles="sectionStyles"
      />
      
      <!-- 默认单列布局 -->
      <template v-else>
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
            <component 
              :is="getSectionComponent(section)"
              :section="section" 
              :section-style="getSectionStyleObj(section)"
            />
          </slot>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, markRaw, resolveComponent } from 'vue'

interface Props {
  layoutConfig: {
    type: string;
    container?: Record<string, string>;
    content?: Record<string, string>;
    custom?: any;
    schema?: any;
  };
  sections: any[];
  sectionStyles?: Record<string, any>;
}

const props = defineProps<Props>()

// 尝试解析Schema渲染器组件
const schemaComponent = markRaw(resolveComponent('SchemaRenderer') || 'div')

// 获取布局Schema
const layoutSchema = computed(() => props.layoutConfig?.schema || null)

// 容器样式
const containerStyle = computed(() => {
  const config = props.layoutConfig?.container || {}
  return {
    maxWidth: config.maxWidth || '100%',
    margin: config.margin || '0 auto',
    padding: config.padding || '0',
    backgroundColor: config.backgroundColor,
    ...config
  }
})

// 内容区样式
const contentStyle = computed(() => {
  const config = props.layoutConfig?.content || {}
  return {
    padding: config.padding || '0',
    backgroundColor: config.backgroundColor || '#ffffff',
    borderRadius: config.borderRadius || '0',
    boxShadow: config.boxShadow,
    ...config
  }
})

// 按顺序排序的模块
const sortedSections = computed(() => {
  return [...props.sections]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
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
  // 这个函数将返回合适的组件
  // 实际实现将由父组件提供或通过动态注册系统解析
  return 'div'
}
</script>

<style scoped>
.custom-layout {
  width: 100%;
}
</style>
