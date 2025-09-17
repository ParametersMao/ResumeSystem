<template>
  <div class="awards-section">
    <div v-if="config?.showTitle !== false" class="section-title" :style="titleStyle">
      {{ data?.title || config?.title || '荣誉证书' }}
    </div>
    <div class="awards-grid" :style="gridStyle">
      <div v-for="(item, idx) in (data?.items || [])" :key="idx" class="award-card" :style="cardStyle">
        <div class="award-name" :style="nameStyle">{{ item.name || '奖项/证书' }}</div>
        <div class="award-org" :style="orgStyle">{{ item.org || '' }}</div>
        <div class="award-date" :style="dateStyle">{{ item.date || '' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

interface Props {
  data: any
  config?: any
  styles?: any
}

const props = defineProps<Props>()

const titleStyle = computed(() => ({
  fontSize: props.config?.titleStyle?.fontSize || '18px',
  fontWeight: props.config?.titleStyle?.fontWeight || '600',
  color: props.config?.titleStyle?.color || props.styles?.colors?.primary || '#333',
  textAlign: props.config?.titleStyle?.textAlign || props.config?.titleStyle?.alignment || 'left',
  marginBottom: props.data?.style?.paragraphSpacing || '15px',
  borderBottom: props.config?.titleStyle?.borderBottom || `2px solid ${props.styles?.colors?.primary || '#333'}`,
  paddingBottom: '6px',
  ...props.config?.titleStyle?.customStyle
}))

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: props.config?.gridTemplateColumns || 'repeat(2, 1fr)',
  gap: props.data?.style?.elementSpacing || props.styles?.spacing?.elementMargin || '12px'
}))

const cardStyle = computed(() => ({
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: props.config?.padding || '12px',
  background: '#fff'
}))

const nameStyle = computed(() => ({
  fontSize: '15px',
  fontWeight: '600',
  color: props.styles?.colors?.text || '#333',
  marginBottom: '6px'
}))

const orgStyle = computed(() => ({
  fontSize: '13px',
  color: '#666'
}))

const dateStyle = computed(() => ({
  fontSize: '12px',
  color: props.styles?.colors?.primary || '#4a90a4'
}))
</script>


