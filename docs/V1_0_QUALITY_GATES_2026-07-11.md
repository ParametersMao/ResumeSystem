# v1.0 质量闸门（2026-07-11）

## RAG Agent

运行环境：`resume-agent` 容器，`EMBEDDING_BACKEND=hash`，内存 Qdrant。

- 7 项测试全部通过。
- 4 类评测查询 Top-1 命中率：100%。
- 覆盖前端开发、财务审计、用户增长、校园运营四种意图区分。
- 分类过滤通过：`campus-guide` 不会混入 `job-guide`。
- 禁用知识排除通过。
- 空知识库降级通过：返回空 sources，Agent 继续基础流程。
- 数字事实约束通过：原文没有的 `35%` 会生成“必须核实”告警。

限制：当前质量分数证明 hash 检索和 Agent 约束链路稳定，不等价于真实 embedding 模型及线上大规模知识库的语义质量。上线前仍需使用真实知识库运行同一评测集。

运行方式：

```powershell
docker cp python-agent/tests resume-agent:/app/tests
docker exec resume-agent python -m unittest discover -s tests -p 'test_*.py' -v
```

## 模板渲染

运行命令：

```powershell
cd backed-resume
npm run qa:templates
```

结果：

- 11/11 模板完成全尺寸预览。
- 11 个唯一布局键，无换色冒充重复布局。
- 所有画布宽度为 820px。
- 所有模板横向溢出为 0。
- 浏览器运行时错误为 0。
- 自动翻页覆盖模板列表第 1、2 页。

需继续关注的纵向超页候选：成果导向 1141px、校招版 1209px、时间轴 1170px、高管版 1203px。它们不是横向布局错误，但需要后续针对一页投递和自然分页分别验收。

## 产品主链路

运行命令：

```powershell
cd backed-resume
npm run qa:product-flow
```

自动覆盖：

1. 使用测试账号登录。
2. 打开我的简历和第一份可编辑简历。
3. 修改标题与 Slogan 并保存。
4. 重载页面验证数据库持久化。
5. 请求 PDF 导出并确认 2xx 与下载 URL。
6. 恢复原始标题与 Slogan，避免污染测试数据。

本轮结果：登录、编辑器打开、保存持久化、PDF 导出全部通过，运行时错误为 0。
