import { request } from '@/utils/request'

export const getSystemLogs = (params: { page?: number; limit?: number; userId?: number; route?: string; method?: string }) => {
  return request.get('/system-logs', { params })
}

