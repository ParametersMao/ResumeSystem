# ResumeSystem

本项目是一个简历制作系统，当前包含三个主要应用：

```text
backed-resume        NestJS 后端服务，默认端口 3000
fronted-resume-web   C 端简历 Web，默认端口 5173
middle-resume        中台管理端，默认端口 3030
```

## 本地启动顺序

1. 启动数据库，并确认 `backed-resume/.env` 已配置。
2. 启动后端。
3. 启动 C 端 Web。
4. 如需运营管理功能，启动中台管理端。

```bash
cd backed-resume
npm run start:dev

cd ../fronted-resume-web
npm run dev

cd ../middle-resume
npm run dev
```

## 验证命令

```bash
cd backed-resume
npm run build
npm run test

cd ../fronted-resume-web
npm run build

cd ../middle-resume
npm run build
```

## 当前阶段重点

- C 端核心简历编辑器已具备模块化编辑、实时预览、样式参数、模板切换和 PDF 导出能力。
- 模板中心已简化为卡片式列表，支持版式筛选、收藏筛选和最近使用筛选。
- 多版本管理和 AI 润色/定向生成已形成基础闭环。
- 中台支持模板管理、AI 配置、AI 操作监控和数据统计。

历史方案、旧需求、旧修复总结类文档已清理。后续新增文档应尽量保持短小，只记录当前仍能指导开发或运维的信息。
