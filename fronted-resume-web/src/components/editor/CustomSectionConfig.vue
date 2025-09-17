<template>
  <el-dialog v-model="dialogVisible" title="自定义模块配置" width="600px" @closed="$emit('closed')">
    <div class="custom-config">
      <div class="form-group">
        <label>模块标题</label>
        <el-input v-model="config.title" placeholder="请输入模块标题" />
      </div>
      
      <div class="fields-config">
        <div class="fields-header">
          <h4>字段配置</h4>
          <el-button size="small" type="primary" @click="addField">
            <el-icon><Plus /></el-icon>
            添加字段
          </el-button>
        </div>
        
        <div v-for="(field, index) in config.fields" :key="index" class="field-item">
          <div class="field-controls">
            <el-input v-model="field.name" placeholder="字段名称" style="width: 120px;" />
            <el-input v-model="field.label" placeholder="显示标签" style="width: 120px;" />
            <el-select v-model="field.type" style="width: 120px;" @change="handleTypeChange(field, $event)">
              <el-option label="文本" value="text" />
              <el-option label="多行文本" value="textarea" />
              <el-option label="日期" value="date" />
              <el-option label="日期区间" value="dateRange" />
            </el-select>
            <el-checkbox 
              v-if="field.type === 'textarea'" 
              v-model="field.richText"
              style="margin-left: 8px;"
            >
              富文本
            </el-checkbox>
            <el-checkbox v-model="field.required">必填</el-checkbox>
            <el-button size="small" type="danger" @click="removeField(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FieldConfig } from '@/types/resume'

interface CustomSectionConfig {
  title: string
  fields: FieldConfig[]
}

interface Props {
  visible: boolean
  initialConfig?: CustomSectionConfig
}

interface Emits {
  (e: 'confirm', config: CustomSectionConfig): void
  (e: 'cancel'): void
  (e: 'closed'): void
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 处理 v-model 绑定
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const config = ref<CustomSectionConfig>({
  title: '自定义模块',
  fields: [
    { name: 'title', label: '标题', type: 'text', required: true }
  ]
})

// 监听初始配置变化
watch(() => props.initialConfig, (newConfig) => {
  if (newConfig) {
    config.value = { ...newConfig }
  }
}, { immediate: true })

function addField() {
  config.value.fields.push({
    name: '',
    label: '',
    type: 'text',
    required: false,
    richText: false
  })
}

function handleTypeChange(field: any, newType: string) {
  if (newType !== 'textarea') {
    field.richText = false
  }
}

function removeField(index: number) {
  config.value.fields.splice(index, 1)
}

function confirm() {
  // 验证配置
  if (!config.value.title.trim()) {
    ElMessage.warning('请输入模块标题')
    return
  }
  
  const hasEmptyFields = config.value.fields.some(field => 
    !field.name.trim() || !field.label.trim()
  )
  
  if (hasEmptyFields) {
    ElMessage.warning('请完善所有字段配置')
    return
  }
  
  emit('confirm', config.value)
}
</script>

<style scoped>
.custom-config {
  padding: 20px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.fields-config {
  margin-top: 30px;
}

.fields-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.fields-header h4 {
  margin: 0;
  color: #374151;
}

.field-item {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
}

.field-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
