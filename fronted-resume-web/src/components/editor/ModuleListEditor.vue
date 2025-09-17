<template>
  <div class="module-list-editor">
    <!-- 基本信息模块（作为一个可排序/可隐藏的 section） -->
    <div class="module-editor-item" v-if="basicSection">
      <BasicSectionEditor
        :section="basicSection"
        v-model="resumeData.profile"
        @update:section="onUpdateBasicSection"
        @move-up="moveSection(basicSection.id, -1)"
        @move-down="moveSection(basicSection.id, 1)"
      />
    </div>
    <div
      v-for="section in orderedSections"
      :key="section.id"
      class="module-editor-item"
    >
      <SimpleSectionEditor
        :model-value="section"
        @update:model-value="onUpdateSection(section.id, $event)"
        @remove="removeSection(section.id)"
        @ai="onAiFromSection"
        @move-up="moveSection(section.id, -1)"
        @move-down="moveSection(section.id, 1)"
      />
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SimpleSectionEditor from './SimpleSectionEditor.vue'
import BasicSectionEditor from './BasicSectionEditor.vue'
import type { ResumeData } from '@/types/resume'

interface Props {
  resumeData: ResumeData
}

interface Emits {
  (e: 'ai', payload: { sectionId: string; itemIndex: number; fieldName: string; html: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 始终以 resumeData.sections 的顺序为准
const orderedSections = computed(() => props.resumeData.sections.filter(s => s.type !== 'basic'))
const basicSection = computed(() => props.resumeData.sections.find(s => s.type === 'basic'))

function onUpdateSection(id: string, newSection: any) {
  const index = props.resumeData.sections.findIndex(s => s.id === id)
  if (index > -1) props.resumeData.sections[index] = newSection
}

function onUpdateBasicSection(newSection: any) {
  const idx = props.resumeData.sections.findIndex(s => s.id === newSection.id)
  if (idx > -1) props.resumeData.sections[idx] = { ...props.resumeData.sections[idx], ...newSection }
}

function removeSection(id: string) {
  const index = props.resumeData.sections.findIndex(s => s.id === id)
  if (index > -1) props.resumeData.sections.splice(index, 1)
}

function moveSection(id: string, delta: 1 | -1) {
  const idx = props.resumeData.sections.findIndex(s => s.id === id)
  if (idx === -1) return
  const target = idx + delta
  if (target < 0 || target >= props.resumeData.sections.length) return
  ;[props.resumeData.sections[idx], props.resumeData.sections[target]] = [props.resumeData.sections[target], props.resumeData.sections[idx]]
}

function onAiFromSection(payload: { sectionId: string; itemIndex: number; fieldName: string; html: string }) {
  emit('ai', payload)
}
</script>

<style scoped>
.module-list-editor {
  margin: 20px 0;
}

.module-editor-item {
  margin-bottom: 15px;
}
</style>
