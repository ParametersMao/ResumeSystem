/**
 * 组件注册表
 * 用于动态注册和解析Vue组件
 */

import { markRaw } from 'vue'
import type { Component } from 'vue'

// 组件注册项
interface ComponentRegistryItem {
  id: string;
  component: Component;
  metadata?: Record<string, any>;
}

// 组件注册表
const registry = new Map<string, ComponentRegistryItem>()

/**
 * 组件注册表 API
 */
export const componentRegistry = {
  /**
   * 注册组件
   * @param id 组件ID
   * @param component 组件定义
   * @param metadata 组件元数据
   */
  register(id: string, component: Component, metadata: Record<string, any> = {}) {
    if (registry.has(id)) {
      console.warn(`ComponentRegistry: 组件 "${id}" 已存在，将被覆盖`)
    }
    
    // 使用markRaw优化性能，防止组件被代理
    registry.set(id, {
      id,
      component: markRaw(component),
      metadata
    })
    
    return this
  },
  
  /**
   * 批量注册组件
   * @param components 组件配置数组
   */
  registerBatch(components: Array<{ id: string; component: Component; metadata?: Record<string, any> }>) {
    components.forEach(item => {
      this.register(item.id, item.component, item.metadata)
    })
    
    return this
  },
  
  /**
   * 获取组件
   * @param id 组件ID
   */
  get(id: string): ComponentRegistryItem | undefined {
    return registry.get(id)
  },
  
  /**
   * 检查组件是否存在
   * @param id 组件ID
   */
  has(id: string): boolean {
    return registry.has(id)
  },
  
  /**
   * 移除组件
   * @param id 组件ID
   */
  unregister(id: string): boolean {
    return registry.delete(id)
  },
  
  /**
   * 获取所有组件
   */
  getAll(): ComponentRegistryItem[] {
    return Array.from(registry.values())
  },
  
  /**
   * 查找满足条件的组件
   * @param filter 过滤函数
   */
  find(filter: (item: ComponentRegistryItem) => boolean): ComponentRegistryItem[] {
    return this.getAll().filter(filter)
  },
  
  /**
   * 按类型查找组件
   * @param type 组件类型
   */
  findByType(type: string): ComponentRegistryItem[] {
    return this.find(item => item.metadata?.type === type)
  },
  
  /**
   * 清空注册表
   */
  clear() {
    registry.clear()
    return this
  }
}