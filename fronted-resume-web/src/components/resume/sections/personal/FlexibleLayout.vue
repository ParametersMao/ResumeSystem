<template>
  <div class="flexible-personal-layout" :style="containerStyle">
    <!-- 标题 -->
    <div 
      v-if="config?.showTitle !== false"
      class="section-title" 
      :style="titleStyle"
    >
      {{ config?.title || '基本信息' }}
      <div v-if="config?.titleStyle === 'ribbon'" class="title-ribbon-arrow" :style="arrowStyle"></div>
    </div>

    <!-- 根据配置的布局类型渲染 -->
    <div class="personal-content" :style="contentStyle">
      <!-- 头像区域（如果配置了显示） -->
      <div 
        v-if="avatarField && shouldShowField(avatarField.key)"
        class="avatar-section" 
        :style="avatarSectionStyle"
      >
        <img 
          v-if="avatarValue" 
          :src="avatarValue" 
          class="avatar-image" 
          :style="avatarImageStyle"
          :alt="nameValue || '头像'"
        />
        <div v-else class="avatar-placeholder" :style="avatarPlaceholderStyle">
          {{ config?.avatarText || '头像' }}
        </div>
      </div>

      <!-- 主要信息区域 -->
      <div class="info-section" :style="infoSectionStyle">
        <!-- 姓名和职位（通常放在最前面） -->
        <div v-if="nameField && shouldShowField(nameField.key)" class="name-row" :style="nameRowStyle">
          <div class="name" :style="nameStyle">{{ nameValue || '请填写姓名' }}</div>
        </div>
        <div v-if="titleField && shouldShowField(titleField.key)" class="title-row" :style="titleRowStyle">
          <div class="title" :style="titleTextStyle">{{ titleValue || '请填写职位' }}</div>
        </div>

        <!-- 其他字段（根据配置的顺序和布局） -->
        <div class="fields-container" :style="fieldsContainerStyle">
          <template v-for="field in orderedFields" :key="field.key">
            <div 
              v-if="shouldShowField(field.key) && field.type !== 'avatar' && field.type !== 'summary'"
              class="field-item"
              :class="`field-${field.key}`"
              :style="getFieldStyle(field)"
            >
              <span class="field-label" :style="getFieldLabelStyle(field)">
                {{ getFieldLabel(field) }}
              </span>
              <span class="field-value" :style="getFieldValueStyle(field)">
                {{ getFieldDisplayValue(data, field) || '-' }}
              </span>
            </div>
          </template>
        </div>

        <!-- 联系方式（可以单独分组） -->
        <div v-if="hasContacts" class="contacts-section" :style="contactsStyle">
          <div 
            v-for="contactField in contactFields" 
            :key="contactField.key"
            v-if="shouldShowField(contactField.key) && getFieldDisplayValue(data, contactField)"
            class="contact-item"
            :style="getContactItemStyle(contactField)"
          >
            <span class="contact-label" :style="contactLabelStyle">
              {{ getFieldLabel(contactField) }}
            </span>
            <span class="contact-value" :style="contactValueStyle">
              {{ getFieldDisplayValue(data, contactField) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 自我概述（单独区域） -->
    <div 
      v-if="summaryField && shouldShowField(summaryField.key) && summaryValue"
      class="summary-section"
      :style="summarySectionStyle"
    >
      <div class="summary-title" :style="summaryTitleStyle">
        {{ getFieldLabel(summaryField) }}
      </div>
      <div class="summary-content" :style="summaryContentStyle">
        {{ summaryValue }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  PERSONAL_FIELDS, 
  getFieldByKey, 
  getFieldDisplayValue,
  type PersonalField 
} from '@/config/personalFields'

interface Props {
  data: any
  config?: {
    layout?: 'center' | 'table' | 'card' | 'flexible'
    showTitle?: boolean
    title?: string
    titleStyle?: string
    // 字段显示配置
    fields?: {
      visible?: string[] // 要显示的字段key列表
      order?: string[] // 字段显示顺序
      labels?: Record<string, string> // 字段标签自定义
      styles?: Record<string, any> // 字段样式
    }
    // 样式配置
    containerStyle?: Record<string, any>
    contentStyle?: Record<string, any>
    nameStyle?: Record<string, any>
    titleStyle?: Record<string, any>
    fieldStyle?: Record<string, any>
    contactStyle?: Record<string, any>
    summaryStyle?: Record<string, any>
    [key: string]: any
  }
  styles?: any
}

const props = defineProps<Props>()

// 获取字段值
const nameField = computed(() => getFieldByKey('name'))
const titleField = computed(() => getFieldByKey('title'))
const avatarField = computed(() => getFieldByKey('avatar'))
const summaryField = computed(() => getFieldByKey('summary'))

const nameValue = computed(() => getFieldDisplayValue(props.data, nameField.value!))
const titleValue = computed(() => getFieldDisplayValue(props.data, titleField.value!))
const avatarValue = computed(() => getFieldDisplayValue(props.data, avatarField.value!))
const summaryValue = computed(() => getFieldDisplayValue(props.data, summaryField.value!))

// 联系方式字段
const contactFields = computed(() => {
  return PERSONAL_FIELDS.filter(f => f.type === 'contact')
})

const hasContacts = computed(() => {
  return contactFields.value.some(f => getFieldDisplayValue(props.data, f))
})

// 根据配置排序的字段列表
const orderedFields = computed(() => {
  const fields = PERSONAL_FIELDS.filter(f => 
    f.type !== 'avatar' && 
    f.type !== 'summary' && 
    f.key !== 'name' && 
    f.key !== 'title'
  )
  
  const order = props.config?.fields?.order
  if (order && Array.isArray(order)) {
    return order
      .map(key => fields.find(f => f.key === key))
      .filter(Boolean) as PersonalField[]
  }
  
  return fields
})

// 判断字段是否应该显示
function shouldShowField(key: string): boolean {
  const visibleFields = props.config?.fields?.visible
  if (!visibleFields || !Array.isArray(visibleFields)) {
    return true // 默认全部显示
  }
  return visibleFields.includes(key)
}

// 获取字段标签
function getFieldLabel(field: PersonalField): string {
  const customLabels = props.config?.fields?.labels
  if (customLabels && customLabels[field.key]) {
    return customLabels[field.key]
  }
  return field.defaultLabel || field.label
}

// 获取字段样式
function getFieldStyle(field: PersonalField): Record<string, any> {
  const fieldStyles = props.config?.fields?.styles
  const baseStyle = props.config?.fieldStyle || {}
  const customStyle = fieldStyles?.[field.key] || {}
  return { ...baseStyle, ...customStyle }
}

function getFieldLabelStyle(field: PersonalField): Record<string, any> {
  return props.config?.fieldLabelStyle || {}
}

function getFieldValueStyle(field: PersonalField): Record<string, any> {
  return props.config?.fieldValueStyle || {}
}

function getContactItemStyle(field: PersonalField): Record<string, any> {
  return props.config?.contactItemStyle || {}
}

// 容器样式
const containerStyle = computed(() => ({
  ...props.config?.containerStyle,
  ...props.styles?.container
}))

const contentStyle = computed(() => ({
  ...props.config?.contentStyle
}))

const titleStyle = computed(() => ({
  ...props.config?.titleStyle,
  ...props.styles?.title
}))

const arrowStyle = computed(() => ({
  ...props.config?.arrowStyle
}))

const avatarSectionStyle = computed(() => ({
  ...props.config?.avatarSectionStyle
}))

const avatarImageStyle = computed(() => ({
  ...props.config?.avatarImageStyle
}))

const avatarPlaceholderStyle = computed(() => ({
  ...props.config?.avatarPlaceholderStyle
}))

const infoSectionStyle = computed(() => ({
  ...props.config?.infoSectionStyle
}))

const nameRowStyle = computed(() => ({
  ...props.config?.nameRowStyle
}))

const nameStyle = computed(() => ({
  ...props.config?.nameStyle
}))

const titleRowStyle = computed(() => ({
  ...props.config?.titleRowStyle
}))

const titleTextStyle = computed(() => ({
  ...props.config?.titleTextStyle
}))

const fieldsContainerStyle = computed(() => ({
  ...props.config?.fieldsContainerStyle
}))

const contactsStyle = computed(() => ({
  ...props.config?.contactStyle
}))

const contactLabelStyle = computed(() => ({
  ...props.config?.contactLabelStyle
}))

const contactValueStyle = computed(() => ({
  ...props.config?.contactValueStyle
}))

const summarySectionStyle = computed(() => ({
  ...props.config?.summaryStyle
}))

const summaryTitleStyle = computed(() => ({
  ...props.config?.summaryTitleStyle
}))

const summaryContentStyle = computed(() => ({
  ...props.config?.summaryContentStyle
}))
</script>

<style scoped>
.flexible-personal-layout {
  width: 100%;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  position: relative;
}

.title-ribbon-arrow {
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid currentColor;
}

.personal-content {
  display: flex;
  gap: 20px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
  border-radius: 50%;
}

.info-section {
  flex: 1;
}

.name-row {
  margin-bottom: 8px;
}

.name {
  font-size: 24px;
  font-weight: 600;
}

.title-row {
  margin-bottom: 16px;
}

.title {
  font-size: 16px;
  color: #666;
}

.fields-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-item {
  display: flex;
  gap: 8px;
}

.field-label {
  font-weight: 500;
  color: #666;
}

.field-value {
  color: #333;
}

.contacts-section {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  gap: 8px;
}

.summary-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.summary-content {
  line-height: 1.6;
  color: #666;
}
</style>

