<template>
  <div class="section-editor">
    <div class="section-header">
      <div class="section-title">
        <el-input
          v-model="modelValue.title"
          size="small"
          style="width: 200px;"
        />
        <el-switch
          v-model="modelValue.visible"
          size="small"
          active-text="显示"
          inactive-text="隐藏"
        />
      </div>
      <div class="section-actions">
        <el-button size="small" type="primary" @click="addItem" v-if="canAddItems">
          <el-icon><Plus /></el-icon>
          添加
        </el-button>
        <el-button size="small" type="danger" @click="$emit('remove')">
          <el-icon><Delete /></el-icon>
          删除模块
        </el-button>
      </div>
    </div>

    <div v-show="modelValue.visible" class="section-content">
      <!-- 技能类型 - 标签形式 -->
      <div v-if="modelValue.type === 'skills'" class="skills-container">
        <el-tag
          v-for="(skill, index) in modelValue.items"
          :key="index"
          closable
          @close="removeSkill(index)"
          class="skill-tag"
        >
          {{ skill }}
        </el-tag>
        <el-input
          v-if="showSkillInput"
          ref="skillInputRef"
          v-model="newSkill"
          size="small"
          @keyup.enter="confirmSkill"
          @blur="confirmSkill"
          class="skill-input"
        />
        <el-button
          v-else
          size="small"
          @click="addSkill"
          class="add-skill-btn"
        >
          <el-icon><Plus /></el-icon>
          添加技能
        </el-button>
      </div>

      <!-- 其他类型 - 表单形式 -->
      <div v-else>
        <div
          v-for="(item, index) in modelValue.items"
          :key="index"
          class="item-card"
        >
          <div class="item-header">
            <span>{{ modelValue.title }} {{ index + 1 }}</span>
            <el-button size="small" type="danger" text @click="removeItem(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          
          <div class="item-fields">
            <DynamicField
              v-for="field in sectionConfig.fields"
              :key="field.name"
              :field="field"
              v-model="item[field.name]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { ResumeSection } from '@/types/resume'
import { SECTION_TYPES } from '@/config/sectionTypes'
import DynamicField from '@/components/form/DynamicField.vue'

interface Props {
  modelValue: ResumeSection
}

interface Emits {
  (e: 'update:modelValue', value: ResumeSection): void
  (e: 'remove'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 技能输入相关
const showSkillInput = ref(false)
const newSkill = ref('')
const skillInputRef = ref()

// 获取模块配置
const sectionConfig = computed(() => {
  return SECTION_TYPES[props.modelValue.type] || SECTION_TYPES.custom
})

// 是否可以添加项目
const canAddItems = computed(() => {
  return props.modelValue.type !== 'skills' && sectionConfig.value.allowMultiple
})

// 添加项目
function addItem() {
  const emptyItem: any = {}
  sectionConfig.value.fields?.forEach(field => {
    emptyItem[field.name] = ''
  })
  
  const newItems = [...props.modelValue.items, emptyItem]
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

// 删除项目
function removeItem(index: number) {
  const newItems = [...props.modelValue.items]
  newItems.splice(index, 1)
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

// 技能相关操作
function addSkill() {
  showSkillInput.value = true
  nextTick(() => {
    skillInputRef.value?.focus()
  })
}

function confirmSkill() {
  if (newSkill.value.trim()) {
    const newItems = [...props.modelValue.items, newSkill.value.trim()]
    emit('update:modelValue', { ...props.modelValue, items: newItems })
    newSkill.value = ''
  }
  showSkillInput.value = false
}

function removeSkill(index: number) {
  const newItems = [...props.modelValue.items]
  newItems.splice(index, 1)
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}
</script>

<style scoped>
.section-editor {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0; /* 防止按钮被压缩 */
}

.section-content {
  margin-top: 16px;
}

.item-card {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  background: white;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #374151;
}

.item-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.item-fields > :last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

/* 响应式布局 - 当空间不够时改为单列 */
@media (max-width: 600px) {
  .item-fields {
    grid-template-columns: 1fr;
  }
  
  .item-fields > :last-child:nth-child(odd) {
    grid-column: 1;
  }
}

/* 技能样式 */
.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.skill-tag {
  margin: 0;
}

.skill-input {
  width: 100px;
}

.add-skill-btn {
  border: 1px dashed #d1d5db;
}</style>
