import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'

const Login = () => import('@/views/Login.vue')
const Home = () => import('@/views/Home.vue')
const Templates = () => import('@/views/Templates.vue')
const Editor = () => import('@/views/Editor.vue')
// const ResumeEditor = () => import('@/views/ResumeEditor.vue')
const ResumeEditor = () => import('@/views/ResumeEditorNew.vue')
const Preview = () => import('@/views/Preview.vue')
const Resumes = () => import('@/views/Resumes.vue')
const Contact = () => import('@/views/Contact.vue')
const AppLayout = () => import('@/layouts/AppLayout.vue')

const routes: RouteRecordRaw[] = [
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  // 独立的简历编辑器页面（全屏）
  { path: '/resume-editor', component: ResumeEditor, meta: { requiresAuth: true } },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: false },
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', component: Home, meta: { requiresAuth: false } },
      { path: 'resumes', component: Resumes, meta: { requiresAuth: true } },
      { path: 'templates', component: Templates, meta: { requiresAuth: false } },
      { path: 'contact', component: Contact, meta: { requiresAuth: false } },
      { path: 'positions', component: Resumes, meta: { requiresAuth: true } },
      { path: 'mock', component: Resumes, meta: { requiresAuth: true } },
      { path: 'account', component: Resumes, meta: { requiresAuth: true } },
      { path: 'editor/:resumeId', component: Editor, props: true, meta: { requiresAuth: true } },
      { path: 'preview/:resumeId', component: Preview, props: true, meta: { requiresAuth: true } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 检查路由是否需要登录
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  
  if (requiresAuth && !userStore.isLoggedIn) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    // 已登录访问登录页，跳转到主页
    next('/resumes')
  } else {
    // 允许访问
    next()
  }
})

export default router


