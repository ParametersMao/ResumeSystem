/**
 * 样式令牌管理器
 * 用于管理和应用设计令牌（颜色、字体、间距等）作为CSS变量
 */

// 样式令牌默认值
const defaultTokens = {
  colors: {
    primary: '#2f80ed',
    secondary: '#2ecc71',
    tertiary: '#e67e22',
    text: {
      primary: '#333333',
      secondary: '#666666',
      muted: '#999999'
    },
    background: '#ffffff',
    border: '#eeeeee'
  },
  typography: {
    fontFamily: {
      body: "'Microsoft YaHei', Arial, sans-serif",
      heading: "'Microsoft YaHei', Arial, sans-serif"
    },
    fontSize: {
      base: '14px',
      small: '12px',
      large: '16px',
      h1: '24px',
      h2: '20px',
      h3: '18px',
      h4: '16px'
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700'
    },
    lineHeight: {
      normal: '1.5',
      tight: '1.2',
      loose: '1.8'
    }
  },
  spacing: {
    unit: '8px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borders: {
    radius: {
      small: '2px',
      medium: '4px',
      large: '8px',
      round: '999px'
    },
    width: {
      thin: '1px',
      medium: '2px',
      thick: '4px'
    }
  }
}

// 当前令牌集合
let currentTokens = { ...defaultTokens }

/**
 * 样式令牌管理器
 */
export const styleTokenManager = {
  /**
   * 更新令牌值
   */
  updateTokens(tokens: Record<string, any> = {}) {
    // 深度合并令牌
    currentTokens = mergeDeep(structuredClone(defaultTokens), tokens)
  },
  
  /**
   * 重置为默认令牌
   */
  resetTokens() {
    currentTokens = { ...defaultTokens }
  },
  
  /**
   * 获取当前令牌值
   */
  getTokens() {
    return structuredClone(currentTokens)
  },
  
  /**
   * 获取特定令牌值
   */
  getToken(path: string): any {
    return getNestedValue(currentTokens, path)
  },
  
  /**
   * 生成CSS变量
   */
  generateCSSVariables(): string {
    return generateVariables(currentTokens)
  }
}

/**
 * 深度合并对象
 */
function mergeDeep(target: any, source: any): any {
  if (!isObject(target) || !isObject(source)) {
    return source === undefined ? target : source
  }
  
  const output = { ...target }
  
  Object.keys(source).forEach(key => {
    if (isObject(source[key])) {
      if (!(key in target)) {
        output[key] = source[key]
      } else {
        output[key] = mergeDeep(target[key], source[key])
      }
    } else {
      output[key] = source[key]
    }
  })
  
  return output
}

/**
 * 检查是否为对象
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.')
  return keys.reduce((result, key) => {
    return result && result[key] !== undefined ? result[key] : undefined
  }, obj)
}

/**
 * 从对象生成CSS变量
 */
function generateVariables(tokens: Record<string, any>, prefix = ''): string {
  let result: string[] = []
  
  Object.entries(tokens).forEach(([key, value]) => {
    const varName = prefix ? `${prefix}-${key}` : key
    
    if (typeof value === 'object' && value !== null) {
      // 递归处理嵌套对象
      result.push(generateVariables(value, varName))
    } else {
      // 基础值
      result.push(`--${varName}: ${value};`)
    }
  })
  
  return result.join('\n')
}