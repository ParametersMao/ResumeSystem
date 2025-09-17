<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 简历中台系统后端

基于 NestJS 框架开发的简历中台系统后端 API。

## 功能模块

- **后台用户管理**: 管理员用户的增删改查
- **C端用户管理**: 小程序用户的增删改查
- **模板管理**: 简历模板的增删改查
- **AI操作记录**: AI功能的操作记录和统计
- **数据统计**: 系统数据概览和趋势分析
- **认证授权**: JWT 认证和权限控制

## 技术栈

- **框架**: NestJS
- **数据库**: MySQL
- **ORM**: TypeORM
- **认证**: JWT + Passport
- **验证**: class-validator
- **加密**: bcrypt

## 环境要求

- Node.js >= 18.19.0
- MySQL >= 5.7
- Redis (可选，用于缓存)

## 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `config.env` 文件为 `.env`，并修改数据库配置：

```bash
# Windows
copy config.env .env

# Linux/Mac
cp config.env .env
```

修改 `.env` 文件中的数据库配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=resume_system
```

### 3. 数据库初始化

在 MySQL 中执行 `database/init.sql` 脚本：

```bash
mysql -u root -p < database/init.sql
```

或者手动创建数据库和表结构。

### 4. 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run start:prod
```

服务将在 http://localhost:3000 启动。

## API 接口

### 认证相关

- `POST /api/auth/login` - 管理员登录
- `GET /api/auth/profile` - 获取当前用户信息

### 后台用户管理

- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 新增用户
- `PUT /api/admin/users/{id}` - 编辑用户
- `DELETE /api/admin/users/{id}` - 删除用户
- `PATCH /api/admin/users/{id}/status` - 启用/禁用用户

### C端用户管理

- `GET /api/cusers` - 获取C端用户列表
- `POST /api/cusers` - 新增C端用户
- `PUT /api/cusers/{id}` - 编辑C端用户
- `DELETE /api/cusers/{id}` - 删除C端用户
- `PATCH /api/cusers/{id}/status` - 启用/禁用C端用户

### 模板管理

- `GET /api/templates` - 获取模板列表
- `POST /api/templates` - 新增模板
- `PUT /api/templates/{id}` - 编辑模板
- `DELETE /api/templates/{id}` - 删除模板

### AI操作记录

- `GET /api/ai-operations` - 获取AI操作记录
- `GET /api/ai-operations/{id}` - 查看操作详情
- `POST /api/ai-operations` - 创建AI操作记录
- `DELETE /api/ai-operations/{id}` - 删除操作记录
- `GET /api/ai-operations/statistics/overview` - 获取AI操作统计

### 数据统计

- `GET /api/statistics/overview` - 数据概览
- `GET /api/statistics/trend` - 趋势图表数据
- `GET /api/statistics/popular-templates` - 热门模板排行
- `GET /api/statistics/user-activity` - 用户活跃度排行

## 默认管理员账户

- 用户名: `admin`
- 密码: `admin123`

## 项目结构

```
src/
├── entities/           # 数据库实体
├── modules/           # 功能模块
│   ├── admin-users/   # 后台用户管理
│   ├── auth/         # 认证模块
│   ├── c-users/      # C端用户管理
│   ├── templates/    # 模板管理
│   ├── ai-operations/ # AI操作记录
│   └── statistics/   # 数据统计
├── dto/              # 数据传输对象
├── common/           # 公共工具
├── database/         # 数据库脚本
└── src/              # 应用入口
```

## 开发说明

### 添加新模块

1. 在 `modules/` 目录下创建新模块目录
2. 创建 `*.module.ts`、`*.service.ts`、`*.controller.ts` 文件
3. 在 `app.module.ts` 中导入新模块

### 数据库迁移

项目使用 TypeORM 的 `synchronize` 功能，在开发环境中会自动同步数据库结构。生产环境请使用迁移功能。

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t resume-backend .

# 运行容器
docker run -p 3000:3000 resume-backend
```

### 生产环境配置

1. 设置 `NODE_ENV=production`
2. 关闭 `synchronize` 选项
3. 配置生产环境数据库
4. 设置强密码的 JWT_SECRET
5. 配置 HTTPS

## 许可证

MIT License

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
