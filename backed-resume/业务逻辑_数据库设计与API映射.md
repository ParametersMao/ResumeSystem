# 简历系统（用户端/后台端）业务逻辑、数据库设计与 API 映射

## 一、系统角色与总体业务

- **用户端（C 端）**: 小程序/前台用户，使用模板创建/编辑/导出简历，触发 AI 能力（润色/生成），形成下载与使用记录。
- **后台管理端（中台）**: 平台管理员登录后，管理后台用户、C 端用户、模板；查看 AI 使用情况与关键运营统计。

## 二、数据库表结构

> 以实体与 `database/init.sql` 为准，字段名采用数据库列名。

### 1. c_users（C 端用户）

- id INT PK AI
- username VARCHAR(255) NOT NULL
- password VARCHAR(255) NOT NULL
- email VARCHAR(255)
- phone VARCHAR(20) UNIQUE 可空
- status TINYINT DEFAULT 1
- create_time DATETIME
- update_time DATETIME
- ai_operation_count INT DEFAULT 0

用途：存储用户端账号及状态、AI 使用计数。

### 2. admin_users（后台用户）

- id INT PK AI
- username VARCHAR(255) UNIQUE NOT NULL
- password VARCHAR(255) NOT NULL
- user_type VARCHAR(20) NOT NULL（实体中字段名 `role`）
- status TINYINT DEFAULT 1
- create_time DATETIME
- update_time DATETIME

用途：后台管理端登录、权限（admin/operator/viewer）。

### 3. templates（模板）

- id INT PK AI
- template_name VARCHAR(255) NOT NULL（实体字段 `templateName`）
- template_data TEXT NOT NULL（实体字段 `templateData`）
- preview_image VARCHAR(255) / 实体为 LONGTEXT（以迁移结果为准，现实体为 longtext）
- description VARCHAR(255) 可空（实体存在）
- status BOOLEAN/ TINYINT（实体为 boolean）
- create_time DATETIME
- update_time DATETIME
- use_count INT DEFAULT 0
- download_count INT DEFAULT 0

用途：简历模板存储、统计使用与下载。

### 4. ai_operations（AI 操作记录）

- id INT PK AI
- user_id INT NOT NULL（关联 c_users.id）
- operation_type VARCHAR(20) NOT NULL（polish/generate）
- input_data TEXT 可空
- output_data TEXT 可空
- create_time DATETIME
- token_used INT DEFAULT 0

用途：记录 AI 调用的类型/输入/输出与 token 消耗。

### 5. template_usage（模板使用记录）

- id INT PK AI
- user_id INT NOT NULL（关联 c_users.id）
- template_id INT NOT NULL（关联 templates.id）
- usage_type VARCHAR(20) NOT NULL
- create_time DATETIME

用途：记录模板被使用的行为，如预览、编辑、应用。

### 6. resume_downloads（简历下载记录）

- id INT PK AI
- user_id INT NOT NULL（关联 c_users.id）
- template_id INT NOT NULL（关联 templates.id）
- download_time DATETIME

用途：记录导出/下载行为，用于统计下载数。

### 7. statistics（统计快照）

- id INT PK AI
- statistic_type VARCHAR(50) NOT NULL
- statistic_data TEXT NOT NULL（JSON 字符串）
- create_time DATETIME

用途：可存放预计算统计数据快照。

索引：见 `database/init.sql`（对用户名、手机号、模板名、外键与时间列建立索引）。

## 三、模块与核心业务流程

### A. 认证（后台端）

- 登录：`POST /api/auth/login`
  - 通过 `AuthService.validateUser` 使用 `AdminUsersService.findByUsername` 查询用户，`bcrypt.compare` 校验密码；禁用用户拒绝登录。
  - 成功返回 JWT `access_token` 与简要用户信息。
- 获取当前用户：`GET /api/auth/profile`（JWT）
  - 通过 `JwtAuthGuard` 校验，`authService.getProfile` 返回后台用户资料（不含密码）。

### B. 后台用户管理（admin_users）

- 列表：`GET /api/admin/users`（分页）
- 新增：`POST /api/admin/users`（用户名唯一，密码加密）
- 编辑：`PUT /api/admin/users/:id`（用户名冲突检测，密码变更加密）
- 状态：`PATCH /api/admin/users/:id/status`（0/1）
- 删除：`DELETE /api/admin/users/:id`

数据映射：接口响应遵循统一格式与分页结构（见下文）。

### C. C 端用户管理（c_users）

- 列表：`GET /api/cusers`（分页）
- 新增：`POST /api/cusers`（用户名、手机号唯一校验，密码加密）
- 编辑：`PUT /api/cusers/:id`（用户名与手机号冲突校验，密码变更加密）
- 状态：`PATCH /api/cusers/:id/status`
- 删除：`DELETE /api/cusers/:id`

扩展能力：`CUsersService.incrementAiOperationCount(id)` 用于沉淀 AI 使用计数（当前未在 AI 创建处自动调用）。

### D. 模板管理（templates）

- 列表检索：`GET /api/templates`（分页+名称/描述模糊+状态精准）
- 新增：`POST /api/templates`
- 编辑：`PUT /api/templates/:id`
- 删除：`DELETE /api/templates/:id`

计数接口：`TemplatesService.incrementUseCount` 与 `incrementDownloadCount` 暴露累加器（当前未在外部流程自动调用）。

### E. AI 操作记录（ai_operations）

- 列表：`GET /api/ai-operations`（分页，可按 userId / operationType 过滤）
- 详情：`GET /api/ai-operations/:id`
- 新增：`POST /api/ai-operations`
- 删除：`DELETE /api/ai-operations/:id`
- 统计：`GET /api/ai-operations/statistics/overview`（总次数、各类型次数、token 总和）

注意：新增记录时并未自动同步 `c_users.ai_operation_count`，如需同步可在 Service 里串联 `CUsersService.incrementAiOperationCount`。

### F. 统计（statistics + 业务表聚合）

- 概览：`GET /api/statistics/overview`（用户数、模板数、AI 次数、下载数、使用记录数）
- 趋势：`GET /api/statistics/trend?period=day|week|month`（按天聚合的新增用户、AI 次数、下载次数）
- 热门模板：`GET /api/statistics/popular-templates`（按使用与下载排序）
- 用户活跃度：`GET /api/statistics/user-activity`（按 `ai_operation_count` 排序）

### G. 简历导出（导出+云存储）

- 导出 PDF：`POST /resumes/export`，入参 `html`
  - 使用 `puppeteer` 渲染为 PDF；若配置 Aliyun OSS（`OSS_REGION`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`、`OSS_BUCKET`）则上传返回 URL，否则返回 base64。
  - 当前未写入 `resume_downloads` 记录，未累加模板 `download_count`，如需统计需扩展：
    - 入参增加 `userId`、`templateId`；导出成功后写入 `resume_downloads`，并调用 `TemplatesService.incrementDownloadCount(templateId)`。

## 四、统一 API 响应与分页约定

- 标准响应：`{ code: 200, message: 'success', data: T }`
- 分页响应：`{ code: 200, message: 'success', data: { list, total, page, limit } }`
- 错误码：`400/401/403/404/409/500`

## 五、用户端与后台端视角业务串联

### 用户端（C 端）典型路径

1. 注册/登录（当前登录接口由后台用户承担，C 端登录逻辑尚未实现）
2. 浏览模板：调用 `GET /api/templates`；预览/编辑时可记录 `template_usage`
3. AI 功能：调用 `POST /api/ai-operations`；可选择在服务层联动 `c_users.ai_operation_count += 1`
4. 导出简历：调用 `POST /resumes/export`；建议扩展为写入下载记录并累加模板下载数

### 后台端典型路径

1. 登录后台：`POST /api/auth/login` → 获取 `access_token`
2. 查看概览与趋势：`GET /api/statistics/*`
3. 管理模板：`/api/templates` CRUD
4. 管理 C 端用户：`/api/cusers` CRUD/状态
5. 管理后台用户：`/api/admin/users` CRUD/状态
6. 审核/排查 AI 使用：`/api/ai-operations` 列表与详情

## 六、API → 表/实体映射总览

- `/api/auth/*` → `admin_users`（实体 `AdminUser`）
- `/api/admin/users/*` → `admin_users`（实体 `AdminUser`）
- `/api/cusers/*` → `c_users`（实体 `CUser`）
- `/api/templates/*` → `templates`（实体 `Template`）
- `/api/ai-operations/*` → `ai_operations`（实体 `AiOperation`，左联 `CUser`）
- `/api/statistics/*` → 聚合 `c_users`、`templates`、`ai_operations`、`resume_downloads`、`template_usage`、`statistics`
- `/resumes/export` → 与表无直接写入；可扩展关联 `resume_downloads` 与 `templates.download_count`

## 七、差异与注意点（代码与 SQL）

- `templates.preview_image`：实体为 `longtext`，`init.sql` 为 `VARCHAR(255)`；以最新迁移为准（仓库存在迁移：`1753255877061`、`1753256747327`）。
- `templates.description`、`status` 字段：实体已存在，`init.sql` 初始版本未列出 description/status 字段；以实体和迁移后的表为准。
- 统计接口字段命名采用下划线风格（如 `user_trend`），与实体字段风格（驼峰）并存。

## 八、后续可扩展建议

- C 端登录与鉴权模块（独立于后台用户）
- 在 AI 操作创建时原子性地自增用户 `ai_operation_count`
- 在模板被使用/导出时统一记录 `template_usage`/`resume_downloads` 并自增计数
- 将导出服务与模板计数打通，便于统计看板闭环
