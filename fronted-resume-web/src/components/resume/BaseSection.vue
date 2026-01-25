<template>
  <div 
    class="resume-section" 
    :class="customClass"
    :style="sectionStyle"
  >
    <component 
      :is="sectionComponent" 
      :data="data" 
      :config="config"
      :styles="styles"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import PersonalInfoSection from './sections/PersonalInfoSection.vue'
import ExperienceSection from './sections/ExperienceSection.vue'
import EducationSection from './sections/EducationSection.vue'
import SkillsSection from './sections/SkillsSection.vue'
import ProjectsSection from './sections/ProjectsSection.vue'
import CustomSection from './sections/CustomSection.vue'
import GenericTextSection from './sections/GenericTextSection.vue'
import InternshipSection from './sections/InternshipSection.vue'
import CampusSection from './sections/CampusSection.vue'
import AwardsSection from './sections/AwardsSection.vue'
import SchemaRenderer from './sections/SchemaRenderer.vue'

interface Props {
  type: string
  data: any
  config?: any
  styles?: any
}

const props = defineProps<Props>()

// 组件映射表 - 支持动态扩展
// 注意：模板中可以使用 'personal' 或 'basic'，都会映射到 PersonalInfoSection
const componentMap = {
  'basic': PersonalInfoSection,
  'personal': PersonalInfoSection, // 兼容模板中的 'personal' 类型
  'experience': ExperienceSection,
  'education': EducationSection,
  'skills': SkillsSection,
  'projects': ProjectsSection,
  'intention': GenericTextSection,
  'summary': GenericTextSection,
  'hobbies': GenericTextSection,
  'awards': AwardsSection,
  'internship': InternshipSection,
  'campus': CampusSection,
  'custom': CustomSection
}

const sectionComponent = computed(() => {
  // 优先检查是否有自定义渲染器
  if (props.config?.renderer) {
    return props.config.renderer
  }
  
  // 检查是否有Schema定义
  if (props.config?.schema) {
    return SchemaRenderer
  }
  
  // 使用默认组件映射
  return (componentMap as Record<string, any>)[props.type] || CustomSection
})

// 自定义类名
const customClass = computed(() => {
  const config = props.config || {}
  return config.customClass || ''
})

const sectionStyle = computed(() => {
  const config = props.config || {}
  // 解析模块 style（gridColumn 等）
  const style: Record<string, any> = {
    marginBottom: props.styles?.spacing?.sectionMargin || '25px',
    margin: config.margin || '0',
    padding: config.padding || '0',
    backgroundColor: config.backgroundColor,
    borderRadius: config.borderRadius,
    boxShadow: config.boxShadow,
    ...config.customStyles,
    ...config.customStyle // 支持 customStyle 对象
  }
  if (config.gridColumn) style.gridColumn = config.gridColumn
  if (config.gap) style.gap = config.gap
  return style
})
</script>
