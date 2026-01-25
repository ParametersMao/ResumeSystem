# 简历模板 JSON 规范（渲染引擎 v2）

## 目标

- 规范模板结构，保证渲染引擎与编辑器一致
- 样式与内容分离，模板负责样式和默认显隐
- 简历数据始终保留全量模块，显隐仅由 `visible` 控制

## 顶层结构

```json
{
  "schemaVersion": 2,
  "templateName": "模板名称",
  "templateType": "single-column",
  "theme": {},
  "globalStyles": {},
  "layout": {},
  "sectionStyles": {},
  "sections": [],
  "responsive": {},
  "assets": {},
  "customCss": "/* 可选 */"
}
```

### 字段说明

- `schemaVersion`: 固定为 `2`
- `templateName`: 模板名称
- `templateType`: 布局类型，`single-column | two-column | three-column | custom`
- `theme`: 主题设计令牌，转换为 CSS 变量
- `globalStyles`: 全局样式
- `layout`: 布局配置（容器、列、间距）
- `sectionStyles`: 各模块样式
- `sections`: 模块清单（模板默认显隐与排序）
- `responsive`: 响应式样式（可选）
- `assets`: 资源配置（可选）
- `customCss`: 追加 CSS（可选）

## 模块与数据规则

### 模块类型（标准列表）

`basic | intention | education | experience | projects | skills | internship | campus | awards | summary | hobbies | custom`

### 模块显隐规则

- 模板仅决定默认显隐：`sections[].visible`
- 简历数据始终包含所有标准模块
- 若模板缺失某模块，编辑器仍显示该模块，默认 `visible=false`
- 用户开启显示后，预览区即时显示该模块

### sections 定义

```json
{
  "id": "experience-1",
  "type": "experience",
  "title": "工作经验",
  "visible": true,
  "order": 2,
  "items": [],
  "config": {},
  "style": {},
  "data": {}
}
```

- `id`: 唯一标识
- `type`: 模块类型
- `title`: 模块标题（为空时使用默认标题）
- `visible`: 默认显隐
- `order`: 排序值（越小越靠前）
- `items`: 内容数组（常规模块）
- `config`: 模块渲染配置（布局、字段、图标等）
- `style`: 模块内联样式覆盖
- `data`: 仅 `basic` 等需要结构化数据的模块使用

## theme（主题令牌）

```json
{
  "colors": {
    "primary": "#2f80ed",
    "secondary": "#2ecc71",
    "tertiary": "#e67e22",
    "text": {
      "primary": "#333333",
      "secondary": "#666666",
      "muted": "#999999"
    },
    "background": "#ffffff",
    "border": "#eeeeee"
  },
  "typography": {
    "fontFamily": {
      "body": "'Microsoft YaHei', Arial, sans-serif",
      "heading": "'Microsoft YaHei', Arial, sans-serif"
    }
  },
  "spacing": {
    "unit": "8px",
    "sectionMargin": "20px"
  },
  "borders": {
    "radius": { "small": "2px", "medium": "4px", "large": "8px" },
    "width": { "thin": "1px", "medium": "2px", "thick": "4px" }
  }
}
```

## globalStyles（全局样式）

```json
{
  "backgroundColor": "#f5f5f5",
  "fontFamily": "var(--typography-fontFamily-body)",
  "fontSize": "14px",
  "lineHeight": "1.6",
  "color": "var(--colors-text-primary)",
  "elements": {
    "h1, h2, h3, h4, h5, h6": {
      "fontFamily": "var(--typography-fontFamily-heading)",
      "marginTop": "0",
      "marginBottom": "16px",
      "lineHeight": "1.3",
      "color": "var(--colors-primary)"
    }
  }
}
```

## layout（布局）

```json
{
  "type": "single-column",
  "container": {
    "maxWidth": "860px",
    "margin": "0 auto",
    "padding": "20px"
  },
  "content": {
    "padding": "30px",
    "backgroundColor": "#ffffff",
    "borderRadius": "6px",
    "boxShadow": "0 2px 10px rgba(0,0,0,0.1)"
  },
  "columns": {
    "widths": ["30%", "70%"],
    "gap": "20px",
    "leftStyle": {},
    "rightStyle": {}
  }
}
```

## sectionStyles（模块样式）

```json
{
  "experience": {
    "container": { "marginBottom": "20px" },
    "title": { "fontSize": "18px", "fontWeight": "700" },
    "content": { "fontSize": "14px", "lineHeight": "1.6" },
    "items": { "spacing": "12px" }
  }
}
```

## basic 模块建议配置

```json
{
  "type": "basic",
  "title": "个人信息",
  "visible": true,
  "config": {
    "layout": "flexible",
    "showTitle": false,
    "fields": {
      "visible": ["name", "title", "phone", "email", "site", "gender", "age", "yearsOfExperience", "summary"],
      "order": ["name", "title", "phone", "email", "site", "gender", "age", "yearsOfExperience", "summary"],
      "labels": {
        "yearsOfExperience": "工作经验"
      }
    }
  }
}
```

## 推荐商业化风格示例

```json
{
  "theme": {
    "colors": {
      "primary": "#2563eb",
      "secondary": "#64748b",
      "tertiary": "#f97316",
      "text": {
        "primary": "#111827",
        "secondary": "#4b5563",
        "muted": "#9aa3b2"
      },
      "background": "#ffffff",
      "border": "rgba(15, 23, 42, 0.12)"
    },
    "typography": {
      "fontFamily": {
        "body": "'Inter', 'Microsoft YaHei', Arial, sans-serif",
        "heading": "'Inter', 'Microsoft YaHei', Arial, sans-serif"
      }
    },
    "spacing": {
      "unit": "8px",
      "sectionMargin": "22px"
    }
  },
  "globalStyles": {
    "backgroundColor": "#f5f7fb",
    "fontFamily": "var(--typography-fontFamily-body)",
    "fontSize": "14px",
    "lineHeight": "1.7",
    "color": "var(--colors-text-primary)"
  },
  "sectionStyles": {
    "experience": {
      "title": {
        "fontSize": "18px",
        "fontWeight": "700",
        "color": "var(--colors-text-primary)",
        "borderBottom": "2px solid var(--colors-primary)",
        "paddingBottom": "6px"
      },
      "content": {
        "color": "var(--colors-text-primary)",
        "lineHeight": "1.7"
      }
    },
    "projects": {
      "title": {
        "fontSize": "18px",
        "fontWeight": "700",
        "color": "var(--colors-text-primary)",
        "borderBottom": "2px solid var(--colors-primary)",
        "paddingBottom": "6px"
      },
      "content": {
        "color": "var(--colors-text-primary)",
        "lineHeight": "1.7"
      }
    }
  }
}
```

## 兼容旧格式说明（过渡）

- 若模板缺失 `theme/layout/sectionStyles`，会走旧格式适配逻辑
- 旧格式 `layout[]` 会被转换为 `sections` 与 `sectionStyles`
- 旧格式中未定义的模块会在编辑器中补齐为 `visible=false`

