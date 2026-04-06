<template>
  <div class="dashboard">
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
              <el-button type="text" @click="refreshResumeChart">刷新</el-button>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">图表区域</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>热门模板使用情况</span>
              <el-button type="text" @click="refreshTemplateChart">刷新</el-button>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">图表区域</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-row :gutter="20" class="activity-row">
      <el-col :xs="24" :lg="12">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>最近用户活动</span>
            </div>
          </template>
          <div class="activity-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
            >
              <el-avatar :size="32" :src="activity.avatar">
                {{ activity.username?.charAt(0) }}
              </el-avatar>
              <div class="activity-content">
                <div class="activity-text">
                  <strong>{{ activity.username }}</strong>
                  {{ activity.action }}
                </div>
                <div class="activity-time">{{ formatTime(activity.time) }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>系统状态</span>
            </div>
          </template>
          <div class="system-status">
            <div class="status-item">
              <span class="status-label">服务器状态</span>
              <el-tag type="success">正常</el-tag>
            </div>
            <div class="status-item">
              <span class="status-label">数据库连接</span>
              <el-tag type="success">正常</el-tag>
            </div>
            <div class="status-item">
              <span class="status-label">AI服务</span>
              <el-tag type="success">正常</el-tag>
            </div>
            <div class="status-item">
              <span class="status-label">缓存服务</span>
              <el-tag type="success">正常</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStatisticsOverview, getStatisticsTrend, getUserActivity } from '@/api/statistics'

// 统计数据
const stats = ref([
  {
    title: '总用户数',
    value: '-',
    icon: 'User',
    color: '#409EFF'
  },
  {
    title: '今日新增用户',
    value: '-',
    icon: 'Document',
    color: '#67C23A'
  },
  {
    title: '模板总数',
    value: '-',
    icon: 'Files',
    color: '#E6A23C'
  },
  {
    title: 'AI调用次数',
    value: '-',
    icon: 'Cpu',
    color: '#F56C6C'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    username: '张三',
    avatar: '',
    action: 'AI调用次数最高',
    time: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 2,
    username: '李四',
    avatar: '',
    action: 'AI调用次数较高',
    time: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 3,
    username: '王五',
    avatar: '',
    action: 'AI调用次数较高',
    time: new Date(Date.now() - 30 * 60 * 1000)
  }
])

// 格式化时间
const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

// 刷新图表
const refreshResumeChart = () => {
  init()
}

const refreshTemplateChart = () => {
  init()
}

const init = async () => {
  try {
    const [overviewRes, trendRes, userActivityRes] = await Promise.all([
      getStatisticsOverview(),
      getStatisticsTrend({ period: 'day' }),
      getUserActivity({ limit: 3 })
    ])

    const overview = overviewRes.data.data
    const trend = trendRes.data.data
    const today = new Date().toISOString().slice(0, 10)
    const todayNewUsers = (trend.user_trend || []).reduce((sum: number, item: any) => {
      return item.date === today ? sum + Number(item.count || 0) : sum
    }, 0)

    stats.value[0].value = String(overview.total_users ?? 0)
    stats.value[1].value = String(todayNewUsers)
    stats.value[2].value = String(overview.total_templates ?? 0)
    stats.value[3].value = String(overview.total_ai_operations ?? 0)

    const users = userActivityRes.data.data || []
    // “最近活动”当前用真实数据做替代：展示活跃用户排行
    recentActivities.value = users.map((u: any, idx: number) => ({
      id: u.id ?? idx + 1,
      username: u.username,
      avatar: '',
      action: `AI调用 ${u.aiOperationCount ?? u.ai_operation_count ?? 0} 次`,
      time: new Date()
    }))
  } catch (e) {
    // 页面可渲染，失败时保留占位值
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.dashboard {
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

.activity-row {
  margin-bottom: 20px;
}

.activity-card {
  margin-bottom: 20px;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.status-label {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
  }
}
</style> 