<template>
  <div class="navbar-wrapper" @mouseenter="showNavbar" @mouseleave="hideNavbar">
    <nav class="top-navbar" :class="{ 'navbar-visible': isVisible }">
      <div class="nav-items">
        <router-link class="nav-item" to="/home">首页</router-link>
        <router-link class="nav-item" to="/resumes">我的简历</router-link>
        <router-link class="nav-item" to="/templates">简历库</router-link>
        <router-link class="nav-item" to="/account">个人资料</router-link>
        <router-link class="nav-item" to="/contact">联系我们</router-link>
      </div>
      <div class="user-section">
        <span class="username">{{ userStore.user?.username || '用户' }}</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const isVisible = ref(true) // 默认显示，鼠标悬浮在顶部时显示

function showNavbar() {
  isVisible.value = true
}

function hideNavbar() {
  // 可以设置为 false 实现自动隐藏功能
  // isVisible.value = false
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    // 用户取消退出
  }
}
</script>

<style scoped>
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
  pointer-events: none;
}

.top-navbar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  width: 90%;
  height: 56px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  padding: 0 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  margin-top: 12px;
}

.top-navbar.navbar-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* 如果想要自动隐藏功能，取消下面的注释 */
/* .top-navbar {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.top-navbar.navbar-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
} */

.nav-items {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  position: relative;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-radius: 20px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(46, 108, 255, 0.08);
  color: #2e6cff;
}

.nav-item.router-link-active {
  background: #2e6cff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(46, 108, 255, 0.3);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-navbar {
    width: 95%;
    padding: 0 16px;
  }
  
  .nav-item {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .username {
    display: none;
  }
}
</style>
