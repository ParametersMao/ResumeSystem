<template>
  <div class="resume-layout two-column-layout" :style="containerStyle">
    <div class="resume-content" :style="contentStyle">
      <div class="resume-columns" :style="columnsStyle">
        <!-- 左列 -->
        <div class="resume-column column-left" :style="leftColumnStyle">
          <section 
            v-for="section in leftColumnSections" 
            :key="section.id"
            :class="['resume-section', `section-${section.type}`]"
            :style="getSectionStyle(section)"
          >
            <slot 
              :name="`section-${section.id}`" 
              :section="section"
              :section-style="getSectionStyleObj(section)"
            >
              <component 
                :is="getSectionComponent(section)"
                :section="section" 
                :section-style="getSectionStyleObj(section)"
              />
            </slot>
          </section>
        </div>
        
        <!-- 右列 -->
        <div class="resume-column column-right" :style="rightColumnStyle">
          <section 
            v-for="section in rightColumnSections" 
            :key="section.id"
            :class="['resume-section', `section-${section.type}`]"
            :style="getSectionStyle(section)"
          >
            <slot 
              :name="`section-${section.id}`" 
              :section="section"
              :section-style="getSectionStyleObj(section)"
            >
              <component 
                :is="getSectionComponent(section)"
                :section="section" 
                :section-style="getSectionStyleObj(section)"
              />
            </slot>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

interface Props {
  layoutConfig: {
    type: string;
    columns?: {
      widths?: string[];
      gap?: string;
      leftWidth?: string;
      rightWidth?: string;
      leftStyle?: Record<string, string>;
      rightStyle?: Record<string, string>;
    };
    container?: Record<string, string>;
    content?: Record<string, string>;
    custom?: any;
  };
  sections: any[];
  sectionStyles?: Record<string, any>;
}

const props = defineProps<Props>()

// 容器样式 - 完全从layoutConfig获取
const containerStyle = computed(() => {
  const config = props.layoutConfig?.container || {}
  return {
    ...config
  }
})

// 内容区样式 - 完全从layoutConfig获取
const contentStyle = computed(() => {
  const config = props.layoutConfig?.content || {}
  return {
    ...config
  }
})

// 双列样式 - 完全从layoutConfig获取，但确保有默认值
const columnsStyle = computed(() => {
  const columns = props.layoutConfig?.columns || {}
  const widths = columns.widths || []
  
  console.log('TwoColumnLayout: 列样式配置', {
    columns,
    widths,
    gap: columns.gap
  })
  
  return {
    display: 'grid',
    gridTemplateColumns: widths.length ? widths.join(' ') : '30% 70%', // 确保至少有默认值
    gap: columns.gap !== undefined ? columns.gap : '20px' // 支持gap为"0"的情况
  }
})

// 左列样式 - 完全从layoutConfig获取
const leftColumnStyle = computed(() => {
  const columns = props.layoutConfig?.columns || {}
  console.log('TwoColumnLayout: 左列样式', columns.leftStyle)
  return columns.leftStyle || {}
})

// 右列样式 - 完全从layoutConfig获取
const rightColumnStyle = computed(() => {
  const columns = props.layoutConfig?.columns || {}
  console.log('TwoColumnLayout: 右列样式', columns.rightStyle)
  return columns.rightStyle || {}
})

// 左列模块
const leftColumnSections = computed(() => {
  return [...props.sections]
    .filter(section => {
      const sectionStyle = section.style || {}
      const configStyle = section.config || {}
      
      // 检查是否明确指定放在左列
      if (sectionStyle.column === 'left' || configStyle.column === 'left') {
        return true
      }
      
      // 检查gridColumn配置
      if (sectionStyle.gridColumn === '1 / 2' || configStyle.gridColumn === '1 / 2') {
        return true
      }
      
      return false
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))
})

// 右列模块
const rightColumnSections = computed(() => {
  // 先获取所有左列模块的ID
  const leftColumnSectionIds = leftColumnSections.value.map(section => section.id)
  
  return [...props.sections]
    .filter(section => {
      const sectionStyle = section.style || {}
      const configStyle = section.config || {}
      
      // 如果已经分配到左列则不包含
      if (leftColumnSectionIds.includes(section.id)) {
        return false
      }
      
      // 检查是否明确指定放在右列
      if (sectionStyle.column === 'right' || configStyle.column === 'right') {
        return true
      }
      
      // 检查gridColumn配置
      if (sectionStyle.gridColumn === '2 / 3' || configStyle.gridColumn === '2 / 3') {
        return true
      }
      
      // 默认放在右列
      return true
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))
})

// 获取模块样式对象
function getSectionStyleObj(section: any): Record<string, any> {
  const sectionType = section.type
  const defaultStyle = props.sectionStyles?.[sectionType] || {}
  const sectionStyle = section.style || {}
  
  // 合并默认样式和模块自定义样式
  return {
    ...defaultStyle,
    ...sectionStyle
  }
}

// 获取模块样式字符串
function getSectionStyle(section: any): Record<string, string> {
  const styleObj = getSectionStyleObj(section)
  const result: Record<string, string> = {}
  
  // 只提取直接的CSS属性，不包括嵌套对象
  Object.keys(styleObj).forEach(key => {
    if (typeof styleObj[key] !== 'object' || styleObj[key] === null) {
      result[key] = styleObj[key]
    }
  })
  
  return result
}

// 获取模块对应的组件
function getSectionComponent(section: any) {
  // 使用generic-section组件
  return 'generic-section'
}
</script>

<style>
/* 基础样式，保持最小化，具体视觉由模板自定义CSS控制 */
.two-column-layout {
  width: 100%;
}

.resume-columns {
  display: grid;
  width: 100%;
}

.resume-column {
  display: flex;
  flex-direction: column;
}

.resume-section {
  width: 100%;
}
</style>
