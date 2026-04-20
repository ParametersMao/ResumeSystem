<template>
  <div class="profile-page">
    <div class="container">
      <el-card class="profile-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="title">
              <div class="h1">个人中心</div>
              <div class="desc">管理你的基础资料和头像，后续可用于简历作者信息与账户展示。</div>
            </div>
            <div class="actions">
              <el-button @click="load" :loading="loading">刷新</el-button>
              <el-button type="primary" @click="save" :loading="saving">保存资料</el-button>
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
                <el-button v-if="pickedFile" @click="uploadAvatar" :loading="uploading">
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
                <div class="hint">支持本地上传路径、默认头像路径，也支持可公开访问的图片 URL。</div>
              </el-form-item>
            </el-form>
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

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)

const formRef = ref()
const form = ref<{ nickname: string; bio: string; avatarUrl: string }>({
  nickname: '',
  bio: '',
  avatarUrl: '',
})

const pickedFile = ref<File | null>(null)
const pickedPreviewUrl = ref('')

const avatarFallback = computed(() => {
  return (form.value.nickname || userStore.user?.username || 'U').slice(0, 1).toUpperCase()
})

const avatarPreview = computed(() => {
  return pickedPreviewUrl.value || form.value.avatarUrl || '/mock/avatar/default.svg'
})

async function load() {
  loading.value = true
  try {
    const res = await getCuserProfile()
    if (res.code !== 200) {
      throw new Error(res.message || '加载失败')
    }
    form.value.nickname = res.data.nickname || ''
    form.value.bio = res.data.bio || ''
    form.value.avatarUrl = res.data.avatarUrl || ''
  } catch (error: any) {
    ElMessage.error(error?.message || '加载个人资料失败')
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const res = await updateCuserProfile({
      nickname: normalizeOptionalText(form.value.nickname),
      bio: normalizeOptionalText(form.value.bio),
      avatarUrl: normalizeOptionalText(form.value.avatarUrl),
    })
    if (res.code !== 200) {
      throw new Error(res.message || '保存失败')
    }
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
  if (!raw) {
    return
  }

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
    if (res.code !== 200) {
      throw new Error(res.message || '上传失败')
    }
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
    if (res.code !== 200) {
      throw new Error(res.message || '操作失败')
    }
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
  if (pickedPreviewUrl.value) {
    URL.revokeObjectURL(pickedPreviewUrl.value)
    pickedPreviewUrl.value = ''
  }
}

onMounted(async () => {
  await userStore.initUserState()
  await load()
})

onBeforeUnmount(() => {
  revokePickedPreview()
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 80px);
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.1), transparent 28%),
    #f8fafc;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px;
}

.profile-card {
  border-radius: 18px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title .h1 {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
}

.title .desc {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.actions {
  display: flex;
  gap: 10px;
}

.content {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 28px;
}

.avatar-box {
  display: flex;
  gap: 16px;
  align-items: center;
}

.avatar-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.avatar-tip {
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}

.info {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 10px 12px;
  align-items: center;
}

.info .label {
  font-size: 12px;
  color: #64748b;
}

.info .value {
  font-size: 13px;
  color: #111827;
  font-weight: 700;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 980px) {
  .content {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
