<template>
  <div class="resumes-page">
    <div class="page-header">
      <div>
        <h1>我的简历</h1>
        <p>先聚焦最小可用闭环：编辑、保存、导出。</p>
      </div>
      <el-button type="primary" @click="goCreate">新建简历</el-button>
    </div>

    <el-empty v-if="!loading && list.length === 0" description="还没有简历，先从模板开始创建一份吧" />

    <div v-else class="resume-grid" v-loading="loading">
      <el-card v-for="item in list" :key="item.id" class="resume-card" shadow="hover">
        <div class="resume-card-body">
          <div class="resume-meta">
            <h3>{{ item.title }}</h3>
            <p>模板：{{ item.templateName || '默认模板' }}</p>
            <p>更新时间：{{ formatDate(item.updateTime) }}</p>
          </div>
          <div class="resume-actions">
            <el-button size="small" @click="goEdit(item.id)">继续编辑</el-button>
            <el-button size="small" @click="goPreview(item.id)">预览</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="limit"
        :total="total"
        :page-sizes="[8, 16, 24]"
        layout="total, sizes, prev, pager, next"
        @current-change="load"
        @size-change="load"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listMyResumes } from '@/api/resume'
import { useUserStore } from '@/store/user'

interface ResumeListItem {
  id: number
  title: string
  templateName?: string
  updateTime: string
}

const router = useRouter()
const userStore = useUserStore()

const list = ref<ResumeListItem[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(8)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

onMounted(load)

async function load() {
  if (!userStore.user?.id) {
    await userStore.initUserState()
  }
  if (!userStore.user?.id) {
    return
  }

  loading.value = true
  try {
    const data = await listMyResumes(userStore.user.id, page.value, limit.value)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function goCreate() {
  router.push('/templates')
}

function goEdit(id: number) {
  router.push(`/resume-editor?resumeId=${id}`)
}

function goPreview(id: number) {
  router.push(`/preview/${id}`)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}
</script>

<style scoped>
.resumes-page {
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 30%),
    #f8fafc;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
}

.page-header p {
  margin: 6px 0 0;
  color: #64748b;
}

.resume-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.resume-card {
  border-radius: 18px;
}

.resume-card-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.resume-meta h3 {
  margin: 0 0 8px;
}

.resume-meta p {
  margin: 6px 0 0;
  color: #64748b;
}

.resume-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .resumes-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
