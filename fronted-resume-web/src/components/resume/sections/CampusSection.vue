<template>
  <div class="campus-section">
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '校园经历' }}
    </div>
    <div class="list" :style="listStyle">
      <div v-for="(item, idx) in (data?.items || [])" :key="idx" class="item" :style="itemStyle">
        <div class="header" :style="headerStyle">
          <div class="icon-wrapper" v-if="item.icon">
            {{ sanitizeIcon(item.icon) }}
          </div>
          <div class="org" :style="orgStyle">{{ item.org || '组织/社团/比赛' }}</div>
          <div class="date" :style="dateStyle">{{ formatDuration(item) }}</div>
        </div>
        <div class="role" :style="roleStyle">{{ item.role || '' }}</div>
        <div v-if="item.desc" class="desc" :style="descStyle">
          <div v-html="renderDescription(item.desc)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { normalizeRichTextValue } from '@/utils/richText'

interface Props {
  data: any
  config?: any
  styles?: any
}

const props = defineProps<Props>()

const renderDescription = (desc: any): string => normalizeRichTextValue(desc).html

const sanitizeIcon = (icon: any) => {
  if (!icon) return ''
  const value = typeof icon === 'string' ? icon : icon?.text || ''
  return value?.slice(0, 2) || ''
}

const formatDuration = (item: any) => {
  const duration = item?.duration || {}
  const start = duration.start ?? item.start ?? ''
  const end = duration.end ?? item.end ?? ''
  if (start && end) return `${start} - ${end}`
  if (start) return start
  if (end) return end
  return ''
}

const titleStyle = computed(() => ({
  fontSize: props.config?.titleStyle?.fontSize || '18px',
  fontWeight: props.config?.titleStyle?.fontWeight || '600',
  color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
  textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
  marginBottom: props.data?.style?.paragraphSpacing || '15px',
  borderBottom: props.config?.titleStyle?.borderBottom || `2px solid ${props.styles?.colors?.primary || '#333'}`,
  paddingBottom: '6px'
}))

const listStyle = computed(() => ({
  padding: props.config?.padding
}))

const itemStyle = computed(() => ({
  marginBottom: props.data?.style?.elementSpacing || props.styles?.spacing?.elementMargin || '12px',
  paddingBottom: '12px',
  borderBottom: props.config?.itemSeparator === 'dashed' ? '1px dashed #e5e7eb' : '1px solid #e5e7eb'
}))

const headerStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '6px'
}))

const orgStyle = computed(() => ({
  fontSize: '15px',
  fontWeight: '600',
  color: props.styles?.colors?.text || '#333'
}))

const dateStyle = computed(() => ({
  fontSize: '12px',
  color: props.styles?.colors?.primary || '#4a90a4'
}))

const roleStyle = computed(() => ({
  fontSize: '14px',
  color: props.styles?.colors?.text || '#555',
  marginBottom: '6px'
}))

const descStyle = computed(() => ({
  fontSize: '13px',
  color: props.styles?.colors?.text || '#666',
  lineHeight: '1.6'
}))
</script>

<style scoped>
.icon-wrapper {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.12);
  color: #2573d5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
</style>

