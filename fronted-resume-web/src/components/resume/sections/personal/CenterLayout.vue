<template>
  <div class="center-layout" :style="containerStyle">
    
    <div class="center-content" :style="contentStyle">
      <div class="name" :style="nameStyle">
        {{ data?.basic?.name || '请填写姓名' }}
      </div>
      <div class="title" :style="titleStyle">
        {{ data?.basic?.title || '请填写职位' }}
      </div>
      <div class="contacts" :style="contactsStyle">
        {{ contactsText }}
      </div>
    </div>
    
    <div v-if="data?.summary" class="summary" :style="summaryStyle">
      <div class="summary-title" :style="summaryTitleStyle">
        {{ config?.summaryTitle || '个人概述' }}
      </div>
      <div class="summary-content" :style="summaryContentStyle">
        {{ data.summary }}
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

const contactsText = computed(() => {
  const { contacts } = props.data?.basic || {}
  if (!contacts) return '请完善联系方式'
  
  const items = []
  if (contacts.email) items.push(contacts.email)
  if (contacts.phone) items.push(contacts.phone)
  if (contacts.site) items.push(contacts.site)
  
  return items.join(' · ') || '请完善联系方式'
})

const containerStyle = computed(() => ({
  textAlign: 'center',
  marginBottom: props.styles?.spacing?.sectionMargin || '20px',
  padding: props.config?.padding,
  ...props.config?.containerStyle
}))

const contentStyle = computed(() => ({
  marginBottom: props.styles?.spacing?.elementMargin || '15px',
  ...props.config?.contentStyle
}))

const nameStyle = computed(() => ({
  fontSize: props.config?.nameStyle?.fontSize || '32px',
  fontWeight: props.config?.nameStyle?.fontWeight || '700',
  color: props.config?.nameStyle?.color || props.styles?.colors?.primary || '#333',
  marginBottom: '8px',
  ...props.config?.nameStyle?.customStyle
}))

const titleStyle = computed(() => ({
  fontSize: props.config?.titleStyle?.fontSize || '18px',
  fontWeight: props.config?.titleStyle?.fontWeight || '400',
  color: props.config?.titleStyle?.color || props.styles?.colors?.text || '#666',
  marginBottom: '12px',
  ...props.config?.titleStyle?.customStyle
}))

const contactsStyle = computed(() => ({
  fontSize: props.config?.contactsStyle?.fontSize || '14px',
  color: props.config?.contactsStyle?.color || props.styles?.colors?.text || '#666',
  opacity: props.config?.contactsStyle?.opacity || '0.8',
  ...props.config?.contactsStyle?.customStyle
}))

const summaryStyle = computed(() => ({
  marginTop: props.styles?.spacing?.elementMargin || '15px',
  textAlign: 'left',
  ...props.config?.summaryStyle
}))

const summaryTitleStyle = computed(() => ({
  fontSize: props.config?.summaryTitleStyle?.fontSize || '18px',
  fontWeight: props.config?.summaryTitleStyle?.fontWeight || '600',
  color: props.config?.summaryTitleStyle?.color || props.styles?.colors?.primary || '#333',
  textAlign: props.config?.summaryTitleStyle?.textAlign || props.config?.summaryTitleStyle?.alignment || 'left',
  marginBottom: props.data?.style?.paragraphSpacing || '10px',
  borderBottom: props.config?.summaryTitleStyle?.borderBottom || `2px solid ${props.styles?.colors?.primary || '#333'}`,
  paddingBottom: '6px',
  ...props.config?.summaryTitleStyle?.customStyle
}))

const summaryContentStyle = computed(() => ({
  fontSize: props.config?.summaryContentStyle?.fontSize || '15px',
  lineHeight: props.config?.summaryContentStyle?.lineHeight || '1.6',
  color: props.config?.summaryContentStyle?.color || props.styles?.colors?.text || '#666',
  ...props.config?.summaryContentStyle?.customStyle
}))
</script>
