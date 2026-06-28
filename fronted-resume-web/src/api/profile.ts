import request, { ApiResponse } from './request'

export interface CUserProfile {
  userId: number
  nickname: string | null
  bio: string | null
  avatarUrl: string | null
  createTime: string
  updateTime: string
}

export function getCuserProfile(): Promise<ApiResponse<CUserProfile>> {
  return request.get('/api/cuser/profile').then((res) => res.data)
}

export function updateCuserProfile(payload: { nickname?: string; bio?: string; avatarUrl?: string }): Promise<ApiResponse<CUserProfile>> {
  return request.patch('/api/cuser/profile', payload).then((res) => res.data)
}

export async function uploadCuserAvatar(file?: File): Promise<ApiResponse<{ avatarUrl: string }>> {
  const form = new FormData()
  if (file) form.append('file', file)
  return request.post('/api/cuser/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data)
}

