# C 端简历编辑系统需求文档

## 文档信息

| 项目     | 内容                                             |
| -------- | ------------------------------------------------ |
| 文档版本 | v1.0                                             |
| 创建日期 | 2026-01-12                                       |
| 系统名称 | C 端简历编辑系统 (fronted-resume-web)            |
| 系统定位 | 面向 C 端用户的在线简历编辑和导出平台            |
| 技术栈   | Vue 3 + TypeScript + Vite + Pinia + Element Plus |

---

## 一、系统概述

### 1.1 产品定位

C 端简历编辑系统是一个面向求职者的在线简历制作平台，提供：

- **所见即所得**的简历编辑体验
- **多样化模板**支持一键切换
- **智能 AI 辅助**优化简历内容
- **高质量 PDF 导出**满足投递需求
- **在线分享**实现便捷传播

### 1.2 目标用户

- **主要用户**: 求职者、应届毕业生、职场人士
- **使用场景**: 制作简历、更新简历、导出简历、在线分享
- **核心需求**: 简单易用、美观大方、专业规范、快速导出

### 1.3 核心价值

1. **降低制作门槛** - 无需设计和排版技能
2. **提升简历质量** - 专业模板+AI 优化
3. **节省时间成本** - 快速编辑和导出
4. **提高投递效率** - 多版本管理+在线分享

---

## 二、功能需求

### 2.1 用户认证与管理

#### 2.1.1 用户注册

**功能描述**: 支持多种注册方式

- **手机号注册**: 手机号+验证码
- **邮箱注册**: 邮箱+密码
- **第三方登录**: 微信、QQ、GitHub 等

**业务规则**:

- 手机号/邮箱唯一性校验
- 密码强度要求：8-20 位，包含字母数字
- 验证码有效期：5 分钟
- 注册成功自动登录

**接口定义**:

```typescript
POST /api/auth/register
Request: {
  type: 'phone' | 'email' | 'oauth',
  phone?: string,
  email?: string,
  password: string,
  code?: string,
  oauthToken?: string
}
Response: {
  code: number,
  message: string,
  data: {
    userId: number,
    token: string,
    username: string
  }
}
```

#### 2.1.2 用户登录

**功能描述**: 灵活的登录方式

- 账号密码登录
- 手机号验证码登录
- 第三方快捷登录
- 记住登录状态（7 天）

**业务规则**:

- 连续 5 次登录失败锁定账号 30 分钟
- Token 有效期 24 小时，可刷新
- 支持多端登录互踢策略可配置

**接口定义**:

```typescript
POST /api/auth/login
Request: {
  username: string,
  password: string,
  remember?: boolean
}
Response: {
  code: number,
  message: string,
  data: {
    userId: number,
    token: string,
    username: string,
    email: string,
    avatar?: string
  }
}
```

#### 2.1.3 用户个人中心

**功能描述**: 用户信息管理

- 查看个人资料
- 修改头像
- 修改密码
- 绑定/解绑手机/邮箱
- 注销账号

**页面路由**: `/profile`

---

### 2.2 模板管理

#### 2.2.1 模板浏览

**功能描述**: 用户可以浏览所有可用简历模板

**展示内容**:

- 模板缩略图（预览图）
- 模板名称
- 模板分类（单栏/双栏/三栏）
- 模板风格（现代/经典/简约）
- 使用次数
- 推荐标签

**筛选条件**:

- 按分类筛选
- 按风格筛选
- 按颜色筛选
- 按行业筛选（互联网/金融/教育等）

**接口定义**:

```typescript
GET /api/templates
Query: {
  page: number,
  limit: number,
  category?: string,
  style?: string,
  industry?: string
}
Response: {
  code: number,
  message: string,
  data: {
    list: Template[],
    total: number,
    page: number,
    limit: number
  }
}
```

#### 2.2.2 模板预览

**功能描述**: 点击模板查看详细预览

**预览功能**:

- 全尺寸预览
- 放大/缩小
- 模板详情说明
- 适用场景介绍
- 使用该模板案例展示

**操作**:

- 使用此模板（创建新简历）
- 收藏模板
- 分享模板

#### 2.2.3 模板切换

**功能描述**: 编辑过程中切换模板

**业务规则**:

- 切换前提示保存
- 内容数据保留（智能映射）
- 不兼容字段提示用户
- 支持撤销切换

---

### 2.3 简历编辑器

#### 2.3.1 编辑器整体布局

**三栏布局**:

```
+------------------+------------------+------------------+
|   左侧工具栏      |   中间预览区      |   右侧编辑面板     |
|   (200-300px)    |   (600-800px)    |   (300-400px)    |
+------------------+------------------+------------------+
```

**左侧工具栏**:

- 模块列表（可拖拽排序）
- 添加模块按钮
- 删除模块按钮
- 显示/隐藏模块
- 模块配置快捷入口

**中间预览区**:

- 所见即所得预览
- 缩放控制（50%-200%）
- 对齐辅助线
- 模块选中高亮
- 实时渲染

**右侧编辑面板**:

- 根据选中模块动态切换
- 字段编辑表单
- 样式调整选项
- AI 辅助功能入口

#### 2.3.2 支持的简历模块

##### 2.3.2.1 基础信息模块 (basic)

**必填字段**:

- 姓名 (name)
- 求职意向 (title)
- 手机号 (phone)
- 邮箱 (email)

**可选字段**:

- 性别 (gender)
- 年龄 (age) / 出生日期 (birthday)
- 工作年限 (yearsOfExperience)
- 现居地 (location)
- 头像 (avatar)
- 个人网站 (website)
- GitHub (github)
- LinkedIn (linkedin)

**布局选项**:

- flexible: 灵活布局（推荐）
- center: 居中布局
- table: 表格布局
- card: 卡片布局

**字段配置**:

```json
{
  "type": "basic",
  "config": {
    "layout": "flexible",
    "showTitle": false,
    "fields": {
      "visible": ["name", "title", "phone", "email", "gender", "age"],
      "order": ["name", "title", "gender", "age", "phone", "email"],
      "labels": {
        "name": "姓名",
        "title": "求职意向",
        "phone": "联系电话"
      }
    }
  }
}
```

##### 2.3.2.2 教育经历模块 (education)

**字段**:

- 学校名称 (school) \*
- 学历 (degree) \*
- 专业 (major) \*
- 在校时间 (startDate - endDate) \*
- 主要课程 (courses)
- 成绩排名 (gpa)
- 学习描述 (description)

**支持多条记录**: 是
**排序**: 按时间倒序
**布局**: timeline（时间线）/ simple（简单列表）

##### 2.3.2.3 工作经历模块 (experience)

**字段**:

- 公司名称 (company) \*
- 职位 (position) \*
- 工作时间 (startDate - endDate) \*
- 工作内容 (description) \*
- 工作成果 (achievements)

**支持多条记录**: 是
**排序**: 按时间倒序
**富文本**: description 和 achievements 支持富文本

##### 2.3.2.4 项目经验模块 (projects)

**字段**:

- 项目名称 (name) \*
- 项目角色 (role) \*
- 项目时间 (startDate - endDate) \*
- 项目描述 (description) \*
- 技术栈 (techStack)
- 项目成果 (achievements)
- 项目链接 (link)

**支持多条记录**: 是
**技术栈**: 支持标签形式展示

##### 2.3.2.5 技能特长模块 (skills)

**字段**:

- 技能名称 (name) \*
- 熟练度 (level): 精通/熟练/了解
- 技能描述 (description)

**展示方式**:

- 标签云
- 进度条
- 列表

**分类**:

- 编程语言
- 框架工具
- 语言能力
- 其他技能

##### 2.3.2.6 实习经历模块 (internship)

**字段**: 同工作经历
**标注**: 自动添加"实习"标签

##### 2.3.2.7 校园经历模块 (campus)

**字段**:

- 组织名称 (organization) \*
- 担任职位 (position) \*
- 时间 (startDate - endDate) \*
- 职责描述 (description)

##### 2.3.2.8 荣誉奖项模块 (awards)

**字段**:

- 奖项名称 (name) \*
- 获奖时间 (date) \*
- 颁发机构 (issuer)
- 奖项描述 (description)

##### 2.3.2.9 自我评价模块 (summary)

**字段**:

- 评价内容 (text) \*

**编辑器**: 富文本编辑器
**AI 辅助**: 支持 AI 生成和优化

##### 2.3.2.10 自定义模块 (custom)

**功能**: 用户自定义模块类型和内容
**字段**: 完全自定义
**用途**: 满足特殊需求（如作品集、证书等）

#### 2.3.3 编辑操作

**基础操作**:

- 添加模块
- 删除模块
- 复制模块
- 移动模块（拖拽排序）
- 显示/隐藏模块

**条目操作**（对于包含多条记录的模块）:

- 添加条目
- 删除条目
- 编辑条目
- 条目排序

**文本编辑**:

- 富文本编辑器（支持加粗、斜体、下划线、列表）
- 字数统计
- 实时保存

**样式调整**:

- 字体选择
- 字号调整
- 颜色设置
- 行距设置
- 页边距设置

#### 2.3.4 实时预览

**功能描述**: 编辑内容实时反映在预览区

**技术要求**:

- 去抖动保存（800ms）
- 增量更新（只更新变化部分）
- 预览缩放（50%-200%）
- 页面分页预览
- 打印预览

#### 2.3.5 自动保存

**功能描述**: 编辑内容自动保存到云端

**保存策略**:

- 输入去抖 800ms 后触发
- 每 30 秒强制保存一次
- 关闭页面前保存
- 失败重试（最多 3 次）
- 离线队列（网络恢复后同步）

**本地缓存**:

- IndexedDB 存储编辑中简历
- 网络异常时使用缓存
- 缓存有效期 7 天

---

### 2.4 AI 辅助功能

#### 2.4.1 AI 内容生成

**功能描述**: 根据关键词生成简历内容

**支持模块**:

- 工作描述生成
- 项目经验生成
- 自我评价生成

**使用流程**:

1. 用户输入关键信息（公司、职位、主要工作等）
2. 点击"AI 生成"按钮
3. AI 生成内容
4. 用户可以接受、修改或重新生成

**接口定义**:

```typescript
POST /api/ai/generate
Request: {
  type: 'experience' | 'project' | 'summary',
  keywords: {
    company?: string,
    position?: string,
    duration?: string,
    mainWork?: string[]
  },
  length: 'short' | 'medium' | 'long'
}
Response: {
  code: number,
  message: string,
  data: {
    content: string,
    suggestions: string[]
  }
}
```

#### 2.4.2 AI 内容优化

**功能描述**: 优化已有内容，使其更专业

**优化维度**:

- 语言表达优化
- 结构调整
- 关键词突出
- 错别字修正
- 语气专业化

**使用流程**:

1. 选中要优化的内容
2. 点击"AI 优化"按钮
3. AI 返回优化后的内容
4. 用户确认或拒绝

**接口定义**:

```typescript
POST /api/ai/polish
Request: {
  content: string,
  type: 'experience' | 'project' | 'summary',
  style: 'professional' | 'concise' | 'detailed'
}
Response: {
  code: number,
  message: string,
  data: {
    original: string,
    polished: string,
    changes: Array<{
      type: 'add' | 'remove' | 'modify',
      content: string,
      reason: string
    }>
  }
}
```

#### 2.4.3 AI 智能匹配

**功能描述**: 根据求职意向推荐内容调整建议

**分析维度**:

- 关键技能匹配度
- 经验相关性
- 内容完整度
- 格式规范性

**输出建议**:

- 添加缺失的技能
- 突出相关经验
- 调整模块顺序
- 优化描述重点

---

### 2.5 简历管理

#### 2.5.1 简历列表

**功能描述**: 展示用户创建的所有简历

**展示信息**:

- 简历标题
- 使用的模板
- 创建时间
- 最后修改时间
- 简历缩略图
- 状态（编辑中/已完成）

**操作**:

- 编辑简历
- 复制简历
- 重命名简历
- 删除简历（软删除）
- 设置为主简历

**排序**:

- 按修改时间
- 按创建时间
- 按标题

**分页**: 每页显示 12 个

**接口定义**:

```typescript
GET /api/resumes
Query: {
  userId: number,
  page: number,
  limit: number,
  orderBy?: 'createTime' | 'updateTime' | 'title'
}
Response: {
  code: number,
  message: string,
  data: {
    list: Resume[],
    total: number,
    page: number,
    limit: number
  }
}
```

#### 2.5.2 简历版本管理

**功能描述**: 记录简历修改历史，支持版本回退

**版本信息**:

- 版本号（自动递增）
- 修改时间
- 修改内容摘要
- 版本快照

**操作**:

- 查看历史版本
- 对比版本差异
- 恢复到某个版本

**保留策略**:

- 最近 30 天的所有版本
- 30 天前每周保留一个版本
- 总计保留 50 个版本

---

### 2.6 导出与分享

#### 2.6.1 PDF 导出

**功能描述**: 将简历导出为高质量 PDF 文件

**导出方式**:

- **客户端导出**: html2canvas + jsPDF（快速）
- **服务端导出**: Puppeteer 渲染（高质量）

**导出选项**:

- 纸张大小：A4 / Letter
- 页边距：窄/标准/宽
- 颜色模式：彩色/黑白
- 水印：添加/不添加

**技术要求**:

- DPI >= 300
- 字体嵌入
- 图片压缩
- 分页优化（避免内容截断）

**接口定义**:

```typescript
POST /api/resumes/export
Request: {
  resumeId: string,
  format: 'pdf' | 'png' | 'jpg',
  options: {
    paperSize: 'A4' | 'Letter',
    margin: 'narrow' | 'normal' | 'wide',
    colorMode: 'color' | 'grayscale',
    watermark: boolean
  }
}
Response: {
  code: number,
  message: string,
  data: {
    url: string,
    expireAt: string
  }
}
```

#### 2.6.2 图片导出

**功能描述**: 导出为 PNG/JPG 图片

**使用场景**:

- 社交媒体分享
- 邮件附件
- 在线预览

**技术方案**: html2canvas

#### 2.6.3 在线分享

**功能描述**: 生成分享链接，他人可在线查看

**分享选项**:

- 公开分享（任何人可访问）
- 密码保护
- 有效期设置（7 天/30 天/永久）
- 允许下载/仅预览

**分享链接格式**:

```
https://resume.example.com/share/{shareId}?pwd={password}
```

**接口定义**:

```typescript
POST /api/resumes/{id}/share
Request: {
  accessType: 'public' | 'password',
  password?: string,
  expireDays: number,
  allowDownload: boolean
}
Response: {
  code: number,
  message: string,
  data: {
    shareId: string,
    shareUrl: string,
    expireAt: string
  }
}
```

#### 2.6.4 打印

**功能描述**: 直接打印简历

**打印优化**:

- 专用打印 CSS
- 分页符控制
- 页眉页脚移除
- 背景色处理
- 字体大小调整

---

### 2.7 用户引导

#### 2.7.1 新手引导

**触发条件**: 首次使用编辑器

**引导内容**:

1. 欢迎页（介绍主要功能）
2. 模板选择提示
3. 编辑器功能介绍
4. 保存和导出指引

**实现方式**: Driver.js 或自定义蒙层引导

#### 2.7.2 空状态提示

**场景**:

- 无简历时：引导创建第一份简历
- 模块为空时：提示添加内容
- 搜索无结果：提示调整搜索条件

#### 2.7.3 操作提示

**场景**:

- 删除确认
- 切换模板提示
- 导出前检查（必填项）
- 网络异常提示
- 保存失败提示

---

## 三、非功能需求

### 3.1 性能要求

#### 3.1.1 加载性能

- 首屏加载时间 < 2 秒
- 路由切换 < 500ms
- 编辑器打开 < 1 秒

#### 3.1.2 响应性能

- 输入响应 < 100ms
- 预览更新 < 300ms（去抖后）
- 保存响应 < 1 秒

#### 3.1.3 导出性能

- 客户端 PDF 导出 < 5 秒
- 服务端 PDF 导出 < 10 秒
- 图片导出 < 3 秒

### 3.2 兼容性要求

#### 3.2.1 浏览器兼容

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

#### 3.2.2 设备兼容

- 桌面端（主要）
- 平板端（基础支持）
- 移动端（响应式，功能受限）

### 3.3 安全性要求

#### 3.3.1 认证安全

- HTTPS 传输
- Token 加密存储
- XSS 防护
- CSRF 防护

#### 3.3.2 数据安全

- 密码 BCrypt 加密
- 敏感信息脱敏
- 数据备份策略
- 删除数据可恢复（30 天内）

#### 3.3.3 权限控制

- 只能操作自己的简历
- API 请求鉴权
- 敏感操作二次确认

### 3.4 可用性要求

#### 3.4.1 系统可用性

- 服务可用性 >= 99.9%
- 故障恢复时间 < 1 小时

#### 3.4.2 数据可靠性

- 数据不丢失
- 自动保存机制
- 本地缓存备份

### 3.5 可维护性要求

#### 3.5.1 代码质量

- TypeScript 类型覆盖率 >= 90%
- 代码注释覆盖率 >= 30%
- 组件化、模块化开发
- 遵循 ESLint 规范

#### 3.5.2 日志与监控

- 错误日志收集（Sentry）
- 用户行为埋点
- 性能监控（LCP/FID/CLS）
- API 调用监控

---

## 四、技术实现

### 4.1 技术栈

| 类别         | 技术选型               | 版本   |
| ------------ | ---------------------- | ------ |
| 框架         | Vue 3                  | ^3.3.0 |
| 语言         | TypeScript             | ^5.0.0 |
| 构建工具     | Vite                   | ^5.0.0 |
| 状态管理     | Pinia                  | ^2.1.0 |
| 路由         | Vue Router             | ^4.2.0 |
| UI 组件库    | Element Plus           | ^2.4.0 |
| HTTP 客户端  | Axios                  | ^1.6.0 |
| 富文本编辑器 | Tiptap                 | ^2.1.0 |
| 拖拽排序     | VueDraggable           | ^4.1.0 |
| PDF 生成     | jsPDF + html2canvas    | -      |
| 工具库       | VueUse, Lodash, Day.js | -      |

### 4.2 项目结构

```
fronted-resume-web/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口
│   │   ├── auth.ts
│   │   ├── resume.ts
│   │   ├── template.ts
│   │   └── ai.ts
│   ├── assets/            # 资源文件
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/
│   ├── components/        # 组件
│   │   ├── common/        # 通用组件
│   │   ├── editor/        # 编辑器组件
│   │   ├── form/          # 表单组件
│   │   └── resume/        # 简历渲染组件
│   ├── composables/       # 组合式函数
│   │   ├── useAuth.ts
│   │   ├── useResume.ts
│   │   └── useAutoSave.ts
│   ├── config/            # 配置文件
│   │   ├── constants.ts
│   │   └── personalFields.ts
│   ├── layouts/           # 布局组件
│   │   ├── DefaultLayout.vue
│   │   └── EditorLayout.vue
│   ├── router/            # 路由配置
│   │   └── index.ts
│   ├── store/             # 状态管理
│   │   ├── auth.ts
│   │   ├── resume.ts
│   │   └── template.ts
│   ├── styles/            # 样式文件
│   │   ├── index.css
│   │   ├── variables.css
│   │   └── print.css
│   ├── types/             # 类型定义
│   │   ├── api.ts
│   │   ├── resume.ts
│   │   └── template.ts
│   ├── utils/             # 工具函数
│   │   ├── request.ts
│   │   ├── export.ts
│   │   ├── validation.ts
│   │   └── format.ts
│   ├── views/             # 页面组件
│   │   ├── Login.vue
│   │   ├── Templates.vue
│   │   ├── Resumes.vue
│   │   ├── Editor.vue
│   │   └── Preview.vue
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 4.3 核心模块设计

#### 4.3.1 渲染引擎

**职责**: 将简历数据渲染为可视化界面

**架构**:

```
ResumeRenderer
├── StyleInjector (样式注入)
├── LayoutManager (布局管理)
└── GenericSection (模块渲染)
    ├── BasicRenderer (个人信息)
    ├── EducationRenderer (教育经历)
    ├── ExperienceRenderer (工作经历)
    └── ... (其他渲染器)
```

**特性**:

- 模块类型自动映射
- 模板适配器（兼容旧格式）
- 配置智能适配
- 降级渲染机制

#### 4.3.2 编辑器引擎

**职责**: 提供简历编辑能力

**组件**:

- `ModuleListEditor`: 模块列表管理
- `SectionEditor`: 模块内容编辑
- `StylePanel`: 样式调整面板
- `RichTextEditor`: 富文本编辑器

**数据流**:

```
用户输入 → 编辑器组件 → Store → 渲染引擎 → 预览更新
              ↓
           自动保存 → API
```

#### 4.3.3 导出引擎

**职责**: 将简历导出为各种格式

**客户端导出**:

```typescript
async function exportToPDF(element: HTMLElement) {
  // 1. 使用html2canvas截图
  const canvas = await html2canvas(element, options);

  // 2. 使用jsPDF生成PDF
  const pdf = new jsPDF();
  pdf.addImage(canvas.toDataURL(), "PNG", 0, 0);

  // 3. 保存文件
  pdf.save("resume.pdf");
}
```

**服务端导出**:

```typescript
// API调用后端Puppeteer服务
POST /api/resumes/export
// 后端返回PDF下载链接
```

### 4.4 状态管理

#### 4.4.1 Store 结构

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoggedIn: false
  }),
  actions: {
    login(credentials),
    logout(),
    refreshToken()
  }
})

// stores/resume.ts
export const useResumeStore = defineStore('resume', {
  state: () => ({
    currentResume: null,
    resumeList: [],
    isEditing: false,
    isDirty: false
  }),
  actions: {
    loadResume(id),
    saveResume(),
    updateField(path, value),
    addSection(type),
    deleteSection(id)
  }
})

// stores/template.ts
export const useTemplateStore = defineStore('template', {
  state: () => ({
    currentTemplate: null,
    templateList: [],
    categories: []
  }),
  actions: {
    loadTemplates(),
    selectTemplate(id),
    switchTemplate(id)
  }
})
```

### 4.5 路由设计

```typescript
const routes = [
  {
    path: "/",
    redirect: "/templates",
  },
  {
    path: "/login",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/templates",
    component: () => import("@/views/Templates.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/resumes",
    component: () => import("@/views/Resumes.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/editor/:id?",
    component: () => import("@/views/Editor.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/preview/:id",
    component: () => import("@/views/Preview.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/share/:shareId",
    component: () => import("@/views/Share.vue"),
    meta: { requiresAuth: false },
  },
];
```

---

## 五、数据模型

### 5.1 简历数据结构

```typescript
interface Resume {
  id: string;
  userId: number;
  title: string;
  templateId: string;
  content: ResumeContent;
  createTime: string;
  updateTime: string;
  status: "draft" | "completed";
  version: number;
}

interface ResumeContent {
  profile: {
    basic: BasicInfo;
  };
  sections: ResumeSection[];
}

interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  order: number;
  items: any[];
  config: SectionConfig;
  data: any;
}

type SectionType =
  | "basic"
  | "intention"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "internship"
  | "campus"
  | "awards"
  | "summary"
  | "custom";
```

### 5.2 模板数据结构

```typescript
interface Template {
  id: string;
  templateName: string;
  templateType: "single-column" | "two-column" | "three-column";
  category: string;
  style: string;
  industry: string[];
  previewImage: string;
  theme: TemplateTheme;
  layout: LayoutConfig;
  sectionStyles: Record<string, SectionStyle>;
  customCss?: string;
  useCount: number;
  createTime: string;
}

interface TemplateTheme {
  colors: {
    primary: string;
    secondary?: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    background: string;
    border: string;
  };
  typography: {
    fontFamily: {
      body: string;
      heading: string;
    };
  };
  spacing: {
    unit: string;
    sectionMargin: string;
  };
}
```

---

## 六、接口规范

### 6.1 通用规范

#### 6.1.1 请求格式

- Content-Type: application/json
- Authorization: Bearer {token}

#### 6.1.2 响应格式

```typescript
interface ApiResponse<T = any> {
  code: number; // 200:成功, 4xx:客户端错误, 5xx:服务端错误
  message: string; // 提示信息
  data: T; // 响应数据
}

interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}
```

#### 6.1.3 错误码

| 错误码 | 说明                |
| ------ | ------------------- |
| 200    | 成功                |
| 400    | 请求参数错误        |
| 401    | 未登录或 Token 过期 |
| 403    | 无权限访问          |
| 404    | 资源不存在          |
| 500    | 服务器错误          |
| 1001   | 用户名或密码错误    |
| 1002   | 验证码错误          |
| 2001   | 简历不存在          |
| 2002   | 模板不存在          |
| 3001   | AI 服务调用失败     |

### 6.2 核心接口清单

#### 6.2.1 认证接口

| 接口         | 方法 | 路径               | 说明             |
| ------------ | ---- | ------------------ | ---------------- |
| 注册         | POST | /api/auth/register | 用户注册         |
| 登录         | POST | /api/auth/login    | 用户登录         |
| 登出         | POST | /api/auth/logout   | 用户登出         |
| 刷新 Token   | POST | /api/auth/refresh  | 刷新 Token       |
| 获取用户信息 | GET  | /api/auth/me       | 获取当前用户信息 |

#### 6.2.2 模板接口

| 接口     | 方法 | 路径                      | 说明         |
| -------- | ---- | ------------------------- | ------------ |
| 模板列表 | GET  | /api/templates            | 获取模板列表 |
| 模板详情 | GET  | /api/templates/:id        | 获取模板详情 |
| 模板分类 | GET  | /api/templates/categories | 获取模板分类 |

#### 6.2.3 简历接口

| 接口     | 方法   | 路径                    | 说明           |
| -------- | ------ | ----------------------- | -------------- |
| 创建简历 | POST   | /api/resumes            | 创建新简历     |
| 简历列表 | GET    | /api/resumes            | 获取简历列表   |
| 简历详情 | GET    | /api/resumes/:id        | 获取简历详情   |
| 更新简历 | PUT    | /api/resumes/:id        | 更新简历       |
| 删除简历 | DELETE | /api/resumes/:id        | 删除简历       |
| 复制简历 | POST   | /api/resumes/:id/copy   | 复制简历       |
| 导出简历 | POST   | /api/resumes/:id/export | 导出简历       |
| 分享简历 | POST   | /api/resumes/:id/share  | 生成分享链接   |
| 查看分享 | GET    | /api/share/:shareId     | 查看分享的简历 |

#### 6.2.4 AI 接口

| 接口    | 方法 | 路径             | 说明        |
| ------- | ---- | ---------------- | ----------- |
| AI 生成 | POST | /api/ai/generate | AI 生成内容 |
| AI 优化 | POST | /api/ai/polish   | AI 优化内容 |
| AI 建议 | POST | /api/ai/suggest  | AI 提供建议 |

---

## 七、部署方案

### 7.1 开发环境

- Node.js >= 18.0.0
- npm >= 9.0.0
- 本地开发服务器：`npm run dev`
- 热更新、Source Map 支持

### 7.2 构建配置

```bash
# 开发环境构建
npm run build:dev

# 预发布环境构建
npm run build:stage

# 生产环境构建
npm run build:prod
```

### 7.3 生产部署

**静态资源托管**:

- CDN：阿里云 OSS / 腾讯云 COS
- Gzip 压缩
- Brotli 压缩
- HTTP/2 支持

**Nginx 配置示例**:

```nginx
server {
    listen 80;
    server_name resume.example.com;

    # HTTPS重定向
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name resume.example.com;

    # SSL证书
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 静态文件根目录
    root /var/www/fronted-resume-web/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://backend-server:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.4 监控与日志

- **错误监控**: Sentry
- **性能监控**: Google Analytics, 自建埋点
- **日志收集**: 前端日志上报到服务端

---

## 八、测试计划

### 8.1 单元测试

- 工具: Vitest
- 覆盖率要求: >= 70%
- 测试对象: 工具函数、Store、Composables

### 8.2 组件测试

- 工具: Vue Test Utils + Vitest
- 覆盖主要组件

### 8.3 E2E 测试

- 工具: Playwright / Cypress
- 覆盖关键流程:
  - 注册登录流程
  - 创建编辑流程
  - 导出分享流程

### 8.4 性能测试

- 工具: Lighthouse, WebPageTest
- 指标:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

---

## 九、项目排期

### 9.1 第一阶段：基础功能（4 周）

- Week 1: 项目搭建、认证模块
- Week 2: 模板管理、简历列表
- Week 3: 编辑器核心功能
- Week 4: 预览和基础导出

### 9.2 第二阶段：高级功能（3 周）

- Week 5: AI 辅助功能
- Week 6: 导出优化、分享功能
- Week 7: 版本管理、细节优化

### 9.3 第三阶段：测试与上线（2 周）

- Week 8: 测试、修复 Bug
- Week 9: 部署、监控、文档

---

## 十、附录

### 10.1 参考资料

- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://vitejs.dev/)

### 10.2 相关文档

- 《渲染引擎使用指南》
- 《渲染引擎修复说明》
- 《API 接口文档》

### 10.3 变更记录

| 版本 | 日期       | 变更内容 | 变更人       |
| ---- | ---------- | -------- | ------------ |
| v1.0 | 2026-01-12 | 初始版本 | AI Assistant |

---

**文档结束**
