<template>
  <div class="user-management">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input
            v-model="searchForm.email"
            placeholder="请输入邮箱"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ getRoleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="info" size="small" @click="handleResetPassword(row)">
              重置密码
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="form.id === 0" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入初始密码" show-password />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="操作员" value="operator" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 密码重置对话框 -->
    <el-dialog v-model="resetPasswordVisible" title="重置密码" width="400px">
      <el-form :model="resetPasswordForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input :model-value="resetPasswordForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" required>
          <el-input v-model="resetPasswordForm.password" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { User } from '@/types'
import { getUserList, createUser, updateUser, deleteUser, updateUserStatus, resetUserPassword } from '@/api/user'

// 密码重置
const resetPasswordVisible = ref(false)
const resetPasswordForm = reactive({
  id: 0,
  username: '',
  password: ''
})

const handleResetPassword = (row: User) => {
  resetPasswordForm.id = row.id
  resetPasswordForm.username = row.username
  resetPasswordForm.password = ''
  resetPasswordVisible.value = true
}

const submitResetPassword = async () => {
  if (!resetPasswordForm.password) {
    ElMessage.warning('请输入新密码')
    return
  }
  try {
    await resetUserPassword(resetPasswordForm.id, resetPasswordForm.password)
    ElMessage.success('密码重置成功')
    resetPasswordVisible.value = false
  } catch (error) {
    ElMessage.error('密码重置失败')
  }
}

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  status: ''
})

// 用户列表
const userList = ref<User[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()

// 表单
const form = reactive({
  id: 0,
  username: '',
  password: '',
  email: '',
  phone: '',
  role: 'viewer' as const,
  status: 'active' as const
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      message: '密码至少 8 位，并包含大小写字母和数字',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 获取用户列表
const getUserListData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.pageSize,
      search: searchForm.username || '',
      status: searchForm.status === 'active' ? 1 : searchForm.status === 'inactive' ? 0 : undefined
    }
    const res = await getUserList(params)
    userList.value = (res.data.list || []).map((item: any) => ({
      ...item,
      status: item.status === 1 ? 'active' : 'inactive',
      createdAt: item.createTime,
      updatedAt: item.updateTime
    }))
    pagination.total = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getUserListData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    email: '',
    status: ''
  })
  handleSearch()
}

// 新增用户
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  Object.assign(form, {
    id: 0,
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'viewer' as const,
    status: 'active' as const
  })
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: User) => {
  dialogTitle.value = '编辑用户'
  Object.assign(form, row, { password: '' })
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 'active' ? '禁用' : '启用'}该用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await updateUserStatus(row.id, row.status === 'active' ? 0 : 1)
    ElMessage.success('操作成功')
    getUserListData()
  } catch {
    // 用户取消
  }
}

// 删除用户
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    getUserListData()
  } catch {
    // 用户取消
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    if (form.id === 0) {
      // 新增
      await createUser({
        username: form.username,
        password: form.password,
        email: form.email,
        phone: form.phone, // 补充手机号
        role: form.role,
        status: form.status === 'active' ? 1 : 0
      })
      ElMessage.success('新增成功')
    } else {
      // 编辑
      await updateUser(form.id, {
        username: form.username,
        email: form.email,
        phone: form.phone, // 补充手机号
        role: form.role
      })
      ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
    getUserListData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  getUserListData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getUserListData()
}

// 工具函数
const getRoleType = (role: string) => {
  const types = {
    admin: 'danger',
    operator: 'warning',
    viewer: 'info'
  }
  return types[role as keyof typeof types] || 'info'
}

const getRoleLabel = (role: string) => {
  const labels = {
    admin: '管理员',
    operator: '操作员',
    viewer: '查看者'
  }
  return labels[role as keyof typeof labels] || role
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  getUserListData()
})
</script>

<style scoped>
.user-management {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 
