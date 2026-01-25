<template>
  <div class="generic-content-renderer">
    <!-- 根据项目类型和布局选择合适的渲染方式 -->
    <component 
      v-if="layoutComponent"
      :is="layoutComponent"
      :items="items"
      :config="config"
      :style-config="styleConfig"
    />
    
    <!-- 列表类型项目 -->
    <template v-else-if="isList">
      <div 
        v-for="(item, index) in items" 
        :key="index"
        :class="[
          'section-item',
          `section-${sectionType}-item`,
          { 'with-separator': hasSeparator }
        ]"
        :style="itemStyle"
      >
        <!-- 字符串类型项目 -->
        <template v-if="typeof item === 'string'">
          <div class="item-text">{{ item }}</div>
        </template>
        
        <!-- 复杂对象类型项目 -->
        <template v-else>
          <!-- 通用对象渲染 -->
          <div class="item-content">
            <template v-if="item.text">
              <div class="item-text">{{ item.text }}</div>
            </template>
            <template v-else-if="item.html" v-html="sanitizeHtml(item.html)"></template>
            <template v-else>
              <div v-for="(value, key) in visibleItemProps(item)" :key="key" class="item-field">
                <span class="field-name">{{ formatFieldName(key) }}:</span>
                <span class="field-value">{{ formatFieldValue(value) }}</span>
              </div>
            </template>
          </div>
        </template>
      </div>
    </template>
    
    <!-- 对象类型项目 -->
    <template v-else>
      <div v-if="typeof items === 'object'" class="object-content">
        <div v-for="(value, key) in visibleItemProps(items)" :key="key" class="item-field">
          <span class="field-name">{{ formatFieldName(key) }}:</span>
          <span class="field-value">{{ formatFieldValue(value) }}</span>
        </div>
      </div>
      
      <!-- 纯文本内容 -->
      <div v-else class="text-content">{{ items }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, resolveComponent } from 'vue'

interface Props {
  section: {
    id: string;
    type: string;
    title?: string;
    items: any[];
  };
  items: any[] | object | string;
  config?: any;
  styleConfig?: any;
}

// 组件属性定义

const props = defineProps<Props>()

// 模块类型
const sectionType = computed(() => props.section.type || 'generic')

// 是否为列表类型
const isList = computed(() => Array.isArray(props.items))

// 布局组件
const layoutComponent = computed(() => {
  const config = props.config || {}
  const layout = config.layout || 'standard'
  const componentName = `${props.section.type}-${layout}`
  
  console.log(`尝试解析组件: ${componentName}, section类型: ${props.section.type}`, config)
  
  // 尝试解析具体的布局组件
  const resolved = resolveComponent(componentName)
  console.log(`解析结果: ${componentName}`, resolved)
  
  // 如果找不到特定布局组件，回退到标准布局
  if (!resolved && layout !== 'standard') {
    const standardComponent = `${props.section.type}-standard`
    console.log(`尝试回退到标准组件: ${standardComponent}`)
    const standardResolved = resolveComponent(standardComponent)
    if (standardResolved) {
      return standardResolved
    }
  }
  
  return resolved || null
})

// 是否有分隔符
const hasSeparator = computed(() => {
  const styleConfig = props.styleConfig || {}
  const itemsConfig = styleConfig.items || {}
  const separator = itemsConfig.separator || {}
  
  return separator.type && separator.type !== 'none'
})

// 项目样式
const itemStyle = computed(() => {
  const styleConfig = props.styleConfig || {}
  const itemsConfig = styleConfig.items || {}
  
  return {
    marginBottom: itemsConfig.spacing || '15px',
    // 其他项目样式
    ...itemsConfig
  }
})

// 过滤出可显示的属性
function visibleItemProps(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  
  if (!obj) return result
  
  // 过滤掉特殊属性和函数
  Object.keys(obj).forEach(key => {
    if (
      typeof obj[key] !== 'function' && 
      key !== 'component' &&
      key !== 'style' &&
      key !== 'config' &&
      key !== 'className' &&
      !key.startsWith('_')
    ) {
      result[key] = obj[key]
    }
  })
  
  return result
}

// 格式化字段名称
function formatFieldName(key: string): string {
  // 将驼峰命名转换为空格分隔的词组
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

// 格式化字段值
function formatFieldValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  if (typeof value === 'object') {
    // 对象类型的特殊处理
    if (value.html) {
      return value.html
    }
    
    if (value.text) {
      return value.text
    }
    
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    
    // 日期区间对象
    if (value.start || value.end) {
      return `${value.start || ''} - ${value.end || ''}`
    }
    
    try {
      return JSON.stringify(value)
    } catch (e) {
      return '[Object]'
    }
  }
  
  return String(value)
}

// 净化HTML内容
function sanitizeHtml(html: string): string {
  // 基础安全过滤
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/onclick/gi, '')
    .replace(/onerror/gi, '')
}
</script>

<style>
.generic-content-renderer {
  width: 100%;
}

.section-item {
  margin-bottom: 15px;
}

.section-item:last-child {
  margin-bottom: 0;
}

.section-item.with-separator:not(:last-child) {
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.item-field {
  margin-bottom: 5px;
}

.field-name {
  font-weight: 500;
  margin-right: 8px;
}

.item-text {
  line-height: 1.5;
}
</style>
