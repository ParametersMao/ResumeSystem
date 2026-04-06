<template>
  <div class="system-logs">
    <el-card class="search-card">
      <el-form :model="form" inline>
        <el-form-item label="用户ID">
          <el-input v-model="form.userId" placeholder="可选" style="width: 160px" />
        </el-form-item>
        <el-form-item label="方法">
          <el-select v-model="form.method" placeholder="可选" clearable style="width: 140px">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="PATCH" value="PATCH" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="路由">
          <el-input v-model="form.route" placeholder="精确匹配（可选）" style="width: 320px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>审计日志</span>
          <el-button @click="load" :loading="loading">刷新</el-button>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="createTime" label="时间" width="180">
          <template #default="{ row }">{{ format(row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" width="90" />
        <el-table-column prop="userType" label="类型" width="90" />
        <el-table-column prop="method" label="方法" width="90" />
        <el-table-column prop="statusCode" label="状态码" width="90" />
        <el-table-column prop="durationMs" label="耗时(ms)" width="100" />
        <el-table-column prop="route" label="路由" min-width="220" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP" width="140" show-overflow-tooltip />
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="load"
          @current-change="load"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemLogs } from '@/api/system-logs'

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(20)

const form = reactive({
  userId: '',
  method: '',
  route: '',
})

function format(v: any) {
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v || '-')
  return d.toLocaleString('zh-CN')
}

async function load() {
  loading.value = true
  try {
    const res = await getSystemLogs({
      page: page.value,
      limit: limit.value,
      userId: form.userId ? Number(form.userId) : undefined,
      method: form.method || undefined,
      route: form.route || undefined,
    })
    const data = res.data.data
    list.value = data.list || []
    total.value = data.total || 0
  } catch (e) {
    ElMessage.error('加载审计日志失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function reset() {
  form.userId = ''
  form.method = ''
  form.route = ''
  search()
}

onMounted(load)
</script>

<style scoped>
.search-card { margin-bottom: 16px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>

