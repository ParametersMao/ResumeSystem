<template>
  <div class="error-message" :class="{ fullscreen }">
    <div class="error-content">
      <el-icon class="error-icon"><Warning /></el-icon>
      <div class="error-text">
        <h3 v-if="title">{{ title }}</h3>
        <p>{{ message }}</p>
      </div>
      <div v-if="showRetry" class="error-actions">
        <el-button type="primary" @click="$emit('retry')">重试</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message: string
  fullscreen?: boolean
  showRetry?: boolean
}

defineProps<Props>()

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.error-message.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
}

.error-content {
  max-width: 400px;
}

.error-icon {
  font-size: 48px;
  color: var(--el-color-danger);
  margin-bottom: 16px;
}

.error-text h3 {
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  font-size: 18px;
}

.error-text p {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.error-actions {
  margin-top: 16px;
}
</style> 