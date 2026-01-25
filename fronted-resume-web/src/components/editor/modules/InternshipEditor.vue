<template>
  <div class="internship-editor">
    <h3 class="section-title">实习经验</h3>
    <p class="section-desc">填写方式与工作经验相同，突出实习期间的工作内容和收获</p>
    
    <!-- 复用工作经验的编辑组件 -->
    <ExperienceEditor 
      v-model="localData"
      @change="emitChange"
      @ai-optimize="$emit('ai-optimize', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ExperienceEditor from './ExperienceEditor.vue'

interface Props {
  modelValue: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change', 'ai-optimize'])

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
.internship-editor {
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

