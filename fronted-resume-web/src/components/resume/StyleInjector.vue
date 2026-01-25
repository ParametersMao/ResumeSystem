<template>
  <!-- 样式注入组件，不渲染任何可见内容 -->
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, defineProps } from 'vue'
import { styleTokenManager } from '@/utils/styleTokens'

interface StyleProps {
  // 主题定义
  theme?: {
    colors?: Record<string, any>;
    typography?: Record<string, any>;
    spacing?: Record<string, any>;
    borders?: Record<string, any>;
    [key: string]: any;
  };
  
  // 全局样式定义
  globalStyles?: {
    css?: string;
    elements?: Record<string, Record<string, string>>;
  };
  
  // 响应式配置
  responsive?: {
    breakpoints?: Record<string, string>;
    styles?: Record<string, any>;
  };
  
  // 部分样式
  sectionStyles?: Record<string, any>;
  
  // 自定义CSS
  customCss?: string;
}

const props = defineProps<StyleProps>()

// 样式元素引用
let styleElement: HTMLStyleElement | null = null
const uniqueId = ref(`style-${Date.now()}`)

// 生成的CSS
const generatedCss = computed(() => {
  let css: string[] = []
  
  // 1. 主题变量 - 限制只在简历渲染器范围内
  if (props.theme) {
    // 更新全局Token管理器
    styleTokenManager.updateTokens(props.theme)
    css.push(`.resume-renderer {
      ${styleTokenManager.generateCSSVariables()}
    }`)
  }
  
  // 2. 全局样式
  if (props.globalStyles) {
    // 直接注入的CSS
    if (props.globalStyles.css) {
      css.push(props.globalStyles.css)
    }
    
    // 元素样式对象转换为CSS
    if (props.globalStyles.elements) {
      css.push(generateCSSFromObject(props.globalStyles.elements))
    }
  }

  // 2.1 模块基础样式（商业化基线）
  css.push(generateBaseSectionStyles())
  
  // 3. 响应式样式
  if (props.responsive && props.responsive.styles) {
    const breakpoints = props.responsive.breakpoints || {
      mobile: '0px',
      tablet: '768px',
      desktop: '1024px',
      wide: '1280px'
    }
    
    // 基础样式
    if (props.responsive.styles.base) {
      css.push(generateCSSFromObject(props.responsive.styles.base))
    }
    // 移动端样式
    if ((props.responsive.styles as any).mobile) {
      css.push(`@media (min-width: ${breakpoints.mobile}) {
        ${generateCSSFromObject((props.responsive.styles as any).mobile, '  ')}
      }`)
    }
    
    // 平板样式
    if (props.responsive.styles.tablet) {
      css.push(`@media (min-width: ${breakpoints.tablet}) {
        ${generateCSSFromObject(props.responsive.styles.tablet, '  ')}
      }`)
    }
    
    // 桌面样式
    if (props.responsive.styles.desktop) {
      css.push(`@media (min-width: ${breakpoints.desktop}) {
        ${generateCSSFromObject(props.responsive.styles.desktop, '  ')}
      }`)
    }
    
    // 宽屏样式
    if (props.responsive.styles.wide) {
      css.push(`@media (min-width: ${breakpoints.wide}) {
        ${generateCSSFromObject(props.responsive.styles.wide, '  ')}
      }`)
    }
  }
  
  // 4. 各节模块样式
  if (props.sectionStyles) {
    css.push(generateSectionStyles(props.sectionStyles))
  }
  
  // 5. 自定义CSS（最后应用，可覆盖之前的样式）
  if (props.customCss) {
    css.push(sanitizeCSS(props.customCss))
  }
  
  return css.join('\n\n')
})

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

function generateBaseSectionStyles(): string {
  return `.resume-renderer .section-wrapper {
  margin-bottom: 24px;
}

.resume-renderer .section-wrapper:last-child {
  margin-bottom: 0;
}

.resume-renderer .section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--colors-text-primary, #111827);
  letter-spacing: 0.2px;
  margin: 0 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--colors-primary, #2563eb);
}

.resume-renderer .section-content {
  color: var(--colors-text-primary, #111827);
  line-height: 1.7;
}

.resume-renderer .section-content p {
  margin: 0 0 10px;
}

.resume-renderer .section-content ul,
.resume-renderer .section-content ol {
  padding-left: 18px;
  margin: 6px 0 0;
}

.resume-renderer .section-content li {
  margin: 4px 0;
}

.resume-renderer .section-content a {
  color: var(--colors-primary, #2563eb);
  text-decoration: none;
}

.resume-renderer .section-content a:hover {
  text-decoration: underline;
}`
}

// 为各节模块生成样式
function generateSectionStyles(sectionStyles: Record<string, any>): string {
  const css: string[] = []
  
  Object.keys(sectionStyles).forEach(sectionType => {
    const styles = sectionStyles[sectionType]
    
    // 容器样式 - 同时生成多个匹配的选择器
    if (styles.container) {
      css.push(`.section-${sectionType},
        .section-${sectionType}-wrapper {
        ${generateStyleProperties(styles.container)}
      }`)
    }
    
    // 标题样式
    if (styles.title) {
      css.push(`.section-${sectionType}-title {
        ${generateStyleProperties(styles.title)}
      }`)
      
      // 特殊标题样式
      if (styles.title.special && styles.title.special.type) {
        css.push(generateSpecialTitleStyle(sectionType, styles.title.special))
      }
    }
    
    // 内容样式
    if (styles.content) {
      css.push(`.section-${sectionType}-content {
        ${generateStyleProperties(styles.content)}
      }`)
    }
    
    // 项目样式
    if (styles.items) {
      css.push(`.section-${sectionType}-item {
        ${generateStyleProperties(styles.items)}
      }`)
      
      // 分隔线样式
      if (styles.items.separator && styles.items.separator.type !== 'none') {
        css.push(`.section-${sectionType}-item:not(:last-child) {
          border-bottom: ${styles.items.separator.width || '1px'} ${styles.items.separator.type} ${styles.items.separator.color || '#e0e0e0'};
          margin-bottom: ${styles.items.separator.margin || '15px'};
          padding-bottom: ${styles.items.separator.margin || '15px'};
        }`)
      }
    }
    
    // 自定义样式
    if (styles.custom) {
      Object.keys(styles.custom).forEach(selector => {
        const rules = styles.custom[selector]
        css.push(`.section-${sectionType} ${selector} {
          ${generateStyleProperties(rules)}
        }`)
      })
    }
  })
  
  return css.join('\n\n')
}

// 生成特殊标题样式
function generateSpecialTitleStyle(sectionType: string, special: any): string {
  const type = special.type
  const config = special.config || {}
  
  switch (type) {
    case 'ribbon':
      return `.section-${sectionType}-title.title-ribbon {
        position: relative;
        background: ${config.color || 'var(--colors-primary)'};
        color: ${config.textColor || 'white'};
        padding: ${config.padding || '10px 15px'};
        margin: ${config.margin || '0 0 20px 0'};
      }
      
      .section-${sectionType}-title.title-ribbon::after {
        content: '';
        position: absolute;
        right: ${config.afterRight || '-15px'};
        top: 0;
        width: 0;
        height: 0;
        border-top: ${config.borderSize || '19px'} solid ${config.color || 'var(--colors-primary)'};
        border-bottom: ${config.borderSize || '19px'} solid ${config.color || 'var(--colors-primary)'};
        border-right: ${config.afterWidth || '15px'} solid transparent;
      }`
      
    case 'underline':
      return `.section-${sectionType}-title.title-underline {
        position: relative;
        padding-bottom: ${config.paddingBottom || '10px'};
        margin-bottom: ${config.marginBottom || '20px'};
      }
      
      .section-${sectionType}-title.title-underline::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: ${config.lineWidth || '50px'};
        height: ${config.lineHeight || '3px'};
        background: ${config.lineColor || 'var(--colors-primary)'};
      }`
      
    case 'boxed':
      return `.section-${sectionType}-title.title-boxed {
        border: ${config.borderWidth || '1px'} solid ${config.borderColor || 'var(--colors-primary)'};
        padding: ${config.padding || '8px 15px'};
        display: inline-block;
        margin-bottom: ${config.marginBottom || '20px'};
      }`
      
    default:
      return ''
  }
}

// 从样式对象生成CSS属性
function generateStyleProperties(styles: Record<string, any>): string {
  return Object.keys(styles)
    .filter(prop => {
      const value = styles[prop]
      // 过滤掉嵌套对象，但保留null值
      return typeof value !== 'object' || value === null
    })
    .map(prop => {
      const value = styles[prop]
      // 将驼峰命名转换为短横线命名
      const cssProperty = prop.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssProperty}: ${value};`
    })
    .join('\n  ')
}

// 安全过滤CSS
function sanitizeCSS(css: string): string {
  return css
    .replace(/javascript:/gi, '') // 移除 javascript: 协议
    .replace(/expression\s*\(/gi, '') // 移除 expression()
    .replace(/@import/gi, '') // 移除 @import
    .replace(/behavior\s*:/gi, '') // 移除 behavior
    .replace(/binding\s*:/gi, '') // 移除 binding
}

// 监听样式变化，更新DOM
watch(() => generatedCss.value, updateStyle, { immediate: false })

// 动态注入CSS的方法
function updateStyle() {
  const css = generatedCss.value
  
  // 添加基础样式，并确保不影响Element Plus组件
  const baseStyles = `
  /* 重置可能影响Element Plus的全局样式 */
  .resume-renderer .el-form, .resume-renderer .el-input, .resume-renderer .el-button {
    all: revert;
  }
  
  /* 最小化的基础样式，仅用于确保元素可见和避免布局崩溃 */
  .resume-renderer {
    box-sizing: border-box;
  }
  
  .resume-renderer * {
    box-sizing: border-box;
  }
  `
  
  // 处理customCss，增强选择器特异性
  let enhancedCustomCss = props.customCss || ''
  if (enhancedCustomCss) {
    // 将简单选择器替换为更具体的选择器
    enhancedCustomCss = enhancedCustomCss
      // 处理顶级选择器
      .replace(/\.resume-renderer\s*\{/g, '.resume-renderer {')
      .replace(/\.column-left\s*\{/g, '.resume-renderer .resume-column.column-left {')
      .replace(/\.column-right\s*\{/g, '.resume-renderer .resume-column.column-right {')
      .replace(/\.section-title\s*\{/g, '.resume-renderer .section-title {')
      .replace(/\.section-content\s*\{/g, '.resume-renderer .section-content {')
      .replace(/\.section-item\s*\{/g, '.resume-renderer .section-item {')
      .replace(/\.resume-columns\s*\{/g, '.resume-renderer .resume-columns {')
      .replace(/\.resume-section\s*\{/g, '.resume-renderer .resume-section {')
      // 处理特定模块类型的选择器
      .replace(/\.section-basic\s*\{/g, '.resume-renderer .section-basic {')
      .replace(/\.section-education\s*\{/g, '.resume-renderer .section-education {')
      .replace(/\.section-skills\s*\{/g, '.resume-renderer .section-skills {')
      .replace(/\.section-experience\s*\{/g, '.resume-renderer .section-experience {')
      .replace(/\.section-projects\s*\{/g, '.resume-renderer .section-projects {')
      .replace(/\.section-summary\s*\{/g, '.resume-renderer .section-summary {')
      .replace(/\.section-awards\s*\{/g, '.resume-renderer .section-awards {')
      // 处理特定内容选择器
      .replace(/\.section-basic-content\s*\{/g, '.resume-renderer .section-basic-content {')
      .replace(/\.section-education-content\s*\{/g, '.resume-renderer .section-education-content {')
      .replace(/\.section-skills-content\s*\{/g, '.resume-renderer .section-skills-content {')
      .replace(/\.section-experience-content\s*\{/g, '.resume-renderer .section-experience-content {')
      .replace(/\.section-projects-content\s*\{/g, '.resume-renderer .section-projects-content {')
      .replace(/\.section-summary-content\s*\{/g, '.resume-renderer .section-summary-content {')
      .replace(/\.section-awards-content\s*\{/g, '.resume-renderer .section-awards-content {')
      // 处理特定项目选择器
      .replace(/\.section-experience-item\s*\{/g, '.resume-renderer .section-experience-item {')
      .replace(/\.section-projects-item\s*\{/g, '.resume-renderer .section-projects-item {')
      .replace(/\.section-skills-item\s*\{/g, '.resume-renderer .section-skills-item {')
      .replace(/\.section-awards-item\s*\{/g, '.resume-renderer .section-awards-item {')
      
      // 处理伪元素选择器
      .replace(/\.column-left::before\s*\{/g, '.resume-renderer .resume-column.column-left::before {')
      .replace(/\.column-right::before\s*\{/g, '.resume-renderer .resume-column.column-right::before {')
      .replace(/\.section-title::before\s*\{/g, '.resume-renderer .section-title::before {')
      .replace(/\.section-title::after\s*\{/g, '.resume-renderer .section-title::after {')
      .replace(/\.section-basic .section-title::before\s*\{/g, '.resume-renderer .section-basic .section-title::before {')
      .replace(/\.section-education .section-title::before\s*\{/g, '.resume-renderer .section-education .section-title::before {')
      .replace(/\.section-skills .section-title::before\s*\{/g, '.resume-renderer .section-skills .section-title::before {')
      .replace(/\.section-experience .section-title::before\s*\{/g, '.resume-renderer .section-experience .section-title::before {')
      .replace(/\.section-projects .section-title::before\s*\{/g, '.resume-renderer .section-projects .section-title::before {')
      .replace(/\.section-summary .section-title::before\s*\{/g, '.resume-renderer .section-summary .section-title::before {')
      .replace(/\.section-awards .section-title::before\s*\{/g, '.resume-renderer .section-awards .section-title::before {')
  }
  
  if (styleElement) {
    styleElement.textContent = css + baseStyles + enhancedCustomCss
  } else {
    // 创建样式元素
    styleElement = document.createElement('style')
    styleElement.id = uniqueId.value
    styleElement.type = 'text/css'
    styleElement.textContent = css + baseStyles + enhancedCustomCss
    document.head.appendChild(styleElement)
  }
}

// 组件挂载时注入样式
onMounted(() => {
  updateStyle()
})

// 组件卸载时清理样式
onUnmounted(() => {
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }
})
</script>
