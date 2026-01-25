<template>
  <div class="education-renderer">
    <div 
      v-for="(item, index) in items" 
      :key="index"
      class="education-item"
      :class="{ 'with-separator': hasSeparator }"
    >
      <div class="education-header">
        <div class="education-main">
          <div class="education-school">{{ item.school }}</div>
          <div class="education-degree">{{ item.degree }}</div>
        </div>
        <div class="education-time">
          {{ getDuration(item) }}
        </div>
      </div>
      <div v-if="item.major" class="education-major">
        专业: {{ item.major }}
      </div>
      <div v-if="item.gpa" class="education-gpa">
        {{ item.gpa }}
      </div>
      <div v-if="item.courses" class="education-courses">
        {{ item.courses }}
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
</script>

<style scoped>
.education-renderer {
  width: 100%;
}

.education-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
}

.education-item.with-separator:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.education-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.education-main {
  flex: 1;
}

.education-school {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.education-degree {
  font-size: 14px;
  color: #555;
}

.education-time {
  color: #2f80ed;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  margin-left: 10px;
}

.education-major,
.education-gpa,
.education-courses {
  font-size: 14px;
  margin-top: 5px;
  color: #666;
}

.education-courses {
  white-space: pre-line;
  line-height: 1.4;
}
</style>
