# 简历中台系统 API接口文档 & 数据库表结构

## 目录

- [后台用户管理](#后台用户管理)
- [C端用户管理](#c端用户管理)
- [模板管理](#模板管理)
- [AI操作记录](#ai操作记录)
- [数据统计](#数据统计)
- [登录/权限](#登录权限)
- [通用响应结构](#通用响应结构)

---

## 后台用户管理

### 数据库表：`admin_user`

| 字段名     | 类型         | 说明         | 约束                          |
| ---------- | ------------ | ------------ | ----------------------------- |
| id         | bigint       | 主键         | PK, AUTO_INC                  |
| username   | varchar(50)  | 用户名       | UNIQUE, NOT NULL              |
| password   | varchar(100) | 密码（加密） | NOT NULL                      |
| email      | varchar(100) | 邮箱         |                               |
| phone      | varchar(20)  | 手机号       |                               |
| avatar     | varchar(255) | 头像         |                               |
| status     | enum         | 状态         | 'active', 'inactive'          |
| role       | enum         | 角色         | 'admin', 'operator', 'viewer' |
| created_at | datetime     | 创建时间     |                               |
| updated_at | datetime     | 更新时间     |                               |

### API接口

- `POST   /api/auth/login` 登录
- `GET    /api/admin/users` 获取用户列表
- `POST   /api/admin/users` 新增用户
- `PUT    /api/admin/users/{id}` 编辑用户
- `DELETE /api/admin/users/{id}` 删除用户
- `PATCH  /api/admin/users/{id}/status` 启用/禁用用户

---

## C端用户管理

### 数据库表：`c_user`

| 字段名        | 类型         | 说明         | 约束                      |
| ------------- | ------------ | ------------ | ------------------------- |
| id            | bigint       | 主键         | PK, AUTO_INC              |
| nickname      | varchar(50)  | 昵称         |                           |
| phone         | varchar(20)  | 手机号       | UNIQUE                    |
| email         | varchar(100) | 邮箱         |                           |
| avatar        | varchar(255) | 头像         |                           |
| gender        | enum         | 性别         | 'male', 'female', 'other' |
| status        | enum         | 状态         | 'active', 'inactive'      |
| register_at   | datetime     | 注册时间     |                           |
| last_login_at | datetime     | 最后登录时间 |                           |

### API接口

- `GET    /api/cusers` 获取C端用户列表
- `PATCH  /api/cusers/{id}/status` 启用/禁用用户
- `DELETE /api/cusers/{id}` 删除用户

---

## 模板管理

### 数据库表：`resume_template`

| 字段名        | 类型         | 说明         | 约束                 |
| ------------- | ------------ | ------------ | -------------------- |
| id            | bigint       | 主键         | PK, AUTO_INC         |
| name          | varchar(100) | 模板名称     | NOT NULL             |
| description   | varchar(255) | 描述         |                      |
| preview_image | varchar(255) | 预览图URL    |                      |
| template_data | text         | 模板JSON数据 |                      |
| status        | enum         | 状态         | 'active', 'inactive' |
| created_at    | datetime     | 创建时间     |                      |
| updated_at    | datetime     | 更新时间     |                      |

### API接口

- `GET    /api/templates` 获取模板列表
- `POST   /api/templates` 新增模板
- `PUT    /api/templates/{id}` 编辑模板
- `DELETE /api/templates/{id}` 删除模板
- `PATCH  /api/templates/{id}/status` 启用/禁用模板

---

## AI操作记录

### 数据库表：`ai_operation_log`

| 字段名          | 类型        | 说明         | 约束                              |
| --------------- | ----------- | ------------ | --------------------------------- |
| id              | bigint      | 主键         | PK, AUTO_INC                      |
| user_id         | bigint      | 用户ID       |                                   |
| username        | varchar(50) | 用户名       |                                   |
| operation_type  | enum        | 操作类型     | 'polish', 'generate'              |
| input_data      | text        | 输入数据     |                                   |
| output_data     | text        | 输出数据     |                                   |
| status          | enum        | 状态         | 'success', 'failed', 'processing' |
| processing_time | int         | 处理时长(ms) |                                   |
| created_at      | datetime    | 创建时间     |                                   |

### API接口

- `GET    /api/ai-operations` 获取AI操作记录
- `GET    /api/ai-operations/{id}` 查看操作详情
- `DELETE /api/ai-operations/{id}` 删除操作记录
- `GET    /api/ai-operations/export` 导出操作记录

---

## 数据统计

### 统计相关API

- `GET /api/statistics/overview` 数据概览（用户数、模板数、AI操作数等）
- `GET /api/statistics/trend` 趋势图表数据（按天/周/月）
- `GET /api/statistics/popular-templates` 热门模板排行
- `GET /api/statistics/user-activity` 用户活跃度排行

### 统计相关表（可选，视业务需求）

- `statistics_daily`（每日统计快照）
- `template_usage_log`（模板使用记录）

---

## 登录/权限

### API接口

- `POST   /api/auth/login` 登录
- `POST   /api/auth/logout` 退出登录
- `GET    /api/auth/profile` 获取当前登录用户信息
- `GET    /api/auth/permissions` 获取当前用户权限

---

## 通用响应结构

```json
{
  "code": 200,
  "message": "ok",
  "data": { ... }
}
```

- `code`：200为成功，其他为错误码
- `message`：提示信息
- `data`：返回数据

---

如需补充其他业务模块（如操作日志、系统设置等），或需要更详细的字段说明、索引设计等，请补充说明。
