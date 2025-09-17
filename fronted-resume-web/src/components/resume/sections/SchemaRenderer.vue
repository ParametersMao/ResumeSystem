<template>
  <div 
    :class="schemaClass"
    :style="schemaStyle"
  >
    <!-- 根据schema类型渲染不同布局 -->
    <template v-if="schema.type === 'grid'">
      <div 
        class="schema-grid" 
        :style="gridStyle"
      >
        <SchemaRenderer
          v-for="(item, index) in schema.items"
          :key="index"
          :schema="item"
          :data="data"
          :config="config"
          :styles="styles"
        />
      </div>
    </template>

    <template v-else-if="schema.type === 'flex'">
      <div 
        class="schema-flex" 
        :style="flexStyle"
      >
        <SchemaRenderer
          v-for="(item, index) in schema.items"
          :key="index"
          :schema="item"
          :data="data"
          :config="config"
          :styles="styles"
        />
      </div>
    </template>

    <template v-else-if="schema.type === 'text'">
      <div 
        :class="textClass"
        :style="textStyle"
        v-html="renderTextContent()"
      ></div>
    </template>

    <template v-else-if="schema.type === 'image'">
      <img 
        :src="getImageSrc()"
        :alt="schema.alt || ''"
        :class="imageClass"
        :style="imageStyle"
      />
    </template>

    <template v-else-if="schema.type === 'list'">
      <ul 
        :class="listClass"
        :style="listStyle"
      >
        <li 
          v-for="(item, index) in getListItems()"
          :key="index"
          :class="itemClass"
          :style="itemStyle"
          v-html="renderListItem(item)"
        ></li>
      </ul>
    </template>

    <template v-else-if="schema.type === 'table'">
      <table 
        :class="tableClass"
        :style="tableStyle"
      >
        <thead v-if="schema.header">
          <tr>
            <th 
              v-for="(col, index) in schema.header"
              :key="index"
              :style="getColumnStyle(index)"
            >
              {{ col }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, rowIndex) in getTableRows()"
            :key="rowIndex"
          >
            <td 
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              :style="getColumnStyle(colIndex)"
            >
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else-if="schema.type === 'chart'">
      <div 
        :class="chartClass"
        :style="chartStyle"
        :id="chartId"
      ></div>
    </template>

    <template v-else-if="schema.type === 'custom'">
      <component 
        :is="getCustomComponent()"
        :data="data"
        :config="config"
        :styles="styles"
        v-bind="schema.props || {}"
      />
    </template>

    <!-- 默认容器 -->
    <template v-else>
      <div 
        :class="containerClass"
        :style="containerStyle"
      >
        <SchemaRenderer
          v-for="(item, index) in schema.children || []"
          :key="index"
          :schema="item"
          :data="data"
          :config="config"
          :styles="styles"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, nextTick } from 'vue'
import { componentRegistry } from '@/utils/componentRegistry'

interface Props {
  schema: any
  data: any
  config?: any
  styles?: any
}

const props = defineProps<Props>()

// 基础样式计算
const schemaClass = computed(() => {
  const classes = ['schema-renderer']
  if (props.schema.className) classes.push(props.schema.className)
  if (props.config?.customClass) classes.push(props.config.customClass)
  return classes.join(' ')
})

const schemaStyle = computed(() => {
  const style: Record<string, any> = {
    ...props.schema.style,
    ...props.config?.customStyle
  }
  return style
})

// Grid布局
const gridStyle = computed(() => {
  const cols = props.schema.columns || 1
  const gap = props.schema.gap || '16px'
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: gap
  }
})

// Flex布局
const flexStyle = computed(() => {
  return {
    display: 'flex',
    flexDirection: props.schema.direction || 'row',
    justifyContent: props.schema.justify || 'flex-start',
    alignItems: props.schema.align || 'stretch',
    gap: props.schema.gap || '16px',
    flexWrap: props.schema.wrap || 'nowrap'
  }
})

// 文本样式
const textClass = computed(() => {
  const classes = ['schema-text']
  if (props.schema.variant) classes.push(`text-${props.schema.variant}`)
  return classes.join(' ')
})

const textStyle = computed(() => {
  const style: Record<string, any> = {}
  if (props.schema.fontSize) style.fontSize = props.schema.fontSize
  if (props.schema.fontWeight) style.fontWeight = props.schema.fontWeight
  if (props.schema.color) style.color = props.schema.color
  if (props.schema.textAlign) style.textAlign = props.schema.textAlign
  return style
})

// 图片样式
const imageClass = computed(() => {
  const classes = ['schema-image']
  if (props.schema.className) classes.push(props.schema.className)
  return classes.join(' ')
})

const imageStyle = computed(() => {
  return {
    width: props.schema.width || '100%',
    height: props.schema.height || 'auto',
    objectFit: props.schema.objectFit || 'cover'
  }
})

// 列表样式
const listClass = computed(() => {
  const classes = ['schema-list']
  if (props.schema.variant === 'ordered') classes.push('ordered-list')
  return classes.join(' ')
})

const listStyle = computed(() => {
  return {
    listStyleType: props.schema.variant === 'ordered' ? 'decimal' : 'disc'
  }
})

const itemClass = computed(() => {
  return ['schema-list-item']
})

const itemStyle = computed(() => {
  return {
    marginBottom: props.schema.itemSpacing || '8px'
  }
})

// 表格样式
const tableClass = computed(() => {
  const classes = ['schema-table']
  if (props.schema.striped) classes.push('striped')
  if (props.schema.bordered) classes.push('bordered')
  return classes.join(' ')
})

const tableStyle = computed(() => {
  return {
    width: '100%',
    borderCollapse: 'collapse'
  }
})

// 图表样式
const chartClass = computed(() => {
  return ['schema-chart']
})

const chartStyle = computed(() => {
  return {
    width: props.schema.width || '100%',
    height: props.schema.height || '300px'
  }
})

const chartId = computed(() => {
  return `chart-${Math.random().toString(36).substr(2, 9)}`
})

const containerClass = computed(() => {
  return ['schema-container']
})

const containerStyle = computed(() => {
  return {
    display: 'block'
  }
})

// 工具方法
function renderTextContent(): string {
  if (props.schema.content) {
    return props.schema.content
  }
  if (props.schema.field && props.data) {
    return props.data[props.schema.field] || ''
  }
  return ''
}

function getImageSrc(): string {
  if (props.schema.src) {
    return props.schema.src
  }
  if (props.schema.field && props.data) {
    return props.data[props.schema.field] || ''
  }
  return ''
}

function getListItems(): any[] {
  if (props.schema.items) {
    return props.schema.items
  }
  if (props.schema.field && props.data) {
    return props.data[props.schema.field] || []
  }
  return []
}

function renderListItem(item: any): string {
  if (typeof item === 'string') {
    return item
  }
  if (typeof item === 'object' && item.text) {
    return item.text
  }
  return String(item)
}

function getTableRows(): any[][] {
  if (props.schema.rows) {
    return props.schema.rows
  }
  if (props.schema.field && props.data) {
    return props.data[props.schema.field] || []
  }
  return []
}

function getColumnStyle(index: number): Record<string, any> {
  const style: Record<string, any> = {}
  if (props.schema.columnStyles && props.schema.columnStyles[index]) {
    Object.assign(style, props.schema.columnStyles[index])
  }
  return style
}

function getCustomComponent() {
  if (props.schema.component) {
    return props.schema.component
  }
  if (props.schema.componentId) {
    const definition = componentRegistry.get(props.schema.componentId)
    return definition?.component
  }
  return 'div'
}

// 图表渲染（需要引入图表库）
onMounted(async () => {
  if (props.schema.type === 'chart' && props.schema.chartType) {
    await nextTick()
    // 这里可以集成 ECharts、Chart.js 等图表库
    console.log('Chart rendering not implemented yet')
  }
})
</script>

<style scoped>
.schema-renderer {
  box-sizing: border-box;
}

.schema-grid {
  display: grid;
}

.schema-flex {
  display: flex;
}

.schema-text {
  line-height: 1.6;
}

.schema-image {
  max-width: 100%;
  height: auto;
}

.schema-list {
  padding-left: 20px;
}

.schema-list-item {
  margin-bottom: 8px;
}

.schema-table {
  border-collapse: collapse;
}

.schema-table.striped tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.schema-table.bordered th,
.schema-table.bordered td {
  border: 1px solid #dee2e6;
  padding: 8px 12px;
}

.schema-chart {
  position: relative;
}

.schema-container {
  display: block;
}
</style>
