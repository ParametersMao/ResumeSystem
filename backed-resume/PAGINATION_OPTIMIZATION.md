# 分页优化和接口标准化说明

## 优化概述

本次优化主要针对获取列表的接口进行了标准化改造，主要包括：

1. **分页支持**：所有列表接口都支持分页查询
2. **统一返回格式**：标准化API响应格式
3. **字段命名优化**：统一使用驼峰命名法
4. **数据过滤**：移除敏感信息（如密码字段）

## 主要变更

### 1. 新增通用接口和DTO

#### 分页相关接口

- `common/interfaces/pagination.interface.ts` - 分页相关接口定义
- `common/dto/pagination.dto.ts` - 分页查询DTO

#### 响应格式

```typescript
// 标准响应
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 分页响应
interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}
```

### 2. 实体字段优化

#### 管理员用户 (AdminUser)

- 新增：`email`, `phone` 字段
- 字段映射：`user_type` → `role`, `create_time` → `createTime`, `update_time` → `updateTime`

#### 普通用户 (CUser)

- 字段映射：`create_time` → `createTime`, `update_time` → `updateTime`, `ai_operation_count` → `aiOperationCount`

#### 模板 (Template)

- 字段映射：`template_name` → `templateName`, `template_data` → `templateData`, `preview_image` → `previewImage`, `create_time` → `createTime`, `update_time` → `updateTime`, `use_count` → `useCount`, `download_count` → `downloadCount`

#### AI操作 (AiOperation)

- 字段映射：`user_id` → `userId`, `operation_type` → `operationType`, `input_data` → `inputData`, `output_data` → `outputData`, `create_time` → `createTime`, `token_used` → `tokenUsed`

### 3. 接口变更

#### 分页参数

所有列表接口都支持以下查询参数：

- `page`: 页码，默认为1
- `limit`: 每页数量，默认为10，最大100

#### 返回格式变更

**之前**：

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "password": "$2b$10$...",
      "user_type": "admin",
      "status": 1,
      "create_time": "2025-06-27T08:43:20.000Z",
      "update_time": "2025-06-27T12:03:55.040Z"
    }
  ]
}
```

**现在**：

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
        "createTime": "2025-06-27T08:43:20.000Z",
        "updateTime": "2025-06-27T12:03:55.040Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

## 受影响的接口

### 1. 管理员用户管理

- `GET /api/admin/users` - 支持分页，返回格式优化

### 2. 普通用户管理

- `GET /api/cusers` - 支持分页，返回格式优化

### 3. 模板管理

- `GET /api/templates` - 支持分页，返回格式优化

### 4. AI操作记录

- `GET /api/ai-operations` - 支持分页，返回格式优化

### 5. 认证接口

- `POST /api/auth/login` - 返回格式优化
- `GET /api/auth/profile` - 返回格式优化

### 6. 统计接口

- `GET /api/statistics/*` - 返回格式优化

### 7. 简历导出

- `POST /resumes/export` - 返回格式优化

## 数据库迁移

执行以下SQL来更新数据库结构：

```sql
-- 更新 admin_users 表结构
ALTER TABLE admin_users
ADD COLUMN email VARCHAR(255) NULL,
ADD COLUMN phone VARCHAR(20) NULL;

-- 为现有管理员用户添加默认邮箱和手机号
UPDATE admin_users
SET email = CONCAT(username, '@example.com'),
    phone = '13800138000'
WHERE email IS NULL OR phone IS NULL;
```

## 前端适配建议

1. **分页组件**：更新分页组件以支持新的分页参数和返回格式
2. **字段映射**：更新前端字段名映射，使用新的驼峰命名
3. **响应处理**：更新API响应处理逻辑，适配新的数据结构
4. **表单验证**：更新表单验证规则，适配新的字段结构

## 向后兼容性

- 数据库字段名保持不变，只更新实体映射
- 现有数据不受影响
- 新增字段为可选字段，不会破坏现有功能

## 测试建议

1. **分页功能测试**：验证分页参数是否正确传递和处理
2. **数据完整性测试**：验证返回数据是否完整且格式正确
3. **字段映射测试**：验证字段名映射是否正确
4. **性能测试**：验证分页查询性能是否满足要求
