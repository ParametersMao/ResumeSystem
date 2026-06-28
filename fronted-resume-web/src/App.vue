<template>
  <el-config-provider :locale="zhCn">
    <router-view />
    <Transition name="app-loading-fade">
      <div v-if="appStore.loading" class="app-global-loading">
        <div class="app-loading-inner">
          <el-icon class="app-loading-spinner" :size="36"><Loading /></el-icon>
          <span class="app-loading-text">{{ appStore.loadingText }}</span>
        </div>
      </div>
    </Transition>
  </el-config-provider>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
</script>

<style>
html, body, #app { height: 100%; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, 'Noto Sans CJK SC', sans-serif; }
</style>

<style scoped>
.app-global-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.app-loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.app-loading-spinner {
  animation: app-spin 1s linear infinite;
  color: var(--el-color-primary, #409eff);
}

.app-loading-text {
  font-size: 14px;
  color: #606266;
}

@keyframes app-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.app-loading-fade-enter-active,
.app-loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.app-loading-fade-enter-from,
.app-loading-fade-leave-to {
  opacity: 0;
}
</style>
