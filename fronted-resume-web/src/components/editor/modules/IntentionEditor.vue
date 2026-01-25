<template>
  <div class="intention-editor">
    <h3 class="section-title">求职意向</h3>
    
    <div class="form-grid">
      <div class="form-item">
        <label>求职岗位</label>
        <el-input 
          v-model="localData.position" 
          placeholder="请输入求职岗位"
          @input="emitChange"
        />
      </div>

      <div class="form-item">
        <label>期望薪资</label>
        <el-input 
          v-model="localData.salary" 
          placeholder="如：10-15K"
          @input="emitChange"
        />
      </div>

      <div class="form-item">
        <label>求职城市</label>
        <el-input 
          v-model="localData.city" 
          placeholder="如：北京/上海"
          @input="emitChange"
        />
      </div>

      <div class="form-item">
        <label>期望薪资类型</label>
        <el-select 
          v-model="localData.salaryType" 
          placeholder="请选择"
          @change="emitChange"
        >
          <el-option label="月薪" value="月薪" />
          <el-option label="年薪" value="年薪" />
          <el-option label="面议" value="面议" />
        </el-select>
      </div>

      <div class="form-item">
        <label>入职日期</label>
        <el-select 
          v-model="localData.availableDate" 
          placeholder="请选择"
          @change="emitChange"
        >
          <el-option label="随时" value="随时" />
          <el-option label="一周内" value="一周内" />
          <el-option label="一个月内" value="一个月内" />
          <el-option label="三个月内" value="三个月内" />
        </el-select>
      </div>
    </div>

    <div class="form-item full-width">
      <label>职业目标</label>
      <el-input 
        v-model="localData.objective" 
        type="textarea"
        :rows="3"
        placeholder="请输入您的职业目标和规划"
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
  position: '',
  salary: '',
  city: '',
  salaryType: '',
  availableDate: '',
  objective: ''
})

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.data) {
    localData.value = { ...localData.value, ...newVal.data }
  }
}, { immediate: true, deep: true })

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
</style>

