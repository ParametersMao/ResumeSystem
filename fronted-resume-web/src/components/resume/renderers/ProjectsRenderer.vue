<template>
  <div class="projects-renderer">
    <div 
      v-for="(item, index) in items" 
      :key="index"
      class="project-item"
      :class="{ 'with-separator': hasSeparator }"
    >
      <div class="project-header">
        <div class="project-main">
          <div class="project-name">{{ getProjectName(item) }}</div>
          <div v-if="getProjectRole(item)" class="project-role">{{ getProjectRole(item) }}</div>
        </div>
        <div class="project-time">
          {{ getDuration(item) }}
        </div>
      </div>
      <div v-if="hasActualContent(item)" class="project-description" v-html="sanitizeHtml(getDescription(item))">
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
  } else if (item.date) {
    return item.date
  }
  
  if (Array.isArray(item.dateRange)) {
    const start = item.dateRange[0] || ''
    const end = item.dateRange[1] || ''
    return `${start} - ${end}`
  }
  
  const start = item.start || item.startDate || ''
  const end = item.end || item.endDate || ''
  return start || end ? `${start} - ${end}` : ''
}

// 获取描述内容
function getDescription(item: any): string {
  if (!item) return ''
  const raw = item.desc ?? item.description ?? item.summary ?? ''
  if (!raw) return ''
  
  // 如果是纯字符串
  if (typeof raw === 'string') {
    return raw
  }
  
  // 如果是对象，优先使用html属性
  if (typeof raw === 'object') {
    if (raw.html) {
      return raw.html
    }
    
    if (raw.text) {
      return raw.text
    }
  }
  
  // 兜底：转换为字符串
  try {
    return JSON.stringify(item.desc)
  } catch (e) {
    return ''
  }

function hasActualContent(item: any): boolean {
  const desc = getDescription(item)
  if (!desc) return false
  return String(desc).trim().length > 0
}

function getProjectName(item: any): string {
  return item?.name || item?.projectName || ''
}

function getProjectRole(item: any): string {
  return item?.role || item?.position || ''
}
}

// 净化HTML内容
function sanitizeHtml(html: any): string {
  if (!html) return '';
  
  // 确保html是字符串
  const htmlStr = String(html);
  
  // 基础安全过滤
  return htmlStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/onclick/gi, '')
    .replace(/onerror/gi, '')
}
</script>

<style scoped>
.projects-renderer {
  width: 100%;
}

.project-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
}

.project-item.with-separator:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.project-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.project-main {
  flex: 1;
}

.project-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.project-role {
  font-size: 14px;
  color: #2f80ed;
  font-weight: 500;
}

.project-time {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  margin-left: 10px;
}

.project-description {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

:deep(.project-description p) {
  margin-bottom: 8px;
}

:deep(.project-description ul) {
  padding-left: 20px;
  margin: 8px 0;
}

:deep(.project-description li) {
  margin-bottom: 4px;
}
</style>
