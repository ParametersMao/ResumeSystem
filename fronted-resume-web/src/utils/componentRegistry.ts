/**
 * 动态组件注册系统
 * 支持模板自定义渲染器注册和管理
 */

import type { Component } from 'vue'

export interface ComponentDefinition {
  id: string
  name: string
  component: Component
  description?: string
  version?: string
  author?: string
  tags?: string[]
  props?: Record<string, any>
  example?: any
}

export interface ComponentRegistry {
  register(definition: ComponentDefinition): void
  unregister(id: string): void
  get(id: string): ComponentDefinition | undefined
  list(): ComponentDefinition[]
  has(id: string): boolean
}

class ComponentRegistryImpl implements ComponentRegistry {
  private components = new Map<string, ComponentDefinition>()

  register(definition: ComponentDefinition): void {
    if (!definition.id || !definition.component) {
      throw new Error('Component definition must have id and component')
    }
    
    // 验证组件是否有效
    if (typeof definition.component !== 'object' && typeof definition.component !== 'function') {
      throw new Error('Component must be a valid Vue component')
    }

    this.components.set(definition.id, definition)
    console.log(`Component registered: ${definition.id}`)
  }

  unregister(id: string): void {
    if (this.components.has(id)) {
      this.components.delete(id)
      console.log(`Component unregistered: ${id}`)
    }
  }

  get(id: string): ComponentDefinition | undefined {
    return this.components.get(id)
  }

  list(): ComponentDefinition[] {
    return Array.from(this.components.values())
  }

  has(id: string): boolean {
    return this.components.has(id)
  }
}

// 全局组件注册表实例
export const componentRegistry = new ComponentRegistryImpl()

// 预注册一些内置组件
export function registerBuiltinComponents() {
  // 这里可以预注册一些内置的自定义组件
  // 例如：图表组件、媒体组件等
}

// 从远程加载组件的工具函数
export async function loadRemoteComponent(url: string, id: string): Promise<ComponentDefinition> {
  try {
    const module = await import(/* @vite-ignore */ url)
    const component = module.default || module
    
    return {
      id,
      name: component.name || id,
      component,
      description: component.description,
      version: component.version,
      author: component.author,
      tags: component.tags || [],
      props: component.props,
      example: component.example
    }
  } catch (error) {
    console.error(`Failed to load remote component from ${url}:`, error)
    throw error
  }
}

// 验证组件安全性的工具函数
export function validateComponent(definition: ComponentDefinition): boolean {
  // 检查组件是否包含危险代码
  const componentStr = definition.component.toString()
  
  // 基础安全检查
  const dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /setTimeout\s*\(/,
    /setInterval\s*\(/,
    /document\.write/,
    /innerHTML\s*=/,
    /outerHTML\s*=/
  ]
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(componentStr)) {
      console.warn(`Component ${definition.id} contains potentially dangerous code`)
      return false
    }
  }
  
  return true
}
