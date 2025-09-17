<template>
  <div class="module-state-test">
    <div class="test-header">
      <h1>模块状态管理测试</h1>
      <div class="test-controls">
        <el-button @click="loadTestTemplate">加载测试模板</el-button>
        <el-button @click="resetToDefaults">重置为默认</el-button>
        <el-button @click="clearUserSettings">清除用户设置</el-button>
      </div>
    </div>

    <div class="test-content">
      <!-- 左侧：模块状态显示 -->
      <div class="state-panel">
        <h3>模块状态</h3>
        <div class="module-states">
          <div 
            v-for="module in allModuleStates" 
            :key="module.type"
            class="module-state-item"
            :class="{ 
              'visible': module.editorVisible,
              'collapsed': module.collapsed 
            }"
          >
            <div class="module-info">
              <span class="module-type">{{ module.type }}</span>
              <span class="module-title">{{ module.config.title }}</span>
            </div>
            <div class="module-status">
              <el-tag 
                :type="module.visible ? 'success' : 'info'"
                size="small"
              >
                模板: {{ module.visible ? '显示' : '隐藏' }}
              </el-tag>
              <el-tag 
                :type="module.userVisible ? 'success' : 'warning'"
                size="small"
              >
                用户: {{ module.userVisible ? '显示' : '隐藏' }}
              </el-tag>
              <el-tag 
                :type="module.collapsed ? 'warning' : 'success'"
                size="small"
              >
                {{ module.collapsed ? '收起' : '展开' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：操作面板 -->
      <div class="action-panel">
        <h3>操作面板</h3>
        
        <!-- 模块可见性控制 -->
        <div class="control-section">
          <h4>模块可见性控制</h4>
          <div 
            v-for="module in allModuleStates" 
            :key="`vis-${module.type}`"
            class="control-item"
          >
            <span>{{ module.config.title }}</span>
            <el-switch 
              v-if="module.allowHide"
              v-model="module.userVisible"
              @change="toggleVisibility(module.type)"
            />
            <el-tag v-else size="small" type="warning">必需</el-tag>
          </div>
        </div>

        <!-- 模块收起控制 -->
        <div class="control-section">
          <h4>模块收起控制</h4>
          <div 
            v-for="module in allModuleStates" 
            :key="`col-${module.type}`"
            class="control-item"
          >
            <span>{{ module.config.title }}</span>
            <el-switch 
              v-if="module.allowCollapse"
              v-model="module.collapsed"
              @change="toggleCollapse(module.type)"
            />
            <el-tag v-else size="small" type="warning">固定</el-tag>
          </div>
        </div>

        <!-- 模块顺序控制 -->
        <div class="control-section">
          <h4>模块顺序控制</h4>
          <div 
            v-for="module in sortedModules" 
            :key="`order-${module.type}`"
            class="control-item"
          >
            <span>{{ module.config.title }}</span>
            <div class="order-controls">
              <el-button 
                size="small"
                @click="moveModule(module.type, -1)"
                :disabled="module.order === 0"
              >
                上移
              </el-button>
              <span class="order-number">{{ module.order }}</span>
              <el-button 
                size="small"
                @click="moveModule(module.type, 1)"
                :disabled="module.order === allModuleStates.length - 1"
              >
                下移
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：预览区域 -->
    <div class="preview-panel">
      <h3>预览区域</h3>
      <div class="preview-content">
        <div class="editor-preview">
          <h4>编辑区域可见模块</h4>
          <div class="preview-list">
            <el-tag 
              v-for="module in editorVisibleModules" 
              :key="`ed-${module.type}`"
              :type="module.collapsed ? 'warning' : 'success'"
            >
              {{ module.config.title }}
              {{ module.collapsed ? '(收起)' : '' }}
            </el-tag>
          </div>
        </div>
        
        <div class="preview-preview">
          <h4>预览区域可见模块</h4>
          <div class="preview-list">
            <el-tag 
              v-for="module in previewVisibleModules" 
              :key="`pr-${module.type}`"
              type="success"
            >
              {{ module.config.title }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { moduleStateManager } from '@/utils/moduleStateManager'
import type { ModuleType } from '@/types/resume'

// 计算属性
const allModuleStates = computed(() => 
  moduleStateManager.getAllModuleStates().value
)

const sortedModules = computed(() => 
  allModuleStates.value.sort((a, b) => a.order - b.order)
)

const editorVisibleModules = computed(() => 
  moduleStateManager.getEditorVisibleModules().value
)

const previewVisibleModules = computed(() => 
  moduleStateManager.getPreviewVisibleModules().value
)

// 方法
const loadTestTemplate = () => {
  const testTemplate = {
    templateName: "测试模板",
    templateVersion: 1,
    styles: {
      colors: {
        primary: "#2c5aa0",
        secondary: "#f1f5f9",
        text: "#2c3e50",
        background: "#ffffff"
      },
      fonts: {
        heading: "Microsoft YaHei, Arial, sans-serif",
        body: "Microsoft YaHei, Arial, sans-serif"
      },
      spacing: {
        sectionMargin: "25px",
        elementMargin: "15px"
      }
    },
    globalConfig: {
      maxWidth: "860px",
      padding: "30px",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    },
    layout: [
      {
        type: 'basic',
        visible: true,
        collapsed: false,
        order: 0,
        config: {
          title: '基本信息',
          allowHide: false,
          allowCollapse: false
        }
      },
      {
        type: 'education',
        visible: true,
        collapsed: false,
        order: 1,
        config: {
          title: '教育背景',
          allowHide: true,
          allowCollapse: true
        }
      },
      {
        type: 'experience',
        visible: true,
        collapsed: false,
        order: 2,
        config: {
          title: '工作经验',
          allowHide: true,
          allowCollapse: true
        }
      },
      {
        type: 'skills',
        visible: false,
        collapsed: true,
        order: 3,
        config: {
          title: '技能特长',
          allowHide: true,
          allowCollapse: true
        }
      },
      {
        type: 'hobbies',
        visible: false,
        collapsed: true,
        order: 4,
        config: {
          title: '兴趣爱好',
          allowHide: true,
          allowCollapse: true
        }
      }
    ]
  }
  
  moduleStateManager.setTemplateData(testTemplate)
}

const toggleVisibility = (moduleType: ModuleType) => {
  moduleStateManager.toggleModuleVisibility(moduleType)
}

const toggleCollapse = (moduleType: ModuleType) => {
  moduleStateManager.toggleModuleCollapse(moduleType)
}

const moveModule = (moduleType: ModuleType, direction: -1 | 1) => {
  moduleStateManager.moveModule(moduleType, direction)
}

const resetToDefaults = () => {
  moduleStateManager.resetToTemplateDefaults()
}

const clearUserSettings = () => {
  moduleStateManager.clearUserSettings()
}

// 初始化
onMounted(() => {
  // 加载默认状态
  loadTestTemplate()
})
</script>

<style scoped>
.module-state-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e4e7ed;
}

.test-header h1 {
  margin: 0;
  color: #303133;
}

.test-controls {
  display: flex;
  gap: 10px;
}

.test-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.state-panel,
.action-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.state-panel h3,
.action-panel h3 {
  margin: 0 0 20px 0;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.module-states {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.module-state-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
}

.module-state-item.visible {
  background: #f0f9ff;
  border-color: #0ea5e9;
}

.module-state-item.collapsed {
  opacity: 0.7;
}

.module-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.module-type {
  font-weight: 600;
  color: #374151;
}

.module-title {
  color: #6b7280;
}

.module-status {
  display: flex;
  gap: 8px;
}

.control-section {
  margin-bottom: 25px;
}

.control-section h4 {
  margin: 0 0 15px 0;
  color: #374151;
  font-size: 14px;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.control-item:last-child {
  border-bottom: none;
}

.order-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-number {
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  color: #374151;
}

.preview-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.preview-panel h3 {
  margin: 0 0 20px 0;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.preview-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.preview-content h4 {
  margin: 0 0 15px 0;
  color: #374151;
  font-size: 14px;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-list .el-tag {
  margin-bottom: 5px;
}
</style>
