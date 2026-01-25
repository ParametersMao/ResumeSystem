<template>
  <div class="experience-editor">
    <h3 class="section-title">工作经验</h3>
    
    <div v-if="localItems.length === 0" class="empty-placeholder">
      <el-empty description="暂无工作经验" :image-size="80">
        <el-button type="primary" :icon="Plus" @click="addItem">
          添加第一条工作经验
        </el-button>
      </el-empty>
    </div>
    
    <div v-else class="items-list">
      <div v-for="(item, index) in localItems" :key="index" class="item-card">
        <div class="item-header">
          <h4>公司经历 {{ index + 1 }}</h4>
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
            <label>公司名称 <span class="required">*</span></label>
            <el-input 
              v-model="item.company" 
              placeholder="请输入公司名称"
              @input="emitChange"
            />
          </div>

          <div class="form-item">
            <label>所在部门</label>
            <el-input 
              v-model="item.department" 
              placeholder="请输入部门"
              @input="emitChange"
            />
          </div>

          <div class="form-item">
            <label>职位 <span class="required">*</span></label>
            <el-input 
              v-model="item.position" 
              placeholder="请输入职位"
              @input="emitChange"
            />
          </div>

          <div class="form-item">
            <label>在职时间 <span class="required">*</span></label>
            <el-date-picker
              v-model="item.dateRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="至今/结束时间"
              format="YYYY-MM"
              value-format="YYYY-MM"
              @change="emitChange"
            />
          </div>

          <div class="form-item">
            <label>工作性质</label>
            <el-select 
              v-model="item.type" 
              placeholder="请选择"
              @change="emitChange"
            >
              <el-option label="全职" value="全职" />
              <el-option label="兼职" value="兼职" />
              <el-option label="实习" value="实习" />
              <el-option label="外包" value="外包" />
            </el-select>
          </div>

          <div class="form-item">
            <label>城市</label>
            <el-input 
              v-model="item.city" 
              placeholder="如：北京"
              @input="emitChange"
            />
          </div>
        </div>

        <div class="form-item full-width">
          <label>工作职责与业绩</label>
          <div class="rich-editor">
            <el-input 
              v-model="item.description" 
              type="textarea"
              :rows="6"
              placeholder="请输入工作职责与业绩，每条一行，例如：&#10;• 负责公司核心产品的前端开发&#10;• 参与技术方案设计和代码审查&#10;• 优化前端性能，提升用户体验"
              @input="emitChange"
            />
          </div>
          <div class="editor-tips">
            💡 提示：每条工作职责单独一行，以"•"或"-"开头
          </div>
        </div>

        <div class="ai-optimize-box">
          <el-button 
            type="primary" 
            size="small"
            @click="emitAiOptimize(index)"
          >
            <el-icon><MagicStick /></el-icon>
            AI 优化此条工作经验
          </el-button>
        </div>
      </div>
    </div>

    <el-button 
      class="add-item-btn" 
      type="primary" 
      :icon="Plus"
      @click="addItem"
    >
      新增一条工作经验
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, MagicStick } from '@element-plus/icons-vue'
import { ElEmpty } from 'element-plus'

interface ExperienceItem {
  company: string
  department: string
  position: string
  dateRange: [string, string] | null
  type: string
  city: string
  description: string
}

interface Props {
  modelValue: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change', 'ai-optimize'])

const localItems = ref<ExperienceItem[]>([])

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.items) {
    localItems.value = newVal.items.map((item: any) => ({
      company: item.company || '',
      department: item.department || '',
      position: item.position || '',
      dateRange: item.startDate && item.endDate ? [item.startDate, item.endDate] : null,
      type: item.type || '',
      city: item.city || '',
      description: item.description || item.responsibilities?.join('\n') || ''
    }))
  } else {
    // 不自动添加空项，让用户主动点击"新增"按钮
    localItems.value = []
  }
}, { immediate: true, deep: true })

function addItem() {
  localItems.value.push({
    company: '',
    department: '',
    position: '',
    dateRange: null,
    type: '全职',
    city: '',
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
    props.modelValue.items = localItems.value.map(item => ({
      company: item.company,
      department: item.department,
      position: item.position,
      startDate: item.dateRange?.[0] || '',
      endDate: item.dateRange?.[1] || '',
      type: item.type,
      city: item.city,
      description: item.description,
      responsibilities: item.description.split('\n').filter(line => line.trim())
    }))
    emit('update:modelValue', props.modelValue)
    emit('change', props.modelValue)
  }
}

function emitAiOptimize(index: number) {
  emit('ai-optimize', {
    type: 'experience',
    index: index,
    data: localItems.value[index]
  })
}
</script>

<style scoped lang="scss">
@import './common-styles.scss';

.experience-editor {
  :deep(.el-date-editor) {
    width: 100%;
  }

  .editor-tips {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    padding: 8px 12px;
    background: #f4f4f5;
    border-radius: 4px;
  }

  .ai-optimize-box {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #e4e7ed;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

