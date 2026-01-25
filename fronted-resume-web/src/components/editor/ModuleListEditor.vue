<template>
  <div class="module-list-editor" ref="rootEl">
    <!-- 基本信息模块 -->
    <div
      v-if="basicSection"
      class="module-editor-item"
      :class="{ 'is-highlighted': highlightedSectionId === basicSection.id }"
      @mouseenter="emitHighlight(basicSection.id)"
      @mouseleave="emitClearHighlight"
      @click="emitSelect(basicSection.id)"
    >
      <BasicSectionEditor
        :section="basicSection"
        v-model="resumeData.profile"
        @update:section="onUpdateBasicSection"
        @settings="openSettings(basicSection)"
      />
    </div>

    <!-- 其他模块列表（支持拖拽） -->
    <div
      class="module-editor-list"
      ref="sortableContainer"
    >
      <div
        v-for="section in orderedSections"
        :key="section.id"
        class="module-editor-item"
        :data-id="section.id"
        :data-section-id="section.id"
        :class="{ 'is-highlighted': highlightedSectionId === section.id }"
        @mouseenter="emitHighlight(section.id)"
        @mouseleave="emitClearHighlight"
        @click="emitSelect(section.id)"
      >
        <SimpleSectionEditor
          :model-value="section"
          :highlighted="highlightedSectionId === section.id"
          @update:model-value="onUpdateSection(section.id, $event)"
          @remove="removeSection(section.id)"
          @ai="onAiFromSection"
          @settings="openSettings(section)"
        />
      </div>
    </div>

    <SectionSettingsDrawer
      v-model="settingsVisible"
      :section="editingSection"
      @save="applySectionSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Sortable from 'sortablejs'
import SimpleSectionEditor from './SimpleSectionEditor.vue'
import BasicSectionEditor from './BasicSectionEditor.vue'
import SectionSettingsDrawer from './SectionSettingsDrawer.vue'
import type { ResumeData, ResumeSection } from '@/types/resume'
import { isBasicSection } from '@/utils/sectionType'

interface Props {
  resumeData: ResumeData
  highlightedSectionId?: string | null
}

interface Emits {
  (e: 'ai', payload: { sectionId: string; itemIndex: number; fieldName: string; html: string }): void
  (e: 'highlight', sectionId: string): void
  (e: 'clear-highlight'): void
  (e: 'select', sectionId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 始终以 resumeData.sections 的顺序为准
const orderedSections = computed(() => props.resumeData.sections.filter(s => !isBasicSection(s.type)))
const basicSection = computed(() => props.resumeData.sections.find(s => isBasicSection(s.type)))

const rootEl = ref<HTMLElement | null>(null)
const sortableContainer = ref<HTMLElement>()
const sortableInstance = ref<Sortable | null>(null)

const settingsVisible = ref(false)
const editingSection = ref<ResumeSection | null>(null)

onMounted(() => {
  initSortable()
})

onBeforeUnmount(() => {
  destroySortable()
})

watch(
  () => orderedSections.value.length,
  () => {
    nextTick(() => initSortable())
  }
)

function initSortable() {
  if (!sortableContainer.value) return
  destroySortable()
  sortableInstance.value = Sortable.create(sortableContainer.value, {
    animation: 180,
    handle: '.drag-handle',
    ghostClass: 'drag-ghost',
    onEnd: (evt) => {
      if (evt.oldIndex == null || evt.newIndex == null || evt.oldIndex === evt.newIndex) return
      reorderSections(evt.oldIndex, evt.newIndex)
    }
  })
}

function destroySortable() {
  if (sortableInstance.value) {
    sortableInstance.value.destroy()
    sortableInstance.value = null
  }
}

function reorderSections(oldIndex: number, newIndex: number) {
  const sections = props.resumeData.sections
  const basic = sections.find(s => isBasicSection(s.type))
  const others = sections.filter(s => !isBasicSection(s.type))
  if (oldIndex < 0 || oldIndex >= others.length || newIndex < 0 || newIndex >= others.length) return

  const [moved] = others.splice(oldIndex, 1)
  others.splice(newIndex, 0, moved)

  const merged: ResumeSection[] = []
  if (basic) merged.push(basic)
  merged.push(...others)

  sections.splice(0, sections.length, ...merged)
  merged.forEach((section, index) => {
    section.order = index
  })

  nextTick(() => initSortable())
}

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

function onAiFromSection(payload: { sectionId: string; itemIndex: number; fieldName: string; html: string }) {
  emit('ai', payload)
}

function emitHighlight(sectionId: string) {
  emit('highlight', sectionId)
}

function emitClearHighlight() {
  emit('clear-highlight')
}

function emitSelect(sectionId: string) {
  emit('select', sectionId)
}

function openSettings(section: ResumeSection) {
  editingSection.value = section
  settingsVisible.value = true
}

function applySectionSettings(updated: ResumeSection) {
  if (!updated) return
  const target = props.resumeData.sections.find(section => section.id === updated.id)
  if (!target) return

  target.title = updated.title
  target.visible = updated.visible
  target.config = { ...target.config, ...updated.config }
  if (updated.style) {
    target.style = { ...target.style, ...updated.style }
  }
}

function scrollToSection(sectionId: string) {
  const target = rootEl.value?.querySelector<HTMLElement>(`[data-section-id="${sectionId}"]`)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

defineExpose({
  scrollToSection
})
</script>

<style scoped>
.module-list-editor {
  margin: 20px 0;
}

.module-editor-item {
  margin-bottom: 15px;
}

.module-editor-item.is-highlighted {
  position: relative;
}

.module-editor-item.is-highlighted::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid #409eff;
  border-radius: 8px;
  pointer-events: none;
}

.module-editor-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drag-ghost {
  opacity: 0.6;
}
</style>
