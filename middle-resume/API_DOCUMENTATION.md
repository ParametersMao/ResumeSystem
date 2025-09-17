# 简历中台系统 API 接口文档

## 基础信息

- **基础URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **认证方式**: JWT Token (Bearer Token)

## 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

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
      "user_type": "admin"
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
  "message": "ok",
  "data": {
    "id": 1,
    "username": "admin",
    "user_type": "admin",
    "status": 1,
    "create_time": "2025-06-27T16:43:20.000Z",
    "update_time": "2025-06-27T20:03:55.040Z"
  }
}
```

## 2. 后台用户管理

### 2.1 获取用户列表

**接口**: `GET /api/admin/users`

**请求参数**:

```
?page=1&limit=10&search=admin&status=1
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
        "role": "admin",
        "status": 1,
        "createTime": "2024-01-01T00:00:00.000Z",
        "updateTime": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
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
  "user_type": "admin"
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
  "user_type": "admin"
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
  "message": "用户状态更新成功",
  "data": {
    "id": 2,
    "status": 0
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

## 3. C端用户管理

### 3.1 获取C端用户列表

**接口**: `GET /api/cusers`

**请求参数**:

```
?page=1&limit=10&search=user&status=1
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
        "phone": "13800138000",
        "email": "user1@example.com",
        "status": 1,
        "createTime": "2024-01-01T00:00:00.000Z",
        "updateTime": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 3.2 新增C端用户

**接口**: `POST /api/cusers`

**请求参数**:

```json
{
  "username": "newcuser",
  "phone": "13800138001",
  "email": "newcuser@example.com",
  "password": "123456"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "C端用户创建成功",
  "data": {
    "id": 2,
    "username": "newcuser",
    "phone": "13800138001",
    "email": "newcuser@example.com",
    "status": 1,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3.3 编辑C端用户

**接口**: `PUT /api/cusers/{id}`

**请求参数**:

```json
{
  "username": "updatedcuser",
  "phone": "13800138002",
  "email": "updatedcuser@example.com"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "C端用户更新成功",
  "data": {
    "id": 2,
    "username": "updatedcuser",
    "phone": "13800138002",
    "email": "updatedcuser@example.com",
    "status": 1,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3.4 启用/禁用C端用户

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
  "message": "C端用户状态更新成功",
  "data": {
    "id": 2,
    "status": 0
  }
}
```

### 3.5 删除C端用户

**接口**: `DELETE /api/cusers/{id}`

**响应示例**:

```json
{
  "code": 200,
  "message": "C端用户删除成功",
  "data": null
}
```

## 4. 模板管理

### 4.1 获取模板列表

**接口**: `GET /api/templates`

**请求参数**:

```
?page=1&limit=10&search=template&status=1
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
        "name": "经典模板",
        "description": "经典简历模板",
        "content": "<html>...</html>",
        "status": 1,
        "createTime": "2024-01-01T00:00:00.000Z",
        "updateTime": "2024-01-01T00:00:00.000Z"
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
  "name": "新模板",
  "description": "新的简历模板",
  "content": "<html><body><h1>简历模板</h1></body></html>"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "模板创建成功",
  "data": {
    "id": 2,
    "name": "新模板",
    "description": "新的简历模板",
    "content": "<html><body><h1>简历模板</h1></body></html>",
    "status": 1,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4.3 编辑模板

**接口**: `PUT /api/templates/{id}`

**请求参数**:

```json
{
  "name": "更新后的模板",
  "description": "更新后的简历模板",
  "content": "<html><body><h1>更新后的简历模板</h1></body></html>"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "模板更新成功",
  "data": {
    "id": 2,
    "name": "更新后的模板",
    "description": "更新后的简历模板",
    "content": "<html><body><h1>更新后的简历模板</h1></body></html>",
    "status": 1,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
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

### 5.1 获取AI操作记录

**接口**: `GET /api/ai-operations`

**请求参数**:

```
?page=1&limit=10&userId=1&operationType=generate
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
        "operationType": "generate",
        "prompt": "生成一份简历",
        "response": "生成的简历内容",
        "tokenUsed": 100,
        "createTime": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 5.2 查看操作详情

**接口**: `GET /api/ai-operations/{id}`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "user": {
      "id": 1,
      "username": "user1",
      "phone": "13800138000"
    },
    "operationType": "generate",
    "prompt": "生成一份简历",
    "response": "生成的简历内容",
    "tokenUsed": 100,
    "createTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5.3 创建AI操作记录

**接口**: `POST /api/ai-operations`

**请求参数**:

```json
{
  "userId": 1,
  "operationType": "generate",
  "prompt": "生成一份简历",
  "response": "生成的简历内容",
  "tokenUsed": 100
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "AI操作记录创建成功",
  "data": {
    "id": 2,
    "userId": 1,
    "operationType": "generate",
    "prompt": "生成一份简历",
    "response": "生成的简历内容",
    "tokenUsed": 100,
    "createTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5.4 删除操作记录

**接口**: `DELETE /api/ai-operations/{id}`

**响应示例**:

```json
{
  "code": 200,
  "message": "AI操作记录删除成功",
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
    "totalTokens": 10000,
    "todayOperations": 10,
    "todayTokens": 1000,
    "operationTypes": [
      {
        "type": "generate",
        "count": 80
      },
      {
        "type": "optimize",
        "count": 20
      }
    ]
  }
}
```

## 6. 数据统计

### 6.1 数据概览

**接口**: `GET /api/statistics/overview`

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalUsers": 1000,
    "totalTemplates": 50,
    "totalDownloads": 5000,
    "totalAiOperations": 2000,
    "todayNewUsers": 10,
    "todayDownloads": 100,
    "todayAiOperations": 50
  }
}
```

### 6.2 趋势图表数据

**接口**: `GET /api/statistics/trend`

**请求参数**:

```
?type=users&days=7
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "type": "users",
    "days": 7,
    "data": [
      {
        "date": "2024-01-01",
        "value": 10
      },
      {
        "date": "2024-01-02",
        "value": 15
      }
    ]
  }
}
```

### 6.3 热门模板排行

**接口**: `GET /api/statistics/popular-templates`

**请求参数**:

```
?limit=10&period=7
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "经典模板",
      "downloadCount": 500,
      "usageCount": 1000
    },
    {
      "id": 2,
      "name": "现代模板",
      "downloadCount": 300,
      "usageCount": 800
    }
  ]
}
```

### 6.4 用户活跃度排行

**接口**: `GET /api/statistics/user-activity`

**请求参数**:

```
?limit=10&period=7
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "username": "user1",
      "downloadCount": 50,
      "aiOperationCount": 100,
      "lastActiveTime": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "username": "user2",
      "downloadCount": 30,
      "aiOperationCount": 80,
      "lastActiveTime": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 7. 简历导出

### 7.1 导出PDF

**接口**: POST /api/resumes/export

**请求参数**:

```json
{
  "html": "<html>...</html>"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "导出成功",
  "data": {
    "url": "https://oss.aliyun.com/xxx/xxx.pdf"
  }
}
```

## 错误码说明

| 错误码 | 说明           |
| ------ | -------------- |
| 200    | 成功           |
| 400    | 请求参数错误   |
| 401    | 未授权         |
| 403    | 禁止访问       |
| 404    | 资源不存在     |
| 500    | 服务器内部错误 |

## 状态码说明

- `status: 1` - 启用
- `status: 0` - 禁用

## 角色说明

- `role: admin` - 管理员
- `role: user` - 普通用户
