<template>
  <div class="settings-panel" :class="{ collapsed }">
    <div v-if="!collapsed" class="settings-header">
      <h3>样式设置</h3>
      <el-button 
        text 
        @click="$emit('toggle')"
        class="toggle-btn"
      >
        <el-icon>
          <ArrowRight />
        </el-icon>
      </el-button>
    </div>
    
    <div v-show="!collapsed" class="settings-content">
      <!-- 标签页 -->
      <div class="settings-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'theme' }"
          @click="activeTab = 'theme'"
        >
          主题设置
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'css' }"
          @click="activeTab = 'css'"
        >
          自定义CSS
        </div>
      </div>
      
      <!-- 主题设置标签页 -->
      <div v-show="activeTab === 'theme'" class="tab-content">
        <div class="setting-group">
          <h4>主题颜色</h4>
          <div class="color-picker">
            <input 
              type="color" 
              v-model="modelValue.colors.primary" 
              @change="$emit('update')"
            />
            <span>主色调</span>
          </div>
          <div class="color-picker">
            <input 
              type="color" 
              v-model="modelValue.colors.text" 
              @change="$emit('update')"
            />
            <span>文字颜色</span>
          </div>
        </div>

      <div class="setting-group">
        <h4>字体设置</h4>
        <el-select v-model="modelValue.fonts.body" @change="$emit('update')">
          <el-option label="默认字体" value="Open Sans, sans-serif" />
          <el-option label="微软雅黑" value="Microsoft YaHei, sans-serif" />
          <el-option label="苹方" value="PingFang SC, sans-serif" />
        </el-select>
      </div>

      <div class="setting-group">
        <h4>间距设置</h4>
        <div class="spacing-control">
          <label>段落间距</label>
          <el-input-number 
            v-model="spacingValues.section" 
            :min="10" 
            :max="50" 
            @change="updateSpacing"
          />
        </div>
        <div class="spacing-control">
          <label>元素间距</label>
          <el-input-number 
            v-model="spacingValues.element" 
            :min="5" 
            :max="30" 
            @change="updateSpacing"
          />
        </div>
      </div>
      </div>
      
      <!-- 自定义CSS标签页 -->
      <div v-show="activeTab === 'css'" class="tab-content">
        <CSSEditor 
          v-model="customCss"
          @apply="handleCSSApply"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import type { TemplateStyles } from '@/types/resume'
import CSSEditor from '@/components/CSSEditor.vue'

interface Props {
  modelValue: TemplateStyles
  collapsed: boolean
}

interface Emits {
  (e: 'update:modelValue', value: TemplateStyles): void
  (e: 'update'): void
  (e: 'toggle'): void
  (e: 'update:customCss', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 当前激活的标签页
const activeTab = ref('theme')

// 自定义CSS
const customCss = ref('')

// 间距数值（用于输入控件）
const spacingValues = ref({
  section: 25,
  element: 15
})

// 监听 modelValue 变化，同步间距数值
watch(() => props.modelValue.spacing, (newSpacing) => {
  spacingValues.value.section = parseInt(newSpacing.sectionMargin) || 25
  spacingValues.value.element = parseInt(newSpacing.elementMargin) || 15
}, { immediate: true })

// no letter-spacing watcher

function updateSpacing() {
  const newStyles = {
    ...props.modelValue,
    spacing: {
      sectionMargin: spacingValues.value.section + 'px',
      elementMargin: spacingValues.value.element + 'px'
    }
  }
  emit('update:modelValue', newStyles)
  emit('update')
}

// 处理CSS应用
function handleCSSApply(css: string) {
  emit('update:customCss', css)
  emit('update')
}
</script>

<style scoped>
.settings-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e5e7eb;
  transition: width 0.3s ease;
  overflow: hidden;
}

.settings-panel.collapsed {
  width: 0;
  border: none;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.settings-header h3 {
  margin: 0;
  color: #333;
}

.toggle-btn {
  padding: 4px;
}

.settings-content {
  padding: 0;
}

.settings-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.tab-item {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover {
  background: #f0f0f0;
  color: #333;
}

.tab-item.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  background: white;
}

.tab-content {
  padding: 16px;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.color-picker input[type="color"] {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker span {
  font-size: 14px;
  color: #6b7280;
}

.spacing-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.spacing-control label {
  font-size: 14px;
  color: #6b7280;
}
</style>
