<template>
  <div class="profile-page">
    <div class="container">
      <el-card class="profile-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="title">
              <div class="h1">个人中心</div>
              <div class="desc">管理你的基础资料和头像，后续可用于简历作者信息与账号展示。</div>
            </div>
            <div class="actions">
              <el-button :loading="loading" @click="load">刷新</el-button>
              <el-button type="primary" :loading="saving" @click="save">保存资料</el-button>
            </div>
          </div>
        </template>

        <div class="content">
          <div class="left">
            <div class="avatar-box">
              <el-avatar :size="96" :src="avatarPreview" class="avatar">
                {{ avatarFallback }}
              </el-avatar>
              <div class="avatar-meta">
                <div class="avatar-tip">支持 png、jpg、webp、gif、svg，文件不超过 5MB。</div>
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="image/*"
                  :on-change="handlePick"
                >
                  <el-button type="primary" :loading="uploading">选择头像</el-button>
                </el-upload>
                <el-button v-if="pickedFile" :loading="uploading" @click="uploadAvatar">
                  上传并应用
                </el-button>
                <el-button text @click="useDefaultAvatar">使用默认头像</el-button>
              </div>
            </div>

            <el-divider />

            <div class="info">
              <div class="label">当前用户</div>
              <div class="value">{{ userStore.user?.username || '-' }}</div>
              <div class="label">用户 ID</div>
              <div class="value">{{ userStore.user?.id ?? '-' }}</div>
            </div>
          </div>

          <div class="right">
            <el-form ref="formRef" :model="form" label-width="90px">
              <el-form-item label="昵称" prop="nickname">
                <el-input
                  v-model="form.nickname"
                  maxlength="64"
                  show-word-limit
                  placeholder="例如：MrBean"
                />
              </el-form-item>
              <el-form-item label="简介" prop="bio">
                <el-input
                  v-model="form.bio"
                  type="textarea"
                  :rows="6"
                  maxlength="500"
                  show-word-limit
                  placeholder="一句话介绍你自己，可选。"
                />
              </el-form-item>
              <el-form-item label="头像 URL" prop="avatarUrl">
                <el-input
                  v-model="form.avatarUrl"
                  maxlength="512"
                  placeholder="上传头像后会自动生成，也可以粘贴外部图片地址。"
                />
                <div class="hint">支持本地上传路径、默认头像路径，以及可公开访问的图片 URL。</div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-card>

      <el-card class="quota-card" shadow="never">
        <template #header>
          <div class="quota-header">
            <div>
              <div class="quota-title">免费版权益</div>
              <div class="quota-desc">每月额度会自动刷新，版本额度按每份简历计算。</div>
            </div>
            <el-tag type="primary">FREE</el-tag>
          </div>
        </template>
        <div v-loading="quotaLoading" class="quota-grid">
          <div v-for="item in quotaItems" :key="item.label" class="quota-item">
            <div class="quota-label">{{ item.label }}</div>
            <div class="quota-value">{{ item.value }}</div>
            <el-progress :percentage="item.percentage" :stroke-width="7" :show-text="false" />
            <div class="quota-note">{{ item.note }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getCuserProfile, updateCuserProfile, uploadCuserAvatar } from '@/api/profile'
import { getUserCenter, type EntitlementSummary } from '@/api/user'

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const quotaLoading = ref(false)
const entitlements = ref<EntitlementSummary | null>(null)

const formRef = ref()
const form = ref<{ nickname: string; bio: string; avatarUrl: string }>({
  nickname: '',
  bio: '',
  avatarUrl: '',
})

const pickedFile = ref<File | null>(null)
const pickedPreviewUrl = ref('')

const avatarFallback = computed(() =>
  (form.value.nickname || userStore.user?.username || 'U').slice(0, 1).toUpperCase(),
)

const avatarPreview = computed(() =>
  pickedPreviewUrl.value || form.value.avatarUrl || '/mock/avatar/default.svg',
)

const quotaItems = computed(() => {
  const quota = entitlements.value
  if (!quota) return []
  const percent = (used: number, total: number) =>
    total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0
  return [
    {
      label: '简历存档',
      value: `${quota.resume.used} / ${quota.resume.total}`,
      percentage: percent(quota.resume.used, quota.resume.total),
      note: `还可创建 ${quota.resume.remaining} 份`,
    },
    {
      label: 'AI 能力',
      value: `${quota.ai.used} / ${quota.ai.total}`,
      percentage: percent(quota.ai.used, quota.ai.total),
      note: `本月剩余 ${quota.ai.remaining} 次`,
    },
    {
      label: 'PDF 导出',
      value: `${quota.pdf.used} / ${quota.pdf.total}`,
      percentage: percent(quota.pdf.used, quota.pdf.total),
      note: `本月剩余 ${quota.pdf.remaining} 次`,
    },
    {
      label: '云端存储',
      value: `${formatBytes(quota.storage.usedBytes)} / ${formatBytes(quota.storage.totalBytes)}`,
      percentage: percent(quota.storage.usedBytes, quota.storage.totalBytes),
      note: `每份简历保留 ${quota.versionPerResume.total} 个版本`,
    },
  ]
})

async function load() {
  loading.value = true
  quotaLoading.value = true
  try {
    const [res, center] = await Promise.all([getCuserProfile(), getUserCenter()])
    if (res.code !== 200) throw new Error(res.message || '加载失败')
    form.value.nickname = res.data.nickname || ''
    form.value.bio = res.data.bio || ''
    form.value.avatarUrl = res.data.avatarUrl || ''
    if (center.code === 200) entitlements.value = center.data.entitlements
  } catch (error: any) {
    ElMessage.error(error?.message || '加载个人资料失败')
  } finally {
    loading.value = false
    quotaLoading.value = false
  }
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 MB'
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function save() {
  saving.value = true
  try {
    const res = await updateCuserProfile({
      nickname: normalizeOptionalText(form.value.nickname),
      bio: normalizeOptionalText(form.value.bio),
      avatarUrl: normalizeOptionalText(form.value.avatarUrl),
    })
    if (res.code !== 200) throw new Error(res.message || '保存失败')
    form.value.nickname = res.data.nickname || ''
    form.value.bio = res.data.bio || ''
    form.value.avatarUrl = res.data.avatarUrl || ''
    ElMessage.success('个人资料已保存')
  } catch (error: any) {
    ElMessage.error(error?.message || '保存个人资料失败')
  } finally {
    saving.value = false
  }
}

function handlePick(file: any) {
  const raw = file?.raw as File | undefined
  if (!raw) return
  if (!raw.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  if (raw.size > 5 * 1024 * 1024) {
    ElMessage.warning('头像文件不能超过 5MB')
    return
  }
  revokePickedPreview()
  pickedFile.value = raw
  pickedPreviewUrl.value = URL.createObjectURL(raw)
}

async function uploadAvatar() {
  if (!pickedFile.value) {
    ElMessage.warning('请先选择头像文件')
    return
  }
  uploading.value = true
  try {
    const res = await uploadCuserAvatar(pickedFile.value)
    if (res.code !== 200) throw new Error(res.message || '上传失败')
    form.value.avatarUrl = res.data.avatarUrl
    pickedFile.value = null
    revokePickedPreview()
    ElMessage.success('头像已上传并应用')
  } catch (error: any) {
    ElMessage.error(error?.message || '上传头像失败')
  } finally {
    uploading.value = false
  }
}

async function useDefaultAvatar() {
  uploading.value = true
  try {
    const res = await uploadCuserAvatar()
    if (res.code !== 200) throw new Error(res.message || '操作失败')
    form.value.avatarUrl = res.data.avatarUrl
    pickedFile.value = null
    revokePickedPreview()
    ElMessage.success('已切换为默认头像')
  } catch (error: any) {
    ElMessage.error(error?.message || '切换默认头像失败')
  } finally {
    uploading.value = false
  }
}

function normalizeOptionalText(value: string) {
  const text = value.trim()
  return text || undefined
}

function revokePickedPreview() {
  if (!pickedPreviewUrl.value) return
  URL.revokeObjectURL(pickedPreviewUrl.value)
  pickedPreviewUrl.value = ''
}

onMounted(async () => {
  await userStore.initUserState()
  await load()
})

onBeforeUnmount(revokePickedPreview)
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 80px);
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.1), transparent 28%),
    #f8fafc;
}

.container { max-width: 1100px; margin: 0 auto; padding: 28px 24px; }
.profile-card, .quota-card { border-radius: 18px; }
.quota-card { margin-top: 20px; }
.quota-header, .card-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.quota-title { font-size: 18px; font-weight: 800; color: #111827; }
.quota-desc, .quota-note { margin-top: 5px; color: #64748b; font-size: 13px; }
.quota-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.quota-item { padding: 18px; border: 1px solid #e2e8f0; border-radius: 14px; background: linear-gradient(145deg, #fff, #f8fafc); }
.quota-label { color: #475569; font-size: 13px; }
.quota-value { margin: 8px 0 12px; color: #0f172a; font-size: 22px; font-weight: 800; }
.title .h1 { font-size: 20px; font-weight: 800; color: #111827; }
.title .desc { margin-top: 6px; font-size: 13px; color: #64748b; }
.actions { display: flex; gap: 10px; }
.content { display: grid; grid-template-columns: 360px 1fr; gap: 28px; }
.avatar-box { display: flex; gap: 16px; align-items: center; }
.avatar-meta { display: flex; flex-direction: column; gap: 10px; }
.avatar-tip { font-size: 12px; color: #64748b; line-height: 1.6; }
.info { display: grid; grid-template-columns: 90px 1fr; gap: 10px 12px; align-items: center; }
.info .label { font-size: 12px; color: #64748b; }
.info .value { font-size: 13px; color: #111827; font-weight: 700; }
.hint { margin-top: 6px; font-size: 12px; color: #94a3b8; }

@media (max-width: 900px) {
  .quota-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 980px) {
  .content { grid-template-columns: 1fr; }
  .card-header { flex-direction: column; align-items: stretch; }
}

@media (max-width: 560px) {
  .quota-grid { grid-template-columns: 1fr; }
}
</style>
