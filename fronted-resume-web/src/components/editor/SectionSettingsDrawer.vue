<template>
  <el-drawer
    :model-value="visible"
    size="360px"
    title="模块设置"
    append-to-body
    @close="handleClose"
  >
    <el-form
      v-if="localSection"
      label-width="96px"
      class="section-settings-form"
    >
      <el-form-item label="模块标题">
        <el-input v-model="localSection.title" placeholder="请输入模块标题" />
      </el-form-item>

      <el-form-item label="显示模块">
        <el-switch v-model="localSection.visible" />
      </el-form-item>

      <el-form-item label="自定义图标">
        <el-input
          v-model="localConfig.icon"
          placeholder="例如：mdi-account 或 emoji"
        />
      </el-form-item>

      <el-divider>标题样式</el-divider>

      <el-form-item label="背景颜色">
        <el-color-picker v-model="titleStyle.backgroundColor" show-alpha />
      </el-form-item>

      <el-form-item label="文字颜色">
        <el-color-picker v-model="titleStyle.color" show-alpha />
      </el-form-item>

      <el-form-item label="字体大小">
        <el-input
          v-model="titleStyle.fontSize"
          placeholder="例如：18px"
        />
      </el-form-item>

      <el-divider>内容样式</el-divider>

      <el-form-item label="文字颜色">
        <el-color-picker v-model="contentStyle.color" show-alpha />
      </el-form-item>

      <el-form-item label="行高">
        <el-input v-model="contentStyle.lineHeight" placeholder="例如：1.6" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ResumeSection } from '@/types/resume'

interface Props {
  modelValue: boolean
  section: ResumeSection | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', value: ResumeSection): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const localSection = ref<ResumeSection | null>(null)

const titleStyle = computed({
  get: () => {
    if (!localSection.value) return createDefaultStyle()
    const style = ensureSectionStyle(localSection.value)
    if (!style.title) style.title = {}
    return style.title
  },
  set: (val: Record<string, any>) => {
    if (localSection.value) {
      const style = ensureSectionStyle(localSection.value)
      style.title = { ...style.title, ...val }
    }
  }
})

const contentStyle = computed({
  get: () => {
    if (!localSection.value) return createDefaultStyle()
    const style = ensureSectionStyle(localSection.value)
    if (!style.content) style.content = {}
    return style.content
  },
  set: (val: Record<string, any>) => {
    if (localSection.value) {
      const style = ensureSectionStyle(localSection.value)
      style.content = { ...style.content, ...val }
    }
  }
})

const localConfig = computed({
  get: () => {
    if (!localSection.value) {
      return {}
    }
    if (!localSection.value.config) {
      localSection.value.config = {}
    }
    return localSection.value.config
  },
  set: (val: Record<string, any>) => {
    if (localSection.value) {
      localSection.value.config = { ...localSection.value.config, ...val }
    }
  }
})

watch(
  () => props.section,
  (section) => {
    if (visible.value && section) {
      localSection.value = deepClone(section)
    }
  },
  { immediate: true }
)

watch(
  () => visible.value,
  (val) => {
    if (val && props.section) {
      localSection.value = deepClone(props.section)
    } else if (!val) {
      localSection.value = null
    }
  }
)

function handleClose() {
  emit('update:modelValue', false)
}

function handleSave() {
  if (!localSection.value) {
    handleClose()
    return
  }
  emit('save', sanitizeSection(localSection.value))
  emit('update:modelValue', false)
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}

function ensureSectionStyle(section: ResumeSection) {
  if (!section.style) section.style = {}
  return section.style as Record<string, any>
}

function createDefaultStyle(): Record<string, any> {
  return {
    backgroundColor: '',
    color: '',
    fontSize: '',
    lineHeight: ''
  }
}

function sanitizeSection(section: ResumeSection): ResumeSection {
  const clean = deepClone(section)
  if (clean.style) {
    Object.keys(clean.style).forEach((key) => {
      if (clean.style[key] && typeof clean.style[key] === 'object') {
        Object.keys(clean.style[key]).forEach((prop) => {
          if (clean.style[key][prop] === '') {
            delete clean.style[key][prop]
          }
        })
        if (Object.keys(clean.style[key]).length === 0) {
          delete clean.style[key]
        }
      }
    })
    if (Object.keys(clean.style).length === 0) {
      delete clean.style
    }
  }
  return clean
}
</script>

<style scoped>
.section-settings-form {
  padding-right: 8px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

