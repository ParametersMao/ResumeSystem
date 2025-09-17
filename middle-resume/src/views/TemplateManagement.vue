<template>
  <div class="template-management">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="模板名称">
          <el-input
            v-model="searchForm.templateName"
            placeholder="请输入模板名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="searchForm.description"
            placeholder="请输入描述关键词"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch(getSearchParams())">搜索</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 模板列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>模板列表</span>
          <el-button type="primary" @click="handleAdd">新增模板</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="templateList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="templateName" label="模板名称" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="预览图" width="120">
          <template #default="{ row }">
            <el-button 
              v-if="row.previewImage" 
              type="primary" 
              size="small" 
              @click="showPreviewImage(row)"
            >
              查看图片
            </el-button>
            <span v-else class="no-image">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">
              {{ row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" size="small" @click="handlePreview(row)">预览</el-button>
              <el-button
                :type="row.status ? 'warning' : 'success'"
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.status ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 模板编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="预览图" prop="previewImage">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleImageChange"
            :show-file-list="false"
          >
            <el-button type="primary">选择图片</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过2MB
              </div>
            </template>
          </el-upload>
          <div v-if="form.previewImage" class="preview-image">
            <el-image
              :src="form.previewImage"
              style="width: 200px; height: 150px"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="模板数据" prop="templateData">
          <el-input
            v-model="form.templateData"
            type="textarea"
            :rows="10"
            placeholder="请输入模板JSON数据"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="模板预览"
      width="90%"
      top="5vh"
      fullscreen
    >
      <div class="preview-content">
        <div v-if="generatedHtml && generatedHtml.length > 0" class="template-preview">
          <el-tabs>
            <el-tab-pane label="渲染效果">
              <div class="iframe-container">
                <iframe
                  ref="previewIframe"
                  class="preview-iframe"
                  :srcdoc="generatedHtml"
                  sandbox="allow-scripts allow-same-origin"
                  width="100%"
                  height="800"
                ></iframe>
              </div>
            </el-tab-pane>
            <el-tab-pane label="模板数据">
              <el-card class="template-data-card">
                <pre>{{ JSON.stringify(currentTemplateData, null, 2) }}</pre>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-else class="preview-placeholder">
          模板数据为空，无法预览
        </div>
      </div>
    </el-dialog>
    
    <!-- 预览图对话框 -->
    <el-dialog
      v-model="imagePreviewVisible"
      title="预览图"
      width="50%"
      top="10vh"
    >
      <div class="image-preview-content">
        <el-image
          v-if="currentPreviewImage"
          :src="currentPreviewImage"
          style="max-width: 100%; max-height: 500px"
          fit="contain"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, UploadFile } from 'element-plus'
import type { Template } from '@/types'
import { getTemplateList, getTemplateDetail, createTemplate, updateTemplate, deleteTemplate } from '@/api/template'
import { useTable } from '@/hooks/useTable'
import { formatDate } from '@/utils/common'

// 搜索表单
const searchForm = reactive({
  templateName: '',
  description: '',
  status: null as boolean | null
})

const {
  loading,
  dataList: templateList,
  pagination,
  handleSearch,
  handleReset,
  refresh,
  getData
} = useTable<Template>({
  fetchData: getTemplateList
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const previewVisible = ref(false)
const imagePreviewVisible = ref(false)
const currentPreviewImage = ref('')
const formRef = ref<FormInstance>()

// 表单
const form = reactive({
  id: 0,
  templateName: '',
  description: '',
  previewImage: '',
  templateData: '' as any,
  status: 'active' as 'active' | 'inactive'
})

// 表单验证规则
const rules = {
  templateName: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  templateData: [
    { required: true, message: '请输入模板数据', trigger: 'blur' }
  ]
}

// 新增模板
const handleAdd = () => {
  dialogTitle.value = '新增模板'
  form.id = 0
  form.templateName = ''
  form.description = ''
  form.previewImage = ''
  form.templateData = '{}'
  form.status = 'active'
  dialogVisible.value = true
}

// 编辑模板
const handleEdit = (row: Template) => {
  dialogTitle.value = '编辑模板'
  form.id = row.id
  form.templateName = row.templateName ?? ''
  form.description = row.description ?? ''
  form.previewImage = row.previewImage ?? ''
  form.templateData = JSON.stringify(row.templateData, null, 2)
  form.status = row.status ? 'active' : 'inactive'
  dialogVisible.value = true
}

// 当前预览的模板数据
const currentTemplateData = ref({})
// 生成的 HTML 内容
const generatedHtml = ref('')

// 预览模板
const handlePreview = async (row: Template) => {
  try {
    // 通过API获取完整的模板详情数据
    const response = await getTemplateDetail(row.id)
    console.log('API响应数据:', response) // 调试日志
    
    // 根据API响应格式解析数据
    const templateDetail = response.data?.data || response.data
    console.log('模板详情:', templateDetail) // 调试日志
    
    // 解析模板数据
    let templateDataObj
    if (templateDetail.templateData) {
      console.log('原始templateData:', templateDetail.templateData) // 调试日志
      console.log('templateData类型:', typeof templateDetail.templateData) // 调试日志
      console.log('templateData长度:', templateDetail.templateData.length) // 调试日志
      
      if (typeof templateDetail.templateData === 'string') {
        try {
          // 先尝试直接解析
          templateDataObj = JSON.parse(templateDetail.templateData)
          console.log('第一次解析成功:', templateDataObj) // 调试日志
        } catch (parseError) {
          console.error('第一次JSON解析失败:', parseError)
          console.error('解析失败的字符串前100个字符:', templateDetail.templateData.substring(0, 100)) // 调试日志
          
          // 尝试清理字符串后再解析
          try {
            let cleanedString = templateDetail.templateData
              .replace(/^\s+/, '') // 移除开头的所有空白字符
              .replace(/\s+$/, '') // 移除结尾的所有空白字符
              .replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除零宽字符
              .replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/g, ' ') // 移除各种空格字符
              .trim() // 再次移除首尾空格
            
            console.log('清理后的字符串前100个字符:', cleanedString.substring(0, 100)) // 调试日志
            console.log('清理后的字符串前10个字符的ASCII码:', Array.from(cleanedString.substring(0, 10)).map((c: string) => c.charCodeAt(0))) // 调试日志
            
            templateDataObj = JSON.parse(cleanedString)
            console.log('清理后解析成功:', templateDataObj) // 调试日志
          } catch (cleanParseError) {
            console.error('清理后JSON解析仍然失败:', cleanParseError)
            
            // 最后尝试：找到第一个 { 字符，从那里开始截取
            try {
              const firstBraceIndex = templateDetail.templateData.indexOf('{')
              if (firstBraceIndex > 0) {
                console.log('找到第一个{字符位置:', firstBraceIndex) // 调试日志
                const truncatedString = templateDetail.templateData.substring(firstBraceIndex)
                console.log('截取后的字符串前100个字符:', truncatedString.substring(0, 100)) // 调试日志
                templateDataObj = JSON.parse(truncatedString)
                console.log('截取后解析成功:', templateDataObj) // 调试日志
              } else {
                templateDataObj = {}
              }
            } catch (truncateParseError) {
              console.error('截取后JSON解析仍然失败:', truncateParseError)
              templateDataObj = {}
            }
          }
        }
      } else {
        templateDataObj = templateDetail.templateData
      }
    } else {
      templateDataObj = {}
    }
    
    console.log('解析后的模板数据:', templateDataObj) // 调试日志
    console.log('模板数据类型:', typeof templateDataObj) // 调试日志
    console.log('模板数据keys:', Object.keys(templateDataObj)) // 调试日志
    currentTemplateData.value = templateDataObj
    
    // 生成预览 HTML - 传递解析后的templateData，而不是整个模板对象
    generatePreviewHtml(templateDataObj)
    
    console.log('生成的HTML长度:', generatedHtml.value.length) // 调试日志
    console.log('currentTemplateData keys:', Object.keys(currentTemplateData.value)) // 调试日志
    
    previewVisible.value = true
  } catch (error) {
    ElMessage.error('获取模板详情失败，无法预览')
    console.error('获取模板详情失败:', error)
  }
}

// 生成预览 HTML
const generatePreviewHtml = (templateData: any) => {
  try {
    // 支持新旧两种数据结构
    let profile, sections, globalStyles, colors, fonts, spacing;
    
    console.log('generatePreviewHtml 接收到的数据:', templateData) // 调试日志
    console.log('profile 存在:', !!templateData?.profile) // 调试日志
    console.log('sections 存在:', !!templateData?.sections) // 调试日志
    console.log('sections 类型:', Array.isArray(templateData?.sections)) // 调试日志
    
    if (templateData?.profile && Array.isArray(templateData?.sections)) {
      // 新数据结构：profile + sections数组
      profile = templateData.profile;
      sections = templateData.sections;
      globalStyles = templateData.globalStyles || {};
      colors = globalStyles.themeColor ? { primary: globalStyles.themeColor } : { primary: '#3498db' };
      fonts = globalStyles.fontFamily ? { body: globalStyles.fontFamily } : { body: 'Arial, sans-serif' };
      spacing = globalStyles.paragraphSpacing ? { sectionMargin: globalStyles.paragraphSpacing, elementMargin: globalStyles.elementSpacing || '10px' } : { sectionMargin: '25px', elementMargin: '15px' };
      
      console.log('使用新数据结构') // 调试日志
      console.log('profile:', profile) // 调试日志
      console.log('sections:', sections) // 调试日志
      console.log('globalStyles:', globalStyles) // 调试日志
    } else {
      // 旧数据结构：styles + sections对象
      const styles = templateData?.styles || {};
      sections = templateData?.sections || {};
      colors = styles.colors || { primary: '#3498db', secondary: '#f0f8ff', text: '#2c3e50', background: '#ffffff' };
      fonts = styles.fonts || { heading: 'Montserrat, sans-serif', body: 'Open Sans, sans-serif' };
      spacing = styles.spacing || { sectionMargin: '25px', elementMargin: '15px' };
      
      // 模拟旧结构的profile数据
      profile = {
        basic: {
          name: '张三',
          title: '高级前端工程师', 
          contacts: {
            email: 'zhangsan@example.com',
            phone: '13800138000',
            site: 'https://zhangsan.dev'
          }
        },
        summary: '拥有5年前端开发经验，专注于React和Vue框架，擅长构建高性能、可扩展的Web应用。热衷于用户体验设计和前端性能优化。',
        experience: [
          {
            company: 'ABC科技有限公司',
            role: '高级前端工程师',
            start: '2020-06',
            end: '至今',
            desc: '负责公司核心产品的前端架构设计和开发，优化前端性能使页面加载速度提升40%，带领5人前端团队完成多个关键项目。'
          },
          {
            company: 'XYZ互联网公司',
            role: '前端工程师',
            start: '2018-03',
            end: '2020-05',
            desc: '参与电商平台的前端开发，实现响应式设计，确保在各种设备上的良好体验，开发了多个可复用的UI组件。'
          }
        ],
        education: [
          {
            school: '北京大学',
            degree: '计算机科学 硕士',
            start: '2015-09',
            end: '2018-06'
          },
          {
            school: '南京大学',
            degree: '软件工程 学士',
            start: '2011-09',
            end: '2015-06'
          }
        ],
        skills: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Webpack', 'CSS3', 'HTML5'],
        projects: [
          {
            name: '企业资源管理系统',
            role: '前端负责人',
            date: '2021-01 - 2021-06',
            desc: '设计并实现了基于React的企业资源管理系统前端，包括数据可视化、实时通知等功能，提高了企业运营效率20%。'
          },
          {
            name: '移动端电商平台',
            role: '前端开发',
            date: '2019-05 - 2019-12',
            desc: '使用Vue开发移动端电商平台，实现了购物车、支付流程、商品搜索等核心功能，月活用户超过10万。'
          }
        ]
      };
    }

    // 从profile中提取数据
    const basic = profile?.basic || {};
    const contacts = basic.contacts || {};
    const summary = profile?.summary || '';
    const exps = Array.isArray(profile?.experience) ? profile.experience : [];
    const edus = Array.isArray(profile?.education) ? profile.education : [];
    const skills = Array.isArray(profile?.skills) ? profile.skills : [];
    const projects = Array.isArray(profile?.projects) ? profile.projects : [];
    
    // 处理新数据结构的sections数组
    let sectionsConfig: Record<string, any> = {};
    if (Array.isArray(sections)) {
      // 新结构：sections是数组，转换为配置对象
      sections.forEach(section => {
        if (section.type && section.config) {
          sectionsConfig[section.type] = section.config;
        }
      });
    } else {
      // 旧结构：sections是对象
      sectionsConfig = sections as Record<string, any>;
    }
    
    // 获取各部分配置
    const headerConfig = sectionsConfig.header || {};
    const summaryConfig = sectionsConfig.summary || {};
    const skillsConfig = sectionsConfig.skills || {};
    const experienceConfig = sectionsConfig.experience || {};
    const educationConfig = sectionsConfig.education || {};
    const projectsConfig = sectionsConfig.projects || {};

    // 生成头部样式
    const headerNameStyle = headerConfig.elements?.[0] ? 
      `font-size: ${headerConfig.elements[0].fontSize || '32px'}; 
       font-weight: ${headerConfig.elements[0].fontWeight || '700'}; 
       color: ${headerConfig.elements[0].color || colors.primary};` :
      `font-size: 32px; font-weight: 700; color: ${colors.primary};`;

    const headerTitleStyle = headerConfig.elements?.[1] ? 
      `font-size: ${headerConfig.elements[1].fontSize || '18px'}; 
       font-weight: ${headerConfig.elements[1].fontWeight || '400'}; 
       color: ${headerConfig.elements[1].color || colors.text};` :
      `font-size: 18px; font-weight: 400; color: ${colors.text};`;

    // 生成标题样式函数
    const getSectionTitleStyle = (sectionConfig: any) => {
      const titleStyle = sectionConfig.titleStyle || {};
      return `font-size: ${titleStyle.fontSize || '22px'}; 
              font-weight: ${titleStyle.fontWeight || '600'}; 
              color: ${titleStyle.color || colors.primary};
              border-bottom: ${titleStyle.borderBottom || `2px solid ${colors.primary}`};
              padding-bottom: 6px;
              margin-bottom: ${spacing.elementMargin || '15px'};`;
    };
    
        // 生成HTML内容
    let htmlContent = '';
    
    // 处理新数据结构：遍历sections数组，按order排序
    if (Array.isArray(sections)) {
      const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
      
      sortedSections.forEach(section => {
        if (section.visible === false) return; // 跳过隐藏的模块
        
        const sectionStyle = section.style || {};
        const sectionConfig = section.config || {};
        
        // 根据模块类型生成内容
        switch (section.type) {
          case 'basic':
            if (profile?.basic) {
              const basic = profile.basic;
              const contacts = basic.contacts || {};
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '个人信息'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'};">
                    <div style="text-align: center; margin-bottom: 15px;">
                      <div style="font-size: 24px; font-weight: 600; color: ${colors.primary}; margin-bottom: 8px;">${basic.name || '姓名'}</div>
                      <div style="font-size: 18px; color: ${colors.text || '#333'}; margin-bottom: 8px;">${basic.title || '职位'}</div>
                    </div>
                    <div style="text-align: center; font-size: 14px; color: ${colors.text || '#333'}; opacity: 0.8;">
                      ${contacts.email || ''} ${contacts.phone ? '· ' + contacts.phone : ''} ${contacts.site ? '· ' + contacts.site : ''}
                    </div>
                  </div>
                </div>`;
              
              // 如果有summary，也在basic模块中显示
              if (profile.summary) {
                htmlContent += `
                  <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                    <div style="${getSectionTitleStyle({ title: '个人概述' })}">个人概述</div>
                    <div style="padding: ${sectionStyle.padding || '0'}; font-size: 15px; line-height: 1.6; color: ${colors.text || '#333'};">
                      ${profile.summary}
                    </div>
                  </div>`;
              }
            }
            break;
            
          case 'skills':
            if (section.items && section.items.length > 0) {
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '技能特长'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}; text-align: center;">
                    ${section.items.map((skill: string) => `
                      <span style="display: inline-block; 
                                   background: ${sectionStyle.itemSeparator === 'dashed' ? '#f0f8ff' : '#e8f4fd'}; 
                                   color: ${colors.text || '#333'}; 
                                   padding: 8px 12px; 
                                   margin: 6px; 
                                   border-radius: 20px; 
                                   font-size: 14px;">
                        ${skill}
                      </span>
                    `).join('')}
                  </div>
                </div>`;
            }
            break;
            
          case 'intention':
            if (section.items && section.items.length > 0) {
              const intention = section.items[0]?.intention || '';
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '求职意向'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}; font-size: 15px; line-height: 1.6; color: ${colors.text || '#333'};">
                    ${intention}
                  </div>
                </div>`;
            }
            break;
            
          case 'education':
            if (section.items && section.items.length > 0) {
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '教育背景'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}">
                    ${section.items.map((edu: any) => `
                      <div style="margin: ${spacing.elementMargin || '15px'} 0;">
                        <div style="font-size: 18px; font-weight: 600; color: ${sectionStyle.titleColor || colors.primary};">
                          ${edu.school || '学校名称'}
                        </div>
                        <div style="font-size: 16px; color: ${colors.text || '#333'}; margin: 5px 0;">
                          ${edu.degree || '学位专业'}
                        </div>
                        <div style="font-size: 14px; color: ${colors.text || '#333'}; opacity: 0.7;">
                          ${edu.duration?.start || ''} - ${edu.duration?.end || ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>`;
            }
            break;
            
          case 'experience':
            if (section.items && section.items.length > 0) {
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '工作经验'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}">
                    ${section.items.map((exp: any) => `
                      <div style="margin: ${spacing.elementMargin || '15px'} 0;">
                        <div style="font-size: 18px; font-weight: 600; color: ${colors.text || '#333'};">
                          ${exp.company || '公司名称'}
                        </div>
                        <div style="font-size: 16px; color: ${colors.primary}; margin: 5px 0;">
                          ${exp.role || '职位'}
                        </div>
                        <div style="font-size: 14px; color: ${colors.text || '#333'}; opacity: 0.7; margin: 5px 0;">
                          ${exp.duration?.start || ''} - ${exp.duration?.end || ''}
                        </div>
                        <div style="font-size: 14px; line-height: 1.5; color: ${colors.text || '#333'}; margin-top: 8px;">
                          ${exp.desc?.html || exp.desc || ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>`;
            }
            break;
            
          case 'projects':
            if (section.items && section.items.length > 0) {
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '项目经验'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}">
                    ${section.items.map((proj: any) => `
                      <div style="margin: ${spacing.elementMargin || '15px'} 0;">
                        <div style="font-size: 18px; font-weight: 600; color: ${colors.text || '#333'};">
                          ${proj.name || '项目名称'}
                        </div>
                        <div style="font-size: 16px; color: ${colors.primary}; margin: 5px 0;">
                          ${proj.role || '项目角色'}
                        </div>
                        <div style="font-size: 14px; color: ${colors.text || '#333'}; opacity: 0.7; margin: 5px 0;">
                          ${proj.duration?.start || ''} - ${proj.duration?.end || ''}
                        </div>
                        <div style="font-size: 14px; line-height: 1.5; color: ${colors.text || '#333'}; margin-top: 8px;">
                          ${proj.desc?.html || proj.desc || ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>`;
            }
            break;
            
          case 'awards':
            if (section.items && section.items.length > 0) {
              // 检查是否配置了网格列数
              const gridCols = sectionConfig.gridTemplateColumns || 'repeat(2, 1fr)';
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '荣誉证书'}</div>
                  <div style="display: grid; grid-template-columns: ${gridCols}; gap: 15px; padding: ${sectionStyle.padding || '0'}">
                    ${section.items.map((award: any) => `
                      <div style="padding: 12px; border: 1px solid #e0e0e0; border-radius: 6px;">
                        <div style="font-size: 16px; font-weight: 600; color: ${colors.text || '#333'};">
                          ${award.name || '证书名称'}
                        </div>
                        <div style="font-size: 14px; color: ${colors.text || '#333'}; opacity: 0.7; margin: 5px 0;">
                          ${award.org || '颁发机构'}
                        </div>
                        <div style="font-size: 12px; color: ${colors.text || '#333'}; opacity: 0.5;">
                          ${award.date || '获得时间'}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>`;
            }
            break;
            
          case 'hobbies':
            if (section.items && section.items.length > 0) {
              const hobby = section.items[0]?.text || '';
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${sectionConfig.title || '兴趣爱好'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}; font-size: 15px; line-height: 1.6; color: ${colors.text || '#333'};">
                    ${hobby}
                  </div>
                </div>`;
            }
            break;
            
          case 'custom':
            if (section.items && section.items.length > 0) {
              const custom = section.items[0];
              htmlContent += `
                <div style="margin: ${spacing.sectionMargin || '25px'} 0; ${sectionStyle.gridColumn ? `grid-column: ${sectionStyle.gridColumn};` : ''}">
                  <div style="${getSectionTitleStyle(sectionConfig)}">${custom.title || sectionConfig.title || '自定义模块'}</div>
                  <div style="padding: ${sectionStyle.padding || '0'}; font-size: 15px; line-height: 1.6; color: ${colors.text || '#333'};">
                    ${custom.content || ''}
                  </div>
                </div>`;
            }
            break;
        }
      });
    }
    
    // 如果没有新数据结构，使用旧的HTML生成逻辑
    if (!htmlContent) {
      htmlContent = `
        <!-- 头部信息 -->
        ${headerConfig.enabled !== false ? `
        <div style="text-align: center; margin-bottom: ${spacing.sectionMargin || '25px'};">
          <div style="${headerNameStyle}">${basic.name || '张三'}</div>
          <div style="${headerTitleStyle}">${basic.title || '前端工程师'}</div>
          <div style="margin-top: 10px; font-size: 14px; color: ${colors.text}; opacity: 0.8;">
            ${contacts.email || 'zhangsan@example.com'} · ${contacts.phone || '13800138000'} · ${contacts.site || 'https://example.com'}
            </div>
        </div>` : ''}

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
      `;
    }
    
    // 判断是否使用网格布局（只有新数据结构且明确设置了gridColumn的模块才使用）
    const useGridLayout = Array.isArray(sections) && sections.some(section => section.style?.gridColumn);
    
    const html = `
  <div style="padding: 20px; font-family: ${fonts.body}; color: ${colors.text || '#333'}; background-color: ${colors.background || '#fff'};">
    <div style="background: ${colors.background || '#fff'}; padding: 30px; border-radius: 6px; max-width: 860px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); ${useGridLayout ? 'display: grid; grid-template-columns: 1fr 2fr; gap: 20px;' : ''}">
      ${htmlContent}
    </div>
  </div>`;

    generatedHtml.value = html;
  } catch (error) {
    console.error('生成预览 HTML 失败:', error);
    // 生成失败时使用默认模板
    const defaultHtml = `<div style="padding: 20px; text-align: center; background-color: #1e1e20; color: #E5EAF3;">
      <h2 style="color: #F56C6C;">模板数据解析失败</h2>
      <p>无法根据提供的模板数据生成预览。请检查模板数据格式是否正确。</p>
      <pre style="text-align: left; background: #2b2b2b; padding: 10px; border-radius: 5px; color: #E5EAF3;">${JSON.stringify(error, null, 2)}</pre>
    </div>`;
    generatedHtml.value = defaultHtml;
  }
}

// 显示预览图
const showPreviewImage = (row: Template) => {
  if (row.previewImage) {
    currentPreviewImage.value = row.previewImage
    imagePreviewVisible.value = true
  }
}

// 切换状态
const handleToggleStatus = async (row: Template) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status ? '禁用' : '启用'}该模板吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await updateTemplate(row.id, { status: !row.status })
    ElMessage.success('操作成功')
    refresh()
  } catch {
    // 用户取消
  }
}

// 删除模板
const handleDelete = async (row: Template) => {
  try {
    await ElMessageBox.confirm('确定要删除该模板吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteTemplate(row.id)
    ElMessage.success('删除成功')
    refresh()
  } catch {
    // 用户取消
  }
}

// 图片上传处理
const handleImageChange = (file: UploadFile) => {
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.previewImage = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const data = {
      templateName: form.templateName,
      description: form.description,
      templateData: form.templateData,
      previewImage: form.previewImage,
      status: form.status === 'active'
    }

    if (form.id === 0) {
      await createTemplate(data)
      ElMessage.success('新增成功')
    } else {
      await updateTemplate(form.id, data)
      ElMessage.success('编辑成功')
    }
    
    dialogVisible.value = false
    refresh()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.limit = size
  getData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getData()
}

// 处理搜索参数
const getSearchParams = () => {
  const params: Record<string, any> = {}
  
  if (searchForm.templateName) {
    params.templateName = searchForm.templateName
  }
  
  if (searchForm.description) {
    params.description = searchForm.description
  }
  
  if (searchForm.status !== null) {
    params.status = searchForm.status
  }
  
  return params
}

// 重置搜索表单
const resetSearchForm = () => {
  searchForm.templateName = ''
  searchForm.description = ''
  searchForm.status = null
  handleReset()
}

onMounted(() => {
  handleSearch(getSearchParams())
})
</script>

<style scoped>
.template-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-image {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-image {
  margin-top: 10px;
}

.preview-content {
  min-height: 400px;
}

.preview-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  border-radius: 4px;
}

.template-preview {
  padding: 10px;
}

.template-data-card {
  margin-top: 10px;
  margin-bottom: 20px;
}

.template-data-card pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 10px;
  background-color: var(--el-fill-color);
  border-radius: 4px;
  max-height: 600px;
  overflow-y: auto;
}

.iframe-container {
  width: 100%;
  padding: 10px 0;
}

.preview-iframe {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background-color: var(--el-bg-color);
}

.image-preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.action-btns {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}
</style> 