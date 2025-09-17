# 简历中台系统 API 文档（生成版）

- 基础URL: `http://localhost:3000`
- Content-Type: `application/json`
- 认证方式: 后台端接口使用 JWT（部分统计与模板接口可按需要加保护）

## 通用响应

- 标准：`{ code: 200, message: 'success', data: T }`
- 分页：`{ code: 200, message: 'success', data: { list, total, page, limit } }`

错误码：400/401/403/404/409/500

---

## 1. 认证（后台端）

### 1.1 登录

- POST `/api/auth/login`
- Body：`{ username: string, password: string }`
- 200：`{ code, message: '登录成功', data: { access_token, user: { id, username, role } } }`

### 1.2 获取当前用户

- GET `/api/auth/profile`（需 Bearer Token）
- 200：返回后台用户资料（不含密码）

---

## 2. 后台用户管理

### 2.1 列表

- GET `/api/admin/users`（分页）
- Query：`page?` `limit?`
- 200：分页数据 `AdminUserResponseDto`

### 2.2 新增

- POST `/api/admin/users`
- Body：`CreateAdminUserDto`（用户名唯一、密码加密）

### 2.3 编辑

- PUT `/api/admin/users/:id`
- Body：`UpdateAdminUserDto`（用户名冲突校验、密码变更加密）

### 2.4 更新状态

- PATCH `/api/admin/users/:id/status`
- Body：`{ status: 0|1 }`

### 2.5 删除

- DELETE `/api/admin/users/:id`

---

## 3. C 端用户管理

### 3.1 列表

- GET `/api/cusers`（分页）
- Query：`page?` `limit?`

### 3.2 新增

- POST `/api/cusers`
- Body：`CreateCUserDto`（用户名、手机号唯一；密码加密）

### 3.3 编辑

- PUT `/api/cusers/:id`
- Body：`UpdateCUserDto`（用户名/手机号冲突校验；密码变更加密）

### 3.4 更新状态

- PATCH `/api/cusers/:id/status`
- Body：`{ status: 0|1 }`

### 3.5 删除

- DELETE `/api/cusers/:id`

---

## 4. 模板管理

### 4.1 检索/列表

- GET `/api/templates`
- Query：`page?` `limit?` `templateName?` `description?` `status? (boolean)`
- 备注：名称/描述为模糊匹配，status 精确匹配

### 4.2 新增

- POST `/api/templates`
- Body：`CreateTemplateDto`

### 4.3 编辑

- PUT `/api/templates/:id`
- Body：`UpdateTemplateDto`

### 4.4 删除

- DELETE `/api/templates/:id`

---

## 5. AI 操作记录

### 5.1 列表

- GET `/api/ai-operations`
- Query：`page?` `limit?` `userId?` `operationType? (polish|generate)`

### 5.2 详情

- GET `/api/ai-operations/:id`

### 5.3 新增

- POST `/api/ai-operations`
- Body：`CreateAiOperationDto`

### 5.4 删除

- DELETE `/api/ai-operations/:id`

### 5.5 概览统计

- GET `/api/ai-operations/statistics/overview`
- 返回：`{ totalOperations, polishCount, generateCount, totalTokens }`

---

## 6. 统计

### 6.1 概览

- GET `/api/statistics/overview`
- 返回：`{ total_users, total_templates, total_ai_operations, total_downloads, total_template_usage }`

### 6.2 趋势

- GET `/api/statistics/trend?period=day|week|month`
- 返回：用户/AI/下载的按日聚合数组

### 6.3 热门模板

- GET `/api/statistics/popular-templates`
- 返回：按 `use_count`、`download_count` 排序的前 10 模板

### 6.4 用户活跃度

- GET `/api/statistics/user-activity`
- 返回：按 `ai_operation_count` 排序的前 10 用户

---

## 7. 简历导出

### 7.1 导出 PDF

- POST `/resumes/export`
- Body：`{ html: string }`
- 返回：若配置 OSS 则为文件 URL，否则为 `data:application/pdf;base64,...`

---

## DTO 摘要

- CreateAdminUserDto / UpdateAdminUserDto / UpdateAdminUserStatusDto / AdminUserResponseDto
- CreateCUserDto / UpdateCUserDto / UpdateCUserStatusDto / CUserResponseDto
- CreateTemplateDto / UpdateTemplateDto / TemplateResponseDto / TemplateSearchDto
- CreateAiOperationDto / AiOperationQueryDto / AiOperationResponseDto
- PaginationDto

---

## 统一分页响应

```json
{
  "code": 200,
  "message": "success",
  "data": { "list": [], "total": 0, "page": 1, "limit": 10 }
}
```
