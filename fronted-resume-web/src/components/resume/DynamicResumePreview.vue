<template>
  <div class="dynamic-resume-preview" :style="resumeStyle">
    <div class="resume-content" :style="contentStyle">
      
      <!-- 双列布局：根据 gridColumn 分拣左右列 -->
      <template v-if="effectiveTemplateType === 'two-column'">
        <div class="columns-grid" :style="columnsGridStyle">
          <div class="column-left">
            <BaseSection
              v-for="(section, index) in leftColumnSections"
              :key="`left-${section.type}-${index}-${resumeDataKey}`"
              :type="section.type"
              :data="section.data"
              :config="section.config"
              :styles="templateStyles"
            />
          </div>
          <div class="column-right">
            <BaseSection
              v-for="(section, index) in rightColumnSections"
              :key="`right-${section.type}-${index}-${resumeDataKey}`"
              :type="section.type"
              :data="section.data"
              :config="section.config"
              :styles="templateStyles"
            />
          </div>
        </div>
      </template>

      <!-- 三列布局：根据 gridColumn 分拣三列 -->
      <template v-else-if="effectiveTemplateType === 'three-column'">
        <div class="columns-grid" :style="threeColumnsGridStyle">
          <div class="column-left">
            <BaseSection
              v-for="(section, index) in leftColumnSections"
              :key="`left-${section.type}-${index}-${resumeDataKey}`"
              :type="section.type"
              :data="section.data"
              :config="section.config"
              :styles="templateStyles"
            />
          </div>
          <div class="column-middle">
            <BaseSection
              v-for="(section, index) in middleColumnSections"
              :key="`middle-${section.type}-${index}-${resumeDataKey}`"
              :type="section.type"
              :data="section.data"
              :config="section.config"
              :styles="templateStyles"
            />
          </div>
          <div class="column-right">
            <BaseSection
              v-for="(section, index) in rightColumnSections"
              :key="`right-${section.type}-${index}-${resumeDataKey}`"
              :type="section.type"
              :data="section.data"
              :config="section.config"
              :styles="templateStyles"
            />
          </div>
        </div>
      </template>

      <!-- 单列布局：忽略 gridColumn，按顺序渲染 -->
      <template v-else>
        <BaseSection
          v-for="(section, index) in renderedSections"
          :key="`${section.type}-${index}-${resumeDataKey}`"
          :type="section.type"
          :data="section.data"
          :config="section.config"
          :styles="templateStyles"
        />
      </template>
      
      <!-- 如果没有模块显示提示 -->
      <div v-if="renderedSections.length === 0" class="no-sections" style="text-align: center; color: #666; padding: 40px;">
        没有找到可显示的模块
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed, defineProps, watch, ref, onMounted, onUnmounted } from 'vue'
import BaseSection from './BaseSection.vue'

interface Props {
  resumeData: any
  templateData: any
  extraStyles?: any
  templateType?: 'single-column' | 'two-column' | 'three-column' | 'auto'
  customCss?: string
}

const props = defineProps<Props>()

// 强制重新渲染的key
const resumeDataKey = ref(0)

// 动态样式元素引用
let styleElement: HTMLStyleElement | null = null

// 监听数据变化
watch(() => props.resumeData, () => {
  resumeDataKey.value++
}, { deep: true })

// 动态注入CSS的方法
function injectCustomCSS(css: string) {
  // 移除旧的样式元素
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }
  
  // 如果有新的CSS，创建并注入
  if (css && css.trim()) {
    styleElement = document.createElement('style')
    styleElement.type = 'text/css'
    styleElement.textContent = css
    styleElement.setAttribute('data-resume-custom', 'true')
    document.head.appendChild(styleElement)
  }
}

// 组件挂载时注入样式
onMounted(() => {
  if (customCss.value) {
    injectCustomCSS(customCss.value)
  }
})

// 组件卸载时清理样式
onUnmounted(() => {
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }
})

// 合并样式：默认值 <- 模板样式 <- 外部样式（右侧面板实时调节）
const templateStyles = computed(() => {
  const defaults = {
    colors: { primary: '#333', secondary: '#f8f9fa', text: '#333', background: '#fff' },
    fonts: { heading: 'sans-serif', body: 'sans-serif' },
    spacing: { sectionMargin: '20px', elementMargin: '15px' }
  }
  const tpl = props.templateData?.styles || {}
  const ext = props.extraStyles || {}
  return {
    colors: { ...defaults.colors, ...(tpl.colors || {}), ...(ext.colors || {}) },
    fonts: { ...defaults.fonts, ...(tpl.fonts || {}), ...(ext.fonts || {}) },
    spacing: { ...defaults.spacing, ...(tpl.spacing || {}), ...(ext.spacing || {}) }
  }
})

// 提取自定义CSS（支持安全过滤和Token系统）
const customCss = computed(() => {
  let css = props.customCss || props.templateData?.styles?.customCss || props.resumeData?.customCss || ''
  
  // 生成样式Token CSS变量
  const tokens = props.templateData?.styles?.tokens
  if (tokens) {
    const tokenCss = generateTokenCSS(tokens)
    css = tokenCss + '\n' + css
  }
  
  // 生成响应式样式
  const responsive = props.templateData?.responsive
  if (responsive) {
    const responsiveCss = generateResponsiveCSS(responsive)
    css = css + '\n' + responsiveCss
  }
  
  if (!css) return ''
  
  // 基础安全过滤：移除危险属性
  const sanitizedCss = css
    .replace(/javascript:/gi, '') // 移除 javascript: 协议
    .replace(/expression\s*\(/gi, '') // 移除 expression()
    .replace(/@import/gi, '') // 移除 @import
    .replace(/behavior\s*:/gi, '') // 移除 behavior
    .replace(/binding\s*:/gi, '') // 移除 binding
  
  return sanitizedCss
})

// 监听自定义CSS变化，动态注入样式
watch(() => customCss.value, (newCss) => {
  injectCustomCSS(newCss)
}, { immediate: true })

// 生成Token CSS变量
function generateTokenCSS(tokens: any): string {
  const variables: string[] = []
  
  const addVariables = (obj: any, prefix = '') => {
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      const varName = prefix ? `${prefix}-${key}` : key
      
      if (typeof value === 'object' && value !== null) {
        addVariables(value, varName)
      } else {
        variables.push(`--${varName}: ${value};`)
      }
    })
  }
  
  addVariables(tokens)
  return `:root {\n  ${variables.join('\n  ')}\n}`
}

// 生成响应式CSS
function generateResponsiveCSS(responsive: any): string {
  const css: string[] = []
  const breakpoints = responsive.breakpoints || {
    mobile: '0px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  }
  
  // 移动端样式（基础）
  if (responsive.mobile) {
    css.push(generateCSSFromObject(responsive.mobile))
  }
  
  // 平板样式
  if (responsive.tablet) {
    css.push(`@media (min-width: ${breakpoints.tablet}) {`)
    css.push(generateCSSFromObject(responsive.tablet, '  '))
    css.push('}')
  }
  
  // 桌面样式
  if (responsive.desktop) {
    css.push(`@media (min-width: ${breakpoints.desktop}) {`)
    css.push(generateCSSFromObject(responsive.desktop, '  '))
    css.push('}')
  }
  
  // 宽屏样式
  if (responsive.wide) {
    css.push(`@media (min-width: ${breakpoints.wide}) {`)
    css.push(generateCSSFromObject(responsive.wide, '  '))
    css.push('}')
  }
  
  return css.join('\n')
}

// 从对象生成CSS
function generateCSSFromObject(styles: Record<string, any>, indent = ''): string {
  const css: string[] = []
  
  Object.keys(styles).forEach(selector => {
    const rules = styles[selector]
    if (typeof rules === 'object' && rules !== null) {
      css.push(`${indent}${selector} {`)
      Object.keys(rules).forEach(property => {
        const value = rules[property]
        css.push(`${indent}  ${property}: ${value};`)
      })
      css.push(`${indent}}`)
    }
  })
  
  return css.join('\n')
}

// 合成最终用于渲染的模块列表：以 resumeData.sections 为唯一数据源
const renderedSections = computed(() => {
  const list: any[] = []

  // 按 sections 顺序渲染，过滤 visible
  const sections = Array.isArray(props.resumeData?.sections) ? props.resumeData.sections : []
  sections
    .filter((s: any) => s && s.visible !== false)
    .forEach((s: any, idx: number) => {
      const normalized = s.type === 'basic' ? (props.resumeData?.profile || {}) : normalizeSectionData(s)
      const mergedConfig = { ...(s.config || {}), ...(s.style || {}) }
      // 规范常用键名直通：titleColor/titleAlignment/itemSpacing/itemSeparator
      if (mergedConfig.titleColor) {
        mergedConfig.titleStyle = { ...(mergedConfig.titleStyle || {}), color: mergedConfig.titleColor }
      }
      if (mergedConfig.titleAlignment) {
        mergedConfig.titleStyle = { ...(mergedConfig.titleStyle || {}), textAlign: mergedConfig.titleAlignment }
      }
      if (mergedConfig.padding) {
        mergedConfig.padding = mergedConfig.padding
      }
      // 求职意向默认字段名
      if (s.type === 'intention' && !mergedConfig.fieldName) {
        mergedConfig.fieldName = 'intention'
        if (!mergedConfig.title && !s.title) {
          mergedConfig.title = '求职意向'
        }
      }
      list.push({ type: s.type, config: mergedConfig, data: normalized, order: typeof s.order === 'number' ? s.order : idx })
    })

  return list
})

// 简历整体样式：按文档合并 globalStyles 与模板样式
const resumeStyle = computed(() => {
  const globalConfig = props.templateData?.globalConfig || {}
  const g = props.resumeData?.globalStyles || {}
  return {
    fontFamily: g.fontFamily || templateStyles.value.fonts?.body || 'sans-serif',
    color: templateStyles.value.colors?.text || '#333',
    backgroundColor: templateStyles.value.colors?.background || '#fff',
    lineHeight: globalConfig.lineHeight || '1.6',
    ...globalConfig.customStyle
  }
})

// 模板类型（auto 时根据是否存在 gridColumn 决定）
const effectiveTemplateType = computed(() => {
  const tpl = props.templateType || 'auto'
  if (tpl !== 'auto') return tpl
  const sections = Array.isArray(props.resumeData?.sections) ? props.resumeData.sections : []
  
  // 检查是否有三列标记
  if (sections.some((s: any) => s?.style?.gridColumn === '3 / 4') || props.templateData?.templateType === 'three-column') {
    return 'three-column' as const
  }
  // 检查是否有双列标记
  else if (sections.some((s: any) => s?.style?.gridColumn)) {
    return 'two-column' as const
  }
  // 默认单列
  else {
    return 'single-column' as const
  }
})

// 内容区域样式：容器基础样式（不在此处设置网格，双列时由内部 wrapper 负责）
const contentStyle = computed(() => {
  const globalConfig = props.templateData?.globalConfig || {}
  const g = props.resumeData?.globalStyles || {}
  const base: any = {
    maxWidth: globalConfig.maxWidth || '860px',
    margin: globalConfig.margin || '0 auto',
    padding: globalConfig.padding || '30px',
    backgroundColor: globalConfig.contentBackground || templateStyles.value.colors?.background,
    borderRadius: globalConfig.borderRadius || '6px',
    boxShadow: globalConfig.boxShadow || '0 2px 10px rgba(0,0,0,0.1)',
    ...globalConfig.contentStyle
  }

  return base
})

// 双列网格样式（仅在 two-column 下使用）
const columnsGridStyle = computed(() => {
  const g = props.resumeData?.globalStyles || {}
  return {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: g.elementSpacing || templateStyles.value.spacing?.elementMargin || '15px'
  }
})

// 三列网格样式（仅在 three-column 下使用）
const threeColumnsGridStyle = computed(() => {
  const g = props.resumeData?.globalStyles || {}
  return {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: g.elementSpacing || templateStyles.value.spacing?.elementMargin || '15px'
  }
})

// 双列和三列：左中右列分拣
const leftColumnSections = computed(() => {
  if (effectiveTemplateType.value !== 'two-column' && effectiveTemplateType.value !== 'three-column') return [] as any[]
  return renderedSections.value
    .filter(s => (s.config?.gridColumn === '1 / 2'))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

const middleColumnSections = computed(() => {
  if (effectiveTemplateType.value !== 'three-column') return [] as any[]
  return renderedSections.value
    .filter(s => (s.config?.gridColumn === '2 / 3'))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

const rightColumnSections = computed(() => {
  if (effectiveTemplateType.value !== 'two-column' && effectiveTemplateType.value !== 'three-column') return [] as any[]
  const columnValue = effectiveTemplateType.value === 'three-column' ? '3 / 4' : '2 / 3'
  return renderedSections.value
    .filter(s => (s.config?.gridColumn === columnValue))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

// 规范化 section 数据结构
function normalizeSectionData(section: any): any {
  const base = section || {}
  
  // 特殊处理不同类型的模块
  if (base.type === 'basic') {
    // basic 类型不需要 items，直接返回 profile 数据
    return base
  }
  
  if (base.type === 'skills') {
    return { items: Array.isArray(base.items) ? base.items : [] }
  }
  
  if (base.type === 'education') {
    return { 
      ...base, 
      items: Array.isArray(base.items) ? base.items : [],
      title: base.title || base.config?.title || '教育背景'
    }
  }
  
  if (base.type === 'experience') {
    return { 
      ...base, 
      items: Array.isArray(base.items) ? base.items : [],
      title: base.title || base.config?.title || '工作经验'
    }
  }
  
  if (base.type === 'projects') {
    return { 
      ...base, 
      items: Array.isArray(base.items) ? base.items : [],
      title: base.title || base.config?.title || '项目经验'
    }
  }
  
  // 通用处理
  if (!Array.isArray(base.items)) {
    return { ...base, items: [] }
  }
  
  return base
}
</script>

<style scoped>
.dynamic-resume-preview {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

.resume-content {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-height: 100vh;
}

.no-sections {
  font-style: italic;
  color: #999;
}
</style>
