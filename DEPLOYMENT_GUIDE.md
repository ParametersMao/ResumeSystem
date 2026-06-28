# ResumeSystem 上线部署指南

这份文档面向当前测试上线阶段：前端 Web 和中台管理端部署到 Vercel，后端与 MySQL 部署在阿里云服务器，文件存储使用 Cloudflare R2。

## 1. 部署结构

- C 端 Web：Vercel 免费域名，当前环境变量走 `/api` 代理。
- 中台管理端：Vercel 免费域名，当前环境变量走 `/api` 代理。
- 后端 API：阿里云服务器 `http://8.162.4.5/api`，后续绑定正式域名后再改为 `https://api.your-domain.com/api`。
- 对象存储：Cloudflare R2，用于 PDF、预览图等文件访问。

## 2. Vercel 环境变量

### fronted-resume-web

```env
VITE_API_BASE=/api
VITE_USE_MOCK=false
```

### middle-resume

```env
VITE_API_BASE_URL=/api
VITE_APP_ENV=production
VITE_DEBUG=false
VITE_USE_MOCK=false
```

两个前端目录里的 `vercel.json` 会把 `/api/(.*)` 代理到阿里云后端：

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "http://8.162.4.5/api/$1"
    }
  ]
}
```

## 3. 后端生产环境变量

后端服务器只在服务器环境里保存真实密钥，不要提交到 Git。可参考：

- [backed-resume/config.production.env.example](D:/Dev/projects/ResumeSystem/backed-resume/config.production.env.example)

必填项：

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-web.vercel.app,https://your-admin.vercel.app

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=resume_app
DB_PASSWORD=<your-db-password>
DB_DATABASE=resume_system

JWT_ACCESS_SECRET=<long-random-secret>
JWT_REFRESH_SECRET=<another-long-random-secret>

R2_ENDPOINT=https://2cef367ed0d9606a47029b9aa51fa19c.r2.cloudflarestorage.com
R2_REGION=auto
R2_ACCESS_KEY_ID=<cloudflare-r2-access-key-id>
R2_SECRET_ACCESS_KEY=<cloudflare-r2-secret-access-key>
R2_BUCKET=cv-assets
R2_PUBLIC_BASE_URL=https://pub-3849403bf41741939821877a7df073c5.r2.dev

PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

注意：`R2_ENDPOINT` 建议只填到账号级 endpoint，不带 bucket 路径；后端已做兼容，如果误填成 `...cloudflarestorage.com/cv-assets` 也会自动去掉尾部 bucket 路径。

## 4. 密钥安全

- R2 Access Key ID 和 Secret Access Key 只能放在阿里云服务器环境变量里。
- 不要把真实密钥写入 `config.production.env.example`、`vercel.json`、README 或任何 Git 文件。
- 如果密钥曾经出现在聊天、截图或日志中，建议在 Cloudflare 后台轮换一组新密钥再正式上线。

## 5. 上线前检查

1. 后端健康检查：`http://8.162.4.5/api/health` 返回 `status: ok`。
2. C 端登录、注册、个人中心可正常访问。
3. 中台登录、模板管理、数据统计、AI 配置页面可正常访问。
4. 简历编辑器保存、版本记录、回滚、PDF 导出正常。
5. PDF 导出后可以通过 R2 公共链接直接访问。
6. 后台“热门模板”Top5 与模板使用/导出行为一致。
7. AI 功能在 mock/provider 配置切换下不报错，接入真实 API 后操作日志中文正常入库。
