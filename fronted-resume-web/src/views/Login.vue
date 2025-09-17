<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="title">简历系统</h1>
          <p class="subtitle">{{ isLogin ? '欢迎登录' : '创建账号' }}</p>
        </div>

        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          class="login-form"
          size="large"
          @submit.prevent="handleSubmit"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item v-if="!isLogin" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱（可选）"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <el-form-item v-if="!isLogin" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号（可选）"
              :prefix-icon="Phone"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              class="login-btn"
              :loading="userStore.loading"
              @click="handleSubmit"
            >
              {{ isLogin ? '登录' : '注册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <el-button 
            type="text" 
            @click="toggleMode"
            class="toggle-btn"
          >
            {{ isLogin ? '还没有账号？立即注册' : '已有账号？立即登录' }}
          </el-button>
        </div>
        
        <p class="agreement">登录即代表您同意《用户协议》</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Message, Phone } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(true)
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  email: '',
  phone: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

function toggleMode() {
  isLogin.value = !isLogin.value
  // 清空表单
  formRef.value?.resetFields()
}

async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    let result
    if (isLogin.value) {
      result = await userStore.login({
        username: form.username,
        password: form.password
      })
    } else {
      result = await userStore.register({
        username: form.username,
        password: form.password,
        email: form.email || undefined,
        phone: form.phone || undefined
      })
    }

    if (result.success) {
      ElMessage.success(result.message)
      // 登录/注册成功后跳转到主页
      router.push('/resumes')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.login-footer {
  text-align: center;
  margin-bottom: 16px;
}

.toggle-btn {
  color: #666;
  font-size: 14px;
}

.toggle-btn:hover {
  color: #409eff;
}

.agreement {
  text-align: center;
  color: #888;
  font-size: 12px;
  margin: 0;
}

/* 表单项间距调整 */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

/* 输入框样式 */
:deep(.el-input__inner) {
  height: 48px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }
  
  .title {
    font-size: 24px;
  }
}
</style>


