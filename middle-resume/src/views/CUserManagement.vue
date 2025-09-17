<template>
  <div class="cuser-management">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="昵称">
          <el-input v-model="searchForm.keyword" placeholder="请输入昵称/手机号/邮箱" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="card-header">
        <span>用户列表</span>
      </div>
      <el-table :data="cUserList" border stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="gender" label="性别" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerAt" label="注册时间" />
        <el-table-column prop="lastLoginAt" label="最后登录" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" :type="scope.row.status === 'active' ? 'warning' : 'success'" @click="handleToggleStatus(scope.row)">
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :current-page="pagination.page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CUser } from '@/types'
import { getCUserList, updateCUser, deleteCUser } from '@/api/cuser'

const cUserList = ref<CUser[]>([])
const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 10
})
const searchForm = reactive({
  keyword: ''
})

const fetchList = async () => {
  const res = await getCUserList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    keyword: searchForm.keyword
  })
  cUserList.value = res.data.data.list
  pagination.total = res.data.data.total
}

const handleSearch = () => {
  pagination.page = 1
  fetchList()
}
const handleReset = () => {
  searchForm.keyword = ''
  handleSearch()
}
const handleToggleStatus = async (row: CUser) => {
  try {
    await ElMessageBox.confirm(`确定要${row.status === 'active' ? '禁用' : '启用'}该用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateCUser({ ...row, status: row.status === 'active' ? 'inactive' : 'active' })
    ElMessage.success('操作成功')
    fetchList()
  } catch {}
}
const handleDelete = async (row: CUser) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteCUser(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {}
}
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}
const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchList()
}
onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.cuser-management {
  padding: 20px;
}
.search-card {
  margin-bottom: 20px;
}
.table-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 