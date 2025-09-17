API 契约（鉴权、分页、导出）

> 统一响应结构与分页返回遵循既有偏好：列表接口一律返回 `{ list, total, page, limit }`，避免返回裸数组，便于表格与分页缓存复用。

## 0. 通用约定

- Base URL：`/api`
- 鉴权：`Authorization: Bearer <token>`（登录后获取）
- 响应包：

```ts
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}
```

## 1. 鉴权与用户

### 1.1 登录（账号密码）

- POST `/auth/login`

```json
{ "username": "string", "password": "string" }
```

响应：

```json
{
  "code": 200,
  "message": "success",
  "data": { "token": "<jwt>", "user": { "id": "u_1", "nickname": "张三" } }
}
```

### 1.2 微信扫码登录（PC）

- GET `/auth/wechat/qrcode` → 返回二维码 ticket/scene
- GET `/auth/wechat/poll?scene=xxx` → 2s 轮询，成功返回 token

## 2. 模板 Template

### 2.1 模板分页列表

- GET `/templates?page=1&limit=20&keyword=`
  响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "templateId": "t1",
        "name": "简洁蓝",
        "coverUrl": "...",
        "themeColor": "#2e6cff",
        "fontFamily": "Source Han Sans",
        "status": "online"
      }
    ],
    "total": 120,
    "page": 1,
    "limit": 20
  }
}
```

### 2.2 获取模板详情

- GET `/templates/:templateId`

## 3. 简历 Resume

### 3.1 创建简历

- POST `/resumes`

```json
{ "templateId": "t1", "title": "我的简历" }
```

响应：`{ code, message, data: { resumeId } }`

### 3.2 获取简历详情

- GET `/resumes/:resumeId`

### 3.3 更新简历（差量）

- PUT `/resumes/:resumeId`
  Headers: `If-Match: <contentHash>` 或 `X-Version: <number>`

```json
{
  "meta": { "title": "我的简历", "version": 12 },
  "style": { "themeColor": "#2e6cff" },
  "sections": [
    /* 变更的 section */
  ]
}
```

冲突：`409`，返回服务器版本与差异摘要。

### 3.4 列出我的简历（分页）

- GET `/resumes?page=1&limit=10`
  响应：`{ code, message, data: { list, total, page, limit } }`

### 3.5 版本与快照

- GET `/resumes/:resumeId/versions?page=1&limit=20`
- POST `/resumes/:resumeId/versions/rollback`（body: `{ version: number }`）

## 4. 导出 Export

### 4.1 创建导出任务

- POST `/exports`

```json
{ "resumeId": "r1", "format": "pdf", "dpi": 192, "serverSide": true }
```

响应：`{ data: { jobId: "e_123" } }`

### 4.2 查询导出任务

- GET `/exports/:jobId`
  响应：`status: pending|processing|success|failed, url?: "https://.../r1.pdf"`

## 5. 统计与埋点

### 5.1 导出统计

- GET `/statistics/exports?resumeId=r1`

```json
{
  "code": 200,
  "message": "success",
  "data": { "count": 12, "lastExportAt": 1710000000000 }
}
```

## 6. 错误码约定

- 200：成功
- 400：参数错误（提供 `fields` 细节）
- 401：未授权（跳转登录）
- 403：无权限
- 404：不存在
- 409：版本冲突（返回服务器版本、diff 摘要）
- 429：限流
- 500：服务器异常

## 7. 示例：前端分页请求封装

```ts
async function fetchPage<T>(url: string, page: number, limit: number) {
  const { data } = await axios.get<ApiResponse<PageResult<T>>>(url, {
    params: { page, limit },
  });
  return data.data;
}
```

## 8. 参考

- 编辑器入口与登录体验参考：https://www.qmjianli.com/cv/edit/?resumeId=2494ZLD3D61WCO
