# 简历中台系统前端

基于 Vue 3 + TypeScript + Element Plus 的现代化管理后台系统，为简历中台提供完整的前端解决方案。

## 🚀 技术栈

- **框架**: Vue 3 + TypeScript
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite
- **HTTP 客户端**: Axios
- **图表库**: ECharts
- **国际化**: Vue I18n
- **工具库**: VueUse, Day.js, Lodash

## 📦 项目结构

```
src/
├── api/                 # API 接口
├── assets/              # 静态资源
├── components/          # 公共组件
├── constants/           # 常量定义
├── hooks/               # 组合式函数
├── i18n/                # 国际化配置
├── layouts/             # 布局组件
├── router/              # 路由配置
├── store/               # 状态管理
├── styles/              # 全局样式
├── types/               # TypeScript 类型
├── utils/               # 工具函数
├── views/               # 页面组件
├── App.vue              # 根组件
└── main.ts              # 入口文件
```

## 🛠️ 开发环境

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 📋 功能模块

### 1. 用户管理
- 用户列表展示
- 用户信息编辑
- 用户状态管理
- 角色权限控制

### 2. 模板管理
- 简历模板列表
- 模板创建和编辑
- 模板预览功能
- 模板状态管理

### 3. 数据统计
- 数据概览仪表盘
- 趋势图表分析
- 用户活跃度排行
- 模板使用统计

### 4. AI 操作监控
- AI 操作记录
- 操作详情查看
- 性能监控
- 数据导出

## 🔧 配置说明

### 环境变量

创建 `.env.development` 和 `.env.production` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=简历中台系统
```

### API 配置

在 `src/utils/request.ts` 中配置 API 请求：

```typescript
const request = new RequestService()
```

### 路由配置

在 `src/router/index.ts` 中配置路由：

```typescript
const routes: RouteRecordRaw[] = [
  // 路由配置
]
```

## 🎨 主题定制

### 自定义主题色

在 `src/styles/variables.css` 中定义 CSS 变量：

```css
:root {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
}
```

### 暗色主题

系统支持明暗主题切换，在 `src/main.ts` 中引入暗色主题样式：

```typescript
import 'element-plus/theme-chalk/dark/css-vars.css'
```

## 📱 响应式设计

系统采用响应式设计，支持多种设备：

- 桌面端 (>= 1200px)
- 平板端 (768px - 1199px)
- 移动端 (< 768px)

## 🌍 国际化

支持中英文切换，配置文件位于 `src/i18n/index.ts`：

```typescript
const messages = {
  'zh-CN': { /* 中文 */ },
  'en-US': { /* 英文 */ }
}
```

## 🔒 权限控制

基于角色的访问控制 (RBAC)：

- 管理员 (admin): 所有权限
- 操作员 (operator): 部分管理权限
- 查看者 (viewer): 只读权限

## 📊 数据可视化

使用 ECharts 实现数据可视化：

- 折线图：趋势分析
- 饼图：占比统计
- 柱状图：数据对比

## 🚀 部署

### 构建

```bash
npm run build
```

### 部署到服务器

将 `dist` 目录下的文件部署到 Web 服务器。

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend-server;
    }
}
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱: support@example.com
- 项目地址: https://github.com/your-username/resume-middle-platform-frontend

## 🙏 致谢

感谢以下开源项目的支持：

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite](https://vitejs.dev/)
- [ECharts](https://echarts.apache.org/) 