<template>
  <div class="new-resume-preview">
    <resume-renderer 
      :template="adaptedTemplate"
      :resume-data="adaptedResumeData"
      :custom-css="customCss"
      :debug="debug"
      :highlighted-section-id="highlightedSectionId || undefined"
      @section-hover="onSectionHover"
      @section-leave="onSectionLeave"
      @section-select="onSectionSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ResumeRenderer from './ResumeRenderer.vue'
import { adaptLegacyTemplateData, adaptLegacyResumeData } from '@/utils/templateAdapter'

interface Props {
  resumeData: any;
  templateData: any;
  templateType?: string;
  extraStyles?: Record<string, any>;
  customCss?: string;
  debug?: boolean;
  highlightedSectionId?: string | null;
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'sectionHover', sectionId: string | null): void
  (e: 'sectionSelect', sectionId: string): void
}>()

// 自定义CSS
const customCss = computed(() => {
  return props.customCss || props.templateData?.customCss || ''
})

// 适配旧版模板数据到新格式
const adaptedTemplate = computed(() => {
  // 优先使用模板中定义的类型
  const templateType = props.templateData?.templateType || props.templateType || 'single-column'
  
  console.log('NewResumePreview: 原始模板数据', {
    templateData: props.templateData,
    templateType,
    extraStyles: props.extraStyles
  })
  
  const adapted = adaptLegacyTemplateData(
    props.templateData,
    templateType,
    props.extraStyles
  )
  
  console.log('NewResumePreview: 适配后的模板数据', {
    layout: adapted.layout,
    customCss: adapted.customCss?.substring(0, 100) + '...'
  })
  
  return adapted
})

// 适配简历数据
const adaptedResumeData = computed(() => {
  return adaptLegacyResumeData(props.resumeData)
})

function onSectionHover(sectionId?: string) {
  emit('sectionHover', sectionId ?? null)
}

function onSectionLeave() {
  emit('sectionHover', null)
}

function onSectionSelect(sectionId?: string) {
  if (!sectionId) return
  emit('sectionSelect', sectionId)
}
</script>

<style>
.new-resume-preview {
  width: 100%;
}
</style>