<template>
  <div class="summary-renderer">
    <div class="summary-content">
      <!-- 直接字符串内容 -->
      <div v-if="typeof items === 'string'" class="summary-text" v-html="sanitizeHtml(items)">
      </div>
      
      <!-- 数组内容 -->
      <div v-else-if="Array.isArray(items) && items.length > 0" class="summary-items">
        <div 
          v-for="(item, index) in items" 
          :key="index" 
          class="summary-item"
        >
          <template v-if="typeof item === 'string'">
            <div v-html="sanitizeHtml(item)"></div>
          </template>
          <template v-else-if="item && typeof item === 'object'">
            <!-- 处理富文本对象 -->
            <template v-if="item.text && typeof item.text === 'object' && item.text.html">
              <div v-html="sanitizeHtml(item.text.html)"></div>
            </template>
            <template v-else>
              <div v-if="item.text" v-html="sanitizeHtml(item.text)"></div>
              <div v-else-if="item.html" v-html="sanitizeHtml(item.html)"></div>
              <div v-else>{{ formatObject(item) }}</div>
            </template>
          </template>
        </div>
      </div>
      
      <!-- section.data.summary内容 -->
      <div v-else-if="section.data && section.data.summary" class="summary-text" v-html="sanitizeHtml(section.data.summary)">
      </div>
      
      <!-- 直接从section.profile获取 -->
      <div v-else-if="section.data && section.data.profile && section.data.profile.summary" class="summary-text" v-html="sanitizeHtml(section.data.profile.summary)">
      </div>
      
      <!-- 从resumeData.profile获取 -->
      <div v-else-if="resumeData && resumeData.profile && resumeData.profile.summary" class="summary-text" v-html="sanitizeHtml(resumeData.profile.summary)">
      </div>
      
      <!-- 调试信息 -->
      <div v-else class="summary-debug">
        <div>无法显示个人总结内容，请检查数据格式</div>
        <pre class="debug-info">{{ formatObject({items, section}) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  items: {
    type: [Array, Object, String],
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

// 尝试从父组件注入resumeData
const resumeData = inject('resumeData', null)

// 格式化对象为可读字符串
function formatObject(obj: any): string {
  if (!obj) return ''
  try {
    if (typeof obj === 'object') {
      return JSON.stringify(obj, null, 2)
    }
    return String(obj)
  } catch (e) {
    return '无法格式化对象'
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
.summary-renderer {
  width: 100%;
}

.summary-content {
  line-height: 1.6;
}

.summary-text {
  white-space: pre-wrap;
  font-size: 14px;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-item {
  margin-bottom: 5px;
}

.debug-info {
  font-family: monospace;
  font-size: 12px;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  overflow-x: auto;
  max-height: 200px;
}

:deep(p) {
  margin-top: 0;
  margin-bottom: 10px;
}

:deep(ul, ol) {
  padding-left: 20px;
  margin-top: 5px;
  margin-bottom: 10px;
}

:deep(li) {
  margin-bottom: 5px;
}
</style>
