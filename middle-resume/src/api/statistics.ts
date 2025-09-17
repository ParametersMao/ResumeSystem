import { request } from '@/utils/request'

/**
 * 数据概览
 * GET /api/statistics/overview
 */
export const getStatisticsOverview = () => {
  return request.get('/statistics/overview')
}

/**
 * 趋势图表数据
 * GET /api/statistics/trend
 */
export const getStatisticsTrend = (params: { type: string; days: number }) => {
  return request.get('/statistics/trend', { params })
}

/**
 * 热门模板排行
 * GET /api/statistics/popular-templates
 */
export const getPopularTemplates = (params: { limit?: number; period?: number }) => {
  return request.get('/statistics/popular-templates', { params })
}

/**
 * 用户活跃度排行
 * GET /api/statistics/user-activity
 */
export const getUserActivity = (params: { limit?: number; period?: number }) => {
  return request.get('/statistics/user-activity', { params })
} 