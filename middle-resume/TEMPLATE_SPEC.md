# 简历模板（templateData）上传规范 v1

本规范用于中台在“新增/编辑模板”时填写（或上传）的 `templateData` JSON。该 JSON 将被前端渲染引擎（DynamicResumePreview + BaseSection + 各 Section Layout）直接消费，实现“模板控制排版样式，用户数据控制内容”。

---

## 顶层结构

```json
{
  "templateName": "模板名称",
  "templateVersion": 1,
  "styles": {
    "colors": {
      "primary": "#2c5aa0",
      "secondary": "#f1f5f9",
      "text": "#334155",
      "background": "#ffffff",
      "accent": "#3b82f6"
    },
    "fonts": {
      "heading": "Microsoft YaHei, Arial, sans-serif",
      "body": "Microsoft YaHei, Arial, sans-serif"
    },
    "spacing": {
      "sectionMargin": "25px",
      "elementMargin": "15px"
    }
  },
  "globalConfig": {
    "maxWidth": "860px",
    "padding": "30px",
    "borderRadius": "8px",
    "boxShadow": "0 2px 10px rgba(0,0,0,0.1)",
    "contentBackground": "#ffffff"
  },
  "layout": []
}
```

- `templateName` 必填：模板展示名称。
- `templateVersion` 建议填写：用于后续兼容与迁移（如 v1→v2）。
- `styles` 可选：配色、字体、间距的 tokens；缺省时使用前端默认值。
- `globalConfig` 可选：渲染画布容器样式。
- `layout` 必填：决定模块顺序/布局与样式。

---

## layout（模块声明）

从上到下为实际渲染顺序。每个模块：

```json
{
  "type": "personal | experience | education | skills | projects | custom",
  "visible": true,
  "config": {}
}
```

### 通用配置（任选）

- `title`: 模块标题（如“工作经历”）。
- `titleStyle`: `"ribbon" | "underline" | "none"`。
- 细粒度样式：`containerStyle`、`itemStyle`、`headerStyle`、`contentStyle` 等（对象，谨慎使用）。

### 各模块配置细则

#### 1) personal（个人信息）

- `config.layout`: `"center" | "table" | "card"`。
- `config.showTitle`: `boolean`。
- 当 `layout=table` 时可选：
  - `fields`: 二维数组，表示表格行：
    ```json
    [
      ["姓名", "{name}", "年龄", "32岁"],
      ["电话", "{phone}", "邮箱", "{email}"]
    ]
    ```
    - 支持占位符：`{name}` `{title}` `{phone}` `{email}` `{site}`。
  - `avatarWidth`/`avatarHeight`/`avatarBackground`/`avatarText` 等头像区域配置。

#### 2) experience / education / projects

- `config.layout`: `"timeline" | "simple"`。
- 可选样式键：
  - `companyStyle/schoolStyle/nameStyle`
  - `positionStyle/degreeStyle/roleStyle`
  - `dateStyle`, `descriptionStyle`

> 富文本字段 `desc` 支持三种结构：
>
> 1. 纯字符串
> 2. `{ html, json, text }`（推荐；优先使用 `html`，缺省时将从 `json` 转为 HTML 渲染）
> 3. 旧格式 `{ ops: [...] }`（保留兼容）

#### 3) skills

- `config.layout`: `"tags" | "progress" | "simple"`。
- `tags` 额外：`gap`、`tagStyle`。
- `progress` 额外：`columns`、`progressStyle`、`progressBarStyle`。
- `simple` 额外：`listStyle`。

---

## 与“用户数据”的映射（前端编辑产生）

- `profile.basic`: `{ name, title, contacts: { email, phone, site } }`
- `profile.summary`: `string`
- `sections`: `Array<ResumeSection>`（逐模块数据，受模板 layout 控制渲染）
  - `experience.items`: `{ company, role, duration: { start, end }, desc }[]`
  - `education.items`: `{ school, degree, duration: { start, end } }[]`
  - `skills.items`: `string[]` 或 `{ name, level }[]`
  - `projects.items`: `{ name, role, duration: { start, end }, desc }[]`

> 模板仅决定“排版与样式”，用户数据决定“内容”。所有涉及起止时间的字段统一为 `duration: { start, end }`。

---

## 中台入库校验建议

- `layout` 为非空数组；每项包含 `type`、`visible`、`config`。
- `type` 必须在支持集合内；未知类型可退化为 `custom` 或拒绝入库。
- `styles.spacing` 的长度单位需为字符串，如 `"25px"`。
- 建议保存 `templateVersion`，为未来模板 DSL 迭代/迁移预留。

### 样式优先级与运行时覆盖（重要）

渲染引擎合并规则：

1. 默认值（引擎内置）
2. 模板 `styles`、`globalConfig`
3. 运行时 `extraStyles`（来自前端“样式设置”面板）
4. `layout[i].config.*`（对单个模块的定向覆盖，如 `titleStyle`、`itemStyle`）

即：全局样式 → 运行时面板 → 模块覆盖。模板应尽量把“可调节的主题参数”放在 `styles` 内作为全局变量，便于统一调节。

---

## 轻量 JSON Schema（片段，供校验参考）

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["templateName", "layout"],
  "properties": {
    "templateName": { "type": "string" },
    "templateVersion": { "type": ["integer", "string"] },
    "styles": {
      "type": "object",
      "properties": {
        "colors": {
          "type": "object",
          "properties": {
            "primary": { "type": "string" },
            "secondary": { "type": "string" },
            "text": { "type": "string" },
            "background": { "type": "string" }
          }
        },
        "fonts": {
          "type": "object",
          "properties": {
            "heading": { "type": "string" },
            "body": { "type": "string" }
          }
        },
        "spacing": {
          "type": "object",
          "properties": {
            "sectionMargin": { "type": "string" },
            "elementMargin": { "type": "string" }
          }
        }
      }
    },
    "globalConfig": { "type": "object" },
    "layout": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["type", "visible", "config"],
        "properties": {
          "type": {
            "enum": [
              "personal",
              "experience",
              "education",
              "skills",
              "projects",
              "custom"
            ]
          },
          "visible": { "type": "boolean" },
          "config": { "type": "object" }
        }
      }
    }
  }
}
```

---

## 最小可用模板（可直接复制试用）

```json
{
  "templateName": "简约-中心+时间轴",
  "templateVersion": 1,
  "styles": {
    "colors": {
      "primary": "#2c5aa0",
      "secondary": "#f1f5f9",
      "text": "#334155",
      "background": "#ffffff",
      "accent": "#3b82f6"
    },
    "fonts": {
      "heading": "Microsoft YaHei, Arial, sans-serif",
      "body": "Microsoft YaHei, Arial, sans-serif"
    },
    "spacing": { "sectionMargin": "25px", "elementMargin": "15px" }
  },
  "globalConfig": {
    "maxWidth": "860px",
    "padding": "30px",
    "borderRadius": "8px",
    "boxShadow": "0 2px 10px rgba(0,0,0,0.1)"
  },
  "layout": [
    {
      "type": "personal",
      "visible": true,
      "config": { "layout": "center", "showTitle": false }
    },
    {
      "type": "experience",
      "visible": true,
      "config": {
        "layout": "timeline",
        "title": "工作经历",
        "titleStyle": "ribbon"
      }
    },
    {
      "type": "education",
      "visible": true,
      "config": {
        "layout": "timeline",
        "title": "教育背景",
        "titleStyle": "ribbon"
      }
    },
    {
      "type": "skills",
      "visible": true,
      "config": {
        "layout": "tags",
        "title": "专业技能",
        "gap": "10px",
        "tagStyle": {
          "backgroundColor": "#f1f5f9",
          "color": "#334155",
          "borderRadius": "20px",
          "padding": "6px 14px",
          "fontSize": "14px"
        }
      }
    },
    {
      "type": "projects",
      "visible": true,
      "config": {
        "layout": "timeline",
        "title": "项目经历",
        "titleStyle": "ribbon"
      }
    }
  ]
}
```

> 该模板与当前前端渲染器完全兼容，可用于中台模板库的快速验证。将以上 JSON 作为 `templateData` 入库（并确保 `status = true`）。

---

## 常见问题与约束

- 未提供 `layout` 时，前端会注入默认布局以保证可渲染，但风格不保证一致。
- 富文本渲染会过滤不安全节点；外链/脚本需遵循安全策略。
- 打印/PDF 建议采用服务端渲染（如 Puppeteer），以保证与屏幕一致。

如需新增布局/能力（如多列栅格、页眉页脚、分页控制等），请在模板评审时提出，我们将迭代 DSL 与前端组件并更新版本号。

---

## 双栏布局模板示例（基于图片效果）

```json
{
  "templateName": "双栏-深灰标题+浅灰侧栏",
  "templateVersion": 1,
  "styles": {
    "colors": {
      "primary": "#2c3e50",
      "secondary": "#f8f9fa",
      "text": "#2c3e50",
      "background": "#ffffff",
      "accent": "#e74c3c",
      "sidebarBg": "#f8f9fa",
      "titleBg": "#34495e"
    },
    "fonts": {
      "heading": "Microsoft YaHei, Arial, sans-serif",
      "body": "Microsoft YaHei, Arial, sans-serif"
    },
    "spacing": {
      "sectionMargin": "20px",
      "elementMargin": "12px"
    }
  },
  "globalConfig": {
    "maxWidth": "900px",
    "padding": "0",
    "borderRadius": "0",
    "boxShadow": "none",
    "contentBackground": "#ffffff",
    "layout": "two-column"
  },
  "layout": [
    {
      "type": "personal",
      "visible": true,
      "config": {
        "layout": "sidebar",
        "showTitle": false,
        "avatar": {
          "width": "120px",
          "height": "120px",
          "background": "#e74c3c",
          "text": "头像"
        },
        "sidebarStyle": {
          "backgroundColor": "#f8f9fa",
          "padding": "30px 25px",
          "width": "35%",
          "minHeight": "100%"
        },
        "mainContentStyle": {
          "padding": "30px 35px",
          "width": "65%"
        }
      }
    },
    {
      "type": "experience",
      "visible": true,
      "config": {
        "layout": "timeline",
        "title": "工作经验",
        "titleStyle": "dark-header",
        "titleStyleConfig": {
          "backgroundColor": "#34495e",
          "color": "#ffffff",
          "padding": "8px 15px",
          "fontSize": "16px",
          "fontWeight": "600"
        },
        "itemStyle": {
          "marginBottom": "20px",
          "padding": "0"
        },
        "companyStyle": {
          "fontSize": "16px",
          "fontWeight": "600",
          "color": "#2c3e50",
          "marginBottom": "5px"
        },
        "positionStyle": {
          "fontSize": "14px",
          "color": "#7f8c8d",
          "marginBottom": "5px"
        },
        "dateStyle": {
          "fontSize": "12px",
          "color": "#95a5a6",
          "marginBottom": "8px"
        },
        "descriptionStyle": {
          "fontSize": "13px",
          "lineHeight": "1.6",
          "color": "#2c3e50"
        }
      }
    },
    {
      "type": "education",
      "visible": true,
      "config": {
        "layout": "timeline",
        "title": "教育背景",
        "titleStyle": "dark-header",
        "titleStyleConfig": {
          "backgroundColor": "#34495e",
          "color": "#ffffff",
          "padding": "8px 15px",
          "fontSize": "16px",
          "fontWeight": "600"
        },
        "itemStyle": {
          "marginBottom": "20px"
        },
        "schoolStyle": {
          "fontSize": "16px",
          "fontWeight": "600",
          "color": "#2c3e50",
          "marginBottom": "5px"
        },
        "degreeStyle": {
          "fontSize": "14px",
          "color": "#7f8c8d",
          "marginBottom": "5px"
        },
        "dateStyle": {
          "fontSize": "12px",
          "color": "#95a5a6",
          "marginBottom": "8px"
        },
        "gpaStyle": {
          "fontSize": "13px",
          "color": "#e74c3c",
          "fontWeight": "500"
        },
        "coursesStyle": {
          "fontSize": "12px",
          "color": "#7f8c8d",
          "lineHeight": "1.5"
        }
      }
    },
    {
      "type": "skills",
      "visible": true,
      "config": {
        "layout": "mixed",
        "title": "技能特长",
        "titleStyle": "dark-header",
        "titleStyleConfig": {
          "backgroundColor": "#34495e",
          "color": "#ffffff",
          "padding": "8px 15px",
          "fontSize": "16px",
          "fontWeight": "600"
        },
        "languageSection": {
          "title": "语言能力",
          "style": {
            "marginBottom": "15px"
          }
        },
        "computerSection": {
          "title": "计算机",
          "style": {
            "marginBottom": "15px"
          }
        },
        "teamworkSection": {
          "title": "团队能力",
          "style": {
            "marginBottom": "15px"
          }
        },
        "skillBars": {
          "enabled": true,
          "items": [
            { "name": "计算机", "level": 90, "label": "精通" },
            { "name": "英语", "level": 75, "label": "良好" }
          ],
          "barStyle": {
            "height": "8px",
            "backgroundColor": "#ecf0f1",
            "borderRadius": "4px"
          },
          "progressStyle": {
            "backgroundColor": "#3498db",
            "borderRadius": "4px"
          }
        }
      }
    },
    {
      "type": "awards",
      "visible": true,
      "config": {
        "layout": "simple",
        "title": "荣誉证书",
        "titleStyle": "dark-header",
        "titleStyleConfig": {
          "backgroundColor": "#34495e",
          "color": "#ffffff",
          "padding": "8px 15px",
          "fontSize": "16px",
          "fontWeight": "600"
        },
        "itemStyle": {
          "fontSize": "13px",
          "lineHeight": "1.6",
          "color": "#2c3e50",
          "marginBottom": "8px"
        }
      }
    },
    {
      "type": "hobbies",
      "visible": true,
      "config": {
        "layout": "circular",
        "title": "兴趣爱好",
        "titleStyle": "dark-header",
        "titleStyleConfig": {
          "backgroundColor": "#34495e",
          "color": "#ffffff",
          "padding": "8px 15px",
          "fontSize": "16px",
          "fontWeight": "600"
        },
        "circularStyle": {
          "width": "60px",
          "height": "60px",
          "borderRadius": "50%",
          "backgroundColor": "#ecf0f1",
          "border": "2px solid #bdc3c7",
          "display": "flex",
          "alignItems": "center",
          "justifyContent": "center",
          "margin": "0 10px 10px 0"
        },
        "textStyle": {
          "fontSize": "12px",
          "color": "#2c3e50",
          "textAlign": "center"
        }
      }
    }
  ]
}
```

### 该模板特点

1. **双栏布局**：左侧35%为个人信息侧栏，右侧65%为主要内容
2. **深色标题**：所有模块标题使用深灰色背景（#34495e）配白色文字
3. **浅灰侧栏**：左侧栏使用浅灰色背景（#f8f9fa）
4. **时间轴样式**：工作经验和教育背景采用时间轴布局
5. **技能条**：包含可视化的技能水平条
6. **圆形兴趣**：兴趣爱好以圆形按钮形式展示
7. **响应式间距**：统一的边距和间距配置

> 注意：此模板需要前端渲染引擎支持 `sidebar` 布局类型和 `dark-header` 标题样式。如果当前引擎不支持，可能需要先实现相应的布局组件。
