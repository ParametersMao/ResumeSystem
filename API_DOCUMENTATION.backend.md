# 简历中台系统 后端 API 文档（根目录副本）

本文件为 `backed-resume/API_DOCUMENTATION.generated.md` 的同步副本，便于调用方在仓库根目录快速查阅。若两者不一致，以 `backed-resume/API_DOCUMENTATION.generated.md` 为准。

- 基础 URL: `http://localhost:3000`
- 认证方式: JWT（Bearer Token），除公开接口外
- 统一响应/分页：`{ code, message, data }` / `{ code, message, data: { list, total, page, limit } }`

请参考：

- 认证：`/api/auth/login`、`/api/auth/profile`
- 后台用户：`/api/admin/users` CRUD + 状态
- C 端用户：`/api/cusers` CRUD + 状态
- 模板：`/api/templates` 检索/CRUD
- AI 操作：`/api/ai-operations` 列表/详情/新增/删除/统计
- 统计：`/api/statistics/*` 概览/趋势/热门模板/用户活跃度
- 导出：`POST /resumes/export`

详细说明、请求示例与 DTO 列表参见：`backed-resume/API_DOCUMENTATION.generated.md`。
