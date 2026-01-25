import { validateTemplateData } from './templateSchema'
import { normalizeModuleType, getDefaultModuleConfig } from './sectionTypeMapping'
import { normalizeSectionRichText } from './richText'

/**
 * 模板适配器
 * 用于将旧版模板数据适配到新版结构
 */

/**
 * 适配旧版模板数据到新版格式
 * @param templateData 旧版模板数据
 * @param layoutType 布局类型
 * @param extraStyles 额外样式配置
 */
export function adaptLegacyTemplateData(
  templateData: any,
  layoutType: string = 'single-column',
  extraStyles: Record<string, any> = {}
): Record<string, any> {
  if (!templateData) {
    return createDefaultTemplate(layoutType)
  }

  // 检查是否是新格式的模板数据（包含theme, layout, sectionStyles等）
  if (templateData.theme && templateData.layout && templateData.sectionStyles) {
    console.log('检测到新格式模板数据，直接使用')
    const validation = validateTemplateData(templateData)
    if (!validation.success) {
      console.warn('模板数据校验失败:', validation.issues)
    }
    const normalized = validation.success ? validation.data! : templateData
    return {
      theme: normalized.theme,
      globalStyles: normalized.globalStyles || {},
      layout: normalized.layout,
      sectionStyles: normalized.sectionStyles || {},
      responsive: normalized.responsive || {},
      customCss: normalized.customCss || ''
    }
  }

  console.log('检测到旧格式模板数据，进行适配')
  // 解析旧版模板
  const oldStyles = templateData.styles || {}
  const oldConfig = templateData.globalConfig || {}
  const oldLayout = templateData.layout || [] // 旧模板可能有 layout 数组

  // 适配主题颜色
  const theme = {
    colors: {
      primary: extraStyles?.colors?.primary || oldStyles?.colors?.primary || '#2f80ed',
      secondary: oldStyles?.colors?.secondary || '#2ecc71',
      tertiary: oldStyles?.colors?.tertiary || '#e67e22',
      text: {
        primary: oldStyles?.colors?.text || '#333333',
        secondary: '#666666',
        muted: '#999999'
      },
      background: oldStyles?.colors?.background || '#ffffff',
      border: '#eeeeee'
    },
    typography: {
      fontFamily: {
        body: oldStyles?.fonts?.body || "'Microsoft YaHei', Arial, sans-serif",
        heading: oldStyles?.fonts?.heading || "'Microsoft YaHei', Arial, sans-serif"
      }
    },
    spacing: {
      unit: '8px',
      sectionMargin: oldStyles?.spacing?.sectionMargin || '20px'
    }
  }

  // 适配全局样式
  const globalStyles = {
    backgroundColor: oldStyles?.background || '#f5f5f5',
    fontFamily: `var(--typography-fontFamily-body)`,
    fontSize: '14px',
    lineHeight: '1.5',
    color: `var(--colors-text-primary)`,

    // 从旧版配置中提取
    maxWidth: oldConfig.maxWidth || '860px',
    padding: oldConfig.padding || '30px',
    elements: {
      'h1, h2, h3, h4, h5, h6': {
        fontFamily: `var(--typography-fontFamily-heading)`,
        marginTop: '0',
        marginBottom: '16px',
        lineHeight: '1.3',
        color: `var(--colors-primary)`
      },
      'p': {
        margin: '0 0 16px 0',
        lineHeight: '1.6'
      },
      'ul, ol': {
        paddingLeft: '20px',
        marginBottom: '16px'
      }
    }
  }

  // 适配布局配置
  let layout = {
    type: layoutType,
    container: {
      maxWidth: oldConfig.maxWidth || '860px',
      margin: '0 auto',
      padding: '20px'
    },
    content: {
      padding: oldConfig.padding || '30px',
      backgroundColor: oldConfig.contentBackground || '#ffffff',
      borderRadius: oldConfig.borderRadius || '6px',
      boxShadow: oldConfig.boxShadow || '0 2px 10px rgba(0,0,0,0.1)'
    }
  }

  // 如果是两列布局，添加列配置
  if (layoutType === 'two-column') {
    layout = {
      ...layout,
      columns: {
        widths: ['30%', '70%'],
        gap: '20px',
        leftStyle: {
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px'
        },
        rightStyle: {
          padding: '15px'
        }
      }
    }
  } else if (layoutType === 'three-column') {
    layout = {
      ...layout,
      columns: {
        widths: ['25%', '40%', '35%'],
        gap: '15px',
        leftStyle: {
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px'
        },
        rightStyle: {
          padding: '15px'
        }
      }
    }
  }

  // 适配模块样式
  const sectionStyles: Record<string, any> = {}

  // 如果有旧版 layout 数组，从中提取模块配置
  if (Array.isArray(oldLayout) && oldLayout.length > 0) {
    console.log('从 layout 数组中提取模块配置', oldLayout)

    oldLayout.forEach((moduleConfig: any) => {
      if (!moduleConfig || !moduleConfig.type) return

      // 标准化模块类型
      const normalizedType = normalizeModuleType(moduleConfig.type)

      console.log(`处理模块配置: ${moduleConfig.type} -> ${normalizedType}`)

      // 提取模块的样式配置
      const config = moduleConfig.config || {}

      sectionStyles[normalizedType] = {
        container: {
          marginBottom: theme.spacing.sectionMargin,
          ...config.containerStyle
        },
        title: {
          fontSize: config.titleStyle?.fontSize || '18px',
          fontWeight: config.titleStyle?.fontWeight || 'bold',
          color: config.titleStyle?.color || `var(--colors-primary)`,
          marginBottom: config.titleStyle?.marginBottom || '15px',
          textAlign: config.titleStyle?.textAlign,
          borderBottom: config.titleStyle === 'underline' ? '2px solid var(--colors-primary)' : undefined,
          paddingBottom: config.titleStyle === 'underline' ? '8px' : undefined,
          special: {}
        },
        content: {
          fontSize: config.itemStyle?.fontSize || config.contentStyle?.fontSize || '14px',
          lineHeight: config.itemStyle?.lineHeight || config.contentStyle?.lineHeight || '1.6',
          color: config.itemStyle?.color || config.contentStyle?.color,
          ...config.contentStyle
        },
        items: {
          spacing: config.itemStyle?.marginBottom || '15px',
          separator: config.separator || {
            type: 'none'
          },
          ...config.itemStyle
        },
        // 保存原始配置供渲染器使用
        moduleConfig: {
          ...config,
          layout: config.layout,
          showTitle: config.showTitle,
          title: moduleConfig.title
        }
      }

      // 处理特定模块的特殊样式
      if (config.nameStyle) {
        sectionStyles[normalizedType].nameStyle = config.nameStyle
      }
      if (config.titleStyle && typeof config.titleStyle === 'object') {
        sectionStyles[normalizedType].titleTextStyle = config.titleStyle
      }
      if (config.fieldStyle) {
        sectionStyles[normalizedType].fieldStyle = config.fieldStyle
      }
      if (config.contactStyle) {
        sectionStyles[normalizedType].contactStyle = config.contactStyle
      }
      if (config.infoSectionStyle) {
        sectionStyles[normalizedType].infoSectionStyle = config.infoSectionStyle
      }

      // 处理其他特定样式
      if (config.schoolStyle) sectionStyles[normalizedType].schoolStyle = config.schoolStyle
      if (config.degreeStyle) sectionStyles[normalizedType].degreeStyle = config.degreeStyle
      if (config.dateStyle) sectionStyles[normalizedType].dateStyle = config.dateStyle
      if (config.descriptionStyle) sectionStyles[normalizedType].descriptionStyle = config.descriptionStyle
      if (config.companyStyle) sectionStyles[normalizedType].companyStyle = config.companyStyle
      if (config.positionStyle) sectionStyles[normalizedType].positionStyle = config.positionStyle
      if (config.tagStyle) sectionStyles[normalizedType].tagStyle = config.tagStyle
      if (config.skillBars) sectionStyles[normalizedType].skillBars = config.skillBars
    })
  }

  // 为所有可能的模块类型创建默认样式模板（如果没有从 layout 中提取）
  const moduleTypes = [
    'basic', 'education', 'experience', 'skills',
    'projects', 'awards', 'certificates', 'hobbies',
    'languages', 'publications', 'references', 'summary',
    'self-evaluation', 'custom',
    // 添加系统中其他特殊模块类型
    'intention', 'internship', 'campus'
  ]

  moduleTypes.forEach(type => {
    // 如果已经从 layout 中提取了配置，跳过
    if (sectionStyles[type]) return

    // 每个模块基础样式
    sectionStyles[type] = {
      container: {
        marginBottom: theme.spacing.sectionMargin
      },
      title: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: `var(--colors-primary)`,
        marginBottom: '15px',
        // 默认不使用特殊样式
        special: {}
      },
      content: {
        fontSize: '14px',
        lineHeight: '1.6'
      },
      items: {
        spacing: '15px', // 项目间距
        separator: {
          type: 'solid',
          width: '1px',
          color: '#eee',
          margin: '10px'
        }
      },
      moduleConfig: getDefaultModuleConfig(type)
    }

    // 为每个模块类型设置一些特定样式
    switch (type) {
      case 'basic':
        sectionStyles[type].title.textAlign = 'center'
        break

      case 'skills':
        // 技能模块特殊样式
        if (layoutType === 'single-column') {
          sectionStyles[type].content.columns = '2'
        }
        break

      case 'education':
      case 'experience':
        // 时间线样式
        sectionStyles[type].content.timeLine = {
          position: 'left',
          width: '2px',
          color: `var(--colors-primary)`
        }
        break
    }
  })

  // 创建适配后的模板数据
  const adaptedTemplate = {
    theme,
    globalStyles,
    layout,
    sectionStyles,
    responsive: {
      breakpoints: {
        mobile: '0px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1280px'
      },
      styles: {
        // 移动端样式
        mobile: {
          '.resume-content': {
            padding: '15px'
          }
        },
        // 平板样式
        tablet: {
          '.resume-content': {
            padding: '20px'
          }
        }
      }
    },
    customCss: templateData?.customCss || ''
  }

  // 不再添加默认样式，完全依赖模板数据

  return adaptedTemplate
}

/**
 * 创建默认模板
 * @param layoutType 布局类型
 */
function createDefaultTemplate(layoutType: string = 'single-column'): Record<string, any> {
  return {
    theme: {
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
        }
      }
    },
    globalStyles: {
      backgroundColor: '#f5f5f5',
      fontFamily: `var(--typography-fontFamily-body)`,
      fontSize: '14px',
      lineHeight: '1.5',
      color: `var(--colors-text-primary)`
    },
    layout: {
      type: layoutType,
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
    },
    sectionStyles: {}
  }
}

/**
 * 适配旧版简历数据到新版格式
 * @param resumeData 旧版简历数据
 */
export function adaptLegacyResumeData(resumeData: any): Record<string, any> {
  if (!resumeData) {
    return { profile: {}, sections: [] }
  }

  console.log('适配简历数据', resumeData)

  // 简历数据结构基本保持不变，但需要确保格式正确
  const adaptedData = {
    profile: resumeData.profile || {},
    sections: Array.isArray(resumeData.sections) ? resumeData.sections : []
  }

  // 确保每个模块都有正确的属性
  adaptedData.sections = adaptedData.sections.map((section, index) => {
    // 标准化模块类型
    const originalType = section.type || 'custom'
    const normalizedType = normalizeModuleType(originalType)

    console.log(`适配模块 #${index}: ${originalType} -> ${normalizedType}`, section)

    // 处理items，确保是数组
    let items = section.items || []

    // 如果是summary模块，确保内容正确
    if (normalizedType === 'summary' && items.length > 0) {
      items = items.map((item: any) => {
        // 如果item是对象但没有text或html属性，尝试转换
        if (typeof item === 'object' && item !== null && !item.text && !item.html) {
          return { text: JSON.stringify(item), html: `<p>${JSON.stringify(item)}</p>` }
        }
        return item
      })
    }

    // 构建适配后的模块数据
    const adaptedSection = {
      id: section.id || `section-${normalizedType}-${index}`,
      type: normalizedType, // 使用标准化后的类型
      originalType: originalType, // 保留原始类型供调试
      title: section.title || '模块',
      visible: section.visible !== false,
      order: section.order !== undefined ? section.order : index,
      items: normalizeSectionItems(normalizedType, items),
      config: {
        ...getDefaultModuleConfig(normalizedType), // 应用默认配置
        ...section.config // 合并原有配置
      },
      style: section.style || {},
      data: section.data || {}
    }

    // 对于基础信息模块，确保数据在正确的位置
    if (normalizedType === 'basic') {
      // 如果有 data 字段但没有嵌套的 basic，尝试重组
      if (section.data && !section.data.basic) {
        adaptedSection.data = {
          basic: section.data
        }
      }

      // 如果完全没有数据，尝试从 profile 获取
      if (!adaptedSection.data.basic && adaptedData.profile) {
        adaptedSection.data = {
          basic: adaptedData.profile.basic || adaptedData.profile
        }
      }
    }

    return normalizeSectionRichText(adaptedSection)
  })

  console.log('适配后的简历数据', adaptedData)

  return adaptedData
}

function normalizeSectionItems(type: string, items: any): any[] {
  if (!Array.isArray(items)) return []

  switch (type) {
    case 'experience':
      return items.map((item) => {
        const start = item.start ?? item.startDate ?? item.dateRange?.[0] ?? item.duration?.start ?? ''
        const end = item.end ?? item.endDate ?? item.dateRange?.[1] ?? item.duration?.end ?? ''
        const desc =
          item.desc ??
          item.description ??
          (Array.isArray(item.responsibilities) ? item.responsibilities.join('\n') : item.responsibilities) ??
          ''
        return {
          ...item,
          company: item.company || item.organization || item.companyName || '',
          role: item.role || item.position || item.title || '',
          start,
          end,
          duration: item.duration || (start || end ? { start, end } : undefined),
          desc
        }
      })
    case 'projects':
      return items.map((item) => {
        const start = item.start ?? item.startDate ?? item.dateRange?.[0] ?? item.duration?.start ?? ''
        const end = item.end ?? item.endDate ?? item.dateRange?.[1] ?? item.duration?.end ?? ''
        const desc = item.desc ?? item.description ?? item.summary ?? ''
        return {
          ...item,
          name: item.name || item.projectName || '',
          role: item.role || item.position || '',
          start,
          end,
          duration: item.duration || (start || end ? { start, end } : undefined),
          desc
        }
      })
    case 'education':
      return items.map((item) => {
        const start = item.start ?? item.startDate ?? item.dateRange?.[0] ?? item.duration?.start ?? ''
        const end = item.end ?? item.endDate ?? item.dateRange?.[1] ?? item.duration?.end ?? ''
        return {
          ...item,
          school: item.school || item.schoolName || '',
          start,
          end,
          duration: item.duration || (start || end ? { start, end } : undefined)
        }
      })
    default:
      return items
  }
}