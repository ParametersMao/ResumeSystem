<template>
  <div class="resume-editor">
    <!-- 左侧编辑区域 -->
    <div class="editor-left">
      <div class="editor-header">
        <h2>{{ resume?.title || '未命名简历' }}</h2>
        <div class="save-status">{{ saveStatusText }}</div>
      </div>
      
      <div class="editor-content">
        <!-- 基本信息编辑 -->
        <div class="edit-section">
        <h3>基本信息</h3>
        <div class="form-group">
          <label>姓名</label>
          <el-input v-model="profileData.basic.name" placeholder="请输入姓名" />
        </div>
        <div class="form-group">
          <label>职位</label>
          <el-input v-model="profileData.basic.title" placeholder="请输入目标职位" />
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <el-input v-model="profileData.basic.contacts.email" placeholder="请输入邮箱" />
        </div>
        <div class="form-group">
          <label>电话</label>
          <el-input v-model="profileData.basic.contacts.phone" placeholder="请输入电话" />
        </div>
        <div class="form-group">
          <label>个人网站</label>
          <el-input v-model="profileData.basic.contacts.site" placeholder="请输入网站地址" />
        </div>
      </div>

      <!-- 个人简介 -->
      <div class="edit-section">
        <h3>个人简介</h3>
        <el-input
          v-model="profileData.summary"
          type="textarea"
          :rows="4"
          placeholder="请输入个人简介"
        />
      </div>

      <!-- 工作经历 -->
      <div class="edit-section">
        <div class="section-header">
          <h3>工作经历</h3>
          <el-button size="small" type="primary" @click="addExperience">
            <el-icon><Plus /></el-icon>
            添加
          </el-button>
        </div>
        <div v-for="(exp, index) in profileData.experience" :key="index" class="item-card">
          <div class="item-header">
            <span>工作经历 {{ index + 1 }}</span>
            <el-button size="small" type="danger" text @click="removeExperience(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>公司名称</label>
              <el-input v-model="exp.company" placeholder="公司名称" />
            </div>
            <div class="form-group">
              <label>职位</label>
              <el-input v-model="exp.role" placeholder="职位" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开始时间</label>
              <el-input v-model="exp.start" placeholder="2023-01" />
            </div>
            <div class="form-group">
              <label>结束时间</label>
              <el-input v-model="exp.end" placeholder="2024-01" />
            </div>
          </div>
          <div class="form-group">
            <label>工作描述</label>
            <el-input
              v-model="exp.desc"
              type="textarea"
              :rows="3"
              placeholder="请描述工作内容和成果"
            />
          </div>
        </div>
      </div>

      <!-- 技能 -->
      <div class="edit-section">
        <div class="section-header">
          <h3>专业技能</h3>
          <el-button size="small" type="primary" @click="addSkill">
            <el-icon><Plus /></el-icon>
            添加
          </el-button>
        </div>
        <div class="skills-container">
          <el-tag
            v-for="(skill, index) in profileData.skills"
            :key="index"
            closable
            @close="removeSkill(index)"
            class="skill-tag"
          >
            {{ skill }}
          </el-tag>
          <el-input
            v-if="showSkillInput"
            ref="skillInputRef"
            v-model="newSkill"
            size="small"
            @keyup.enter="confirmSkill"
            @blur="confirmSkill"
            class="skill-input"
          />
        </div>
      </div>

      <!-- 项目经历 -->
      <div class="edit-section">
        <div class="section-header">
          <h3>项目经历</h3>
          <el-button size="small" type="primary" @click="addProject">
            <el-icon><Plus /></el-icon>
            添加
          </el-button>
        </div>
        <div v-for="(project, index) in profileData.projects" :key="index" class="item-card">
          <div class="item-header">
            <span>项目 {{ index + 1 }}</span>
            <el-button size="small" type="danger" text @click="removeProject(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>项目名称</label>
              <el-input v-model="project.name" placeholder="项目名称" />
            </div>
            <div class="form-group">
              <label>担任角色</label>
              <el-input v-model="project.role" placeholder="项目角色" />
            </div>
          </div>
          <div class="form-group">
            <label>项目时间</label>
            <el-input v-model="project.date" placeholder="2023" />
          </div>
          <div class="form-group">
            <label>项目描述</label>
            <el-input
              v-model="project.desc"
              type="textarea"
              :rows="3"
              placeholder="请描述项目内容和技术栈"
            />
          </div>
        </div>
      </div>

      <!-- 教育背景 -->
      <div class="edit-section">
        <div class="section-header">
          <h3>教育背景</h3>
          <el-button size="small" type="primary" @click="addEducation">
            <el-icon><Plus /></el-icon>
            添加
          </el-button>
        </div>
        <div v-for="(edu, index) in profileData.education" :key="index" class="item-card">
          <div class="item-header">
            <span>教育经历 {{ index + 1 }}</span>
            <el-button size="small" type="danger" text @click="removeEducation(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>学校名称</label>
              <el-input v-model="edu.school" placeholder="学校名称" />
            </div>
            <div class="form-group">
              <label>专业学历</label>
              <el-input v-model="edu.degree" placeholder="计算机科学 本科" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开始时间</label>
              <el-input v-model="edu.start" placeholder="2016-09" />
            </div>
            <div class="form-group">
              <label>结束时间</label>
              <el-input v-model="edu.end" placeholder="2020-06" />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- 右侧预览区域 -->
    <div class="editor-right">
      <div class="preview-header">
        <h3>实时预览</h3>
        <div class="preview-actions">
          <el-button size="small" @click="saveResume">保存</el-button>
          <el-button size="small" type="primary" @click="exportPdf">导出PDF</el-button>
        </div>
      </div>
      <div class="preview-container">
        <iframe 
          ref="previewIframe"
          :srcdoc="previewHtml" 
          class="preview-iframe"
          sandbox="allow-same-origin"
        ></iframe>
      </div>
    </div>

    <!-- 右侧设置栏 -->
    <div class="settings-panel" :class="{ collapsed: settingsCollapsed }">
      <div v-if="!settingsCollapsed" class="settings-header">
        <h3>样式设置</h3>
        <el-button 
          text 
          @click="toggleSettings"
          class="toggle-btn"
        >
          <el-icon>
            <ArrowRight />
          </el-icon>
        </el-button>
      </div>
      
      <div v-show="!settingsCollapsed" class="settings-content">
        <div class="setting-group">
          <h4>布局类型</h4>
          <el-select v-model="templateType" @change="updateTemplateType" style="width: 100%;">
            <el-option label="单列布局" value="single-column" />
            <el-option label="双列布局" value="two-column" />
            <el-option label="三列布局" value="three-column" />
          </el-select>
        </div>

        <div class="setting-group">
          <h4>主题颜色</h4>
          <div class="color-picker">
            <input 
              type="color" 
              v-model="templateStyles.colors.primary" 
              @change="updatePreview"
            />
            <span>主色调</span>
          </div>
          <div class="color-picker">
            <input 
              type="color" 
              v-model="templateStyles.colors.text" 
              @change="updatePreview"
            />
            <span>文字颜色</span>
          </div>
        </div>

        <div class="setting-group">
          <h4>字体设置</h4>
          <el-select v-model="templateStyles.fonts.body" @change="updatePreview">
            <el-option label="默认字体" value="Open Sans, sans-serif" />
            <el-option label="微软雅黑" value="Microsoft YaHei, sans-serif" />
            <el-option label="苹方" value="PingFang SC, sans-serif" />
          </el-select>
        </div>

        <div class="setting-group">
          <h4>间距设置</h4>
          <div class="spacing-control">
            <label>段落间距</label>
            <el-input-number 
              v-model="spacingValues.section" 
              :min="10" 
              :max="50" 
              @change="updateSpacing"
            />
          </div>
          <div class="spacing-control">
            <label>元素间距</label>
            <el-input-number 
              v-model="spacingValues.element" 
              :min="5" 
              :max="30" 
              @change="updateSpacing"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 收起状态的箭头按钮 -->
    <div v-if="settingsCollapsed" class="settings-toggle-collapsed">
      <el-button 
        text 
        @click="toggleSettings"
        class="toggle-btn-collapsed"
      >
        <el-icon>
          <ArrowLeft />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Delete, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getTemplateDetail } from '@/api/template'
import { createResume, getResume, updateResume } from '@/api/resume'
import { useUserStore } from '@/store/user'

// 路由参数
const route = useRoute()
const templateId = route.query.templateId as string
const resumeId = route.query.resumeId as string

// 用户状态
const userStore = useUserStore()

// 响应式数据
const resume = ref<any>(null)
const templateData = ref<any>({})
const settingsCollapsed = ref(true)
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const templateType = ref<'single-column' | 'two-column' | 'three-column'>('single-column')

// 个人信息数据
const profileData = ref({
  basic: {
    name: '张三',
    title: '前端工程师',
    contacts: {
      email: 'zhangsan@example.com',
      phone: '13800138000',
      site: 'https://example.com'
    }
  },
  summary: '拥有3+年前端经验，熟悉 Vue3/TypeScript，关注性能与体验。',
  experience: [
    {
      company: '示例公司A',
      role: '前端工程师',
      start: '2022-01',
      end: '2023-12',
      desc: '负责核心业务前端研发与性能优化。'
    }
  ],
  education: [
    {
      school: '北京大学',
      degree: '计算机科学 本科',
      start: '2016-09',
      end: '2020-06'
    }
  ],
  skills: ['JavaScript', 'TypeScript', 'Vue3', 'Vite', 'Pinia'],
  projects: [
    {
      name: '在线简历平台',
      role: '前端负责人',
      date: '2023',
      desc: '搭建在线编辑与导出能力。'
    }
  ]
})

// 模板样式
const templateStyles = ref({
  colors: {
    primary: '#3498db',
    secondary: '#f0f8ff',
    text: '#2c3e50',
    background: '#ffffff'
  },
  fonts: {
    heading: 'Montserrat, sans-serif',
    body: 'Open Sans, sans-serif'
  },
  spacing: {
    sectionMargin: '25px',
    elementMargin: '15px'
  }
})

// 间距数值（用于输入控件）
const spacingValues = ref({
  section: 25,
  element: 15
})

// 技能输入
const showSkillInput = ref(false)
const newSkill = ref('')
const skillInputRef = ref()

// 计算属性
const saveStatusText = computed(() => {
  const statusMap = {
    idle: '',
    saving: '保存中...',
    saved: '已保存',
    error: '保存失败'
  }
  return statusMap[saveStatus.value]
})

const previewHtml = computed(() => {
  return generatePreviewHtml(templateData.value, profileData.value)
})

// 初始化
onMounted(async () => {
  if (templateId) {
    await loadTemplate()
  }
  if (resumeId) {
    await loadResume()
  }
})

// 加载模板
async function loadTemplate() {
  try {
    const template = await getTemplateDetail(templateId)
    console.log('简历编辑器获取到的模板详情:', template) // 调试日志
    
    templateData.value = template.templateData || {}
    console.log('简历编辑器解析后的模板数据:', templateData.value) // 调试日志
    console.log('简历编辑器模板颜色配置:', templateData.value?.styles?.colors) // 调试日志
    
    // 加载模板类型
    if (templateData.value.templateType) {
      templateType.value = templateData.value.templateType
    }
    
    // 更新样式配置，使用正确的合并逻辑
    if (templateData.value.styles) {
      // 合并颜色配置
      if (templateData.value.styles.colors) {
        Object.assign(templateStyles.value.colors, templateData.value.styles.colors)
      }
      
      // 合并字体配置
      if (templateData.value.styles.fonts) {
        Object.assign(templateStyles.value.fonts, templateData.value.styles.fonts)
      }
      
      // 合并间距配置
      if (templateData.value.styles.spacing) {
        Object.assign(templateStyles.value.spacing, templateData.value.styles.spacing)
        spacingValues.value.section = parseInt(templateData.value.styles.spacing.sectionMargin) || 25
        spacingValues.value.element = parseInt(templateData.value.styles.spacing.elementMargin) || 15
      }
    }
    
    console.log('简历编辑器更新后的templateStyles:', templateStyles.value) // 调试日志
  } catch (error) {
    ElMessage.error('模板加载失败')
    console.error('Template load error:', error)
  }
}

// 加载简历
async function loadResume() {
  try {
    const resumeData = await getResume(resumeId, userStore.user?.id)
    resume.value = resumeData
    
    // 解析简历内容
    if (resumeData.content) {
      const content = typeof resumeData.content === 'string' 
        ? JSON.parse(resumeData.content) 
        : resumeData.content
      
      if (content.profile) {
        profileData.value = { ...profileData.value, ...content.profile }
      }
      
      if (content.styles) {
        Object.assign(templateStyles.value, content.styles)
      }
      
      // 加载模板类型
      if (content.templateType) {
        templateType.value = content.templateType
      } else if (content.templateData?.templateType) {
        templateType.value = content.templateData.templateType
      }
    }
    
    ElMessage.success('简历加载成功')
  } catch (error) {
    ElMessage.error('简历加载失败')
    console.error('Resume load error:', error)
  }
}

// 生成预览HTML
function generatePreviewHtml(templateData: any, profile: any) {
  console.log('简历编辑器 generatePreviewHtml 接收到的 templateData:', templateData) // 调试日志
  
  const styles = templateData?.styles || {}
  const sections = templateData?.sections || {}
  
  // 获取模板类型（支持三列布局）
  const templateType = templateData?.templateType || 'single-column'
  
  // 简化逻辑：用户样式设置始终优先，模板数据作为结构配置
  console.log('styles.colors:', styles.colors) // 额外调试
  console.log('templateStyles.value:', templateStyles.value) // 调试当前设置
  
  // 使用用户当前的样式设置（右侧面板的设置始终有效）
  const colors = templateStyles.value.colors
  const fonts = templateStyles.value.fonts
  const spacing = templateStyles.value.spacing
  
  console.log('简历编辑器提取出的颜色配置:', colors) // 调试日志
  console.log('简历编辑器提取出的字体配置:', fonts) // 调试日志
  console.log('简历模板类型:', templateType) // 调试日志

  const basic = profile.basic || {}
  const contacts = basic.contacts || {}
  const summary = profile.summary || ''
  const exps = Array.isArray(profile.experience) ? profile.experience : []
  const edus = Array.isArray(profile.education) ? profile.education : []
  const skills = Array.isArray(profile.skills) ? profile.skills : []
  const projects = Array.isArray(profile.projects) ? profile.projects : []

  // 获取各部分配置
  const headerConfig = sections.header || {}
  const summaryConfig = sections.summary || {}
  const skillsConfig = sections.skills || {}
  const experienceConfig = sections.experience || {}
  const educationConfig = sections.education || {}
  const projectsConfig = sections.projects || {}
  
  // 生成标题样式函数
  const getSectionTitleStyle = (sectionConfig: any) => {
    const titleStyle = sectionConfig.titleStyle || {}
    return `font-size: ${titleStyle.fontSize || '22px'}; 
            font-weight: ${titleStyle.fontWeight || '600'}; 
            color: ${titleStyle.color || colors.primary};
            border-bottom: ${titleStyle.borderBottom || `2px solid ${colors.primary}`};
            padding-bottom: 6px;
            margin-bottom: ${spacing.elementMargin || '15px'};`
  }

  return `
  <div style="padding: 20px; font-family: ${fonts.body}; color: ${colors.text}; background-color: ${colors.background};">
    <div style="background: ${colors.background}; padding: 30px; border-radius: 6px; max-width: 860px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      
      <!-- 头部信息 -->
      <div style="text-align: center; margin-bottom: ${spacing.sectionMargin || '25px'};">
        <div style="font-size: 32px; font-weight: 700; color: ${colors.primary};">${basic.name || '张三'}</div>
        <div style="font-size: 18px; font-weight: 400; color: ${colors.text};">${basic.title || '前端工程师'}</div>
        <div style="margin-top: 10px; font-size: 14px; color: ${colors.text}; opacity: 0.8;">
          ${contacts.email || 'zhangsan@example.com'} · ${contacts.phone || '13800138000'} · ${contacts.site || 'https://example.com'}
        </div>
      </div>

      <!-- 个人概述 -->
      ${summaryConfig.enabled !== false && summary ? `
      <div style="margin: ${spacing.sectionMargin || '25px'} 0;">
        <div style="${getSectionTitleStyle(summaryConfig)}">${summaryConfig.title || '个人概述'}</div>
        <div style="font-size: ${summaryConfig.contentStyle?.fontSize || '15px'}; 
                    line-height: ${summaryConfig.contentStyle?.lineHeight || '1.6'}; 
                    color: ${colors.text};">
          ${summary}
        </div>
      </div>` : ''}

      <!-- 专业技能 -->
      ${skillsConfig.enabled !== false && skills.length ? `
      <div style="margin: ${spacing.sectionMargin || '25px'} 0;">
        <div style="${getSectionTitleStyle(skillsConfig)}">${skillsConfig.title || '专业技能'}</div>
        <div>
          ${skills.map((s: string) => `
            <span style="display: inline-block; 
                         background: ${skillsConfig.itemStyle?.backgroundColor || colors.secondary}; 
                         color: ${skillsConfig.itemStyle?.color || colors.text}; 
                         padding: ${skillsConfig.itemStyle?.padding || '8px 12px'}; 
                         margin: ${skillsConfig.itemStyle?.margin || '6px'}; 
                         border-radius: ${skillsConfig.itemStyle?.borderRadius || '20px'}; 
                         font-size: ${skillsConfig.itemStyle?.fontSize || '14px'};">
              ${s}
            </span>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- 工作经验 -->
      ${experienceConfig.enabled !== false && exps.length ? `
      <div style="margin: ${spacing.sectionMargin || '25px'} 0;">
        <div style="${getSectionTitleStyle(experienceConfig)}">${experienceConfig.title || '工作经验'}</div>
        ${exps.map((e: any) => `
          <div style="margin: ${spacing.elementMargin || '15px'} 0;">
            <div style="font-size: ${experienceConfig.itemStyle?.company?.fontSize || '18px'}; 
                        font-weight: ${experienceConfig.itemStyle?.company?.fontWeight || '600'}; 
                        color: ${experienceConfig.itemStyle?.company?.color || colors.text};">
              ${e.company || '示例公司A'}
            </div>
            <div style="font-size: ${experienceConfig.itemStyle?.position?.fontSize || '16px'}; 
                        font-weight: ${experienceConfig.itemStyle?.position?.fontWeight || '500'}; 
                        color: ${experienceConfig.itemStyle?.position?.color || colors.primary};">
              ${e.role || '前端工程师'}
            </div>
            <div style="font-size: ${experienceConfig.itemStyle?.date?.fontSize || '14px'}; 
                        color: ${experienceConfig.itemStyle?.date?.color || colors.text}; 
                        opacity: 0.7; margin: 5px 0;">
              ${e.start || '2022-01'} - ${e.end || '2023-12'}
            </div>
            <div style="font-size: ${experienceConfig.itemStyle?.description?.fontSize || '14px'}; 
                        line-height: ${experienceConfig.itemStyle?.description?.lineHeight || '1.5'}; 
                        color: ${colors.text};">
              ${e.desc || '负责核心业务前端研发与性能优化。'}
            </div>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- 项目经历 -->
      ${projectsConfig.enabled !== false && projects.length ? `
      <div style="margin: ${spacing.sectionMargin || '25px'} 0;">
        <div style="${getSectionTitleStyle(projectsConfig)}">${projectsConfig.title || '项目经历'}</div>
        ${projects.map((p: any) => `
          <div style="margin: ${spacing.elementMargin || '15px'} 0;">
            <div style="font-size: ${projectsConfig.itemStyle?.name?.fontSize || '18px'}; 
                        font-weight: ${projectsConfig.itemStyle?.name?.fontWeight || '600'}; 
                        color: ${projectsConfig.itemStyle?.name?.color || colors.text};">
              ${p.name || '在线简历平台'}
            </div>
            <div style="font-size: ${projectsConfig.itemStyle?.role?.fontSize || '16px'}; 
                        font-weight: ${projectsConfig.itemStyle?.role?.fontWeight || '500'}; 
                        color: ${projectsConfig.itemStyle?.role?.color || colors.primary};">
              ${p.role || '前端负责人'}
            </div>
            <div style="font-size: ${projectsConfig.itemStyle?.date?.fontSize || '14px'}; 
                        color: ${projectsConfig.itemStyle?.date?.color || colors.text}; 
                        opacity: 0.7; margin: 5px 0;">
              ${p.date || '2023'}
            </div>
            <div style="font-size: ${projectsConfig.itemStyle?.description?.fontSize || '14px'}; 
                        line-height: ${projectsConfig.itemStyle?.description?.lineHeight || '1.5'}; 
                        color: ${colors.text};">
              ${p.desc || '搭建在线编辑与导出能力。'}
            </div>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- 教育背景 -->
      ${educationConfig.enabled !== false && edus.length ? `
      <div style="margin: ${spacing.sectionMargin || '25px'} 0;">
        <div style="${getSectionTitleStyle(educationConfig)}">${educationConfig.title || '教育背景'}</div>
        ${edus.map((ed: any) => `
          <div style="margin: ${spacing.elementMargin || '15px'} 0;">
            <div style="font-size: ${educationConfig.itemStyle?.institution?.fontSize || '18px'}; 
                        font-weight: ${educationConfig.itemStyle?.institution?.fontWeight || '600'}; 
                        color: ${educationConfig.itemStyle?.institution?.color || colors.text};">
              ${ed.school || '北京大学'}
            </div>
            <div style="font-size: ${educationConfig.itemStyle?.degree?.fontSize || '16px'}; 
                        font-weight: ${educationConfig.itemStyle?.degree?.fontWeight || '500'}; 
                        color: ${educationConfig.itemStyle?.degree?.color || colors.primary};">
              ${ed.degree || '计算机科学 本科'}
            </div>
            <div style="font-size: ${educationConfig.itemStyle?.date?.fontSize || '14px'}; 
                        color: ${educationConfig.itemStyle?.date?.color || colors.text}; 
                        opacity: 0.7; margin: 5px 0;">
              ${ed.start || '2016-09'} - ${ed.end || '2020-06'}
            </div>
          </div>
        `).join('')}
      </div>` : ''}

    </div>
  </div>`
}

// 工作经历操作
function addExperience() {
  profileData.value.experience.push({
    company: '',
    role: '',
    start: '',
    end: '',
    desc: ''
  })
}

function removeExperience(index: number) {
  profileData.value.experience.splice(index, 1)
}

// 技能操作
function addSkill() {
  showSkillInput.value = true
  nextTick(() => {
    skillInputRef.value?.focus()
  })
}

function confirmSkill() {
  if (newSkill.value.trim()) {
    profileData.value.skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
  showSkillInput.value = false
}

function removeSkill(index: number) {
  profileData.value.skills.splice(index, 1)
}

// 项目经历操作
function addProject() {
  profileData.value.projects.push({
    name: '',
    role: '',
    date: '',
    desc: ''
  })
}

function removeProject(index: number) {
  profileData.value.projects.splice(index, 1)
}

// 教育背景操作
function addEducation() {
  profileData.value.education.push({
    school: '',
    degree: '',
    start: '',
    end: ''
  })
}

function removeEducation(index: number) {
  profileData.value.education.splice(index, 1)
}

// 设置面板操作
function toggleSettings() {
  settingsCollapsed.value = !settingsCollapsed.value
}

function updatePreview() {
  // 预览会自动更新，因为使用了计算属性
}

function updateSpacing() {
  templateStyles.value.spacing.sectionMargin = spacingValues.value.section + 'px'
  templateStyles.value.spacing.elementMargin = spacingValues.value.element + 'px'
}

function updateTemplateType(type: string) {
  console.log('更新模板类型:', type)
  if (templateData.value) {
    templateData.value.templateType = type
  }
  
  // 当切换到三列布局时，自动为每个章节分配列位置
  if (type === 'three-column') {
    // 确保初始化 sections 数组
    if (!templateData.value.sections) {
      templateData.value.sections = []
    }
    const sections = templateData.value.sections
    
    // 简单分配策略：均匀分配到三列
    sections.forEach((section: any, index: number) => {
      if (!section.style) section.style = {}
      
      // 基于索引分配列，实现均匀分配
      const columnIndex = index % 3 + 1
      section.style.gridColumn = `${columnIndex} / ${columnIndex + 1}`
    })
  }
}

// 保存和导出
async function saveResume() {
  if (!userStore.user?.id) {
    ElMessage.error('请先登录')
    return
  }
  
  saveStatus.value = 'saving'
  
  try {
    const content = {
      profile: profileData.value,
      styles: templateStyles.value,
      templateData: templateData.value,
      templateType: templateType.value
    }
    
    if (resume.value?.id) {
      // 更新现有简历
      await updateResume(
        resume.value.id.toString(), 
        {
          title: resume.value.title,
          content: JSON.stringify(content),
          version: resume.value.version
        },
        userStore.user.id
      )
    } else {
      // 创建新简历
      const title = `基于${templateData.value?.templateName || '模板'}的简历`
      const result = await createResume(
        templateId,
        title,
        userStore.user.id,
        JSON.stringify(content)
      )
      
      // 更新当前简历ID
      if (result.resumeId) {
        resume.value = { id: parseInt(result.resumeId), title, version: 1 }
        
        // 更新URL，添加resumeId参数
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('resumeId', result.resumeId)
        window.history.replaceState({}, '', newUrl.toString())
      }
    }
    
    saveStatus.value = 'saved'
    ElMessage.success('保存成功')
    
    // 3秒后清除保存状态
    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 3000)
    
  } catch (error) {
    saveStatus.value = 'error'
    ElMessage.error('保存失败')
    console.error('Save error:', error)
    
    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 3000)
  }
}

function exportPdf() {
  // TODO: 实现PDF导出
  ElMessage.info('导出功能开发中...')
}

// 自动保存（防抖）
let saveTimer: number | null = null
watch([profileData, templateStyles], () => {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  
  saveTimer = setTimeout(() => {
    if (resume.value?.id) {
      // 只有已存在的简历才自动保存
      saveResume()
    }
  }, 2000) // 2秒防抖
}, { deep: true })
</script>

<style scoped>
.resume-editor {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.editor-left {
  width: 400px;
  background: white;
  overflow-y: auto;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px; /* 与预览区标题栏高度保持一致 */
  padding: 16px 20px;
  margin: 0;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.editor-header h2 {
  margin: 0;
  color: #333;
}

.save-status {
  font-size: 14px;
  color: #666;
}

.editor-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.edit-section {
  margin-bottom: 32px;
}

.edit-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.item-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #374151;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.skill-tag {
  margin: 0;
}

.skill-input {
  width: 100px;
}

.editor-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px; /* 确保与左侧标题栏高度一致 */
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.preview-header h3 {
  margin: 0;
  color: #333;
}

.preview-container {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.settings-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e5e7eb;
  transition: width 0.3s ease;
  overflow: hidden;
}

.settings-panel.collapsed {
  width: 0;
  border: none;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px; /* 与左侧和中间标题栏高度保持一致 */
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.settings-header h3 {
  margin: 0;
  color: #333;
}

.toggle-btn {
  padding: 4px;
}

.settings-content {
  padding: 20px;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.color-picker input[type="color"] {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker span {
  font-size: 14px;
  color: #6b7280;
}

.spacing-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.spacing-control label {
  font-size: 14px;
  color: #6b7280;
}

/* 收起状态的箭头按钮 */
.settings-toggle-collapsed {
  position: fixed;
  right: 10px;
  top: 73px; /* 与预览区标题栏底部对齐 */
  z-index: 100;
}

.toggle-btn-collapsed {
  width: 32px;
  height: 32px;
  padding: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn-collapsed:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

/* 响应式 */
@media (max-width: 1200px) {
  .editor-left {
    width: 350px;
  }
  
  .settings-panel {
    width: 250px;
  }
}
</style>
