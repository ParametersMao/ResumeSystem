<template>
  <div class="summary-editor">
    <h3 class="section-title">自我评价</h3>
    
    <div class="form-item full-width">
      <label>自我评价内容</label>
      <el-input 
        v-model="localData.content" 
        type="textarea"
        :rows="8"
        placeholder="请输入您的自我评价，展示您的优势、性格特点、职业素养等"
        @input="emitChange"
      />
      <div class="editor-tips">
        💡 提示：建议从工作态度、专业能力、团队协作、学习能力等方面进行描述
      </div>
    </div>

    <div class="ai-optimize-box">
      <el-button 
        type="primary"
        @click="emitAiOptimize"
      >
        <el-icon><MagicStick /></el-icon>
        AI 优化自我评价
      </el-button>
    </div>

    <div class="template-section">
      <h4>参考模板</h4>
      <div class="template-list">
        <el-button
          v-for="(template, index) in templates"
          :key="index"
          size="small"
          text
          @click="useTemplate(template)"
        >
          使用模板{{ index + 1 }}
        </el-button>
      </div>
      <div 
        v-for="(template, index) in templates"
        :key="index"
        class="template-content"
      >
        <strong>模板{{ index + 1 }}：</strong>
        <p>{{ template }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { MagicStick } from '@element-plus/icons-vue'

interface Props {
  modelValue: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change', 'ai-optimize'])

const localData = ref({
  content: ''
})

const templates = [
  '本人积极进取，性格外向，擅长沟通协作。具有较强的学习能力和责任心，能够快速适应新环境。工作认真负责，注重团队合作，愿意承担挑战性的工作。',
  '具有扎实的专业基础和丰富的实践经验，熟悉行业发展趋势。工作中注重效率和质量，善于发现和解决问题。具备良好的沟通能力和团队精神，能够在压力下保持良好的工作状态。',
  '热爱本职工作，对待工作认真负责，善于总结和反思。具有较强的执行力和创新意识，能够独立完成工作任务。注重个人成长，持续学习新知识和新技能。'
]

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (newVal.data && newVal.data.content) {
      localData.value.content = newVal.data.content
    } else if (newVal.items && newVal.items.length > 0) {
      localData.value.content = newVal.items[0].text || newVal.items[0].content || ''
    }
  }
}, { immediate: true, deep: true })

function useTemplate(template: string) {
  localData.value.content = template
  emitChange()
}

function emitChange() {
  if (props.modelValue) {
    props.modelValue.data = { content: localData.value.content }
    props.modelValue.items = [{ text: localData.value.content, content: localData.value.content }]
    emit('update:modelValue', props.modelValue)
    emit('change', props.modelValue)
  }
}

function emitAiOptimize() {
  emit('ai-optimize', {
    type: 'summary',
    data: localData.value
  })
}
</script>

<style scoped lang="scss">
@import './common-styles.scss';

.summary-editor {
  .editor-tips {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    padding: 8px 12px;
    background: #f4f4f5;
    border-radius: 4px;
  }

  .ai-optimize-box {
    margin: 16px 0;
    display: flex;
    justify-content: flex-end;
  }

  .template-section {
    margin-top: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;

    h4 {
      font-size: 15px;
      color: #303133;
      margin: 0 0 12px 0;
    }

    .template-list {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .template-content {
      margin-bottom: 12px;
      padding: 12px;
      background: #ffffff;
      border-radius: 4px;
      font-size: 13px;

      strong {
        color: #409eff;
      }

      p {
        margin: 8px 0 0 0;
        line-height: 1.6;
        color: #606266;
      }
    }
  }
}
</style>

