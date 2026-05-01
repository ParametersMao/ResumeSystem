# ResumeSystem 部署指南

## 1. 计划中的域名

- C 端：`https://www.your-domain.com`
- 中台：`https://admin.your-domain.com`
- 后端：`https://api.your-domain.com`
- 资源域名：`https://assets.your-domain.com`

## 2. Vercel 上要填的环境变量

### fronted-resume-web

- `VITE_API_BASE=https://api.your-domain.com`
- `VITE_USE_MOCK=false`

### middle-resume

- `VITE_API_BASE_URL=https://api.your-domain.com/api`
- `VITE_APP_ENV=production`
- `VITE_DEBUG=false`
- `VITE_USE_MOCK=false`

## 3. 后端服务器要准备的环境变量

可以参考：

- [backed-resume/config.production.env.example](D:/Dev/projects/ResumeSystem/backed-resume/config.production.env.example)

最少需要配置：

- 数据库：`DB_HOST` `DB_PORT` `DB_USERNAME` `DB_PASSWORD` `DB_DATABASE`
- JWT：`JWT_ACCESS_SECRET` `JWT_REFRESH_SECRET`
- 跨域：`FRONTEND_URL`
- AI：`OPENAI_API_URL` `OPENAI_API_KEY` `OPENAI_MODEL`
- R2：`R2_ENDPOINT` `R2_ACCESS_KEY_ID` `R2_SECRET_ACCESS_KEY` `R2_BUCKET` `R2_PUBLIC_BASE_URL`
- PDF：`PUPPETEER_EXECUTABLE_PATH`

## 4. 上线前必须验证

1. 登录是否正常
2. 模板/简历列表是否正常加载
3. 编辑器保存是否正常
4. PDF 导出是否成功
5. 上传后的 PDF 链接是否能直接访问
6. AI 润色是否能正常返回
7. 后端健康检查是否正常

健康检查地址：

- `https://api.your-domain.com/api/health`
