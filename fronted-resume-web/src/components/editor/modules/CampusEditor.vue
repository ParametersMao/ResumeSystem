<template>
  <div class="campus-editor">
    <h3 class="section-title">校园经历</h3>
    <p class="section-desc">社团活动、学生会、志愿者经历等</p>
    
    <!-- 复用项目经验的编辑组件 -->
    <ProjectsEditor 
      v-model="localData"
      @change="emitChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ProjectsEditor from './ProjectsEditor.vue'

interface Props {
  modelValue: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change'])

const localData = ref<any>(null)

watch(() => props.modelValue, (newVal) => {
  localData.value = newVal
}, { immediate: true, deep: true })

function emitChange(data: any) {
  emit('update:modelValue', data)
  emit('change', data)
}
</script>

<style scoped lang="scss">
.campus-editor {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
    padding-bottom: 10px;
    border-bottom: 2px solid #409eff;
  }

  .section-desc {
    font-size: 13px;
    color: #909399;
    margin-bottom: 20px;
  }
}
</style>

