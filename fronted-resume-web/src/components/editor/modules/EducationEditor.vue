<template>
  <div class="education-editor">
    <h3 class="section-title">教育背景</h3>
    
    <div class="items-list">
      <div v-for="(item, index) in localItems" :key="index" class="item-card">
        <div class="item-header">
          <h4>教育背景 {{ index + 1 }}</h4>
          <div class="item-actions">
            <el-button 
              size="small" 
              @click="moveUp(index)"
              :disabled="index === 0"
            >
              上移
            </el-button>
            <el-button 
              size="small" 
              @click="moveDown(index)"
              :disabled="index === localItems.length - 1"
            >
              下移
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="removeItem(index)"
            >
              删除
            </el-button>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-item">
            <label>学校名称 <span class="required">*</span></label>
            <el-input 
              v-model="item.school" 
              placeholder="请输入学校名称"
              @input="emitChange"
            />
          </div>

          <div class="form-item">
            <label>所学专业 <span class="required">*</span></label>
            <el-input 
              v-model="item.major" 
              placeholder="请输入专业名称"
              @input="emitChange"
            />
          </div>

          <div class="form-item">
            <label>时间区间 <span class="required">*</span></label>
            <el-date-picker
              v-model="item.dateRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM"
              value-format="YYYY-MM"
              @change="emitChange"
            />
          </div>

          <div class="form-item">
            <label>学历</label>
            <el-select 
              v-model="item.degree" 
              placeholder="请选择学历"
              @change="emitChange"
            >
              <el-option label="高中" value="高中" />
              <el-option label="大专" value="大专" />
              <el-option label="本科" value="本科" />
              <el-option label="硕士" value="硕士" />
              <el-option label="博士" value="博士" />
            </el-option>
          </div>

          <div class="form-item full-width">
            <label>在校成绩</label>
            <el-input 
              v-model="item.gpa" 
              placeholder="如：GPA 3.8/4.0"
              @input="emitChange"
            />
          </div>

          <div class="form-item full-width">
            <label>主修课程</label>
            <el-input 
              v-model="item.courses" 
              type="textarea"
              :rows="3"
              placeholder="请输入主修课程，用逗号或顿号分隔"
              @input="emitChange"
            />
          </div>

          <div class="form-item full-width">
            <label>详细描述</label>
            <el-input 
              v-model="item.description" 
              type="textarea"
              :rows="3"
              placeholder="请输入更多详细信息，如获奖情况、社团活动等"
              @input="emitChange"
            />
          </div>
        </div>
      </div>
    </div>

    <el-button 
      class="add-item-btn" 
      type="primary" 
      :icon="Plus"
      @click="addItem"
    >
      新增一条教育背景
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'

interface EducationItem {
  school: string
  major: string
  dateRange: [string, string] | null
  degree: string
  gpa: string
  courses: string
  description: string
}

interface Props {
  modelValue: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change'])

const localItems = ref<EducationItem[]>([])

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.items) {
    localItems.value = newVal.items.map((item: any) => ({
      school: item.school || '',
      major: item.major || '',
      dateRange: item.startDate && item.endDate ? [item.startDate, item.endDate] : null,
      degree: item.degree || '',
      gpa: item.gpa || '',
      courses: item.courses || '',
      description: item.description || ''
    }))
  } else {
    // 不自动添加空项
    localItems.value = []
  }
}, { immediate: true, deep: true })

function addItem() {
  localItems.value.push({
    school: '',
    major: '',
    dateRange: null,
    degree: '',
    gpa: '',
    courses: '',
    description: ''
  })
  emitChange()
}

function removeItem(index: number) {
  localItems.value.splice(index, 1)
  emitChange()
}

function moveUp(index: number) {
  if (index > 0) {
    const temp = localItems.value[index]
    localItems.value[index] = localItems.value[index - 1]
    localItems.value[index - 1] = temp
    emitChange()
  }
}

function moveDown(index: number) {
  if (index < localItems.value.length - 1) {
    const temp = localItems.value[index]
    localItems.value[index] = localItems.value[index + 1]
    localItems.value[index + 1] = temp
    emitChange()
  }
}

function emitChange() {
  if (props.modelValue) {
    // 转换回标准格式
    props.modelValue.items = localItems.value.map(item => ({
      school: item.school,
      major: item.major,
      startDate: item.dateRange?.[0] || '',
      endDate: item.dateRange?.[1] || '',
      degree: item.degree,
      gpa: item.gpa,
      courses: item.courses,
      description: item.description
    }))
    emit('update:modelValue', props.modelValue)
    emit('change', props.modelValue)
  }
}
</script>

<style scoped lang="scss">
@import './common-styles.scss';

.education-editor {
  :deep(.el-date-editor) {
    width: 100%;
  }
}
</style>

