<template>
  <div class="tab-module-editor">
    <!-- 顶部选项卡 -->
    <div class="module-tabs">
      <div 
        v-for="module in allModules" 
        :key="module.type"
        class="tab-item"
        :class="{ 
          'active': activeModule === module.type,
          'enabled': isModuleEnabled(module.type),
          'disabled': !isModuleEnabled(module.type)
        }"
        @click="switchModule(module.type)"
      >
        <span class="tab-name">{{ module.label }}</span>
        <el-icon 
          v-if="isModuleEnabled(module.type)" 
          class="check-icon"
        >
          <CircleCheck />
        </el-icon>
      </div>
    </div>

    <!-- 模块编辑区域 -->
    <div class="module-content">
      <!-- 基本信息 -->
      <BasicInfoEditor
        v-if="activeModule === 'basic'"
        v-model="localData.basic"
        @change="emitChange"
      />

      <!-- 求职意向 -->
      <IntentionEditor
        v-if="activeModule === 'intention'"
        v-model="getSectionData('intention')"
        @change="emitChange"
      />

      <!-- 教育背景 -->
      <EducationEditor
        v-if="activeModule === 'education'"
        v-model="getSectionData('education')"
        @change="emitChange"
      />

      <!-- 工作经验 -->
      <ExperienceEditor
        v-if="activeModule === 'experience'"
        v-model="getSectionData('experience')"
        @change="emitChange"
      />

      <!-- 项目经验 -->
      <ProjectsEditor
        v-if="activeModule === 'projects'"
        v-model="getSectionData('projects')"
        @change="emitChange"
      />

      <!-- 实习经验 -->
      <InternshipEditor
        v-if="activeModule === 'internship'"
        v-model="getSectionData('internship')"
        @change="emitChange"
      />

      <!-- 校园经历 -->
      <CampusEditor
        v-if="activeModule === 'campus'"
        v-model="getSectionData('campus')"
        @change="emitChange"
      />

      <!-- 技能特长 -->
      <SkillsEditor
        v-if="activeModule === 'skills'"
        v-model="getSectionData('skills')"
        @change="emitChange"
      />

      <!-- 荣誉证书 -->
      <AwardsEditor
        v-if="activeModule === 'awards'"
        v-model="getSectionData('awards')"
        @change="emitChange"
      />

      <!-- 自我评价 -->
      <SummaryEditor
        v-if="activeModule === 'summary'"
        v-model="getSectionData('summary')"
        @change="emitChange"
      />

      <!-- 兴趣爱好 -->
      <HobbiesEditor
        v-if="activeModule === 'hobbies'"
        v-model="getSectionData('hobbies')"
        @change="emitChange"
      />

      <!-- 自定义模块 -->
      <CustomEditor
        v-if="activeModule === 'custom'"
        v-model="getSectionData('custom')"
        @change="emitChange"
      />
    </div>

    <!-- 底部操作栏 -->
    <div class="module-actions">
      <el-button @click="toggleModule" :type="isModuleEnabled(activeModule) ? 'danger' : 'success'">
        {{ isModuleEnabled(activeModule) ? '禁用此模块' : '启用此模块' }}
      </el-button>
      <el-button type="primary" @click="emitAiOptimize">
        <el-icon><MagicStick /></el-icon>
        AI 优化
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CircleCheck, MagicStick } from '@element-plus/icons-vue'

// 导入各个模块的编辑器组件
import BasicInfoEditor from './modules/BasicInfoEditor.vue'
import IntentionEditor from './modules/IntentionEditor.vue'
import EducationEditor from './modules/EducationEditor.vue'
import ExperienceEditor from './modules/ExperienceEditor.vue'
import ProjectsEditor from './modules/ProjectsEditor.vue'
import InternshipEditor from './modules/InternshipEditor.vue'
import CampusEditor from './modules/CampusEditor.vue'
import SkillsEditor from './modules/SkillsEditor.vue'
import AwardsEditor from './modules/AwardsEditor.vue'
import SummaryEditor from './modules/SummaryEditor.vue'
import HobbiesEditor from './modules/HobbiesEditor.vue'
import CustomEditor from './modules/CustomEditor.vue'

interface Props {
  resumeData: any
  templateConfig?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:resumeData', 'change', 'ai-optimize'])

// 当前激活的模块
const activeModule = ref('basic')

// 本地数据副本
const localData = ref({
  basic: {},
  sections: []
})

// 所有可用模块
const allModules = [
  { type: 'basic', label: '基本信息', required: true },
  { type: 'intention', label: '求职意向', required: false },
  { type: 'education', label: '教育背景', required: false },
  { type: 'experience', label: '工作经验', required: false },
  { type: 'projects', label: '项目经验', required: false },
  { type: 'internship', label: '实习经验', required: false },
  { type: 'campus', label: '校园经历', required: false },
  { type: 'skills', label: '技能特长', required: false },
  { type: 'awards', label: '荣誉证书', required: false },
  { type: 'summary', label: '自我评价', required: false },
  { type: 'hobbies', label: '兴趣爱好', required: false },
  { type: 'custom', label: '自定义', required: false }
]

// 初始化数据
watch(() => props.resumeData, (newData) => {
  if (newData) {
    localData.value = JSON.parse(JSON.stringify(newData))
    
    // 确保所有模块都有对应的 section
    initializeSections()
  }
}, { immediate: true, deep: true })

// 初始化所有模块的section
function initializeSections() {
  allModules.forEach(module => {
    if (module.type === 'basic') return // 基本信息不需要 section
    
    const existingSection = localData.value.sections.find((s: any) => s.type === module.type)
    if (!existingSection) {
      localData.value.sections.push({
        id: `${module.type}-${Date.now()}`,
        type: module.type,
        title: module.label,
        visible: false, // 默认禁用
        order: localData.value.sections.length,
        items: [],
        config: {},
        data: {}
      })
    }
  })
}

// 获取指定类型的 section 数据
function getSectionData(type: string) {
  let section = localData.value.sections.find((s: any) => s.type === type)
  if (!section) {
    // 如果不存在，创建一个
    section = {
      id: `${type}-${Date.now()}`,
      type: type,
      title: allModules.find(m => m.type === type)?.label || type,
      visible: false,
      order: localData.value.sections.length,
      items: [],
      config: {},
      data: {}
    }
    localData.value.sections.push(section)
  }
  return section
}

// 检查模块是否启用
function isModuleEnabled(type: string) {
  if (type === 'basic') return true // 基本信息始终启用
  const section = localData.value.sections.find((s: any) => s.type === type)
  return section?.visible || false
}

// 切换模块
function switchModule(type: string) {
  activeModule.value = type
}

// 启用/禁用模块
function toggleModule() {
  const type = activeModule.value
  if (type === 'basic') return // 基本信息不能禁用
  
  const section = getSectionData(type)
  section.visible = !section.visible
  emitChange()
}

// 发送变更事件
function emitChange() {
  emit('update:resumeData', localData.value)
  emit('change', localData.value)
}

// 触发 AI 优化
function emitAiOptimize() {
  emit('ai-optimize', {
    moduleType: activeModule.value,
    data: activeModule.value === 'basic' ? localData.value.basic : getSectionData(activeModule.value)
  })
}
</script>

<style scoped lang="scss">
.tab-module-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.module-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
  }
}

.tab-item {
  position: relative;
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    color: #409eff;
    border-color: #409eff;
  }
  
  &.active {
    color: #409eff;
    background: #ecf5ff;
    border-color: #409eff;
    font-weight: 600;
  }
  
  &.enabled {
    .tab-name {
      color: #67c23a;
    }
  }
  
  &.disabled {
    color: #909399;
  }
  
  .check-icon {
    font-size: 16px;
    color: #67c23a;
  }
}

.module-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 4px;
  }
}

.module-actions {
  padding: 12px 20px;
  border-top: 1px solid #e4e7ed;
  background: #ffffff;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>

