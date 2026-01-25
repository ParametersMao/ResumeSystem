<template>
  <div class="skills-renderer">
    <div 
      v-if="layout === 'tags'"
      class="skills-tags"
    >
      <div 
        v-for="(skill, index) in normalizedSkills" 
        :key="index"
        class="skill-tag"
      >
        {{ skill }}
      </div>
    </div>
    
    <div 
      v-else-if="layout === 'progress'"
      class="skills-progress"
    >
      <div 
        v-for="(item, index) in progressItems" 
        :key="index"
        class="skill-item"
      >
        <div class="skill-name-row">
          <div class="skill-name">{{ item.name }}</div>
          <div class="skill-level">{{ item.level || (item.proficiency + '%') }}</div>
        </div>
        <div class="skill-progress">
          <div class="skill-progress-bar" :style="{ width: (item.proficiency || 0) + '%' }"></div>
        </div>
      </div>
    </div>
    
    <div 
      v-else
      class="skills-list"
    >
      <div 
        v-for="(skill, index) in normalizedSkills" 
        :key="index"
        class="skill-list-item"
        :class="{ 'with-separator': hasSeparator }"
      >
        {{ skill }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  config: {
    type: Object,
    default: () => ({})
  },
  styleConfig: {
    type: Object,
    default: () => ({})
  }
})

// 布局类型
const layout = computed(() => {
  const cfg = props.config?.layout || 'standard'
  const hasProgressStyle = Boolean(props.styleConfig?.custom?.[".skill-progress"]) || Boolean(props.styleConfig?.custom?.[".skill-progress-bar"]) 
  return hasProgressStyle ? 'progress' : cfg
})

// 标准化的技能项
const normalizedSkills = computed(() => {
  const skills = props.items || []
  return skills.map(skill => {
    if (typeof skill === 'string') {
      return skill
    }
    
    if (typeof skill === 'object') {
      return skill.name || skill.text || JSON.stringify(skill)
    }
    
    return String(skill)
  })
})

// 进度型技能项
const progressItems = computed(() => {
  const skills = props.items || []
  return skills.map((s: any) => ({
    name: s?.name || (typeof s === 'string' ? s : ''),
    proficiency: Number(s?.proficiency ?? 0),
    level: s?.level
  }))
})

// 是否有分隔符
const hasSeparator = computed(() => {
  const styleConfig = props.styleConfig || {}
  const itemsConfig = styleConfig.items || {}
  const separator = itemsConfig.separator || {}
  
  return separator.type && separator.type !== 'none'
})
</script>

<style scoped>
.skills-renderer {
  width: 100%;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  padding: 5px 12px;
  background-color: #f0f4f8;
  color: #2f80ed;
  border-radius: 4px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

.skills-progress {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.skill-item {
  margin-bottom: 10px;
}

.skill-name {
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 14px;
}

.skill-progress { height: 8px; background-color: #e0e0e0; border-radius: 4px; overflow: hidden; }
.skill-progress-bar { height: 100%; background: linear-gradient(90deg,#0F3D7A,#1F5AAE); transition: width .3s ease; }
.skill-name-row { display: flex; justify-content: space-between; margin-bottom: 6px; }

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-list-item {
  padding: 5px 0;
}

.skill-list-item.with-separator:not(:last-child) {
  border-bottom: 1px dashed #eee;
  padding-bottom: 10px;
}
</style>
