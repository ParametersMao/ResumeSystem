<template>
  <main class="auth-page">
    <section class="auth-story">
      <span class="eyebrow">RESUME WORKSPACE</span>
      <h1>把经历整理成<br />更有说服力的简历</h1>
      <p>一个账号保存你的简历、版本、模板收藏与 AI 优化记录。</p>
      <div class="story-points">
        <span>实时编辑预览</span>
        <span>多版本管理</span>
        <span>AI 定向优化</span>
      </div>
    </section>

    <section class="auth-card">
      <header>
        <span class="brand-mark">R</span>
        <div>
          <h2>{{ modeTitle }}</h2>
          <p>{{ modeDescription }}</p>
        </div>
      </header>

      <div v-if="mode !== 'reset'" class="mode-switch">
        <button :class="{ active: mode === 'password' }" @click="switchMode('password')">密码登录</button>
        <button :class="{ active: mode === 'email-login' }" @click="switchMode('email-login')">邮箱登录</button>
        <button :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent="handleSubmit">
        <el-form-item v-if="mode === 'password'" prop="account">
          <el-input v-model="form.account" placeholder="用户名或邮箱" :prefix-icon="User" />
        </el-form-item>

        <el-form-item v-if="needsEmail" prop="email">
          <el-input v-model="form.email" placeholder="邮箱地址" :prefix-icon="Message" />
        </el-form-item>

        <el-form-item v-if="needsCode" prop="code">
          <div class="code-row">
            <el-input v-model="form.code" maxlength="6" placeholder="6 位验证码" :prefix-icon="Key" />
            <el-button :disabled="countdown > 0" :loading="sendingCode" @click="handleSendCode">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item v-if="mode === 'register'" prop="username">
          <el-input v-model="form.username" placeholder="用户名（可选）" :prefix-icon="User" />
        </el-form-item>

        <el-form-item v-if="needsPassword" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="mode === 'reset' ? '设置新密码' : '密码'"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-button class="submit-btn" type="primary" :loading="userStore.loading" @click="handleSubmit">
          {{ submitLabel }}
        </el-button>
      </el-form>

      <div class="auth-links">
        <button v-if="mode === 'password'" @click="switchMode('reset')">忘记密码</button>
        <button v-if="mode === 'reset'" @click="switchMode('password')">返回登录</button>
      </div>

      <p class="agreement">继续使用即代表你同意《用户协议》和《隐私政策》</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Key, Lock, Message, User } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { resetPasswordByEmail, sendEmailCode, type EmailCodePurpose } from '@/api/user'
import { useUserStore } from '@/store/user'

type AuthMode = 'password' | 'email-login' | 'register' | 'reset'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const mode = ref<AuthMode>('password')
const sendingCode = ref(false)
const countdown = ref(0)
let countdownTimer: number | undefined

const form = reactive({
  account: '',
  email: '',
  code: '',
  username: '',
  password: '',
})

const needsEmail = computed(() => mode.value !== 'password')
const needsCode = computed(() => mode.value !== 'password')
const needsPassword = computed(() => ['password', 'register', 'reset'].includes(mode.value))
const modeTitle = computed(() => ({
  password: '欢迎回来',
  'email-login': '邮箱验证码登录',
  register: '创建你的账号',
  reset: '重置密码',
}[mode.value]))
const modeDescription = computed(() => ({
  password: '继续编辑和管理你的简历',
  'email-login': '无需密码，验证邮箱即可登录',
  register: '验证邮箱后建立真实用户档案',
  reset: '验证邮箱后设置一个新密码',
}[mode.value]))
const submitLabel = computed(() => ({
  password: '登录',
  'email-login': '验证并登录',
  register: '注册并进入',
  reset: '确认重置密码',
}[mode.value]))

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const rules: FormRules = {
  account: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  code: [{ required: true, len: 6, message: '请输入 6 位验证码', trigger: 'blur' }],
  username: [{ min: 3, max: 32, message: '用户名长度为 3-32 个字符', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (mode.value === 'password') {
          callback()
          return
        }
        if (!strongPassword.test(value || '')) callback(new Error('至少 8 位，并包含大小写字母和数字'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}

function switchMode(next: AuthMode) {
  mode.value = next
  form.code = ''
  form.password = ''
  formRef.value?.clearValidate()
}

function codePurpose(): EmailCodePurpose {
  if (mode.value === 'register') return 'register'
  if (mode.value === 'reset') return 'reset-password'
  return 'login'
}

async function handleSendCode() {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  try {
    sendingCode.value = true
    const response = await sendEmailCode({ email: form.email, purpose: codePurpose() })
    ElMessage.success(
      response.data.developmentCode
        ? `开发环境验证码：${response.data.developmentCode}`
        : response.message,
    )
    countdown.value = 60
    countdownTimer = window.setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0 && countdownTimer) {
        window.clearInterval(countdownTimer)
        countdownTimer = undefined
      }
    }, 1000)
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '验证码发送失败')
  } finally {
    sendingCode.value = false
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    let result
    if (mode.value === 'password') {
      result = await userStore.login({ username: form.account, password: form.password })
    } else if (mode.value === 'email-login') {
      result = await userStore.emailLogin({ email: form.email, code: form.code })
    } else if (mode.value === 'register') {
      result = await userStore.emailRegister({
        email: form.email,
        code: form.code,
        password: form.password,
        username: form.username || undefined,
      })
    } else {
      const response = await resetPasswordByEmail({
        email: form.email,
        code: form.code,
        newPassword: form.password,
      })
      ElMessage.success(response.message)
      switchMode('password')
      form.account = form.email
      return
    }

    if (!result.success) {
      ElMessage.error(result.message)
      return
    }
    ElMessage.success(result.message)
    await router.push('/resumes')
  } catch (error: any) {
    if (error?.response?.data?.message) ElMessage.error(error.response.data.message)
  }
}

onBeforeUnmount(() => {
  if (countdownTimer) window.clearInterval(countdownTimer)
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(320px, 1.15fr) minmax(360px, 0.85fr);
  background:
    radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.16), transparent 35%),
    linear-gradient(145deg, #eef4ff 0%, #f8fafc 48%, #e8f0ff 100%);
}

.auth-story {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 9vw;
  color: #0f172a;
}

.eyebrow { color: #2563eb; font-weight: 800; letter-spacing: .18em; }
.auth-story h1 { margin: 22px 0; font-size: clamp(44px, 5vw, 76px); line-height: 1.06; letter-spacing: -.05em; }
.auth-story p { max-width: 540px; color: #53627a; font-size: 18px; line-height: 1.8; }
.story-points { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 30px; }
.story-points span { padding: 10px 14px; border: 1px solid rgba(37,99,235,.18); border-radius: 999px; background: rgba(255,255,255,.66); color: #334155; }

.auth-card {
  align-self: center;
  width: min(460px, calc(100% - 48px));
  margin: 40px auto;
  padding: 38px;
  border: 1px solid rgba(148, 163, 184, .24);
  border-radius: 28px;
  background: rgba(255, 255, 255, .92);
  box-shadow: 0 24px 70px rgba(30, 64, 175, .14);
}

.auth-card header { display: flex; gap: 16px; align-items: center; margin-bottom: 26px; }
.brand-mark { display: grid; place-items: center; width: 50px; height: 50px; border-radius: 16px; background: #2563eb; color: #fff; font-size: 24px; font-weight: 900; }
.auth-card h2 { margin: 0; font-size: 27px; color: #111827; }
.auth-card header p { margin: 5px 0 0; color: #64748b; }

.mode-switch { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 24px; padding: 5px; border-radius: 14px; background: #f1f5f9; }
.mode-switch button, .auth-links button { border: 0; background: transparent; cursor: pointer; }
.mode-switch button { padding: 10px 6px; border-radius: 10px; color: #64748b; }
.mode-switch button.active { background: #fff; color: #1d4ed8; font-weight: 700; box-shadow: 0 3px 10px rgba(15,23,42,.08); }
.code-row { display: grid; grid-template-columns: 1fr 126px; gap: 10px; width: 100%; }
.submit-btn { width: 100%; height: 48px; margin-top: 4px; font-weight: 700; }
.auth-links { margin: 18px 0; text-align: right; }
.auth-links button { color: #2563eb; }
.agreement { margin: 0; text-align: center; color: #94a3b8; font-size: 12px; }

@media (max-width: 900px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-story { display: none; }
}
</style>
