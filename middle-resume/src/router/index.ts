import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'cuser-management',
        name: 'CUserManagement',
        component: () => import('@/views/CUserManagement.vue'),
        meta: { title: 'C 端用户管理', icon: 'UserFilled' }
      },
      {
        path: 'template-management',
        name: 'TemplateManagement',
        component: () => import('@/views/TemplateManagement.vue'),
        meta: { title: '模板管理', icon: 'Document' }
      },
      {
        path: 'data-statistics',
        name: 'DataStatistics',
        component: () => import('@/views/DataStatistics.vue'),
        meta: { title: '数据统计', icon: 'TrendCharts' }
      },
      {
        path: 'ai-operations',
        name: 'AiOperations',
        component: () => import('@/views/AiOperationMonitoring.vue'),
        meta: { title: 'AI 操作监控', icon: 'Monitor' }
      },
      {
        path: 'knowledge-management',
        name: 'KnowledgeManagement',
        component: () => import('@/views/KnowledgeManagement.vue'),
        meta: { title: 'AI 知识库', icon: 'Collection' }
      },
      {
        path: 'system-logs',
        name: 'SystemLogs',
        component: () => import('@/views/SystemLogs.vue'),
        meta: { title: '审计日志', icon: 'Tickets' }
      },
      {
        path: 'system-config',
        name: 'SystemConfig',
        component: () => import('@/views/SystemConfig.vue'),
        meta: { title: 'AI 配置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth !== false && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
