<template>
  <div class="profile-editor">
    <!-- 基本信息 -->
    <div class="edit-section">
      <h3>基本信息</h3>
      <div class="form-group">
        <label>姓名</label>
        <el-input v-model="modelValue.basic.name" placeholder="请输入姓名" />
      </div>
      <div class="form-group">
        <label>职位</label>
        <el-input v-model="modelValue.basic.title" placeholder="请输入目标职位" />
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <el-input v-model="modelValue.basic.contacts.email" placeholder="请输入邮箱" />
      </div>
      <div class="form-group">
        <label>电话</label>
        <el-input v-model="modelValue.basic.contacts.phone" placeholder="请输入电话" />
      </div>
      <div class="form-group">
        <label>个人网站</label>
        <el-input v-model="modelValue.basic.contacts.site" placeholder="请输入网站地址" />
      </div>
    </div>

    <!-- 个人简介 -->
    <div class="edit-section">
      <h3>个人简介</h3>
      <el-input
        v-model="modelValue.summary"
        type="textarea"
        :rows="4"
        placeholder="请输入个人简介"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResumeProfile } from '@/types/resume'

interface Props {
  modelValue: ResumeProfile
}

interface Emits {
  (e: 'update:modelValue', value: ResumeProfile): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.profile-editor {
  margin-bottom: 32px;
}

.edit-section {
  margin-bottom: 32px;
}

.edit-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}
</style>
