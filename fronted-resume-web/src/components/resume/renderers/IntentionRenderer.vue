<template>
  <div class="intention-renderer">
    <div class="intention-content">
      <div v-if="typeof items === 'string'" class="intention-text">
        {{ items }}
      </div>
      <div v-else-if="Array.isArray(items) && items.length > 0" class="intention-items">
        <div 
          v-for="(item, index) in items" 
          :key="index" 
          class="intention-item"
        >
          <template v-if="typeof item === 'string'">
            {{ item }}
          </template>
          <template v-else>
            <div v-if="item.intention" class="intention-value">{{ item.intention }}</div>
            <div v-if="item.position" class="intention-position">期望职位：{{ item.position }}</div>
            <div v-if="item.location" class="intention-location">期望地点：{{ item.location }}</div>
            <div v-if="item.salary" class="intention-salary">期望薪资：{{ item.salary }}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
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
</script>

<style scoped>
.intention-renderer {
  width: 100%;
}

.intention-content {
  padding: 5px 0;
}

.intention-text {
  font-size: 15px;
  line-height: 1.6;
}

.intention-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.intention-item {
  padding: 5px 0;
}

.intention-value {
  font-size: 15px;
  margin-bottom: 5px;
}

.intention-position, .intention-location, .intention-salary {
  font-size: 14px;
  color: #666;
  margin-top: 3px;
}
</style>
