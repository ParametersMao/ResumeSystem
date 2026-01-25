<template>
  <div class="skills-editor">
    <h3 class="section-title">技能特长</h3>
    
    <div class="form-item full-width">
      <label>技能描述</label>
      <el-input 
        v-model="localData.description" 
        type="textarea"
        :rows="6"
        placeholder="请输入您的技能特长，例如：&#10;语言能力：大学英语六级，英语听说读写熟练&#10;计算机：熟练使用Office办公软件，如Word、Excel&#10;团队能力：具有良好的团队协作能力"
        @input="emitChange"
      />
    </div>

    <div class="skills-tags-section">
      <label>技能标签</label>
      <div class="tags-container">
        <el-tag
          v-for="tag in localData.tags"
          :key="tag"
          closable
          @close="removeTag(tag)"
          class="skill-tag"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="inputRef"
          v-model="inputValue"
          size="small"
          class="tag-input"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else size="small" @click="showInput">
          + 添加技能标签
        </el-button>
      </div>
      <div class="common-tags">
        <span class="label">常用标签：</span>
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

    <div class="skills-level-section">
      <h4>技能熟练度</h4>
      <div class="skill-items">
        <div v-for="(skill, index) in localData.skills" :key="index" class="skill-item">
          <el-input 
            v-model="skill.name" 
            placeholder="技能名称"
            style="width: 200px"
            @input="emitChange"
          />
          <el-select 
            v-model="skill.level" 
            placeholder="熟练度"
            style="width: 120px"
            @change="emitChange"
          >
            <el-option label="了解" :value="1" />
            <el-option label="一般" :value="2" />
            <el-option label="良好" :value="3" />
            <el-option label="熟练" :value="4" />
            <el-option label="精通" :value="5" />
          </el-select>
          <el-button 
            type="danger" 
            size="small" 
            :icon="Delete"
            @click="removeSkill(index)"
          >
            删除
          </el-button>
        </div>
      </div>
      <el-button 
        size="small" 
        :icon="Plus"
        @click="addSkill"
      >
        添加技能
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

interface Props {
  modelValue: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change'])

const localData = ref({
  description: '',
  tags: [] as string[],
  skills: [] as Array<{ name: string, level: number }>
})

const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref<any>(null)

const commonTags = [
  'Office软件', '沟通能力', '口才', '文字表达', '数据分析', '项目管理',
  '团队合作', '时间管理', 'JavaScript', 'Python', 'Java', 'Node.js',
  'Vue', 'React', 'TypeScript', 'SQL', '产品设计', '广告设计'
]

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (newVal.data) {
      localData.value = { ...localData.value, ...newVal.data }
    }
    if (newVal.items) {
      localData.value.skills = newVal.items
    }
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
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleInputConfirm() {
  if (inputValue.value) {
    addTag(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

function addSkill() {
  localData.value.skills.push({ name: '', level: 3 })
  emitChange()
}

function removeSkill(index: number) {
  localData.value.skills.splice(index, 1)
  emitChange()
}

function emitChange() {
  if (props.modelValue) {
    props.modelValue.data = {
      description: localData.value.description,
      tags: localData.value.tags
    }
    props.modelValue.items = localData.value.skills
    emit('update:modelValue', props.modelValue)
    emit('change', props.modelValue)
  }
}
</script>

<style scoped lang="scss">
@import './common-styles.scss';

.skills-editor {
  .skills-tags-section {
    margin: 20px 0;
    
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
      min-height: 60px;

      .skill-tag {
        font-size: 14px;
      }

      .tag-input {
        width: 120px;
      }
    }

    .common-tags {
      margin-top: 12px;
      padding: 12px;
      background: #fafafa;
      border-radius: 4px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;

      .label {
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .skills-level-section {
    margin-top: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;

    h4 {
      font-size: 15px;
      color: #303133;
      margin: 0 0 16px 0;
    }

    .skill-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 12px;

      .skill-item {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
  }
}
</style>

