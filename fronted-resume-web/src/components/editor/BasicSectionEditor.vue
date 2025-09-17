<template>
  <div class="basic-section-editor">
    <div class="section-header">
      <div class="section-info">
        <span class="section-icon">👤</span>
        <template v-if="!editingTitle">
          <span class="section-title">{{ section.title }}</span>
          <el-button text size="small" class="edit-title-btn" @click="startEditTitle">重命名</el-button>
        </template>
        <template v-else>
          <el-input v-model="tempTitle" size="small" class="title-input" @keyup.enter.native="confirmEditTitle" />
          <el-button size="small" type="primary" @click="confirmEditTitle">保存</el-button>
          <el-button size="small" @click="cancelEditTitle">取消</el-button>
        </template>
      </div>
      <div class="section-actions">
        <el-switch v-model="localVisible" size="small" :active-text="localVisible ? '显示' : '隐藏'" @change="onToggleVisible" />
        <el-button size="small" @click="$emit('move-up')">上移</el-button>
        <el-button size="small" @click="$emit('move-down')">下移</el-button>
        <el-button size="small" type="danger" plain disabled>不可删除</el-button>
      </div>
    </div>

    <div class="section-content">
      <el-form label-width="90px" class="form-grid">
        <el-form-item label="姓名">
          <el-input v-model="localProfile.basic.name" @change="emitProfile" />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="localProfile.basic.title" @change="emitProfile" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="localProfile.basic.contacts.phone" @change="emitProfile" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="localProfile.basic.contacts.email" @change="emitProfile" />
        </el-form-item>
        <el-form-item label="主页">
          <el-input v-model="localProfile.basic.contacts.site" @change="emitProfile" />
        </el-form-item>
        <el-form-item label="自我概述">
          <el-input type="textarea" :rows="4" v-model="localProfile.summary" @change="emitProfile" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import type { ResumeProfile, ResumeSection } from '@/types/resume'

interface Props {
  section: ResumeSection
  modelValue: ResumeProfile
}

interface Emits {
  (e: 'update:modelValue', v: ResumeProfile): void
  (e: 'update:section', v: ResumeSection): void
  (e: 'move-up'): void
  (e: 'move-down'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localProfile = ref<ResumeProfile>(JSON.parse(JSON.stringify(props.modelValue)))
const localVisible = ref<boolean>(props.section.visible)

watch(() => props.modelValue, (v) => {
  localProfile.value = JSON.parse(JSON.stringify(v))
}, { deep: true })

watch(() => props.section.visible, (v) => {
  localVisible.value = v
})

function emitProfile() {
  emit('update:modelValue', JSON.parse(JSON.stringify(localProfile.value)))
}

const editingTitle = ref(false)
const tempTitle = ref(props.section.title)

function startEditTitle() {
  tempTitle.value = props.section.title
  editingTitle.value = true
}

function confirmEditTitle() {
  const title = (tempTitle.value || '').trim()
  if (title && title !== props.section.title) {
    emit('update:section', { ...props.section, title })
  }
  editingTitle.value = false
}

function cancelEditTitle() {
  editingTitle.value = false
}

function onToggleVisible() {
  emit('update:section', { ...props.section, visible: localVisible.value })
}
</script>

<style scoped>
.basic-section-editor { border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; margin-bottom: 16px; }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
.section-info { display: flex; align-items: center; gap: 8px; }
.section-icon { font-size: 16px; }
.section-title { font-weight: 600; color: #1f2937; }
.section-actions { display: flex; align-items: center; gap: 12px; }
.section-content { padding: 15px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
.form-grid :deep(.el-form-item) { margin-bottom: 0; }
.title-input { width: 180px; }
@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
</style>


