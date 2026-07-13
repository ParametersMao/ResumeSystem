<template>
  <div class="cuser-management">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" clearable placeholder="用户名 / 手机号 / 邮箱" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable placeholder="全部" style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header><span>C 端用户列表</span></template>
      <el-table v-loading="loading" :data="cUserList" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" min-width="130" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="email" label="邮箱" min-width="190" />
        <el-table-column prop="aiOperationCount" label="AI 调用" width="100" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" min-width="180">
          <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
        </el-table-column>
        <el-table-column v-if="canWrite" label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CUser } from '@/types'
import { deleteCUser, getCUserList, resetCUserPassword, updateCUserStatus } from '@/api/cuser'
import { useUserStore } from '@/store/modules/user'

const cUserList = ref<CUser[]>([])
const loading = ref(false)
const userStore = useUserStore()
const canWrite = computed(() => userStore.user?.role !== 'viewer')
const pagination = reactive({ total: 0, page: 1, pageSize: 10 })
const searchForm = reactive<{ keyword: string; status?: number }>({ keyword: '', status: undefined })

async function fetchList() {
  loading.value = true
  try {
    const res = await getCUserList({
      page: pagination.page,
      limit: pagination.pageSize,
      search: searchForm.keyword || undefined,
      status: searchForm.status,
    })
    cUserList.value = res.data.list || []
    pagination.total = res.data.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.page = 1; void fetchList() }
function handleReset() { searchForm.keyword = ''; searchForm.status = undefined; handleSearch() }

async function handleToggleStatus(row: CUser) {
  await ElMessageBox.confirm(`确定${row.status === 1 ? '禁用' : '启用'}用户“${row.username}”吗？`, '确认操作', { type: 'warning' })
  await updateCUserStatus(row.id, row.status === 1 ? 0 : 1)
  ElMessage.success('状态已更新')
  await fetchList()
}

async function handleResetPassword(row: CUser) {
  const result = await ElMessageBox.prompt('新密码至少 8 位，并包含大小写字母和数字', `重置 ${row.username} 的密码`, {
    inputType: 'password',
    inputPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    inputErrorMessage: '密码强度不符合要求',
  })
  await resetCUserPassword(row.id, result.value)
  ElMessage.success('密码已重置，原登录状态已失效')
}

async function handleDelete(row: CUser) {
  await ElMessageBox.confirm(`删除用户“${row.username}”后不可恢复，确定继续吗？`, '高风险操作', { type: 'error' })
  await deleteCUser(row.id)
  ElMessage.success('用户已删除')
  await fetchList()
}

function formatDate(value: string) { return value ? new Date(value).toLocaleString('zh-CN') : '-' }
onMounted(fetchList)
</script>

<style scoped>
.cuser-management { padding: 20px; }
.search-card { margin-bottom: 20px; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
