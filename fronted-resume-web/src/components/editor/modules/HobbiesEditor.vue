<template>
  <div class="hobbies-editor">
    <h3 class="section-title">兴趣爱好</h3>
    
    <div class="form-item full-width">
      <label>兴趣爱好描述</label>
      <el-input 
        v-model="localData.description" 
        type="textarea"
        :rows="4"
        placeholder="请描述您的兴趣爱好，展示您的个性和生活态度"
        @input="emitChange"
      />
    </div>

    <div class="hobbies-tags">
      <label>兴趣标签</label>
      <div class="tags-container">
        <el-tag
          v-for="tag in localData.tags"
          :key="tag"
          closable
          @close="removeTag(tag)"
          type="info"
        >
          {{ tag }}
        </el-tag>
      </div>
      <div class="common-tags">
        <span>常用兴趣：</span>
        <el-button
          v-for="tag in commonHobbies"
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
import { ref, watch } from 'vue'

interface Props {
  modelValue: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change'])

const localData = ref({
  description: '',
  tags: [] as string[]
})

const commonHobbies = [
  '阅读', '跑步', '游泳', '健身', '旅游', '摄影', '音乐', '电影',
  '绘画', '书法', '羽毛球', '篮球', '足球', '乒乓球', '登山', '骑行'
]

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

function emitChange() {
  if (props.modelValue) {
    props.modelValue.data = localData.value
    emit('update:modelValue', props.modelValue)
    emit('change', props.modelValue)
  }
}
</script>

<style scoped lang="scss">
@import './common-styles.scss';

.hobbies-editor {
  .hobbies-tags {
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

