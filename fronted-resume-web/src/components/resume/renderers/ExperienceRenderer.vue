<template>
  <div class="experience-renderer">
    <div 
      v-for="(item, index) in items" 
      :key="index"
      class="experience-item"
      :class="{ 'with-separator': hasSeparator }"
    >
      <div class="experience-header">
        <div class="experience-main">
          <div class="experience-company">{{ getCompany(item) }}</div>
          <div class="experience-role">{{ getRole(item) }}</div>
        </div>
        <div class="experience-time">
          {{ getDuration(item) }}
        </div>
      </div>
      <div v-if="hasActualContent(item)" class="experience-description" v-html="sanitizeHtml(getDescription(item))">
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
  
  if (Array.isArray(item.dateRange)) {
    const start = item.dateRange[0] || ''
    const end = item.dateRange[1] || ''
    return `${start} - ${end}`
  }
  
  const start = item.start || item.startDate || ''
  const end = item.end || item.endDate || ''
  return `${start} - ${end}`
}

// 检查是否有实际内容
function hasActualContent(item: any): boolean {
  const desc = getDescription(item)
  if (!desc) return false
  return String(desc).trim().length > 0
}

// 获取描述内容
function getDescription(item: any): string {
  if (!item) return ''
  
  const raw =
    item.desc ??
    item.description ??
    (Array.isArray(item.responsibilities) ? item.responsibilities.join('\n') : item.responsibilities) ??
    ''
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
  
  // 兜底：返回空字符串（不再显示 JSON）
  return ''
}

function getCompany(item: any): string {
  return item?.company || item?.organization || item?.companyName || ''
}

function getRole(item: any): string {
  return item?.role || item?.position || item?.title || ''
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
.experience-renderer {
  width: 100%;
}

.experience-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
}

.experience-item.with-separator:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.experience-main {
  flex: 1;
}

.experience-company {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.experience-role {
  font-size: 14px;
  color: #555;
}

.experience-time {
  color: #2f80ed;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  margin-left: 10px;
}

.experience-description {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

:deep(.experience-description ul) {
  padding-left: 20px;
  margin: 8px 0;
}

:deep(.experience-description li) {
  margin-bottom: 4px;
}
</style>
