<template>
  <div class="app-shell">
    <TopNavbar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import TopNavbar from '@/components/TopNavbar.vue'
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-top: 80px; /* 为顶部导航栏留出空间 */
  min-height: calc(100vh - 80px);
  overflow: auto;
}
</style>


