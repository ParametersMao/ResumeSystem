<template>
  <div class="custom-editor">
    <h3 class="section-title">自定义模块</h3>
    <p class="section-desc">添加任何您想展示的其他信息</p>
    
    <div class="form-item">
      <label>模块标题</label>
      <el-input 
        v-model="localData.title" 
        placeholder="请输入自定义模块的标题"
        @input="emitChange"
      />
    </div>

    <div class="form-item full-width">
      <label>模块内容</label>
      <el-input 
        v-model="localData.content" 
        type="textarea"
        :rows="8"
        placeholder="请输入模块内容"
        @input="emitChange"
      />
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
  title: '',
  content: ''
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (newVal.title) localData.value.title = newVal.title
    if (newVal.data) {
      localData.value = { ...localData.value, ...newVal.data }
    }
  }
}, { immediate: true, deep: true })

function emitChange() {
  if (props.modelValue) {
    props.modelValue.title = localData.value.title
    props.modelValue.data = { content: localData.value.content }
    props.modelValue.items = [{
      text: localData.value.content,
      content: localData.value.content
    }]
    emit('update:modelValue', props.modelValue)
    emit('change', props.modelValue)
  }
}
</script>

<style scoped lang="scss">
@import './common-styles.scss';

.custom-editor {
  .section-desc {
    font-size: 13px;
    color: #909399;
    margin-bottom: 20px;
  }
}
</style>

