<template>
  <div class="profile-container" :style="containerStyle">
    <!-- 蓝色标签标题 -->
    <div 
      v-if="config?.showTitle !== false"
      class="section-title" 
      :style="titleStyle"
    >
      {{ config?.title || '基本信息' }}
      <div v-if="config?.titleStyle === 'ribbon'" class="title-ribbon-arrow" :style="arrowStyle"></div>
    </div>
    
         <!-- 表格 + 头像布局 -->
     <div class="profile-layout" :style="layoutStyle">
       <div class="profile-info" :style="infoStyle">
         <table class="info-table" :style="tableStyle">
           <tr v-for="(row, index) in tableRows" :key="index">
             <td v-for="(cell, cellIndex) in row" :key="cellIndex" :style="cellStyle">
               {{ cell }}
             </td>
           </tr>
         </table>
         
                   <!-- 自我概述区域 -->
          <div v-if="basicInfo.summary" class="summary-section">
            <div class="summary-title">自我概述</div>
            <div class="summary-content">{{ basicInfo.summary }}</div>
          </div>
       </div>
       
       <div class="profile-avatar" :style="avatarStyle">
         <div class="avatar-placeholder" :style="avatarPlaceholderStyle">
           {{ config?.avatarText || '头像区域' }}
         </div>
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

// 提取基本信息
const basicInfo = computed(() => {
  const { basic, summary } = props.data || {}
  return { basic, summary }
})

// 提取联系方式
const contactInfo = computed(() => {
  const { basic } = basicInfo.value
  const { contacts } = basic || {}
  return contacts || {}
})

// 生成表格行数据
const tableRows = computed(() => {
  console.log('TableLayout - props.data:', props.data)
  console.log('TableLayout - props.config:', props.config)
  
  const { basic } = basicInfo.value
  const { name, title } = basic || {}
  const { phone, email, site } = contactInfo.value
  
  console.log('TableLayout - extracted basic:', basic)
  console.log('TableLayout - extracted summary:', basicInfo.value.summary)
  console.log('TableLayout - extracted name:', name, 'title:', title)
  console.log('TableLayout - extracted phone:', phone, 'email:', email)
  
  // 根据接口数据动态生成字段，只显示实际存在的数据
  const fields: string[][] = []
  
  // 姓名和职位（来自 profile.basic）
  if (name) fields.push(['姓名', name])
  if (title) fields.push(['职位', title])
  
  // 联系方式（来自 profile.basic.contacts）
  if (phone) fields.push(['电话', phone])
  if (email) fields.push(['邮箱', email])
  if (site) fields.push(['主页', site])
  
  // 如果没有字段，显示提示
  if (fields.length === 0) {
    fields.push(['提示', '暂无个人信息'])
  }
  
  // 如果配置了自定义字段，使用自定义字段
  if (props.config?.fields && Array.isArray(props.config.fields)) {
    return props.config.fields
  }
  
  console.log('TableLayout - final fields:', fields)
  return fields
})

// 容器样式
const containerStyle = computed(() => ({
  marginBottom: props.config?.marginBottom || '20px',
  padding: props.config?.padding,
  ...props.config?.containerStyle
}))

// 标题样式
const titleStyle = computed(() => {
  const config = props.config?.titleConfig || {}
  const baseStyle = {
    position: 'relative',
    background: config.backgroundColor || props.styles?.colors?.primary || '#4a90a4',
    color: config.color || 'white',
    padding: config.padding || '12px 20px',
    margin: config.margin || '20px 0 15px 0',
    fontSize: config.fontSize || '18px',
    fontWeight: config.fontWeight || 'bold'
  }
  
  return { ...baseStyle, ...config.customStyle }
})

// 标题箭头样式（ribbon效果）
const arrowStyle = computed(() => {
  const primaryColor = props.styles?.colors?.primary || '#4a90a4'
  return {
    content: '""',
    position: 'absolute',
    right: '-15px',
    top: '0',
    width: '0',
    height: '0',
    borderTop: `24px solid ${primaryColor}`,
    borderBottom: `24px solid ${primaryColor}`,
    borderRight: '15px solid transparent'
  }
})

// 布局样式
const layoutStyle = computed(() => ({
  display: 'flex',
  ...props.config?.layoutStyle
}))

// 信息区域样式
const infoStyle = computed(() => ({
  flex: '1',
  paddingRight: '20px',
  ...props.config?.infoStyle
}))

// 表格样式
const tableStyle = computed(() => ({
  width: '100%',
  borderCollapse: 'collapse',
  ...props.config?.tableStyle
}))

// 单元格样式
const cellStyle = computed(() => ({
  padding: '8px 12px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '14px',
  ...props.config?.cellStyle
}))

// 头像区域样式
const avatarStyle = computed(() => ({
  width: props.config?.avatarWidth || '120px',
  textAlign: 'center',
  ...props.config?.avatarStyle
}))

// 头像占位符样式
const avatarPlaceholderStyle = computed(() => ({
  width: props.config?.avatarWidth || '120px',
  height: props.config?.avatarHeight || '150px',
  background: props.config?.avatarBackground || '#f0f0f0',
  borderRadius: props.config?.avatarBorderRadius || '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: props.config?.avatarTextColor || '#999',
  ...props.config?.avatarPlaceholderStyle
}))
</script>

<style scoped>
.title-ribbon-arrow {
  content: '';
  position: absolute;
  right: -15px;
  top: 0;
  width: 0;
  height: 0;
}

/* 自我概述样式 */
.summary-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.summary-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  font-size: 16px;
}

.summary-content {
  color: #4b5563;
  line-height: 1.6;
  font-size: 14px;
  text-align: justify;
}
</style>
