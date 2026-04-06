<template>
  <div class="profile-page">
    <div class="container">
      <el-card class="profile-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="title">
              <div class="h1">个人资料</div>
              <div class="desc">不接 OSS 的阶段：头像将保存为本地 URL 或 Mock URL</div>
            </div>
            <div class="actions">
              <el-button @click="load" :loading="loading">刷新</el-button>
              <el-button type="primary" @click="save" :loading="saving">保存</el-button>
            </div>
          </div>
        </template>

        <div class="content">
          <div class="left">
            <div class="avatar-box">
              <el-avatar :size="96" :src="avatarPreview" class="avatar">
                {{ (userStore.user?.username || 'U').slice(0, 1).toUpperCase() }}
              </el-avatar>
              <div class="avatar-meta">
                <div class="avatar-tip">支持 png/jpg/webp/gif/svg，≤5MB</div>
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="image/*"
                  :on-change="handlePick"
                >
                  <el-button type="primary" :loading="uploading">选择头像</el-button>
                </el-upload>
                <el-button v-if="pickedFile" @click="uploadAvatar" :loading="uploading">上传并应用</el-button>
                <el-button text @click="useMockAvatar">使用 Mock 头像</el-button>
              </div>
            </div>

            <el-divider />

            <div class="info">
              <div class="label">当前用户</div>
              <div class="value">{{ userStore.user?.username || '-' }}</div>
              <div class="label">用户ID</div>
              <div class="value">{{ userStore.user?.id ?? '-' }}</div>
            </div>
          </div>

          <div class="right">
            <el-form ref="formRef" :model="form" label-width="90px">
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="form.nickname" maxlength="64" show-word-limit placeholder="例如：MrBean" />
              </el-form-item>
              <el-form-item label="简介" prop="bio">
                <el-input
                  v-model="form.bio"
                  type="textarea"
                  :rows="6"
                  maxlength="500"
                  show-word-limit
                  placeholder="一句话介绍你自己（可选）"
                />
              </el-form-item>
              <el-form-item label="头像URL" prop="avatarUrl">
                <el-input v-model="form.avatarUrl" maxlength="512" placeholder="例如：/uploads/avatars/xxx.png 或 /mock/avatar/default.svg" />
                <div class="hint">页面展示使用该 URL；你也可以直接粘贴自定义地址。</div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
const pickedPreviewUrl = ref<string>('')

const avatarPreview = computed(() => {
  return pickedPreviewUrl.value || form.value.avatarUrl || '/mock/avatar/default.svg'
})

async function load() {
  loading.value = true
  try {
    const res = await getCuserProfile()
    if (res.code !== 200) throw new Error(res.message || '加载失败')
    form.value.nickname = res.data.nickname || ''
    form.value.bio = res.data.bio || ''
    form.value.avatarUrl = res.data.avatarUrl || ''
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const res = await updateCuserProfile({
      nickname: form.value.nickname || undefined,
      bio: form.value.bio || undefined,
      avatarUrl: form.value.avatarUrl || undefined,
    })
    if (res.code !== 200) throw new Error(res.message || '保存失败')
    ElMessage.success('保存成功')
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function handlePick(file: any) {
  const raw = file?.raw as File | undefined
  if (!raw) return
  pickedFile.value = raw
  pickedPreviewUrl.value = URL.createObjectURL(raw)
}

async function uploadAvatar() {
  uploading.value = true
  try {
    const res = await uploadCuserAvatar(pickedFile.value || undefined)
    if (res.code !== 200) throw new Error(res.message || '上传失败')
    form.value.avatarUrl = res.data.avatarUrl
    pickedFile.value = null
    pickedPreviewUrl.value = ''
    ElMessage.success('头像已应用')
  } catch (e: any) {
    ElMessage.error(e?.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

async function useMockAvatar() {
  uploading.value = true
  try {
    const res = await uploadCuserAvatar(undefined)
    if (res.code !== 200) throw new Error(res.message || '操作失败')
    form.value.avatarUrl = res.data.avatarUrl
    ElMessage.success('已切换为 Mock 头像')
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    uploading.value = false
  }
}

onMounted(async () => {
  await userStore.initUserState()
  await load()
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 80px);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.profile-card {
  border-radius: 14px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title .h1 {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.title .desc {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.content {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
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
  color: #6b7280;
}

.info {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 10px 12px;
  align-items: center;
}

.info .label {
  font-size: 12px;
  color: #6b7280;
}

.info .value {
  font-size: 13px;
  color: #111827;
  font-weight: 600;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 980px) {
  .content {
    grid-template-columns: 1fr;
  }
}
</style>

