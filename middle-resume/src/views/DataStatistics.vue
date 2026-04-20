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
          <div class="chart-container" v-loading="chartLoading">
            <VChart class="chart" :option="lineChartOption" autoresize />
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
          <div class="chart-container" v-loading="chartLoading">
            <VChart class="chart" :option="pieChartOption" autoresize />
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
          <el-table-column prop="resumeCount" label="AI调用次数" width="120" />
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
import { ref, reactive, onMounted, watch } from 'vue'
import VChart from 'vue-echarts'
import { ElMessage } from 'element-plus'
import { getStatisticsOverview, getStatisticsTrend, getPopularTemplates, getUserActivity } from '@/api/statistics'
import '@/plugins/echarts'

// 时间范围
const timeRange = ref('7')

// 图表选项配置
const lineChartOption = ref({})
const pieChartOption = ref({})

// 图表加载状态
const chartLoading = ref(false)

// 统计数据
const stats = ref([
  {
    title: '总用户数',
    value: '-',
    icon: 'User',
    color: '#409EFF',
    trend: 'up',
    trendValue: ''
  },
  {
    title: '今日新增用户',
    value: '-',
    icon: 'Document',
    color: '#67C23A',
    trend: 'up',
    trendValue: ''
  },
  {
    title: '模板总数',
    value: '-',
    icon: 'Files',
    color: '#E6A23C',
    trend: 'down',
    trendValue: ''
  },
  {
    title: 'AI调用次数',
    value: '-',
    icon: 'Cpu',
    color: '#F56C6C',
    trend: 'up',
    trendValue: ''
  }
])

// 用户排行
const userRanking = ref([
  {
    rank: 1,
    username: '张三',
    resumeCount: 0,
    lastActive: '-'
  },
  {
    rank: 2,
    username: '李四',
    resumeCount: 0,
    lastActive: '-'
  },
  {
    rank: 3,
    username: '王五',
    resumeCount: 0,
    lastActive: '-'
  }
])

// 模板排行
const templateRanking = ref([
  {
    rank: 1,
    name: '经典模板',
    usageCount: 0,
    percentage: '-'
  },
  {
    rank: 2,
    name: '现代模板',
    usageCount: 0,
    percentage: '-'
  },
  {
    rank: 3,
    name: '创意模板',
    usageCount: 0,
    percentage: '-'
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
  init()
})

watch(timeRange, () => {
  init()
})

const toPeriod = (range: string): 'day' | 'week' | 'month' => {
  const days = Number(range || 7)
  if (days <= 1) return 'day'
  if (days <= 7) return 'week'
  return 'month'
}

const init = async () => {
  chartLoading.value = true
  try {
    const [overviewRes, trendRes, templatesRes, userActivityRes] = await Promise.all([
      getStatisticsOverview(),
      getStatisticsTrend({ period: toPeriod(timeRange.value) }),
      getPopularTemplates({ limit: 10 }),
      getUserActivity({ limit: 10 })
    ])

    // 响应拦截器已解包，直接使用 .data
    const overview = overviewRes.data
    const trend = trendRes.data
    const today = new Date().toISOString().slice(0, 10)

    const todayNewUsers = (trend.user_trend || []).reduce((sum: number, item: any) => {
      return item.date === today ? sum + Number(item.count || 0) : sum
    }, 0)

    stats.value[0].value = String(overview.total_users ?? 0)
    stats.value[1].value = String(todayNewUsers)
    stats.value[2].value = String(overview.total_templates ?? 0)
    stats.value[3].value = String(overview.total_ai_operations ?? 0)

    // 用户活跃度排行（后端口径：按 ai_operation_count 排序）
    const users = userActivityRes.data || []
    userRanking.value = users.map((u: any, idx: number) => ({
      rank: idx + 1,
      username: u.username,
      resumeCount: u.aiOperationCount ?? u.ai_operation_count ?? 0,
      lastActive: '-'
    }))

    // 模板排行（口径：useCount/downloadCount）
    const templates = templatesRes.data || []
    const totalUse = templates.reduce((sum: number, t: any) => sum + Number(t.useCount ?? 0), 0) || 0
    templateRanking.value = templates.map((t: any, idx: number) => ({
      rank: idx + 1,
      name: t.templateName ?? t.template_name ?? `#${t.id}`,
      usageCount: t.useCount ?? t.use_count ?? 0,
      percentage: totalUse ? `${((Number(t.useCount ?? 0) / totalUse) * 100).toFixed(1)}%` : '0.0%'
    }))

    // 更新折线图 - 简历生成趋势
    const resumeTrend = trend.resume_trend || []
    lineChartOption.value = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: resumeTrend.map((item: any) => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '简历生成数',
          type: 'line',
          smooth: true,
          data: resumeTrend.map((item: any) => item.count),
          areaStyle: {
            color: 'rgba(64, 158, 255, 0.2)'
          },
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    }

    // 更新饼图 - 模板使用情况
    const pieData = templates.slice(0, 5).map((t: any) => ({
      name: t.templateName ?? t.template_name ?? `#${t.id}`,
      value: t.useCount ?? t.use_count ?? 0
    }))
    pieChartOption.value = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '模板使用',
          type: 'pie',
          radius: '50%',
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  } catch (e) {
    ElMessage.error('统计数据加载失败')
  } finally {
    chartLoading.value = false
  }
}
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

.chart {
  width: 100%;
  height: 100%;
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
