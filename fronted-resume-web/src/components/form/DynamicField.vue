<template>
  <div class="dynamic-field">
    <label 
      v-if="field.label && !(field.type === 'textarea' && field.richText)" 
      class="field-label"
    >
      {{ field.label }}
      <span v-if="field.required" class="required">*</span>
    </label>
    
    <el-input
      v-if="field.type === 'text'"
      v-model="fieldValue"
      :placeholder="`请输入${field.label}`"
    />
    
    <el-input
      v-else-if="field.type === 'textarea' && !field.richText"
      v-model="fieldValue"
      type="textarea"
      :rows="3"
      :placeholder="`请输入${field.label}`"
    />
    
    <RichTextEditor
      v-else-if="field.type === 'textarea' && field.richText"
      v-model="fieldValue"
      :label="field.label"
      :required="field.required"
      :placeholder="`请输入${field.label}`"
      :height="200"
      @ai="onAi"
    />
    
    <el-input
      v-else-if="field.type === 'date'"
      v-model="fieldValue"
      :placeholder="field.name === 'end' ? '至今' : '2023-01'"
    />

    <div v-else-if="field.type === 'dateRange'" class="date-range-row">
      <el-input
        v-model="startValue"
        placeholder="开始时间，如 2023-01"
        class="date-input"
      />
      <span class="date-sep">—</span>
      <el-input
        v-model="endValue"
        placeholder="结束时间，如 至今/2024-12"
        class="date-input"
      />
    </div>
    
    <el-select
      v-else-if="field.type === 'select'"
      v-model="fieldValue"
      :placeholder="`请选择${field.label}`"
    >
      <el-option
        v-for="option in field.options"
        :key="option"
        :label="option"
        :value="option"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FieldConfig } from '@/types/resume'
import RichTextEditor from './RichTextEditor.vue'
import { createEmptyRichText, normalizeRichTextValue } from '@/utils/richText'

interface Props {
  field: FieldConfig
  modelValue: any
}

interface Emits {
  (e: 'update:modelValue', value: any): void
  (e: 'ai', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 处理 v-model 绑定
const fieldValue = computed({
  get: () => {
    if (props.field.type === 'textarea' && props.field.richText) {
      if (!props.modelValue) {
        return createEmptyRichText()
      }
      return normalizeRichTextValue(props.modelValue)
    }
    return props.modelValue
  },
  set: (value) => {
    if (props.field.type === 'textarea' && props.field.richText) {
      emit('update:modelValue', normalizeRichTextValue(value))
    } else {
      emit('update:modelValue', value)
    }
  }
})

// dateRange 的拆分绑定
const startValue = computed({
  get: () => (props.modelValue?.start ?? ''),
  set: (v: string) => {
    const next = { ...(props.modelValue || {}), start: v }
    emit('update:modelValue', next)
  }
})

const endValue = computed({
  get: () => (props.modelValue?.end ?? ''),
  set: (v: string) => {
    const next = { ...(props.modelValue || {}), end: v }
    emit('update:modelValue', next)
  }
})

function onAi(html: string) {
  emit('ai', html)
}
</script>

<style scoped>
.dynamic-field {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

.date-range-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  flex: 1;
}

.date-sep {
  color: #6b7280;
}
</style>
