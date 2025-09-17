<template>
  <div class="data-statistics">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-trend" :class="stat.trend">
                {{ stat.trendValue }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>简历生成趋势</span>
              <el-select v-model="timeRange" style="width: 120px">
                <el-option label="最近7天" value="7" />
                <el-option label="最近30天" value="30" />
                <el-option label="最近90天" value="90" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">简历生成趋势图表</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>热门模板使用情况</span>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">模板使用情况饼图</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计表格 -->
    <el-row :gutter="20" class="table-row">
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>用户活跃度排行</span>
            </div>
          </template>
          <el-table :data="userRanking" style="width: 100%">
            <el-table-column prop="rank" label="排名" width="80" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="resumeCount" label="简历数量" width="100" />
            <el-table-column prop="lastActive" label="最后活跃" />
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>模板使用排行</span>
            </div>
          </template>
          <el-table :data="templateRanking" style="width: 100%">
            <el-table-column prop="rank" label="排名" width="80" />
            <el-table-column prop="name" label="模板名称" width="120" />
            <el-table-column prop="usageCount" label="使用次数" width="100" />
            <el-table-column prop="percentage" label="占比" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 导出功能 -->
    <el-row :gutter="20" class="export-row">
      <el-col :span="24">
        <el-card class="export-card">
          <template #header>
            <div class="card-header">
              <span>数据导出</span>
            </div>
          </template>
          <div class="export-content">
            <el-form :model="exportForm" inline>
              <el-form-item label="导出类型">
                <el-select v-model="exportForm.type" placeholder="请选择导出类型">
                  <el-option label="用户数据" value="users" />
                  <el-option label="简历数据" value="resumes" />
                  <el-option label="模板数据" value="templates" />
                  <el-option label="AI操作数据" value="ai-operations" />
                </el-select>
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="exportForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              <el-form-item label="文件格式">
                <el-radio-group v-model="exportForm.format">
                  <el-radio label="excel">Excel</el-radio>
                  <el-radio label="csv">CSV</el-radio>
                  <el-radio label="json">JSON</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleExport">导出数据</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 时间范围
const timeRange = ref('7')

// 统计数据
const stats = ref([
  {
    title: '总用户数',
    value: '1,234',
    icon: 'User',
    color: '#409EFF',
    trend: 'up',
    trendValue: '+12.5%'
  },
  {
    title: '今日简历生成',
    value: '89',
    icon: 'Document',
    color: '#67C23A',
    trend: 'up',
    trendValue: '+8.2%'
  },
  {
    title: '活跃模板',
    value: '45',
    icon: 'Files',
    color: '#E6A23C',
    trend: 'down',
    trendValue: '-2.1%'
  },
  {
    title: 'AI调用次数',
    value: '2,567',
    icon: 'Cpu',
    color: '#F56C6C',
    trend: 'up',
    trendValue: '+15.3%'
  }
])

// 用户排行
const userRanking = ref([
  {
    rank: 1,
    username: '张三',
    resumeCount: 15,
    lastActive: '2024-01-15 14:30'
  },
  {
    rank: 2,
    username: '李四',
    resumeCount: 12,
    lastActive: '2024-01-15 13:45'
  },
  {
    rank: 3,
    username: '王五',
    resumeCount: 10,
    lastActive: '2024-01-15 12:20'
  }
])

// 模板排行
const templateRanking = ref([
  {
    rank: 1,
    name: '经典模板',
    usageCount: 156,
    percentage: '35.2%'
  },
  {
    rank: 2,
    name: '现代模板',
    usageCount: 134,
    percentage: '30.1%'
  },
  {
    rank: 3,
    name: '创意模板',
    usageCount: 89,
    percentage: '20.0%'
  }
])

// 导出表单
const exportForm = reactive({
  type: 'users',
  dateRange: [],
  format: 'excel'
})

// 导出数据
const handleExport = () => {
  ElMessage.success('数据导出成功')
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.data-statistics {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-white);
  font-size: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
  font-weight: bold;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  border-radius: 4px;
}

.table-row {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.export-row {
  margin-bottom: 20px;
}

.export-card {
  margin-bottom: 20px;
}

.export-content {
  padding: 10px 0;
}

@media (max-width: 768px) {
  .data-statistics {
    padding: 10px;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style> 