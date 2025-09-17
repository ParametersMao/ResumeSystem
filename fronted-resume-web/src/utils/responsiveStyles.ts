/**
 * 响应式样式系统
 * 支持桌面/平板/手机等多端样式定义
 */

import { styleTokenManager, type StyleTokens } from './styleTokens'

export interface ResponsiveStyle {
  mobile?: Record<string, any>
  tablet?: Record<string, any>
  desktop?: Record<string, any>
  wide?: Record<string, any>
}

export interface BreakpointConfig {
  mobile: string
  tablet: string
  desktop: string
  wide: string
}

// 默认断点配置
export const defaultBreakpoints: BreakpointConfig = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px'
}

// 响应式样式处理器
export class ResponsiveStyleProcessor {
  private breakpoints: BreakpointConfig

  constructor(breakpoints: BreakpointConfig = defaultBreakpoints) {
    this.breakpoints = breakpoints
  }

  // 生成响应式CSS
  generateResponsiveCSS(styles: ResponsiveStyle): string {
    const css: string[] = []
    
    // 移动端样式（基础）
    if (styles.mobile) {
      css.push(this.generateCSSFromObject(styles.mobile))
    }
    
    // 平板样式
    if (styles.tablet) {
      css.push(`@media (min-width: ${this.breakpoints.tablet}) {`)
      css.push(this.generateCSSFromObject(styles.tablet, '  '))
      css.push('}')
    }
    
    // 桌面样式
    if (styles.desktop) {
      css.push(`@media (min-width: ${this.breakpoints.desktop}) {`)
      css.push(this.generateCSSFromObject(styles.desktop, '  '))
      css.push('}')
    }
    
    // 宽屏样式
    if (styles.wide) {
      css.push(`@media (min-width: ${this.breakpoints.wide}) {`)
      css.push(this.generateCSSFromObject(styles.wide, '  '))
      css.push('}')
    }
    
    return css.join('\n')
  }

  // 从对象生成CSS
  private generateCSSFromObject(styles: Record<string, any>, indent = ''): string {
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

  // 解析响应式值
  parseResponsiveValue(value: any): ResponsiveStyle {
    if (typeof value === 'object' && value !== null) {
      return {
        mobile: value.mobile || value.sm,
        tablet: value.tablet || value.md,
        desktop: value.desktop || value.lg,
        wide: value.wide || value.xl
      }
    }
    
    // 如果是单一值，应用到所有断点
    return {
      mobile: value,
      tablet: value,
      desktop: value,
      wide: value
    }
  }

  // 获取当前断点
  getCurrentBreakpoint(): string {
    if (typeof window === 'undefined') return 'desktop'
    
    const width = window.innerWidth
    
    if (width >= parseInt(this.breakpoints.wide)) return 'wide'
    if (width >= parseInt(this.breakpoints.desktop)) return 'desktop'
    if (width >= parseInt(this.breakpoints.tablet)) return 'tablet'
    return 'mobile'
  }

  // 监听断点变化
  onBreakpointChange(callback: (breakpoint: string) => void): () => void {
    if (typeof window === 'undefined') return () => {}
    
    let currentBreakpoint = this.getCurrentBreakpoint()
    
    const handleResize = () => {
      const newBreakpoint = this.getCurrentBreakpoint()
      if (newBreakpoint !== currentBreakpoint) {
        currentBreakpoint = newBreakpoint
        callback(newBreakpoint)
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }
}

// 全局响应式处理器实例
export const responsiveProcessor = new ResponsiveStyleProcessor()

// 工具函数：生成响应式网格
export function generateResponsiveGrid(columns: ResponsiveStyle): string {
  const gridStyles: ResponsiveStyle = {
    mobile: {
      '.responsive-grid': {
        display: 'grid',
        'grid-template-columns': `repeat(${columns.mobile?.columns || 1}, 1fr)`,
        gap: columns.mobile?.gap || '16px'
      }
    },
    tablet: {
      '.responsive-grid': {
        'grid-template-columns': `repeat(${columns.tablet?.columns || 2}, 1fr)`,
        gap: columns.tablet?.gap || '20px'
      }
    },
    desktop: {
      '.responsive-grid': {
        'grid-template-columns': `repeat(${columns.desktop?.columns || 3}, 1fr)`,
        gap: columns.desktop?.gap || '24px'
      }
    },
    wide: {
      '.responsive-grid': {
        'grid-template-columns': `repeat(${columns.wide?.columns || 4}, 1fr)`,
        gap: columns.wide?.gap || '32px'
      }
    }
  }
  
  return responsiveProcessor.generateResponsiveCSS(gridStyles)
}

// 工具函数：生成响应式字体
export function generateResponsiveTypography(typography: ResponsiveStyle): string {
  const typographyStyles: ResponsiveStyle = {
    mobile: {
      'h1': {
        'font-size': typography.mobile?.h1?.fontSize || '24px',
        'line-height': typography.mobile?.h1?.lineHeight || '1.2',
        'font-weight': typography.mobile?.h1?.fontWeight || '700'
      },
      'h2': {
        'font-size': typography.mobile?.h2?.fontSize || '20px',
        'line-height': typography.mobile?.h2?.lineHeight || '1.3',
        'font-weight': typography.mobile?.h2?.fontWeight || '600'
      },
      'body': {
        'font-size': typography.mobile?.body?.fontSize || '14px',
        'line-height': typography.mobile?.body?.lineHeight || '1.5',
        'font-weight': typography.mobile?.body?.fontWeight || '400'
      }
    },
    tablet: {
      'h1': {
        'font-size': typography.tablet?.h1?.fontSize || '28px'
      },
      'h2': {
        'font-size': typography.tablet?.h2?.fontSize || '24px'
      },
      'body': {
        'font-size': typography.tablet?.body?.fontSize || '16px'
      }
    },
    desktop: {
      'h1': {
        'font-size': typography.desktop?.h1?.fontSize || '32px'
      },
      'h2': {
        'font-size': typography.desktop?.h2?.fontSize || '28px'
      },
      'body': {
        'font-size': typography.desktop?.body?.fontSize || '18px'
      }
    },
    wide: {
      'h1': {
        'font-size': typography.wide?.h1?.fontSize || '36px'
      },
      'h2': {
        'font-size': typography.wide?.h2?.fontSize || '32px'
      },
      'body': {
        'font-size': typography.wide?.body?.fontSize || '20px'
      }
    }
  }
  
  return responsiveProcessor.generateResponsiveCSS(typographyStyles)
}

// 工具函数：生成响应式间距
export function generateResponsiveSpacing(spacing: ResponsiveStyle): string {
  const spacingStyles: ResponsiveStyle = {
    mobile: {
      '.spacing-xs': { margin: spacing.mobile?.xs || '4px' },
      '.spacing-sm': { margin: spacing.mobile?.sm || '8px' },
      '.spacing-md': { margin: spacing.mobile?.md || '16px' },
      '.spacing-lg': { margin: spacing.mobile?.lg || '24px' },
      '.spacing-xl': { margin: spacing.mobile?.xl || '32px' }
    },
    tablet: {
      '.spacing-xs': { margin: spacing.tablet?.xs || '6px' },
      '.spacing-sm': { margin: spacing.tablet?.sm || '12px' },
      '.spacing-md': { margin: spacing.tablet?.md || '20px' },
      '.spacing-lg': { margin: spacing.tablet?.lg || '28px' },
      '.spacing-xl': { margin: spacing.tablet?.xl || '36px' }
    },
    desktop: {
      '.spacing-xs': { margin: spacing.desktop?.xs || '8px' },
      '.spacing-sm': { margin: spacing.desktop?.sm || '16px' },
      '.spacing-md': { margin: spacing.desktop?.md || '24px' },
      '.spacing-lg': { margin: spacing.desktop?.lg || '32px' },
      '.spacing-xl': { margin: spacing.desktop?.xl || '40px' }
    },
    wide: {
      '.spacing-xs': { margin: spacing.wide?.xs || '10px' },
      '.spacing-sm': { margin: spacing.wide?.sm || '20px' },
      '.spacing-md': { margin: spacing.wide?.md || '28px' },
      '.spacing-lg': { margin: spacing.wide?.lg || '36px' },
      '.spacing-xl': { margin: spacing.wide?.xl || '44px' }
    }
  }
  
  return responsiveProcessor.generateResponsiveCSS(spacingStyles)
}
