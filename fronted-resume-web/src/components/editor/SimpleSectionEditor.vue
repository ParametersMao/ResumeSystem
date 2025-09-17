<template>
  <div class="simple-section-editor">
    <!-- 模块标题栏 -->
    <div class="section-header">
      <div class="section-info">
        <span class="section-icon">📝</span>
        <template v-if="!editingTitle">
          <span class="section-title">{{ modelValue.title }}</span>
          <el-button text size="small" class="edit-title-btn" @click="startEditTitle">重命名</el-button>
        </template>
        <template v-else>
          <el-input
            v-model="tempTitle"
            size="small"
            class="title-input"
            @keyup.enter.native="confirmEditTitle"
          />
          <el-button size="small" type="primary" @click="confirmEditTitle">保存</el-button>
          <el-button size="small" @click="cancelEditTitle">取消</el-button>
        </template>
      </div>
      <div class="section-actions">
        <el-button text size="small" @click="collapsed = !collapsed">{{ collapsed ? '展开' : '收起' }}</el-button>
        <el-switch 
          v-model="modelValue.visible" 
          size="small"
          :active-text="modelValue.visible ? '显示' : '隐藏'"
        />
        <el-button size="small" @click="$emit('move-up')">上移</el-button>
        <el-button size="small" @click="$emit('move-down')">下移</el-button>
        <el-button 
          v-if="showAddButton"
          type="primary" 
          size="small" 
          @click="addItem"
        >
          + 添加
        </el-button>
        <el-button 
          type="danger" 
          size="small" 
          plain
          @click="$emit('remove')"
        >
          删除模块
        </el-button>
      </div>
    </div>

    <!-- 模块内容 -->
    <div v-if="sectionVisible" class="section-content" v-show="!collapsed">
      <!-- 技能标签模式 -->
      <template v-if="modelValue.type === 'skills'">
        <div class="skills-container">
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
              + 添加技能
            </el-button>
        </div>
      </template>

      <!-- 列表项模式 -->
      <template v-else>
        <div 
          v-for="(item, index) in modelValue.items" 
          :key="index" 
          class="item-card"
        >
          <div class="item-header">
            <span class="item-title">{{ getItemTitle(item, index) }}</span>
            <div class="item-actions">
              <el-button size="small" text @click="toggleItemCollapse(index)">{{ isItemCollapsed(index) ? '展开' : '收起' }}</el-button>
              <el-button size="small" @click="moveUp(index)" :disabled="index === 0">
                上移
              </el-button>
              <el-button size="small" @click="moveDown(index)" :disabled="index === modelValue.items.length - 1">
                下移
              </el-button>
              <el-button size="small" type="danger" @click="removeItem(index)">
                删除
              </el-button>
            </div>
          </div>
          
          <!-- 简化的字段编辑：仅渲染配置字段，不再显示整个对象结构 -->
          <div class="item-fields" v-show="!isItemCollapsed(index)">
            <div 
              v-for="field in (sectionConfig.fields || [])" 
              :key="field.name"
              class="field-row"
            >
              <DynamicField
                :field="field"
                v-model="item[field.name]"
                @update:modelValue="updateItemField(index, field.name, $event)"
                @ai="(html: string) => onAiRequest(index, field.name, html)"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { SECTION_TYPES } from '@/config/sectionTypes'
import type { ResumeSection } from '@/types/resume'
import DynamicField from '@/components/form/DynamicField.vue'

interface Props {
  modelValue: ResumeSection
}

interface Emits {
  (e: 'update:modelValue', value: ResumeSection): void
  (e: 'remove'): void
  (e: 'ai', payload: { sectionId: string; itemIndex: number; fieldName: string; html: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const sectionVisible = ref(props.modelValue.visible)
const collapsed = ref(false)
const showSkillInput = ref(false)
const newSkill = ref('')
const skillInputRef = ref()
const editingTitle = ref(false)
const tempTitle = ref(props.modelValue.title)
const collapsedItems = ref<Set<number>>(new Set())



// 计算属性
const sectionConfig = computed(() => {
  // 自定义模块：优先使用模块自身携带的字段配置
  if (props.modelValue.type === 'custom') {
    const base = { ...SECTION_TYPES.custom }
    const customFields = (props.modelValue as any)?.config?.fields
    if (Array.isArray(customFields) && customFields.length > 0) {
      return { ...base, fields: customFields }
    }
    return base
  }
  return SECTION_TYPES[props.modelValue.type] || SECTION_TYPES.custom
})

const showAddButton = computed(() => {
  return props.modelValue.type !== 'skills' && sectionConfig.value.allowMultiple
})

// 对于 object 类型且不允许多项的模块，若 items 为空则自动创建一个空对象项
if (sectionConfig.value.itemType === 'object' && !sectionConfig.value.allowMultiple && (!props.modelValue.items || props.modelValue.items.length === 0)) {
  const empty: any = {}
  sectionConfig.value.fields?.forEach(field => {
    if (field.type === 'dateRange') {
      empty[field.name] = { start: '', end: '' }
    } else {
      empty[field.name] = ''
    }
  })
  emit('update:modelValue', { ...props.modelValue, items: [empty] })
}

// 方法
function updateVisibility(visible: boolean) {
  emit('update:modelValue', { ...props.modelValue, visible })
}

function startEditTitle() {
  tempTitle.value = props.modelValue.title
  editingTitle.value = true
}

function confirmEditTitle() {
  const title = (tempTitle.value || '').trim()
  if (title && title !== props.modelValue.title) {
    emit('update:modelValue', { ...props.modelValue, title })
  }
  editingTitle.value = false
}

function cancelEditTitle() {
  editingTitle.value = false
}

function getItemTitle(item: any, index: number): string {
  const config = sectionConfig.value
  if (config.fields && config.fields.length > 0) {
    const firstField = config.fields[0]
    const titleCandidate = item[firstField.name]
    // 如果是富文本或对象，避免把结构化内容渲染到标题上
    if (titleCandidate && typeof titleCandidate === 'object') {
      return `${props.modelValue.title} ${index + 1}`
    }
    return titleCandidate || `${props.modelValue.title} ${index + 1}`
  }
  return `${props.modelValue.title} ${index + 1}`
}

function addItem() {
  const emptyItem: any = {}
  sectionConfig.value.fields?.forEach(field => {
    if (field.type === 'dateRange') {
      emptyItem[field.name] = { start: '', end: '' }
    } else {
      emptyItem[field.name] = ''
    }
  })
  
  const newItems = [...props.modelValue.items, emptyItem]
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

function removeItem(index: number) {
  const newItems = [...props.modelValue.items]
  newItems.splice(index, 1)
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

function moveUp(index: number) {
  if (index === 0) return
  const newItems = [...props.modelValue.items]
  ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

function moveDown(index: number) {
  if (index === props.modelValue.items.length - 1) return
  const newItems = [...props.modelValue.items]
  ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

function updateItemField(itemIndex: number, fieldName: string, value: any) {
  const newItems = [...props.modelValue.items]
  newItems[itemIndex] = { ...newItems[itemIndex], [fieldName]: value }
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

function onAiRequest(itemIndex: number, fieldName: string, html: string) {
  emit('ai', { sectionId: props.modelValue.id, itemIndex, fieldName, html })
}

function toggleItemCollapse(idx: number) {
  const s = new Set(collapsedItems.value)
  if (s.has(idx)) s.delete(idx); else s.add(idx)
  collapsedItems.value = s
}

function isItemCollapsed(idx: number): boolean {
  return collapsedItems.value.has(idx)
}

// 技能相关方法
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
.simple-section-editor {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
  background: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 16px;
}

.section-title {
  font-weight: 600;
  color: #1f2937;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-content {
  padding: 20px;
}

.item-card {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafbfc;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.item-title {
  font-weight: 500;
  color: #374151;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.item-fields {
  display: grid;
  gap: 16px;
}

.field-row {
  display: flex;
  flex-direction: column;
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
  width: 120px;
}

.add-skill-btn {
  border: 1px dashed #d1d5db;
  color: #6b7280;
}

.add-skill-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}



/* 响应式优化 */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .section-actions {
    justify-content: center;
  }
  
  .item-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .item-actions {
    justify-content: center;
  }
}
</style>
