<template>
  <div class="projects-editor">
    <h3 class="section-title">项目经验</h3>
    
    <div class="items-list">
      <div v-for="(item, index) in localItems" :key="index" class="item-card">
        <div class="item-header">
          <h4>项目经历 {{ index + 1 }}</h4>
          <div class="item-actions">
            <el-button size="small" @click="moveUp(index)" :disabled="index === 0">上移</el-button>
            <el-button size="small" @click="moveDown(index)" :disabled="index === localItems.length - 1">下移</el-button>
            <el-button size="small" type="danger" @click="removeItem(index)">删除</el-button>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-item">
            <label>项目名称 <span class="required">*</span></label>
            <el-input v-model="item.name" placeholder="请输入项目名称" @input="emitChange" />
          </div>

          <div class="form-item">
            <label>担任角色</label>
            <el-input v-model="item.role" placeholder="如：项目负责人" @input="emitChange" />
          </div>

          <div class="form-item">
            <label>项目时间 <span class="required">*</span></label>
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
            <label>项目链接</label>
            <el-input v-model="item.link" placeholder="项目网址或仓库地址" @input="emitChange" />
          </div>

          <div class="form-item full-width">
            <label>项目描述</label>
            <el-input 
              v-model="item.description" 
              type="textarea"
              :rows="6"
              placeholder="请输入项目描述、职责和成果，每条一行"
              @input="emitChange"
            />
          </div>
        </div>
      </div>
    </div>

    <el-button class="add-item-btn" type="primary" :icon="Plus" @click="addItem">
      新增一条项目经验
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'

interface Props {
  modelValue: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change'])

const localItems = ref<any[]>([])

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.items) {
    localItems.value = newVal.items.map((item: any) => ({
      name: item.name || '',
      role: item.role || '',
      dateRange: item.startDate && item.endDate ? [item.startDate, item.endDate] : null,
      link: item.link || '',
      description: item.description || ''
    }))
  } else {
    // 不自动添加空项
    localItems.value = []
  }
}, { immediate: true, deep: true })

function addItem() {
  localItems.value.push({
    name: '',
    role: '',
    dateRange: null,
    link: '',
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
    [localItems.value[index], localItems.value[index - 1]] = [localItems.value[index - 1], localItems.value[index]]
    emitChange()
  }
}

function moveDown(index: number) {
  if (index < localItems.value.length - 1) {
    [localItems.value[index], localItems.value[index + 1]] = [localItems.value[index + 1], localItems.value[index]]
    emitChange()
  }
}

function emitChange() {
  if (props.modelValue) {
    props.modelValue.items = localItems.value.map(item => ({
      name: item.name,
      role: item.role,
      startDate: item.dateRange?.[0] || '',
      endDate: item.dateRange?.[1] || '',
      link: item.link,
      description: item.description
    }))
    emit('update:modelValue', props.modelValue)
    emit('change', props.modelValue)
  }
}
</script>

<style scoped lang="scss">
@import './common-styles.scss';

.projects-editor {
  :deep(.el-date-editor) {
    width: 100%;
  }
}
</style>

