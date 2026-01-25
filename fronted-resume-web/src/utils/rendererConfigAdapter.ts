/**
 * 渲染器配置适配工具
 * 将模板配置转换为各渲染器所需的格式
 */

import { normalizeModuleType } from './sectionTypeMapping'

/**
 * 适配 Basic/Personal 渲染器的配置
 * @param section 模块数据
 * @param styleConfig 样式配置
 * @returns 适配后的配置
 */
export function adaptBasicRendererConfig(section: any, styleConfig: any): Record<string, any> {
  const config = section.config || {}
  const moduleConfig = styleConfig?.moduleConfig || {}
  
  // 合并配置
  const adaptedConfig = {
    layout: config.layout || moduleConfig.layout || 'flexible',
    showTitle: config.showTitle !== undefined ? config.showTitle : moduleConfig.showTitle,
    title: section.title || moduleConfig.title,
    
    // 字段配置
    fields: config.fields || moduleConfig.fields || {},
    
    // 样式配置
    nameStyle: styleConfig?.nameStyle || config.nameStyle,
    titleStyle: styleConfig?.titleTextStyle || config.titleStyle,
    fieldStyle: styleConfig?.fieldStyle || config.fieldStyle,
    contactStyle: styleConfig?.contactStyle || config.contactStyle,
    infoSectionStyle: styleConfig?.infoSectionStyle || config.infoSectionStyle,
    
    // 其他自定义配置
    ...config
  }
  
  console.log('Basic渲染器配置适配', {
    original: { config, styleConfig },
    adapted: adaptedConfig
  })
  
  return adaptedConfig
}

/**
 * 适配 Education 渲染器的配置
 * @param section 模块数据
 * @param styleConfig 样式配置
 * @returns 适配后的配置
 */
export function adaptEducationRendererConfig(section: any, styleConfig: any): Record<string, any> {
  const config = section.config || {}
  const moduleConfig = styleConfig?.moduleConfig || {}
  
  return {
    layout: config.layout || moduleConfig.layout || 'timeline',
    schoolStyle: styleConfig?.schoolStyle || config.schoolStyle,
    degreeStyle: styleConfig?.degreeStyle || config.degreeStyle,
    dateStyle: styleConfig?.dateStyle || config.dateStyle,
    descriptionStyle: styleConfig?.descriptionStyle || config.descriptionStyle,
    itemStyle: styleConfig?.items || config.itemStyle,
    ...config
  }
}

/**
 * 适配 Experience 渲染器的配置
 * @param section 模块数据
 * @param styleConfig 样式配置
 * @returns 适配后的配置
 */
export function adaptExperienceRendererConfig(section: any, styleConfig: any): Record<string, any> {
  const config = section.config || {}
  const moduleConfig = styleConfig?.moduleConfig || {}
  
  return {
    layout: config.layout || moduleConfig.layout || 'timeline',
    companyStyle: styleConfig?.companyStyle || config.companyStyle,
    positionStyle: styleConfig?.positionStyle || config.positionStyle,
    dateStyle: styleConfig?.dateStyle || config.dateStyle,
    descriptionStyle: styleConfig?.descriptionStyle || config.descriptionStyle,
    itemStyle: styleConfig?.items || config.itemStyle,
    ...config
  }
}

/**
 * 适配 Skills 渲染器的配置
 * @param section 模块数据
 * @param styleConfig 样式配置
 * @returns 适配后的配置
 */
export function adaptSkillsRendererConfig(section: any, styleConfig: any): Record<string, any> {
  const config = section.config || {}
  const moduleConfig = styleConfig?.moduleConfig || {}
  
  return {
    layout: config.layout || moduleConfig.layout || 'mixed',
    tagStyle: styleConfig?.tagStyle || config.tagStyle,
    skillBars: styleConfig?.skillBars || config.skillBars,
    languageSection: config.languageSection,
    computerSection: config.computerSection,
    teamworkSection: config.teamworkSection,
    ...config
  }
}

/**
 * 适配 Projects 渲染器的配置
 * @param section 模块数据
 * @param styleConfig 样式配置
 * @returns 适配后的配置
 */
export function adaptProjectsRendererConfig(section: any, styleConfig: any): Record<string, any> {
  const config = section.config || {}
  const moduleConfig = styleConfig?.moduleConfig || {}
  
  return {
    layout: config.layout || moduleConfig.layout || 'timeline',
    projectNameStyle: styleConfig?.projectNameStyle || config.projectNameStyle,
    descriptionStyle: styleConfig?.descriptionStyle || config.descriptionStyle,
    itemStyle: styleConfig?.items || config.itemStyle,
    ...config
  }
}

/**
 * 通用配置适配
 * @param section 模块数据
 * @param styleConfig 样式配置
 * @returns 适配后的配置
 */
export function adaptGenericRendererConfig(section: any, styleConfig: any): Record<string, any> {
  const config = section.config || {}
  const moduleConfig = styleConfig?.moduleConfig || {}
  
  return {
    layout: config.layout || moduleConfig.layout || 'simple',
    itemStyle: styleConfig?.items || styleConfig?.content || config.itemStyle,
    ...moduleConfig,
    ...config
  }
}

/**
 * 根据模块类型适配渲染器配置
 * @param section 模块数据
 * @param styleConfig 样式配置
 * @returns 适配后的配置
 */
export function adaptRendererConfig(section: any, styleConfig: any): Record<string, any> {
  const normalizedType = normalizeModuleType(section.type)
  
  const adapters: Record<string, (section: any, styleConfig: any) => Record<string, any>> = {
    'basic': adaptBasicRendererConfig,
    'education': adaptEducationRendererConfig,
    'experience': adaptExperienceRendererConfig,
    'skills': adaptSkillsRendererConfig,
    'projects': adaptProjectsRendererConfig,
  }
  
  const adapter = adapters[normalizedType] || adaptGenericRendererConfig
  return adapter(section, styleConfig)
}

/**
 * 提取并适配样式配置供渲染器使用
 * @param styleConfig 原始样式配置
 * @returns 适配后的样式配置
 */
export function adaptStyleConfigForRenderer(styleConfig: any): Record<string, any> {
  if (!styleConfig) return {}
  
  // 提取所有样式相关的配置
  const adapted: Record<string, any> = {}
  
  // 复制所有样式属性
  Object.keys(styleConfig).forEach(key => {
    // 排除一些内部使用的属性
    if (!['moduleConfig'].includes(key)) {
      adapted[key] = styleConfig[key]
    }
  })
  
  return adapted
}

