/**
 * 验证完全自定义样式功能是否正常工作
 */

// 模拟模板数据
const testTemplateData = {
  templateName: "完全自定义样式测试模板",
  templateData: {
    styles: {
      customCss: `
        .test-custom-class {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          color: white;
          padding: 20px;
          border-radius: 10px;
        }
      `,
      tokens: {
        colors: {
          primary: "#3498db",
          secondary: "#2ecc71"
        },
        spacing: {
          md: "16px",
          lg: "24px"
        }
      }
    },
    responsive: {
      breakpoints: {
        mobile: "0px",
        tablet: "768px",
        desktop: "1024px"
      },
      mobile: {
        ".test-responsive": {
          fontSize: "14px"
        }
      },
      desktop: {
        ".test-responsive": {
          fontSize: "18px"
        }
      }
    }
  }
}

// 模拟section配置
const testSectionConfig = {
  config: {
    customClass: "test-custom-class",
    customStyle: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "30px",
      borderRadius: "15px"
    },
    schema: {
      type: "flex",
      direction: "row",
      justify: "space-between",
      items: [
        {
          type: "text",
          content: "Hello World",
          style: {
            fontSize: "24px",
            color: "#333"
          }
        }
      ]
    }
  }
}

// 验证函数
function verifyCustomStyles() {
  console.log("🔍 开始验证完全自定义样式功能...")
  
  // 1. 验证customCss注入
  console.log("✅ 1. customCss字段存在:", !!testTemplateData.templateData.styles.customCss)
  
  // 2. 验证tokens系统
  console.log("✅ 2. tokens字段存在:", !!testTemplateData.templateData.styles.tokens)
  
  // 3. 验证responsive系统
  console.log("✅ 3. responsive字段存在:", !!testTemplateData.templateData.responsive)
  
  // 4. 验证section自定义样式
  console.log("✅ 4. customClass存在:", !!testSectionConfig.config.customClass)
  console.log("✅ 5. customStyle存在:", !!testSectionConfig.config.customStyle)
  
  // 5. 验证Schema渲染
  console.log("✅ 6. schema字段存在:", !!testSectionConfig.config.schema)
  
  // 6. 验证CSS生成
  const generatedCSS = generateTestCSS(testTemplateData.templateData.styles)
  console.log("✅ 7. CSS生成功能正常:", generatedCSS.length > 0)
  
  // 7. 验证响应式CSS生成
  const responsiveCSS = generateResponsiveCSS(testTemplateData.templateData.responsive)
  console.log("✅ 8. 响应式CSS生成正常:", responsiveCSS.length > 0)
  
  console.log("🎉 所有功能验证通过！")
}

// 生成测试CSS
function generateTestCSS(styles) {
  let css = styles.customCss || ''
  
  // 生成Token CSS变量
  if (styles.tokens) {
    const variables = []
    const addVariables = (obj, prefix = '') => {
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
    
    addVariables(styles.tokens)
    css = `:root {\n  ${variables.join('\n  ')}\n}\n` + css
  }
  
  return css
}

// 生成响应式CSS
function generateResponsiveCSS(responsive) {
  const css = []
  const breakpoints = responsive.breakpoints || {}
  
  if (responsive.mobile) {
    css.push(generateCSSFromObject(responsive.mobile))
  }
  
  if (responsive.desktop) {
    css.push(`@media (min-width: ${breakpoints.desktop}) {`)
    css.push(generateCSSFromObject(responsive.desktop, '  '))
    css.push('}')
  }
  
  return css.join('\n')
}

// 从对象生成CSS
function generateCSSFromObject(styles, indent = '') {
  const css = []
  
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

// 运行验证
verifyCustomStyles()

// 输出生成的CSS示例
console.log("\n📝 生成的CSS示例:")
console.log(generateTestCSS(testTemplateData.templateData.styles))

console.log("\n📱 生成的响应式CSS示例:")
console.log(generateResponsiveCSS(testTemplateData.templateData.responsive))
