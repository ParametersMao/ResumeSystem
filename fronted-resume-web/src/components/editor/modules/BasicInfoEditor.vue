<template>
  <div class="basic-info-editor">
    <h3 class="section-title">基本信息</h3>
    
    <div class="form-grid">
      <div class="form-item">
        <label>姓名 <span class="required">*</span></label>
        <el-input 
          v-model="localData.name" 
          placeholder="请输入姓名"
          @input="emitChange"
        />
      </div>

      <div class="form-item">
        <label>职位</label>
        <el-input 
          v-model="localData.title" 
          placeholder="请输入职位"
          @input="emitChange"
        />
      </div>

      <div class="form-item">
        <label>电话</label>
        <el-input 
          v-model="localData.phone" 
          placeholder="请输入电话"
          @input="emitChange"
        />
      </div>

      <div class="form-item">
        <label>邮箱</label>
        <el-input 
          v-model="localData.email" 
          placeholder="请输入邮箱"
          @input="emitChange"
        />
      </div>

      <div class="form-item">
        <label>主页</label>
        <el-input 
          v-model="localData.website" 
          placeholder="请输入个人主页"
          @input="emitChange"
        />
      </div>

      <div class="form-item">
        <label>性别</label>
        <el-select 
          v-model="localData.gender" 
          placeholder="请选择性别"
          @change="emitChange"
        >
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </div>

      <div class="form-item">
        <label>年龄</label>
        <el-input-number 
          v-model="localData.age" 
          :min="18" 
          :max="100"
          @change="emitChange"
        />
      </div>

      <div class="form-item">
        <label>经验</label>
        <el-input 
          v-model="localData.experience" 
          placeholder="如：3年经验"
          @input="emitChange"
        />
      </div>
    </div>

    <div class="form-item full-width">
      <label>目我简述</label>
      <el-input 
        v-model="localData.summary" 
        type="textarea"
        :rows="4"
        placeholder="请输入简短的自我介绍"
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
  name: '',
  title: '',
  phone: '',
  email: '',
  website: '',
  gender: '',
  age: undefined,
  experience: '',
  summary: ''
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    localData.value = { ...localData.value, ...newVal }
  }
}, { immediate: true, deep: true })

function emitChange() {
  emit('update:modelValue', localData.value)
  emit('change', localData.value)
}
</script>

<style scoped lang="scss">
.basic-info-editor {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #409eff;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 20px;
    margin-bottom: 20px;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.full-width {
      grid-column: 1 / -1;
    }

    label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;

      .required {
        color: #f56c6c;
        margin-left: 2px;
      }
    }

    :deep(.el-input-number) {
      width: 100%;
    }
  }
}
</style>

