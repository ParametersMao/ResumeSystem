<template>
  <div class="resumes-page">
    <div class="container">
      <div class="resume-grid">
        <div v-for="r in list" :key="r.resumeId" class="resume-card">
          <div class="card-preview">
            <img v-if="(r as any).thumbUrl" :src="(r as any).thumbUrl" alt="简历预览" class="preview-image"/>
            <div v-else class="preview-placeholder">
              <div class="placeholder-text">生成缩略图中...</div>
            </div>
          </div>
          <div class="card-info">
            <div class="resume-title">{{ r.meta.title }}</div>
            <div class="resume-meta">
              <span class="resume-id">Parameters @-{{ new Date(r.meta.updatedAt).toISOString().slice(0,10).replace(/-/g, '') }}</span>
              <span class="update-time">{{ formatDate(r.meta.updatedAt) }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="action-btn edit-btn" @click="goEdit(r.resumeId)">
              <span class="btn-icon">✏️</span>
              编辑
            </button>
            <button class="action-btn preview-btn" @click="goPreview(r.resumeId)">
              <span class="btn-icon">👁️</span>
              预览
            </button>
            <button class="action-btn share-btn" @click="share(r.resumeId)">
              <span class="btn-icon">📤</span>
              分享
            </button>
            <button class="action-btn delete-btn" @click="remove(r.resumeId)">
              <span class="btn-icon">🗑️</span>
              删除
            </button>
          </div>
        </div>
      </div>
      <div class="pagination" v-if="totalPages > 1">
        <span class="page-info">第 {{ page }} / {{ totalPages }} 页</span>
        <div class="page-controls">
          <button class="page-btn" :disabled="page<=1" @click="page--; load()">上一页</button>
          <button class="page-btn" :disabled="page>=totalPages" @click="page++; load()">下一页</button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import html2canvas from 'html2canvas'
import { listMyResumes } from '@/api/resume'
import type { Resume, SectionItem } from '@/store/resume'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const list = ref<Resume[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(8)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

async function load() {
  const userId = userStore.user?.id
  if (!userId) {
    return
  }
  const data = await listMyResumes(userId, page.value, limit.value)
  list.value = data.list
  total.value = data.total
  await nextTick()
  // 生成缩略图
  for (const r of list.value) generateThumb(r)
}

function goEdit(id: string) { router.push(`/editor/${id}`) }
function goPreview(id: string) { router.push(`/preview/${id}`) }
function share(_id: string) { /* 预留 */ }
function remove(_id: string) { /* 预留 */ }

function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

async function generateThumb(resume: Resume) {
  // 构建一个小型渲染容器
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '500px'
  container.innerHTML = renderMini(resume)
  document.body.appendChild(container)
  try {
    const pageEl = container.querySelector('.mini-page') as HTMLElement
    const canvas = await html2canvas(pageEl, { scale: 1, useCORS: true })
    ;(resume as any).thumbUrl = canvas.toDataURL('image/png')
  } finally {
    document.body.removeChild(container)
  }
}

function renderMini(resume: Resume) {
  const itemsHtml = resume.sections.map(s => {
    const listHtml = (s.visible ? s.items.map((it: SectionItem) => `<li>${formatItem(it)}</li>`).join('') : '')
    return s.visible ? `<div class=\"sec\"><div class=\"ttl\">${s.title}</div><ul>${listHtml}</ul></div>` : ''
  }).join('')
  return `
  <div class=\"mini-page\" style=\"width:500px;background:#fff;color:#333;border:1px solid #eee;padding:16px;\">
    <h3 style=\"margin:0 0 8px\">${resume.meta.title}</h3>
    ${itemsHtml}
  </div>`
}

function formatItem(it: SectionItem) {
  if ((it as any).company) return `${(it as any).company} - ${(it as any).role}`
  if ((it as any).name) return `${(it as any).name}`
  if ((it as any).content) return `${(it as any).content}`
  return ''
}

onMounted(load)
</script>

<style scoped>
.resumes-page {
  height: 100vh;
  background: #f7f8fa;
}

.container {
  height: 100%;
  padding: 32px;
  overflow-y: auto;
}

.resume-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1200px;
}

.resume-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.resume-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-preview {
  height: 240px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.placeholder-text {
  font-size: 14px;
}

.card-info {
  padding: 16px;
}

.resume-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.resume-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.resume-id {
  font-family: 'Courier New', monospace;
}

.update-time {
  color: #9ca3af;
}

.card-actions {
  padding: 12px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
  color: #6b7280;
}

.action-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.edit-btn:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.preview-btn:hover {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #22c55e;
}

.share-btn:hover {
  background: #fefce8;
  border-color: #eab308;
  color: #eab308;
}

.delete-btn:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.btn-icon {
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.page-info {
  color: #6b7280;
  font-size: 14px;
}

.page-controls {
  display: flex;
  gap: 8px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>


