/**
 * 样式Token系统
 * 提供统一的样式变量管理和主题支持
 */

export interface StyleTokens {
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
  }
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
    text: {
      primary: string
      secondary: string
      disabled: string
      inverse: string
    }
    background: {
      primary: string
      secondary: string
      tertiary: string
      inverse: string
    }
    border: {
      light: string
      medium: string
      dark: string
    }
  }
  typography: {
    fontFamily: {
      primary: string
      secondary: string
      mono: string
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
    fontWeight: {
      light: number
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
      loose: number
    }
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    inner: string
    none: string
  }
  breakpoints: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  zIndex: {
    hide: number
    auto: string
    base: number
    docked: number
    dropdown: number
    sticky: number
    banner: number
    overlay: number
    modal: number
    popover: number
    skipLink: number
    toast: number
    tooltip: number
  }
}

// 默认样式Token
export const defaultTokens: StyleTokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c',
    info: '#17a2b8',
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
      disabled: '#bdc3c7',
      inverse: '#ffffff'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#e9ecef',
      inverse: '#2c3e50'
    },
    border: {
      light: '#e9ecef',
      medium: '#dee2e6',
      dark: '#adb5bd'
    }
  },
  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Georgia, "Times New Roman", serif',
      mono: '"Fira Code", "Monaco", "Consolas", monospace'
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    }
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none'
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
}

// 样式Token管理器
export class StyleTokenManager {
  private tokens: StyleTokens
  private customTokens: Partial<StyleTokens> = {}

  constructor(initialTokens?: Partial<StyleTokens>) {
    this.tokens = this.mergeTokens(defaultTokens, initialTokens || {})
  }

  // 合并Token
  private mergeTokens(base: StyleTokens, custom: Partial<StyleTokens>): StyleTokens {
    const merged = { ...base }
    
    // 深度合并
    Object.keys(custom).forEach(key => {
      const customKey = key as keyof StyleTokens
      if (custom[customKey] && typeof custom[customKey] === 'object') {
        merged[customKey] = { ...merged[customKey], ...custom[customKey] }
      } else if (custom[customKey]) {
        merged[customKey] = custom[customKey] as any
      }
    })
    
    return merged
  }

  // 更新Token
  updateTokens(tokens: Partial<StyleTokens>): void {
    this.customTokens = { ...this.customTokens, ...tokens }
    this.tokens = this.mergeTokens(defaultTokens, this.customTokens)
  }

  // 获取Token值
  getToken(path: string): string | number | undefined {
    const keys = path.split('.')
    let value: any = this.tokens
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return undefined
      }
    }
    
    return value
  }

  // 获取所有Token
  getAllTokens(): StyleTokens {
    return { ...this.tokens }
  }

  // 生成CSS变量
  generateCSSVariables(): string {
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
    
    addVariables(this.tokens)
    return variables.join('\n')
  }

  // 生成响应式CSS
  generateResponsiveCSS(styles: Record<string, any>): string {
    const breakpoints = this.tokens.breakpoints
    const css: string[] = []
    
    // 基础样式
    css.push(this.generateCSSFromObject(styles))
    
    // 响应式样式
    Object.keys(breakpoints).forEach(breakpoint => {
      const mediaQuery = `@media (min-width: ${breakpoints[breakpoint as keyof typeof breakpoints]})`
      const responsiveStyles = styles[breakpoint]
      
      if (responsiveStyles) {
        css.push(`${mediaQuery} {`)
        css.push(this.generateCSSFromObject(responsiveStyles, '  '))
        css.push('}')
      }
    })
    
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
}

// 全局Token管理器实例
export const styleTokenManager = new StyleTokenManager()

// 工具函数：解析Token路径
export function resolveTokenPath(path: string, tokens: StyleTokens = styleTokenManager.getAllTokens()): string | number | undefined {
  return styleTokenManager.getToken(path)
}

// 工具函数：生成主题CSS
export function generateThemeCSS(tokens: StyleTokens): string {
  return `
    :root {
      ${styleTokenManager.generateCSSVariables()}
    }
    
    .theme-dark {
      --colors-primary: #60a5fa;
      --colors-secondary: #34d399;
      --colors-text-primary: #f9fafb;
      --colors-text-secondary: #d1d5db;
      --colors-background-primary: #1f2937;
      --colors-background-secondary: #374151;
    }
  `
}
