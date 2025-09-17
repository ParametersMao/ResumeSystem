<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': isCollapsed }">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand" v-show="!isCollapsed">应用功能</div>
        <button class="toggle-btn" @click="toggleSidebar">
          <span class="toggle-icon">{{ isCollapsed ? '▶' : '◀' }}</span>
        </button>
      </div>
      <nav class="menu">
        <router-link class="item" to="/home" :title="isCollapsed ? '首页' : ''">
          <span class="icon">🏠</span>
          <span class="label" v-show="!isCollapsed">首页</span>
        </router-link>
        <router-link class="item" to="/resumes" :title="isCollapsed ? '我的简历' : ''">
          <span class="icon">📄</span>
          <span class="label" v-show="!isCollapsed">我的简历</span>
        </router-link>
        <router-link class="item" to="/templates" :title="isCollapsed ? '简历库' : ''">
          <span class="icon">📊</span>
          <span class="label" v-show="!isCollapsed">简历库</span>
        </router-link>
        <router-link class="item" to="/positions" :title="isCollapsed ? '目标岗位' : ''">
          <span class="icon">🎯</span>
          <span class="label" v-show="!isCollapsed">目标岗位</span>
        </router-link>
        <router-link class="item" to="/mock" :title="isCollapsed ? '模拟面试' : ''">
          <span class="icon">✏️</span>
          <span class="label" v-show="!isCollapsed">模拟面试</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="brand" v-show="!isCollapsed" style="margin-top:auto">设置</div>
        <nav class="menu">
          <router-link class="item" to="/account" :title="isCollapsed ? '账户设置' : ''">
            <span class="icon">⚙️</span>
            <span class="label" v-show="!isCollapsed">账户设置</span>
          </router-link>
          <div class="item user-item" @click="handleLogout" :title="isCollapsed ? '退出登录' : ''">
            <span class="icon">👤</span>
            <span class="label" v-show="!isCollapsed">{{ userStore.user?.username || '用户' }}</span>
          </div>
        </nav>
      </div>
    </aside>
    <main class="content">
      <router-view />
    </main>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const isCollapsed = ref(false)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
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
.app-shell{
  display:grid;
  grid-template-columns:220px 1fr;
  height:100vh;
  transition: grid-template-columns 0.3s ease;
}

.app-shell.sidebar-collapsed{
  grid-template-columns:60px 1fr;
}

.sidebar{
  display:flex;
  flex-direction:column;
  border-right:1px solid #eee;
  background:#fff;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:12px 16px;
  border-bottom:1px solid #f0f0f0;
}

.brand{
  color:#999;
  font-size:14px;
  font-weight:500;
  white-space: nowrap;
}

.toggle-btn{
  background:none;
  border:none;
  cursor:pointer;
  padding:4px;
  border-radius:4px;
  transition:background 0.2s ease;
  color:#666;
  font-size:12px;
}

.toggle-btn:hover{
  background:#f5f5f5;
}

.toggle-icon{
  display:block;
  width:16px;
  height:16px;
  text-align:center;
}

.menu{
  display:flex;
  flex-direction:column;
  padding:8px;
  flex:1;
}

.sidebar-footer{
  border-top:1px solid #f0f0f0;
  padding-top:8px;
}

.item{
  padding:10px 12px;
  border-radius:6px;
  color:#333;
  text-decoration:none;
  display:flex;
  align-items:center;
  gap:8px;
  transition:all 0.2s ease;
  white-space: nowrap;
  position: relative;
}

.item:hover{
  background:#f8f9fa;
}

.item.router-link-active{
  background:#f5f7ff;
  color:#2e6cff;
}

.icon{
  font-size:16px;
  width:20px;
  text-align:center;
  flex-shrink: 0;
}

.label{
  transition: opacity 0.3s ease;
}

.app-shell.sidebar-collapsed .item{
  justify-content: center;
  padding: 10px 8px;
}

.user-item {
  cursor: pointer;
  color: #666 !important;
}

.user-item:hover {
  background: #f8f9fa !important;
  color: #333 !important;
}

.content{
  background:#f7f8fa;
  overflow:auto;
}

/* 收起状态下的 tooltip 效果 */
.app-shell.sidebar-collapsed .item:hover::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  margin-left: 8px;
  opacity: 0;
  animation: fadeIn 0.2s ease-in-out 0.5s forwards;
}

.app-shell.sidebar-collapsed .item:hover::before {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 4px solid transparent;
  border-right-color: #333;
  z-index: 1000;
  margin-left: 4px;
  opacity: 0;
  animation: fadeIn 0.2s ease-in-out 0.5s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>


