数据模型与版本/并发控制

## 1. 核心实体

### 1.1 简历 Resume

```ts
export interface Resume {
  resumeId: string;
  userId: string;
  templateId: string;
  meta: {
    title: string;
    subtitle?: string;
    updatedAt: number; // ms
    version: number; // 递增版本，用于快照与回滚
  };
  style: ResumeStyle; // 主题色、字体、字号、行距、边距、分栏
  sections: ResumeSection[]; // 区块化内容
}

export interface ResumeStyle {
  themeColor: string; // #2e6cff
  fontFamily: string; // 'Source Han Sans', 'PingFang SC', 'Microsoft YaHei'
  fontSize: number; // 10-14（打印友好）
  lineHeight: number; // 1.2-1.6
  page: { margin: [number, number, number, number]; columns: 1 | 2 };
}

export interface ResumeSection {
  id: string; // UUID
  type: SectionType; // 'work' | 'project' | 'education' | 'skill' | 'award' | 'summary'
  title: string;
  visible: boolean;
  items: SectionItem[];
}

export type SectionItem =
  | WorkItem
  | ProjectItem
  | EducationItem
  | SkillItem
  | AwardItem
  | SummaryItem;

export interface WorkItem {
  type: "work";
  company: string;
  role: string;
  location?: string;
  start: string; // YYYY-MM
  end?: string; // YYYY-MM | 'Present'
  highlights: string[]; // 受控富文本(行内加粗/链接/项目符号)
  techTags?: string[];
}

export interface ProjectItem {
  type: "project";
  name: string;
  role?: string;
  repoUrl?: string;
  start?: string;
  end?: string;
  highlights: string[];
  techTags?: string[];
}

export interface EducationItem {
  type: "education";
  school: string;
  degree?: string;
  major?: string;
  start?: string;
  end?: string;
  highlights?: string[];
}

export interface SkillItem {
  type: "skill";
  name: string;
  level?: 1 | 2 | 3 | 4 | 5; // 可视化成星级/进度条
  tags?: string[];
}

export interface AwardItem {
  type: "award";
  title: string;
  by?: string;
  date?: string;
  highlights?: string[];
}

export interface SummaryItem {
  type: "summary";
  content: string; // 受控富文本（限制行内样式）
}
```

### 1.2 模板 Template

```ts
export interface TemplateMeta {
  templateId: string;
  name: string;
  coverUrl: string; // 预览图
  themeColor: string;
  fontFamily: string;
  layout: Partial<ResumeStyle>; // 默认样式/版式
  status: "online" | "offline";
}
```

## 2. 校验规则与业务约束

- 必填字段：`company/role`（工作），`name`（项目），`school`（教育），`name`（技能）
- 时间区间：`start <= end`，`end` 可为空或 'Present'
- highlights：每条不超过 200 字；最多 8 条/条目
- 字体与字号范围：打印友好，默认字号 12，区间 10-14

## 3. 保存策略

- 输入即保存：`onChange → debounce(800ms) → diff → PUT /resumes/:id`
- 差量提交：前端维护 `lastSaved` 快照，对比 `sections/style/meta` 变化，按字段提交
- 失败重试：指数退避（最多 3 次），同时保存到 LocalStorage 以便刷新恢复

## 4. 版本与并发

- 版本号：`meta.version` 递增；服务器返回最新版本
- 乐观锁：请求携带 `If-Match: <contentHash>` 或 `version`；冲突返回 409，前端弹出合并对比
- 本地快照：保存 `v-1`、`v-2`（IndexedDB），支持回滚与差异高亮

## 5. 本地缓存与离线编辑

- 数据缓存：LocalStorage 小块数据 + IndexedDB 大对象
- 离线队列：网络中断时队列化操作，恢复后按时间戳顺序重放

## 6. 埋点与统计字段

```ts
interface ResumeAnalytics {
  resumeId: string;
  createdAt: number;
  exportedPdfCount: number;
  lastExportAt?: number;
  editSessions: number; // 打开编辑器的会话次数
}
```

## 7. 打印/导出相关元数据

- 字体：内置字体映射与回退链；ttf/woff2 动态加载
- 图片：Base64/Blob 缓存；导出时按 DPI 重新采样
- 分页：预计算分页点，避免孤行/寡行；必要时自动收紧段距
