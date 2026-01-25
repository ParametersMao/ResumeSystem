<template>
  <div class="awards-renderer">
    <div 
      v-if="layout === 'grid'" 
      class="awards-grid"
    >
      <div
        v-for="(award, index) in items"
        :key="index"
        class="award-grid-item"
      >
        <div class="award-name">{{ award.name }}</div>
        <div class="award-details">
          <span v-if="award.org" class="award-org">{{ award.org }}</span>
          <span v-if="award.date" class="award-date">{{ award.date }}</span>
        </div>
      </div>
    </div>
    
    <div 
      v-else 
      class="awards-list"
    >
      <div
        v-for="(award, index) in items"
        :key="index"
        class="award-list-item"
        :class="{ 'with-separator': hasSeparator }"
      >
        <div class="award-name">{{ award.name }}</div>
        <div class="award-details">
          <span v-if="award.org" class="award-org">{{ award.org }}</span>
          <span v-if="award.date" class="award-date">{{ award.date }}</span>
        </div>
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

// 布局类型
const layout = computed(() => {
  return props.config?.layout === 'grid' ? 'grid' : 'standard'
})

// 是否有分隔符
const hasSeparator = computed(() => {
  const styleConfig = props.styleConfig || {}
  const itemsConfig = styleConfig.items || {}
  const separator = itemsConfig.separator || {}
  
  return separator.type && separator.type !== 'none'
})
</script>

<style scoped>
.awards-renderer {
  width: 100%;
}

.awards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.award-grid-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 12px;
  background-color: #f8f9fa;
}

.awards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.award-list-item {
  padding: 8px 0;
}

.award-list-item.with-separator:not(:last-child) {
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.award-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 5px;
}

.award-details {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}

.award-org {
  color: #555;
}

.award-date {
  color: #888;
}
</style>
