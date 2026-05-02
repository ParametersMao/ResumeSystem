# 数据关系与交付检查表

## 核心表关系

- `c_users` 是 C 端用户主表，`resumes`、`ai_operations`、`template_usage`、`resume_downloads`、`template_favorites` 都以它作为用户归属来源。
- `c_user_profiles` 与 `c_user_entitlements` 使用 `user_id` 和 `c_users.id` 一对一绑定；用户注册和个人中心兜底都会补齐这两张表。
- `templates` 是模板主表，`resumes.template_id`、`template_usage.template_id`、`resume_downloads.template_id`、`template_favorites.template_id` 都指向它。
- `resumes` 是简历主表，`resume_versions.resume_id` 保存版本快照，版本回滚以 `resumes.content` 为最终生效内容。
- `ai_operations` 是 AI 调用审计表，后台 AI 操作监控以此表为唯一来源。

## 统计口径

- 总用户数：`c_users` 总数。
- 总模板数：`templates` 总数。
- 总 AI 操作数：`ai_operations` 总数。
- 总下载数：`resume_downloads` 总数。
- 总简历数：`resumes` 总数。
- 热门模板 Top5：优先按真实事件表 `template_usage + resume_downloads` 聚合；如果历史数据只有 `templates.use_count`，会用两者较大值兜底，避免旧数据丢失。
- 用户活跃度：直接按 `ai_operations.user_id` 聚合，不依赖 TypeORM 里未声明的虚拟关系。

## 上线前必须验证

1. 新用户注册后，`c_user_profiles` 和 `c_user_entitlements` 自动生成。
2. 使用模板后，`template_usage` 有记录，`templates.use_count` 递增。
3. 导出 PDF 后，`resume_downloads` 有记录，R2 公共链接可访问。
4. AI 润色/生成后，`ai_operations.input_data` 和 `output_data` 中文不乱码。
5. 中台仪表盘和数据统计页的模板 Top5 与真实使用记录一致。
6. 生产环境必须配置 `JWT_ACCESS_SECRET` 和 `JWT_REFRESH_SECRET`，不允许使用开发默认密钥。
