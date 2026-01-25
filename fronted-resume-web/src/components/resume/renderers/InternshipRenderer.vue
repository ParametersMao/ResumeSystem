<template>
  <div class="internship-renderer">
    <div 
      v-for="(item, index) in items" 
      :key="index"
      class="internship-item"
      :class="{ 'with-separator': hasSeparator }"
    >
      <div class="internship-header">
        <div class="internship-main">
          <div class="internship-company">{{ item.company }}</div>
          <div class="internship-role">{{ item.role || item.position }}</div>
        </div>
        <div class="internship-time">
          {{ getDuration(item) }}
        </div>
      </div>
      <div v-if="item.desc || item.description" class="internship-description" v-html="sanitizeHtml(getDescription(item))">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  config: {
    type: Object,
    default: () => ({})
  },
  styleConfig: {
    type: Object,
    default: () => ({})
  }
})

// 是否有分隔符
const hasSeparator = computed(() => {
  const styleConfig = props.styleConfig || {}
  const itemsConfig = styleConfig.items || {}
  const separator = itemsConfig.separator || {}
  
  return separator.type && separator.type !== 'none'
})

// 格式化时间区间
function getDuration(item: any): string {
  if (!item) return ''
  
  if (item.duration) {
    const start = item.duration.start || ''
    const end = item.duration.end || ''
    return `${start} - ${end}`
  }
  
  const start = item.start || item.startDate || ''
  const end = item.end || item.endDate || ''
  return `${start} - ${end}`
}

// 获取描述内容
function getDescription(item: any): string {
  if (!item) return ''
  
  const desc = item.desc || item.description
  if (!desc) return ''
  
  // 如果是纯字符串
  if (typeof desc === 'string') {
    return desc
  }
  
  // 如果是对象，优先使用html属性
  if (typeof desc === 'object') {
    if (desc.html) {
      return desc.html
    }
    
    if (desc.text) {
      return desc.text
    }
  }
  
  // 兜底：转换为字符串
  try {
    return JSON.stringify(desc)
  } catch (e) {
    return ''
  }
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

<style scoped>
.internship-renderer {
  width: 100%;
}

.internship-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
}

.internship-item.with-separator:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.internship-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.internship-main {
  flex: 1;
}

.internship-company {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.internship-role {
  font-size: 14px;
  color: #555;
}

.internship-time {
  color: #2f80ed;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  margin-left: 10px;
}

.internship-description {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

:deep(.internship-description ul) {
  padding-left: 20px;
  margin: 8px 0;
}

:deep(.internship-description li) {
  margin-bottom: 4px;
}
</style>
