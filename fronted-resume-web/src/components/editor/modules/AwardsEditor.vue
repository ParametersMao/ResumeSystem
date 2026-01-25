<template>
  <div class="awards-editor">
    <h3 class="section-title">荣誉证书</h3>
    
    <div class="form-item full-width">
      <label>荣誉证书列表</label>
      <el-input 
        v-model="localData.content" 
        type="textarea"
        :rows="6"
        placeholder="请输入您获得的荣誉证书，每行一条，例如：&#10;• 荣誉证书03，所获奖励和知识获得，2015&#10;• 荣誉证书02，参加相关项目工作室的奖项，2014"
        @input="emitChange"
      />
    </div>

    <div class="certificate-tags">
      <label>证书标签</label>
      <div class="tags-container">
        <el-tag
          v-for="tag in localData.tags"
          :key="tag"
          closable
          @close="removeTag(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-button v-if="!inputVisible" size="small" @click="showInput">
          + 添加标签
        </el-button>
        <el-input
          v-else
          ref="inputRef"
          v-model="inputValue"
          size="small"
          style="width: 120px"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
      </div>
      <div class="common-tags">
        <span>常用：</span>
        <el-button
          v-for="tag in commonTags"
          :key="tag"
          size="small"
          text
          @click="addTag(tag)"
        >
          {{ tag }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  modelValue: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change'])

const localData = ref({
  content: '',
  tags: [] as string[]
})

const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref<any>(null)

const commonTags = ['英语四级', '英语六级', '计算机二级', '计算机三级', '奖学金', '优秀毕业生', '优秀学生干部']

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.data) {
    localData.value = { ...localData.value, ...newVal.data }
  }
}, { immediate: true, deep: true })

function addTag(tag: string) {
  if (tag && !localData.value.tags.includes(tag)) {
    localData.value.tags.push(tag)
    emitChange()
  }
}

function removeTag(tag: string) {
  localData.value.tags = localData.value.tags.filter(t => t !== tag)
  emitChange()
}

function showInput() {
  inputVisible.value = true
  nextTick(() => inputRef.value?.focus())
}

function handleInputConfirm() {
  if (inputValue.value) {
    addTag(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

function emitChange() {
  if (props.modelValue) {
    props.modelValue.data = localData.value
    // 解析content为items
    const lines = localData.value.content.split('\n').filter(line => line.trim())
    props.modelValue.items = lines.map(line => ({
      text: line.trim(),
      content: line.trim()
    }))
    emit('update:modelValue', props.modelValue)
    emit('change', props.modelValue)
  }
}
</script>

<style scoped lang="scss">
@import './common-styles.scss';

.awards-editor {
  .certificate-tags {
    margin-top: 20px;

    > label {
      display: block;
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
      min-height: 50px;
    }

    .common-tags {
      margin-top: 12px;
      font-size: 13px;
      color: #909399;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
  }
}
</style>

