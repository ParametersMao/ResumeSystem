<template>
  <div class="resume-layout three-column-layout" :style="containerStyle">
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
        
        <!-- 中列 -->
        <div class="resume-column column-middle" :style="middleColumnStyle">
          <section 
            v-for="section in middleColumnSections" 
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
      leftStyle?: Record<string, string>;
      middleStyle?: Record<string, string>;
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

// 容器样式
const containerStyle = computed(() => {
  const config = props.layoutConfig?.container || {}
  return {
    width: '100%',
    ...config
  }
})

// 内容区样式
const contentStyle = computed(() => {
  const config = props.layoutConfig?.content || {}
  return {
    width: '100%',
    ...config
  }
})

// 三列样式
const columnsStyle = computed(() => {
  const columns = props.layoutConfig?.columns || {}
  const widths = columns.widths || ['1fr', '1fr', '1fr']

  return {
    display: 'grid',
    gridTemplateColumns: widths.join(' '),
    gap: columns.gap ?? '0'
  }
})

// 左列样式
const leftColumnStyle = computed(() => {
  const columns = props.layoutConfig?.columns || {}
  return {
    width: '100%',
    ...(columns.leftStyle || {})
  }
})

// 中列样式
const middleColumnStyle = computed(() => {
  const columns = props.layoutConfig?.columns || {}
  return {
    width: '100%',
    ...(columns.middleStyle || {})
  }
})

// 右列样式
const rightColumnStyle = computed(() => {
  const columns = props.layoutConfig?.columns || {}
  return {
    width: '100%',
    ...(columns.rightStyle || {})
  }
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

// 中列模块
const middleColumnSections = computed(() => {
  return [...props.sections]
    .filter(section => {
      const sectionStyle = section.style || {}
      const configStyle = section.config || {}
      
      // 如果已经分配到其他列则不包含
      if (leftColumnSections.value.includes(section)) {
        return false
      }
      
      // 检查是否明确指定放在中列
      if (sectionStyle.column === 'middle' || configStyle.column === 'middle') {
        return true
      }
      
      // 检查gridColumn配置
      if (sectionStyle.gridColumn === '2 / 3' || configStyle.gridColumn === '2 / 3') {
        return true
      }
      
      return false
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))
})

// 右列模块
const rightColumnSections = computed(() => {
  return [...props.sections]
    .filter(section => {
      const sectionStyle = section.style || {}
      const configStyle = section.config || {}
      
      // 如果已经分配到其他列则不包含
      if (leftColumnSections.value.includes(section) || middleColumnSections.value.includes(section)) {
        return false
      }
      
      // 检查是否明确指定放在右列
      if (sectionStyle.column === 'right' || configStyle.column === 'right') {
        return true
      }
      
      // 检查gridColumn配置
      if (sectionStyle.gridColumn === '3 / 4' || configStyle.gridColumn === '3 / 4') {
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
  return 'generic-section'
}
</script>

<style scoped>
.three-column-layout {
  width: 100%;
}
</style>
