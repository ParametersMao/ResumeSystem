# 简历中台系统 API 接口文档

## 基础信息

- **基础URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **认证方式**: JWT Token (Bearer Token)

## 通用响应格式

### 标准响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 分页响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 0,
    "page": 1,
    "limit": 10
  }
}
```

## 分页参数说明

所有支持分页的接口都支持以下查询参数：

- `page`: 页码，默认为1
- `limit`: 每页数量，默认为10，最大100

## 1. 认证相关

### 1.1 管理员登录

**接口**: `POST /api/auth/login`

**请求参数**:

```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### 1.2 获取当前用户信息

**接口**: `GET /api/auth/profile`

**请求头**:

```
Authorization: Bearer <token>
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "phone": "13800138000",
    "role": "admin",
    "status": 1,
    "createTime": "2025-06-27T16:43:20.000Z",
    "updateTime": "2025-06-27T20:03:55.040Z"
  }
}
```

## 2. 后台用户管理

### 2.1 获取用户列表

**接口**: `GET /api/admin/users`

**请求参数**:

```
?page=1&limit=10
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "phone": "13800138000",
        "role": "admin",
        "status": 1,
        "createTime": "2024-01-01T00:00:00.000Z",
        "updateTime": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "username": "user1",
        "email": "user1@example.com",
        "role": "user",
        "status": 1,
        "createTime": "2024-01-02T00:00:00.000Z",
        "updateTime": "2024-01-02T00:00:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

### 2.2 新增用户

**接口**: `POST /api/admin/users`

**请求参数**:

```json
{
  "username": "newuser",
  "password": "123456",
  "email": "newuser@example.com",
  "phone": "13800138001",
  "role": "admin",
  "status": 1
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "用户创建成功",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "phone": "13800138001",
    "role": "admin",
    "status": 1,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2.3 编辑用户

**接口**: `PUT /api/admin/users/{id}`

**请求参数**:

```json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "phone": "13800138002",
  "role": "admin"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "用户更新成功",
  "data": {
    "id": 2,
    "username": "updateduser",
    "email": "updated@example.com",
    "phone": "13800138002",
    "role": "admin",
    "status": 1,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2.4 启用/禁用用户

**接口**: `PATCH /api/admin/users/{id}/status`

**请求参数**:

```json
{
  "status": 0
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "id": 2,
    "username": "updateduser",
    "email": "updated@example.com",
    "phone": "13800138002",
    "role": "admin",
    "status": 0,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2.5 删除用户

**接口**: `DELETE /api/admin/users/{id}`

**响应示例**:

```json
{
  "code": 200,
  "message": "用户删除成功",
  "data": null
}
```

## 3. 普通用户管理

### 3.1 获取用户列表

**接口**: `GET /api/cusers`

**请求参数**:

```
?page=1&limit=10
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "user1",
        "email": "user1@example.com",
        "phone": "13800138000",
        "status": 1,
        "createTime": "2024-01-01T00:00:00.000Z",
        "updateTime": "2024-01-01T00:00:00.000Z",
        "aiOperationCount": 5
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 3.2 新增用户

**接口**: `POST /api/cusers`

**请求参数**:

```json
{
  "username": "newuser",
  "password": "123456",
  "email": "newuser@example.com",
  "phone": "13800138001",
  "status": 1
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "用户创建成功",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "phone": "13800138001",
    "status": 1,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z",
    "aiOperationCount": 0
  }
}
```

### 3.3 编辑用户

**接口**: `PUT /api/cusers/{id}`

**请求参数**:

```json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "phone": "13800138002"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "用户更新成功",
  "data": {
    "id": 2,
    "username": "updateduser",
    "email": "updated@example.com",
    "phone": "13800138002",
    "status": 1,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z",
    "aiOperationCount": 0
  }
}
```

### 3.4 启用/禁用用户

**接口**: `PATCH /api/cusers/{id}/status`

**请求参数**:

```json
{
  "status": 0
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "id": 2,
    "username": "updateduser",
    "email": "updated@example.com",
    "phone": "13800138002",
    "status": 0,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z",
    "aiOperationCount": 0
  }
}
```

### 3.5 删除用户

**接口**: `DELETE /api/cusers/{id}`

**响应示例**:

```json
{
  "code": 200,
  "message": "用户删除成功",
  "data": null
}
```

## 4. 模板管理

### 4.1 获取模板列表

**接口**: `GET /api/templates`

**请求参数**:

```
?page=1&limit=10&templateName=简历&description=专业&status=true
```

| 参数名       | 类型    | 必选 | 说明                              |
| ------------ | ------- | ---- | --------------------------------- |
| page         | number  | 否   | 页码，默认为1                     |
| limit        | number  | 否   | 每页条数，默认为10                |
| templateName | string  | 否   | 模板名称，支持模糊搜索            |
| description  | string  | 否   | 模板描述，支持模糊搜索            |
| status       | boolean | 否   | 模板状态，true为启用，false为禁用 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "templateName": "经典模板",
        "templateData": "<html>...</html>",
        "previewImage": "https://example.com/preview.jpg",
        "createTime": "2024-01-01T00:00:00.000Z",
        "updateTime": "2024-01-01T00:00:00.000Z",
        "useCount": 10,
        "downloadCount": 5
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 4.2 新增模板

**接口**: `POST /api/templates`

**请求参数**:

```json
{
  "templateName": "新模板",
  "templateData": "<html>...</html>",
  "previewImage": "https://example.com/preview.jpg"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "模板创建成功",
  "data": {
    "id": 2,
    "templateName": "新模板",
    "templateData": "<html>...</html>",
    "previewImage": "https://example.com/preview.jpg",
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z",
    "useCount": 0,
    "downloadCount": 0
  }
}
```

### 4.3 编辑模板

**接口**: `PUT /api/templates/{id}`

**请求参数**:

```json
{
  "templateName": "更新后的模板",
  "templateData": "<html>...</html>",
  "previewImage": "https://example.com/new-preview.jpg"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "模板更新成功",
  "data": {
    "id": 2,
    "templateName": "更新后的模板",
    "templateData": "<html>...</html>",
    "previewImage": "https://example.com/new-preview.jpg",
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z",
    "useCount": 0,
    "downloadCount": 0
  }
}
```

### 4.4 删除模板

**接口**: `DELETE /api/templates/{id}`

**响应示例**:

```json
{
  "code": 200,
  "message": "模板删除成功",
  "data": null
}
```

## 5. AI操作记录

### 5.1 获取操作记录列表

**接口**: `GET /api/ai-operations`

**请求参数**:

```
?page=1&limit=10&userId=1&operationType=polish
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 1,
        "username": "user1",
        "operationType": "polish",
        "inputData": "原始文本",
        "outputData": "优化后的文本",
        "createTime": "2024-01-01T00:00:00.000Z",
        "tokenUsed": 100
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 5.2 新增操作记录

**接口**: `POST /api/ai-operations`

**请求参数**:

```json
{
  "userId": 1,
  "operationType": "polish",
  "inputData": "原始文本",
  "outputData": "优化后的文本",
  "tokenUsed": 100
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "AI 操作记录创建成功",
  "data": {
    "id": 2,
    "userId": 1,
    "username": "user1",
    "operationType": "polish",
    "inputData": "原始文本",
    "outputData": "优化后的文本",
    "createTime": "2024-01-01T00:00:00.000Z",
    "tokenUsed": 100
  }
}
```

### 5.3 获取操作记录详情

**接口**: `GET /api/ai-operations/{id}`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "username": "user1",
    "operationType": "polish",
    "inputData": "原始文本",
    "outputData": "优化后的文本",
    "createTime": "2024-01-01T00:00:00.000Z",
    "tokenUsed": 100
  }
}
```

### 5.4 删除操作记录

**接口**: `DELETE /api/ai-operations/{id}`

**响应示例**:

```json
{
  "code": 200,
  "message": "AI 操作记录删除成功",
  "data": null
}
```

### 5.5 获取AI操作统计

**接口**: `GET /api/ai-operations/statistics/overview`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalOperations": 100,
    "polishCount": 60,
    "generateCount": 40,
    "totalTokens": 5000
  }
}
```

## 6. 数据统计

### 6.1 获取概览统计

**接口**: `GET /api/statistics/overview`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalUsers": 100,
    "totalTemplates": 10,
    "totalOperations": 500,
    "totalDownloads": 200
  }
}
```

### 6.2 获取趋势数据

**接口**: `GET /api/statistics/trend`

**请求参数**:

```
?period=day
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "labels": ["2024-01-01", "2024-01-02", "2024-01-03"],
    "datasets": [
      {
        "label": "用户注册",
        "data": [10, 15, 20]
      }
    ]
  }
}
```

### 6.3 获取热门模板

**接口**: `GET /api/statistics/popular-templates`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "templateName": "经典模板",
      "useCount": 100,
      "downloadCount": 50
    }
  ]
}
```

### 6.4 获取用户活跃度

**接口**: `GET /api/statistics/user-activity`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "userId": 1,
      "username": "user1",
      "operationCount": 50,
      "lastActiveTime": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 7. 简历导出

### 7.1 导出PDF

**接口**: `POST /resumes/export`

**请求参数**:

```json
{
  "html": "<html><body>简历内容</body></html>"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "导出成功",
  "data": {
    "url": "https://example.com/resume.pdf"
  }
}
```

## 错误码说明

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `409`: 资源冲突（如用户名已存在）
- `500`: 服务器内部错误

## 注意事项

1. 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer <token>`
2. 分页参数 `page` 从1开始，`limit` 最大值为100
3. 时间字段统一使用ISO 8601格式
4. 状态字段：0表示禁用，1表示启用
5. 角色字段：admin（管理员）、operator（操作员）、viewer（查看者）
