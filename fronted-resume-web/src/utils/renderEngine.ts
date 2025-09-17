import type { ResumeData, TemplateData, TemplateStyles, ResumeSection } from '@/types/resume'

/**
 * 动态简历渲染引擎
 */
export class ResumeRenderEngine {
  constructor(
    private templateData: TemplateData,
    private styles: TemplateStyles
  ) {
    console.log('渲染引擎初始化 - templateData:', this.templateData)
    console.log('渲染引擎初始化 - styles:', this.styles)
  }

  /**
   * 生成完整的简历HTML
   */
  generateHtml(resumeData: ResumeData): string {
    const { profile, sections } = resumeData

    // 按order排序，只渲染visible的sections
    const visibleSections = sections
      .filter(s => s.visible)
      .sort((a, b) => a.order - b.order)

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          /* 隐藏所有滚动条 */
          html, body {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
            overflow-x: hidden;
          }
          
          html::-webkit-scrollbar,
          body::-webkit-scrollbar,
          *::-webkit-scrollbar {
            display: none; /* WebKit */
          }
          
          body {
            font-family: ${this.styles.fonts.body};
            color: ${this.styles.colors.text};
            background-color: ${this.styles.colors.background};
            line-height: 1.6;
          }
          
          /* 蓝色标签样式 */
          .section-title-ribbon {
            position: relative;
            background: ${this.styles.colors.primary};
            color: white;
            padding: 12px 20px;
            margin: 20px 0 15px 0;
            font-size: 18px;
            font-weight: bold;
          }
          
          .section-title-ribbon::after {
            content: '';
            position: absolute;
            right: -15px;
            top: 0;
            width: 0;
            height: 0;
            border-top: 24px solid ${this.styles.colors.primary};
            border-bottom: 24px solid ${this.styles.colors.primary};
            border-right: 15px solid transparent;
          }
          
          /* 基本信息表格样式 */
          .profile-container {
            display: flex;
            margin-bottom: 20px;
          }
          
          .profile-info {
            flex: 1;
            padding-right: 20px;
          }
          
          .profile-avatar {
            width: 120px;
            text-align: center;
          }
          
          .info-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .info-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
          }
          
          .info-table td:first-child {
            font-weight: bold;
            width: 80px;
            color: ${this.styles.colors.text};
          }
          
          /* 时间轴样式 */
          .timeline-item {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .timeline-item:last-child {
            border-bottom: none;
          }
          
          .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          }
          
          .timeline-content {
            flex: 1;
          }
          
          .timeline-date {
            font-size: 14px;
            color: ${this.styles.colors.primary};
            font-weight: 500;
            white-space: nowrap;
            margin-left: 20px;
          }
          
          /* 技能进度条样式 */
          .skills-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 15px;
          }
          
          .skill-item {
            margin-bottom: 15px;
          }
          
          .skill-name {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px;
          }
          
          .skill-progress {
            width: 100%;
            height: 6px;
            background-color: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
          }
          
          .skill-progress-bar {
            height: 100%;
            background-color: ${this.styles.colors.primary};
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div style="padding: 20px;">
          <div style="background: ${this.styles.colors.background}; padding: 30px; border-radius: 6px; max-width: 860px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${this.renderProfile(profile)}
            ${visibleSections.map(section => this.renderSection(section)).join('')}
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * 渲染个人信息
   */
  private renderProfile(profile: ResumeData['profile']): string {
    const { basic, summary } = profile
    const { contacts } = basic

    return `
      <!-- 基本信息标题 -->
      <div class="section-title-ribbon">基本信息</div>
      
      <!-- 个人信息和头像 -->
      <div class="profile-container">
        <div class="profile-info">
          <table class="info-table">
            <tr>
              <td>姓名</td>
              <td>${basic.name || ''}</td>
              <td>年龄</td>
              <td>32岁</td>
            </tr>
            <tr>
              <td>性别</td>
              <td>男</td>
              <td>籍贯</td>
              <td>上海</td>
            </tr>
            <tr>
              <td>工作年限</td>
              <td>6年经验</td>
              <td>求职职位</td>
              <td>${basic.title || ''}</td>
            </tr>
            <tr>
              <td>电话</td>
              <td>${contacts.phone || ''}</td>
              <td>邮箱</td>
              <td>${contacts.email || ''}</td>
            </tr>
          </table>
        </div>
        <div class="profile-avatar">
          <div style="width: 120px; height: 150px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999;">
            头像区域
          </div>
        </div>
      </div>

      ${summary ? `
      <!-- 个人概述 -->
      <div class="section-title-ribbon">个人概述</div>
      <div style="margin-bottom: 20px; font-size: 14px; line-height: 1.6; color: ${this.styles.colors.text};">
        ${summary}
      </div>` : ''}
    `
  }

  /**
   * 渲染模块
   */
  private renderSection(section: ResumeSection): string {
    switch (section.type) {
      case 'experience':
        return this.renderExperience(section)
      case 'education':
        return this.renderEducation(section)
      case 'skills':
        return this.renderSkills(section)
      case 'projects':
        return this.renderProjects(section)
      case 'custom':
        return this.renderCustomSection(section)
      default:
        return ''
    }
  }

  /**
   * 渲染工作经验
   */
  private renderExperience(section: ResumeSection): string {
    if (!section.items.length) return ''

    return `
      <div class="section-title-ribbon">${section.title}</div>
      <div style="margin-bottom: 20px;">
        ${section.items.map((item: any) => `
          <div class="timeline-item">
            <div class="timeline-header">
              <div class="timeline-content">
                <div style="font-size: 16px; font-weight: 600; color: ${this.styles.colors.text}; margin-bottom: 5px;">
                  ${item.company || ''}
                </div>
                <div style="font-size: 14px; color: ${this.styles.colors.text}; margin-bottom: 8px;">
                  ${item.role || ''}
                </div>
              </div>
              <div class="timeline-date">
                ${item.start || ''} - ${item.end || ''}
              </div>
            </div>
            ${item.desc ? `
            <div style="font-size: 14px; line-height: 1.6; color: ${this.styles.colors.text};">
              ${this.renderRichTextContent(item.desc)}
            </div>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }

  /**
   * 渲染教育背景
   */
  private renderEducation(section: ResumeSection): string {
    if (!section.items.length) return ''

    return `
      <div class="section-title-ribbon">${section.title}</div>
      <div style="margin-bottom: 20px;">
        ${section.items.map((item: any) => `
          <div class="timeline-item">
            <div class="timeline-header">
              <div class="timeline-content">
                <div style="font-size: 16px; font-weight: 600; color: ${this.styles.colors.text}; margin-bottom: 5px;">
                  ${item.school || ''}
                </div>
                <div style="font-size: 14px; color: ${this.styles.colors.text};">
                  ${item.degree || ''}
                </div>
              </div>
              <div class="timeline-date">
                ${item.start || ''} - ${item.end || ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  /**
   * 渲染技能
   */
  private renderSkills(section: ResumeSection): string {
    if (!section.items.length) return ''

    return `
      <div class="section-title-ribbon">${section.title}</div>
      <div class="skills-grid">
        ${section.items.map((skill: any) => `
          <div class="skill-item">
            <div class="skill-name">${typeof skill === 'string' ? skill : skill.name || skill}</div>
            <div class="skill-progress">
              <div class="skill-progress-bar" style="width: 80%;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  /**
   * 渲染项目经历
   */
  private renderProjects(section: ResumeSection): string {
    if (!section.items.length) return ''

    return `
      <div class="section-title-ribbon">${section.title}</div>
      <div style="margin-bottom: 20px;">
        ${section.items.map((item: any) => `
          <div class="timeline-item">
            <div class="timeline-header">
              <div class="timeline-content">
                <div style="font-size: 16px; font-weight: 600; color: ${this.styles.colors.text}; margin-bottom: 5px;">
                  ${item.name || '项目名称'}
                </div>
                <div style="font-size: 14px; color: ${this.styles.colors.primary}; margin-bottom: 8px;">
                  ${item.role || '项目角色'}
                </div>
              </div>
              <div class="timeline-date">
                ${item.date || '项目时间'}
              </div>
            </div>
            ${item.desc ? `
            <div style="font-size: 14px; line-height: 1.6; color: ${this.styles.colors.text};">
              ${this.renderRichTextContent(item.desc)}
            </div>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }

  /**
   * 渲染自定义模块
   */
  private renderCustomSection(section: ResumeSection): string {
    if (!section.items.length) return ''

    return `
      <div style="margin: ${this.styles.spacing.sectionMargin} 0;">
        <div style="${this.getSectionTitleStyle('custom')}">${section.title}</div>
        ${section.items.map((item: any) => `
          <div style="margin: ${this.styles.spacing.elementMargin} 0;">
            ${Object.entries(item).map(([key, value]) => `
              <div style="margin-bottom: 8px;">
                <strong style="color: ${this.styles.colors.primary};">${key}:</strong>
                <span style="margin-left: 8px; color: ${this.styles.colors.text};">${value}</span>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `
  }

  /**
   * 生成标题样式
   */
  // 处理富文本内容
  private renderRichTextContent(content: any): string {
    if (typeof content === 'string') {
      return content
    }
    
    if (content && typeof content === 'object') {
      // 如果是富文本编辑器的JSON格式
      if (content.html) {
        return content.html
      }
      
      // 如果是纯JSON格式，转换为HTML
      if (content.json && Array.isArray(content.json)) {
        return this.convertJsonToHtml(content.json)
      }
    }
    
    return ''
  }

  // 简单的JSON到HTML转换
  private convertJsonToHtml(jsonData: any[]): string {
    return jsonData.map(node => {
      if (typeof node === 'object' && node.type) {
        const children = node.children ? this.convertJsonToHtml(node.children) : ''
        switch (node.type) {
          case 'paragraph':
            return `<p>${children}</p>`
          case 'heading':
            const level = node.level || 1
            return `<h${level}>${children}</h${level}>`
          case 'list-item':
            return `<li>${children}</li>`
          case 'bulleted-list':
            return `<ul>${children}</ul>`
          case 'numbered-list':
            return `<ol>${children}</ol>`
          default:
            return children
        }
      }
      return typeof node === 'string' ? node : ''
    }).join('')
  }

  private getSectionTitleStyle(sectionType: string): string {
    // 新的渲染引擎使用ribbon class，不再需要内联样式
    return 'class="section-title-ribbon"'
  }
}
