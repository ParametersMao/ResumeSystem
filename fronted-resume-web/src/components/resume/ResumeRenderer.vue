<template>
  <div 
    class="resume-renderer" 
    :id="containerId"
    :style="resumeStyle"
  >
    <!-- 样式注入 -->
    <style-injector
      :theme="template.theme"
      :global-styles="template.globalStyles"
      :responsive="template.responsive"
      :section-styles="template.sectionStyles"
      :custom-css="customCss"
    />
    
    <!-- 布局渲染 -->
    <layout-manager
      :layout-config="layoutConfig"
      :sections="filteredSections"
      :section-styles="template.sectionStyles"
    >
      <template 
        v-for="section in filteredSections" 
        :key="section.id" 
        #[`section-${section.id}`]="slotProps"
      >
        <generic-section
          :section="section"
          :section-style="getSectionStyle(section)"
          :highlighted="isSectionHighlighted(section.id)"
          @hover="handleSectionHover(section.id)"
          @leave="handleSectionLeave"
          @select="handleSectionSelect(section.id)"
        />
      </template>
    </layout-manager>
    
    <!-- 调试信息 -->
    <div v-if="debug" class="debug-info">
      <pre>{{ JSON.stringify(template, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, provide } from 'vue'
import StyleInjector from './StyleInjector.vue'
import LayoutManager from './layout/LayoutManager.vue'
import GenericSection from './sections/GenericSection.vue'
import GenericContentRenderer from './sections/GenericContentRenderer.vue'

// 注册通用内容渲染器组件（这里仅导入，实际注册在main.ts中）

interface Props {
  template: {
    theme?: any;
    globalStyles?: any;
    responsive?: any;
    sectionStyles?: any;
    layout?: any;
    customCss?: string;
  };
  resumeData: {
    profile?: any;
    sections?: any[];
  };
  containerId?: string;
  customCss?: string;
  debug?: boolean;
  highlightedSectionId?: string;
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'sectionHover', sectionId?: string): void
  (e: 'sectionLeave'): void
  (e: 'sectionSelect', sectionId: string): void
}>()

// 生成唯一ID
const uniqueId = ref(`resume-${Date.now()}`)

// 容器ID
const containerId = computed(() => props.containerId || uniqueId.value)

// 布局配置
const layoutConfig = computed(() => {
  const layout = props.template.layout || {
    type: 'single-column',
    container: {
      maxWidth: '860px',
      margin: '0 auto',
      padding: '20px'
    },
    content: {
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '6px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }
  }
  
  console.log('ResumeRenderer: 布局配置', JSON.stringify(layout, null, 2))
  
  return layout
})

// 简历全局样式 - 完全从模板数据中获取
const resumeStyle = computed(() => {
  const globalConfig = props.template.globalStyles || {}
  const theme = props.template.theme || {}
  const layout = props.template.layout || {}
  
  console.log('ResumeRenderer: 样式配置', {
    globalConfig,
    theme: theme.colors,
    layout: layout.container
  })
  
  // 构建样式对象，优先使用模板数据
  const style: Record<string, any> = {
    fontFamily: globalConfig.fontFamily || theme.typography?.fontFamily?.body,
    color: globalConfig.color || theme.colors?.text?.primary,
    backgroundColor: globalConfig.backgroundColor,
    lineHeight: globalConfig.lineHeight,
    fontSize: globalConfig.fontSize,
    minHeight: '100vh', // 确保简历至少占满视口高度
    boxSizing: 'border-box'
  }
  
  // 应用布局容器样式
  if (layout.container) {
    Object.assign(style, {
      maxWidth: layout.container.maxWidth,
      margin: layout.container.margin,
      padding: layout.container.padding,
      boxShadow: layout.container.boxShadow,
      borderRadius: layout.container.borderRadius,
      backgroundColor: layout.container.backgroundColor || style.backgroundColor
    })
  }
  
  // 合并其他全局样式
  if (globalConfig.style) {
    Object.assign(style, globalConfig.style)
  }
  
  return style
})

// 自定义CSS
const customCss = computed(() => {
  return props.customCss || props.template.customCss || ''
})

// 过滤并排序的模块
const filteredSections = computed(() => {
  const resumeData = props.resumeData || {}
  const sections = resumeData.sections || []
  
  // 以 sections 为渲染唯一来源，避免基础模块重复/错显
  let result = [...sections]
  
  // 过滤掉不可见的模块
  result = result.filter(section => section.visible !== false)
  
  // 按order排序
  return result.sort((a, b) => (a.order || 0) - (b.order || 0))
})

// 提供resumeData给子组件使用
provide('resumeData', props.resumeData)

// 获取模块样式
function getSectionStyle(section: any): any {
  const sectionStyles = props.template.sectionStyles || {}
  const sectionType = section.type
  
  return {
    ...(sectionStyles[sectionType] || {}),
    ...(section.style || {})
  }
}

function isSectionHighlighted(sectionId: string) {
  return !!props.highlightedSectionId && props.highlightedSectionId === sectionId
}

function handleSectionHover(sectionId: string) {
  emit('sectionHover', sectionId)
}

function handleSectionLeave() {
  emit('sectionHover')
  emit('sectionLeave')
}

function handleSectionSelect(sectionId: string) {
  emit('sectionSelect', sectionId)
}
</script>

<style>
/* 基础样式 */
.resume-renderer {
  box-sizing: border-box;
}

.resume-renderer * {
  box-sizing: border-box;
}

/* 调试信息 */
.debug-info {
  margin-top: 30px;
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  max-height: 300px;
  overflow: auto;
}
</style>
