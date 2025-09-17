<template>
  <div class="ai-operation-monitoring">
    <!-- 搜索和筛选 -->
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
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.operationType" placeholder="请选择操作类型" clearable>
            <el-option label="润色" value="polish" />
            <el-option label="生成" value="generate" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="处理中" value="processing" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- AI操作列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>AI操作记录</span>
          <div class="header-actions">
            <el-button type="success" @click="handleRefresh">刷新</el-button>
            <el-button type="warning" @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="operationList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="operationType" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeColor(row.operationType)">
              {{ getOperationTypeLabel(row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inputData" label="输入数据" width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.inputData" placement="top">
              <span class="text-truncate">{{ truncateText(row.inputData, 30) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="outputData" label="输出数据" width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.outputData" placement="top">
              <span class="text-truncate">{{ truncateText(row.outputData, 30) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="processingTime" label="处理时间" width="100">
          <template #default="{ row }">
            {{ row.processingTime ? `${row.processingTime}ms` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="140">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button type="primary" size="small" @click="handleView(row)">查看详情</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </div>
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="操作详情"
      width="800px"
    >
      <div v-if="currentOperation" class="operation-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作ID">{{ currentOperation.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentOperation.username }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getOperationTypeColor(currentOperation.operationType)">
              {{ getOperationTypeLabel(currentOperation.operationType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusColor(currentOperation.status)">
              {{ getStatusLabel(currentOperation.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理时间">
            {{ currentOperation.processingTime ? `${currentOperation.processingTime}ms` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentOperation.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="data-section">
          <h4>输入数据</h4>
          <el-input
            v-model="currentOperation.inputData"
            type="textarea"
            :rows="4"
            readonly
          />
        </div>
        
        <div class="data-section">
          <h4>输出数据</h4>
          <el-input
            v-model="currentOperation.outputData"
            type="textarea"
            :rows="6"
            readonly
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AiOperation } from '@/types'

// 搜索表单
const searchForm = reactive({
  username: '',
  operationType: '',
  status: '',
  dateRange: []
})

// 操作列表
const operationList = ref<AiOperation[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 详情对话框
const detailVisible = ref(false)
const currentOperation = ref<AiOperation | null>(null)

// 获取操作列表
const getOperationList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    const mockData: AiOperation[] = [
      {
        id: 1,
        userId: 1,
        username: '张三',
        operationType: 'polish',
        inputData: '这是一段需要润色的简历内容...',
        outputData: '经过AI润色后的简历内容，更加专业和吸引人...',
        status: 'success',
        createdAt: '2024-01-15T14:30:00Z',
        processingTime: 1500
      },
      {
        id: 2,
        userId: 2,
        username: '李四',
        operationType: 'generate',
        inputData: '根据以下信息生成简历：姓名、工作经验...',
        outputData: '生成的完整简历内容，包含个人信息、工作经验、技能等...',
        status: 'success',
        createdAt: '2024-01-15T13:45:00Z',
        processingTime: 2300
      }
    ]
    
    operationList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('获取操作列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getOperationList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    operationType: '',
    status: '',
    dateRange: []
  })
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  getOperationList()
}

// 导出
const handleExport = () => {
  ElMessage.success('数据导出成功')
}

// 查看详情
const handleView = (row: AiOperation) => {
  currentOperation.value = row
  detailVisible.value = true
}

// 删除
const handleDelete = async (row: AiOperation) => {
  try {
    await ElMessageBox.confirm('确定要删除该操作记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 模拟API调用
    const index = operationList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      operationList.value.splice(index, 1)
      pagination.total--
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  getOperationList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getOperationList()
}

// 工具函数
const getOperationTypeColor = (type: string) => {
  const colors = {
    polish: 'primary',
    generate: 'success'
  }
  return colors[type as keyof typeof colors] || 'info'
}

const getOperationTypeLabel = (type: string) => {
  const labels = {
    polish: '润色',
    generate: '生成'
  }
  return labels[type as keyof typeof labels] || type
}

const getStatusColor = (status: string) => {
  const colors = {
    success: 'success',
    failed: 'danger',
    processing: 'warning'
  }
  return colors[status as keyof typeof colors] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels = {
    success: '成功',
    failed: '失败',
    processing: '处理中'
  }
  return labels[status as keyof typeof labels] || status
}

const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  getOperationList()
})
</script>

<style scoped>
.ai-operation-monitoring {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.text-truncate {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operation-detail {
  padding: 20px 0;
}

.data-section {
  margin-top: 20px;
}

.data-section h4 {
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.action-btns {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}

@media (max-width: 768px) {
  .ai-operation-monitoring {
    padding: 10px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 