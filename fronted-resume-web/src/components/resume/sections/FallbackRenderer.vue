<template>
  <div class="fallback-renderer">
    <div class="fallback-header">
      <strong>模块类型: {{ section.type }}</strong>
      <div>布局: {{ layout }}</div>
    </div>
    <div class="fallback-content">
      <pre>{{ JSON.stringify(items, null, 2) }}</pre>
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
  layout: {
    type: String,
    default: 'standard'
  },
  config: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style>
.fallback-renderer {
  padding: 15px;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 4px;
  margin-bottom: 10px;
}

.fallback-header {
  margin-bottom: 10px;
}

.fallback-header strong {
  color: #dc3545;
  display: block;
  margin-bottom: 5px;
}

.fallback-content pre {
  margin: 10px 0 0;
  background: #f1f1f1;
  padding: 8px;
  font-size: 12px;
  overflow: auto;
  max-height: 200px;
}
</style>
