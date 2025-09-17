<template>
  <div class="card-layout" :style="containerStyle">
    <div class="profile-card" :style="cardStyle">
      <div class="card-header" :style="headerStyle">
        <div class="avatar-section" :style="avatarSectionStyle">
          <div class="avatar-placeholder" :style="avatarStyle">
            {{ config?.avatarText || '头像' }}
          </div>
        </div>
        <div class="basic-info" :style="basicInfoStyle">
          <div class="name" :style="nameStyle">
            {{ data?.basic?.name || '请填写姓名' }}
          </div>
          <div class="title" :style="titleStyle">
            {{ data?.basic?.title || '请填写职位' }}
          </div>
        </div>
      </div>
      
      <div class="card-body" :style="bodyStyle">
        <div class="contact-info" :style="contactStyle">
          <div v-if="data?.basic?.contacts?.email" class="contact-item">
            <strong>邮箱：</strong>{{ data.basic.contacts.email }}
          </div>
          <div v-if="data?.basic?.contacts?.phone" class="contact-item">
            <strong>电话：</strong>{{ data.basic.contacts.phone }}
          </div>
          <div v-if="data?.basic?.contacts?.site" class="contact-item">
            <strong>网站：</strong>{{ data.basic.contacts.site }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="data?.summary" class="summary-section" :style="summaryStyle">
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

const containerStyle = computed(() => ({
  marginBottom: props.styles?.spacing?.sectionMargin || '20px',
  padding: props.config?.padding,
  ...props.config?.containerStyle
}))

const cardStyle = computed(() => ({
  background: props.config?.cardBackground || '#ffffff',
  border: props.config?.cardBorder || '1px solid #e2e8f0',
  borderRadius: props.config?.cardBorderRadius || '12px',
  padding: props.config?.cardPadding || '24px',
  boxShadow: props.config?.cardShadow || '0 2px 8px rgba(0,0,0,0.1)',
  ...props.config?.cardStyle
}))

const headerStyle = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
  ...props.config?.headerStyle
}))

const avatarSectionStyle = computed(() => ({
  marginRight: '20px',
  ...props.config?.avatarSectionStyle
}))

const avatarStyle = computed(() => ({
  width: props.config?.avatarSize || '80px',
  height: props.config?.avatarSize || '80px',
  borderRadius: '50%',
  background: props.config?.avatarBackground || '#f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: props.config?.avatarTextColor || '#64748b',
  fontSize: '12px',
  ...props.config?.avatarStyle
}))

const basicInfoStyle = computed(() => ({
  flex: '1',
  ...props.config?.basicInfoStyle
}))

const nameStyle = computed(() => ({
  fontSize: props.config?.nameStyle?.fontSize || '24px',
  fontWeight: props.config?.nameStyle?.fontWeight || '700',
  color: props.config?.nameStyle?.color || props.styles?.colors?.primary || '#1e293b',
  marginBottom: '4px',
  ...props.config?.nameStyle?.customStyle
}))

const titleStyle = computed(() => ({
  fontSize: props.config?.titleStyle?.fontSize || '16px',
  color: props.config?.titleStyle?.color || props.styles?.colors?.text || '#64748b',
  ...props.config?.titleStyle?.customStyle
}))

const bodyStyle = computed(() => ({
  ...props.config?.bodyStyle
}))

const contactStyle = computed(() => ({
  ...props.config?.contactStyle
}))

const summaryStyle = computed(() => ({
  marginTop: '20px',
  ...props.config?.summaryStyle
}))

const summaryTitleStyle = computed(() => ({
  fontSize: '18px',
  fontWeight: '600',
  color: props.styles?.colors?.primary || '#1e293b',
  marginBottom: '10px',
  ...props.config?.summaryTitleStyle
}))

const summaryContentStyle = computed(() => ({
  fontSize: '14px',
  lineHeight: '1.6',
  color: props.styles?.colors?.text || '#475569',
  ...props.config?.summaryContentStyle
}))
</script>

<style scoped>
.contact-item {
  margin-bottom: 8px;
  font-size: 14px;
}
</style>
