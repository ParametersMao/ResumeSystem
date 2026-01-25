# 简历 JSON 模板上传规范

## 概述

本文档定义了简历模板 JSON 文件的完整上传规范。该规范用于前端模板上传校验和中台模板管理，确保模板数据结构的正确性和一致性。

**核心原则**：模板控制排版样式，用户数据控制内容。

---

## 1. 文件格式要求

### 1.1 文件类型
- **支持格式**：`.json` 或 `.template`
- **文件大小**：建议不超过 2MB
- **编码格式**：UTF-8

### 1.2 JSON 格式要求
- 必须是有效的 JSON 格式
- 支持注释（部分解析器支持，但建议移除）
- 建议使用 2 空格缩进格式化

---

## 2. 必填字段

根据前端验证 Schema（`templateSchema.ts`），以下字段为**必填**：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `templateName` | `string` | 模板名称，至少1个字符 |

---

## 3. 推荐结构

### 3.1 顶层结构

```json
{
  "templateName": "模板名称",
  "templateVersion": 1,
  "version": "1.0.0",
  "description": "模板描述",
  "styles": {
    "colors": {},
    "fonts": {},
    "spacing": {}
  },
  "globalConfig": {},
  "layout": []
}
```

### 3.2 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `templateName` | `string` | ✅ | 模板展示名称 |
| `templateVersion` | `number` | ⚠️ | 模板版本号，建议填写，用于版本兼容与迁移 |
| `version` | `number \| string` | ❌ | 版本号（兼容字段） |
| `description` | `string` | ❌ | 模板描述 |
| `styles` | `object` | ❌ | 样式配置（配色、字体、间距等） |
| `globalConfig` | `object` | ❌ | 全局配置（容器样式等） |
| `layout` | `array` | ⚠️ | 模块布局数组，建议必填 |

---

## 4. 样式配置 (styles)

### 4.1 颜色配置 (colors)

```json
{
  "styles": {
    "colors": {
      "primary": "#2c5aa0",
      "secondary": "#f1f5f9",
      "text": "#334155",
      "background": "#ffffff",
      "accent": "#3b82f6"
    }
  }
}
```

**支持的颜色字段**：
- `primary`：主色调
- `secondary`：次要颜色
- `text`：文本颜色
- `background`：背景颜色
- `accent`：强调色
- 其他自定义颜色键值对

### 4.2 字体配置 (fonts)

```json
{
  "styles": {
    "fonts": {
      "heading": "Microsoft YaHei, Arial, sans-serif",
      "body": "Microsoft YaHei, Arial, sans-serif"
    }
  }
}
```

### 4.3 间距配置 (spacing)

```json
{
  "styles": {
    "spacing": {
      "sectionMargin": "25px",
      "elementMargin": "15px",
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px",
      "xl": "32px"
    }
  }
}
```

**注意**：所有长度单位必须为字符串格式，如 `"25px"`，不能是数字。

---

## 5. 全局配置 (globalConfig)

```json
{
  "globalConfig": {
    "maxWidth": "860px",
    "padding": "30px",
    "borderRadius": "8px",
    "boxShadow": "0 2px 10px rgba(0,0,0,0.1)",
    "contentBackground": "#ffffff",
    "layout": "single-column"
  }
}
```

**支持的布局类型**：
- `single-column`：单栏布局
- `two-column`：双栏布局
- `three-column`：三栏布局
- `custom`：自定义布局

---

## 6. 模块布局 (layout)

`layout` 是一个数组，定义模块的渲染顺序和样式。从上到下为实际渲染顺序。

### 6.1 基本结构

```json
{
  "layout": [
    {
      "type": "personal",
      "visible": true,
      "config": {}
    }
  ]
}
```

### 6.2 支持的模块类型

| 类型 | 说明 |
|------|------|
| `personal` | 个人信息 |
| `experience` | 工作经验 |
| `education` | 教育背景 |
| `skills` | 技能特长 |
| `projects` | 项目经验 |
| `internship` | 实习经历 |
| `campus` | 校园经历 |
| `awards` | 荣誉证书 |
| `summary` | 自我评价 |
| `hobbies` | 兴趣爱好 |
| `intention` | 求职意向 |
| `custom` | 自定义模块 |

### 6.3 通用配置

每个模块都支持以下通用配置：

```json
{
  "type": "experience",
  "visible": true,
  "title": "工作经历",
  "titleStyle": "ribbon",
  "config": {
    "layout": "timeline",
    "containerStyle": {},
    "itemStyle": {},
    "headerStyle": {},
    "contentStyle": {}
  }
}
```

**通用配置字段**：
- `title`：模块标题（如"工作经历"）
- `titleStyle`：标题样式类型，支持 `"ribbon" | "underline" | "none" | "dark-header"`
- `config`：模块特定配置对象

---

## 7. 各模块配置细则

在所有模块中遵循以下原则：

1. **字段固定**：每个模块可用的字段均在前端定义（例如 `sectionTypes.ts`、`personalFields.ts`），上传的模板 **不能新增字段名称**，只能决定哪些字段显示以及如何呈现。
2. **样式由模板控制**：模板通过 `config`、`styles`、`sectionStyles` 等配置项控制排版、颜色、字体、间距等。前端不会再写死样式（除兜底默认值）。
3. **布局可选**：大部分模块提供多种布局（如 `timeline`、`simple`、`tags`、`progress` 等），模板通过 `config.layout` 选择，并可继续覆盖布局内部的样式。
4. **数据只读**：模板不负责修改数据内容，只能读取 `profile` 和 `sections` 里的数据进行渲染。

### 7.1 personal（个人信息）

```json
{
  "type": "personal",
  "visible": true,
  "config": {
    "layout": "flexible",
    "showTitle": false,
    "title": "基本信息",
    "titleStyle": "ribbon",
    "fields": {
      "visible": ["name", "title", "gender", "age", "phone", "email"],
      "order": ["name", "title", "gender", "age", "phone", "email"],
      "labels": {
        "name": "姓名",
        "title": "职位",
        "gender": "性别",
        "age": "年龄",
        "phone": "电话",
        "email": "邮箱"
      },
      "styles": {
        "name": {
          "fontSize": "24px",
          "fontWeight": "600",
          "color": "#333"
        }
      }
    },
    "avatar": {
      "width": "120px",
      "height": "120px",
      "background": "#e74c3c"
    }
  }
}
```

**支持的布局类型**：
- `center`：居中布局（固定样式）
- `table`：表格布局（固定样式）
- `card`：卡片布局（固定样式）
- `flexible`：灵活布局（推荐，完全由模板控制）
- `sidebar`：侧边栏布局（双栏布局时使用）

**flexible 布局配置说明**（推荐使用）：

基本信息模块的字段是固定的，但显示和样式完全由模板控制：

**可用字段列表**：
- `name`：姓名
- `title`：职位
- `gender`：性别
- `age`：年龄
- `yearsOfExperience`：工作经验
- `phone`：电话
- `email`：邮箱
- `site`：主页
- `avatar`：头像
- `summary`：自我概述

**配置示例**：
```json
{
  "config": {
    "layout": "flexible",
    "fields": {
      "visible": ["name", "title", "phone", "email"],  // 只显示这些字段
      "order": ["name", "title", "phone", "email"],    // 显示顺序
      "labels": {                                       // 自定义字段标签
        "name": "姓名",
        "title": "职位"
      },
      "styles": {                                       // 字段样式
        "name": {
          "fontSize": "24px",
          "fontWeight": "600"
        }
      }
    },
    "nameStyle": {                                      // 姓名样式
      "fontSize": "28px",
      "fontWeight": "700",
      "color": "#2c3e50"
    },
    "titleStyle": {                                     // 职位样式
      "fontSize": "18px",
      "color": "#7f8c8d"
    },
    "fieldStyle": {                                     // 通用字段样式
      "fontSize": "14px",
      "marginBottom": "8px"
    },
    "contactStyle": {                                   // 联系方式样式
      "display": "flex",
      "gap": "16px"
    },
    "summaryStyle": {                                  // 自我概述样式
      "marginTop": "20px",
      "paddingTop": "20px",
      "borderTop": "1px solid #eee"
    }
  }
}
```

**table 布局特殊配置**（兼容旧版）：
```json
{
  "config": {
    "layout": "table",
    "fields": [
      ["姓名", "{name}", "年龄", "32岁"],
      ["电话", "{phone}", "邮箱", "{email}"]
    ]
  }
}
```

**支持的占位符**：`{name}` `{title}` `{phone}` `{email}` `{site}`

### 7.2 experience / education / projects（工作/教育/项目经历）

```json
{
  "type": "experience",
  "visible": true,
  "config": {
    "layout": "timeline",
    "title": "工作经历",
    "titleStyle": "ribbon",
    "companyStyle": {
      "fontSize": "16px",
      "fontWeight": "600"
    },
    "positionStyle": {
      "fontSize": "14px",
      "color": "#7f8c8d"
    },
    "dateStyle": {
      "fontSize": "12px",
      "color": "#95a5a6"
    },
    "descriptionStyle": {
      "fontSize": "13px",
      "lineHeight": "1.6"
    }
  }
}
```

**支持的布局类型**：
- `timeline`：时间轴布局
- `simple`：简单列表布局

**富文本字段 `desc` 支持三种结构**：
1. 纯字符串：`"负责核心业务前端研发与性能优化。"`
2. 对象格式（推荐）：`{ "html": "<p>内容</p>", "json": {...}, "text": "内容" }`
3. 旧格式（兼容）：`{ "ops": [...] }`

### 7.3 skills（技能特长）

```json
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
}
```

**支持的布局类型**：
- `tags`：标签布局
- `progress`：进度条布局
- `simple`：简单列表布局
- `mixed`：混合布局

**tags 布局额外配置**：
- `gap`：标签间距
- `tagStyle`：标签样式对象

**progress 布局额外配置**：
- `columns`：列数
- `progressStyle`：进度条容器样式
- `progressBarStyle`：进度条样式

---

## 8. 验证规则

### 8.1 前端验证流程

上传模板文件时会进行以下验证：

1. **JSON 格式校验**：检查是否为有效的 JSON 格式
2. **Schema 校验**：使用 `templateSchema` 验证数据结构
3. **错误提示**：显示详细的验证错误信息

### 8.2 验证规则

| 规则项 | 要求 |
|--------|------|
| `templateName` | 必须存在且长度 ≥ 1 |
| `layout` | 如果存在，必须是非空数组 |
| `layout[].type` | 必须在支持的模块类型集合内 |
| `layout[].visible` | 建议为布尔值 |
| `layout[].config` | 建议为对象 |
| `styles.spacing.*` | 长度单位必须为字符串，如 `"25px"` |

### 8.3 验证错误示例

如果验证失败，会返回详细的错误信息：

```json
{
  "success": false,
  "issues": [
    "[templateName] Required",
    "[layout.0.type] Invalid enum value. Expected 'personal' | 'experience' | ..."
  ]
}
```

---

## 9. 样式优先级

渲染引擎合并规则的优先级（从低到高）：

1. **默认值**（引擎内置）
2. **模板 `styles`、`globalConfig`**
3. **运行时 `extraStyles`**（来自前端"样式设置"面板）
4. **`layout[i].config.*`**（对单个模块的定向覆盖）

**建议**：模板应尽量把"可调节的主题参数"放在 `styles` 内作为全局变量，便于统一调节。

---

## 10. 最小可用模板示例

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
    "spacing": {
      "sectionMargin": "25px",
      "elementMargin": "15px"
    }
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
      "config": {
        "layout": "center",
        "showTitle": false
      }
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

---

## 11. 双栏布局模板示例

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
        }
      }
    }
  ]
}
```

---

## 12. 与用户数据的映射

模板仅决定"排版与样式"，用户数据决定"内容"。

### 12.1 用户数据结构

```json
{
  "profile": {
    "basic": {
      "name": "张三",
      "title": "前端工程师",
      "contacts": {
        "email": "zhangsan@example.com",
        "phone": "13800138000",
        "site": "https://example.com"
      }
    },
    "summary": "拥有3+年前端经验，熟悉 Vue3/TypeScript，关注性能与体验。"
  },
  "sections": [
    {
      "type": "experience",
      "items": [
        {
          "company": "示例公司A",
          "role": "前端工程师",
          "duration": {
            "start": "2022-01",
            "end": "2023-12"
          },
          "desc": "负责核心业务前端研发与性能优化。"
        }
      ]
    },
    {
      "type": "education",
      "items": [
        {
          "school": "北京大学",
          "degree": "计算机科学 本科",
          "duration": {
            "start": "2016-09",
            "end": "2020-06"
          }
        }
      ]
    },
    {
      "type": "skills",
      "items": ["JavaScript", "TypeScript", "Vue3", "Vite", "Pinia"]
    }
  ]
}
```

### 12.2 时间字段规范

所有涉及起止时间的字段统一为 `duration: { start, end }` 格式：

```json
{
  "duration": {
    "start": "2022-01",
    "end": "2023-12"
  }
}
```

---

## 13. 常见问题与约束

### 13.1 常见问题

1. **未提供 `layout` 时**：前端会注入默认布局以保证可渲染，但风格不保证一致。
2. **富文本渲染**：会过滤不安全节点；外链/脚本需遵循安全策略。
3. **打印/PDF**：建议采用服务端渲染（如 Puppeteer），以保证与屏幕一致。

### 13.2 约束条件

- `layout` 应为非空数组；每项包含 `type`、`visible`、`config`
- `type` 必须在支持集合内；未知类型可退化为 `custom` 或拒绝入库
- `styles.spacing` 的长度单位需为字符串，如 `"25px"`
- 建议保存 `templateVersion`，为未来模板 DSL 迭代/迁移预留

### 13.3 扩展性

如需新增布局/能力（如多列栅格、页眉页脚、分页控制等），请在模板评审时提出，我们将迭代 DSL 与前端组件并更新版本号。

---

## 14. JSON Schema 参考

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["templateName"],
  "properties": {
    "templateName": {
      "type": "string",
      "minLength": 1
    },
    "templateVersion": {
      "type": ["integer", "string"]
    },
    "version": {
      "type": ["number", "string"]
    },
    "description": {
      "type": "string"
    },
    "styles": {
      "type": "object",
      "properties": {
        "colors": {
          "type": "object"
        },
        "fonts": {
          "type": "object"
        },
        "spacing": {
          "type": "object"
        }
      }
    },
    "globalConfig": {
      "type": "object"
    },
    "layout": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "enum": [
              "personal",
              "experience",
              "education",
              "skills",
              "projects",
              "internship",
              "campus",
              "awards",
              "summary",
              "hobbies",
              "intention",
              "custom"
            ]
          },
          "visible": {
            "type": "boolean"
          },
          "config": {
            "type": "object"
          }
        },
        "required": ["type"]
      }
    }
  }
}
```

---

## 15. 上传流程

### 15.1 前端上传流程

1. 用户点击"上传模板校验"按钮
2. 选择 JSON 文件（`.json` 或 `.template`）
3. 系统读取文件内容
4. 进行 JSON 格式校验
5. 进行 Schema 结构校验
6. 显示验证结果：
   - ✅ 成功：显示"模板校验通过，可以预览并使用该模板"
   - ⚠️ 失败：显示"模板结构存在问题，请检查校验结果"，并列出具体错误

### 15.2 中台入库建议

- `layout` 为非空数组；每项包含 `type`、`visible`、`config`
- `type` 必须在支持集合内；未知类型可退化为 `custom` 或拒绝入库
- `styles.spacing` 的长度单位需为字符串，如 `"25px"`
- 建议保存 `templateVersion`，为未来模板 DSL 迭代/迁移预留

---

## 16. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024 | 初始版本规范 |

---

## 17. 相关文档

- 前端验证 Schema：`fronted-resume-web/src/utils/templateSchema.ts`
- 模板文件解析：`fronted-resume-web/src/utils/templateFile.ts`
- 中台规范：`middle-resume/TEMPLATE_SPEC.md`
- 前端详细规范：`fronted-resume-web/TEMPLATE_JSON_SPEC.md`

---

## 18. 联系与反馈

如有问题或建议，请联系开发团队或提交 Issue。

---

**最后更新**：2024年

