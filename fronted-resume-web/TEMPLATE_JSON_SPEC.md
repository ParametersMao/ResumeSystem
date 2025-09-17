# 简历模板 JSON 数据结构规范

## 概述

本文档定义了简历模板的完整 JSON 数据结构，支持完全自定义样式、响应式布局、动态组件和 Schema 渲染。

## 基础结构

```json
{
  "templateName": "模板名称",
  "version": "1.0.0",
  "description": "模板描述",
  "author": "作者",
  "tags": ["标签1", "标签2"],
  "previewImage": "预览图URL",
  "templateData": {
    "profile": {
      /* 个人信息结构 */
    },
    "sections": [
      /* 模块列表 */
    ],
    "styles": {
      /* 样式配置 */
    },
    "globalConfig": {
      /* 全局配置 */
    },
    "responsive": {
      /* 响应式配置 */
    },
    "components": {
      /* 自定义组件 */
    }
  }
}
```

## 详细规范

### 1. 个人信息结构 (profile)

```json
{
  "profile": {
    "basic": {
      "name": "姓名",
      "title": "职位",
      "avatar": "头像URL",
      "contacts": {
        "email": "邮箱",
        "phone": "电话",
        "site": "个人网站",
        "address": "地址",
        "wechat": "微信",
        "linkedin": "LinkedIn",
        "github": "GitHub"
      }
    },
    "summary": "个人简介"
  }
}
```

### 2. 模块列表结构 (sections)

```json
{
  "sections": [
    {
      "id": "唯一标识",
      "type": "模块类型",
      "title": "模块标题",
      "visible": true,
      "order": 0,
      "items": [
        /* 模块内容 */
      ],
      "config": {
        /* 模块配置 */
      },
      "style": {
        /* 模块样式 */
      }
    }
  ]
}
```

#### 支持的模块类型

- `basic`: 个人信息
- `experience`: 工作经验
- `education`: 教育背景
- `skills`: 技能特长
- `projects`: 项目经验
- `internship`: 实习经历
- `campus`: 校园经历
- `awards`: 荣誉证书
- `summary`: 自我评价
- `hobbies`: 兴趣爱好
- `intention`: 求职意向
- `custom`: 自定义模块

#### 模块配置 (config)

```json
{
  "config": {
    "title": "模块标题",
    "titleColor": "#333333",
    "titleAlignment": "left|center|right",
    "padding": "20px",
    "margin": "0",
    "backgroundColor": "#ffffff",
    "borderRadius": "8px",
    "boxShadow": "0 2px 4px rgba(0,0,0,0.1)",
    "customClass": "自定义CSS类名",
    "customStyle": {
      /* 自定义内联样式 */
    },
    "gridColumn": "1 / 2|2 / 3", // 双列布局
    "renderer": "自定义渲染器组件",
    "componentId": "注册的组件ID",
    "schema": {
      /* JSON Schema定义 */
    },
    "fields": [
      /* 字段配置 */
    ]
  }
}
```

#### 模块样式 (style)

```json
{
  "style": {
    "gridColumn": "1 / 2",
    "gap": "16px",
    "customStyles": {
      /* 额外样式 */
    }
  }
}
```

### 3. 样式配置 (styles)

```json
{
  "styles": {
    "colors": {
      "primary": "#3498db",
      "secondary": "#2ecc71",
      "text": "#2c3e50",
      "background": "#ffffff",
      "border": "#e9ecef"
    },
    "fonts": {
      "heading": "Inter, sans-serif",
      "body": "Inter, sans-serif"
    },
    "spacing": {
      "sectionMargin": "25px",
      "elementMargin": "15px"
    },
    "customCss": "/* 自定义CSS代码 */",
    "tokens": {
      /* 样式Token */
    }
  }
}
```

#### 样式 Token 系统

```json
{
  "tokens": {
    "spacing": {
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px",
      "xl": "32px",
      "xxl": "48px"
    },
    "colors": {
      "primary": "#3498db",
      "secondary": "#2ecc71",
      "success": "#27ae60",
      "warning": "#f39c12",
      "error": "#e74c3c",
      "text": {
        "primary": "#2c3e50",
        "secondary": "#7f8c8d",
        "disabled": "#bdc3c7"
      },
      "background": {
        "primary": "#ffffff",
        "secondary": "#f8f9fa",
        "tertiary": "#e9ecef"
      }
    },
    "typography": {
      "fontFamily": {
        "primary": "Inter, sans-serif",
        "secondary": "Georgia, serif",
        "mono": "Fira Code, monospace"
      },
      "fontSize": {
        "xs": "12px",
        "sm": "14px",
        "base": "16px",
        "lg": "18px",
        "xl": "20px",
        "2xl": "24px",
        "3xl": "30px",
        "4xl": "36px"
      },
      "fontWeight": {
        "light": 300,
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      }
    },
    "borderRadius": {
      "none": "0",
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px",
      "full": "9999px"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
    }
  }
}
```

### 4. 全局配置 (globalConfig)

```json
{
  "globalConfig": {
    "maxWidth": "860px",
    "margin": "0 auto",
    "padding": "30px",
    "contentBackground": "#ffffff",
    "borderRadius": "6px",
    "boxShadow": "0 2px 10px rgba(0,0,0,0.1)",
    "lineHeight": "1.6",
    "customStyle": {
      /* 全局自定义样式 */
    },
    "contentStyle": {
      /* 内容区域样式 */
    }
  }
}
```

### 5. 响应式配置 (responsive)

```json
{
  "responsive": {
    "breakpoints": {
      "mobile": "0px",
      "tablet": "768px",
      "desktop": "1024px",
      "wide": "1280px"
    },
    "grid": {
      "mobile": { "columns": 1, "gap": "16px" },
      "tablet": { "columns": 2, "gap": "20px" },
      "desktop": { "columns": 3, "gap": "24px" },
      "wide": { "columns": 4, "gap": "32px" }
    },
    "typography": {
      "mobile": {
        "h1": { "fontSize": "24px", "lineHeight": "1.2" },
        "h2": { "fontSize": "20px", "lineHeight": "1.3" },
        "body": { "fontSize": "14px", "lineHeight": "1.5" }
      },
      "tablet": {
        "h1": { "fontSize": "28px" },
        "h2": { "fontSize": "24px" },
        "body": { "fontSize": "16px" }
      },
      "desktop": {
        "h1": { "fontSize": "32px" },
        "h2": { "fontSize": "28px" },
        "body": { "fontSize": "18px" }
      }
    },
    "spacing": {
      "mobile": { "xs": "4px", "sm": "8px", "md": "16px" },
      "tablet": { "xs": "6px", "sm": "12px", "md": "20px" },
      "desktop": { "xs": "8px", "sm": "16px", "md": "24px" }
    }
  }
}
```

### 6. 自定义组件 (components)

```json
{
  "components": {
    "custom-chart": {
      "id": "custom-chart",
      "name": "自定义图表组件",
      "url": "https://example.com/components/chart.js",
      "props": {
        "type": "bar|line|pie",
        "data": "object",
        "options": "object"
      }
    },
    "custom-media": {
      "id": "custom-media",
      "name": "媒体组件",
      "component": "MediaComponent",
      "props": {
        "src": "string",
        "type": "image|video|audio",
        "controls": "boolean"
      }
    }
  }
}
```

### 7. JSON Schema 渲染

```json
{
  "config": {
    "schema": {
      "type": "grid|flex|text|image|list|table|chart|custom",
      "className": "自定义类名",
      "style": {
        /* 样式对象 */
      },
      "columns": 3,
      "gap": "16px",
      "direction": "row|column",
      "justify": "flex-start|center|flex-end|space-between",
      "align": "stretch|center|flex-start|flex-end",
      "items": [
        /* 子元素Schema */
      ],
      "content": "文本内容",
      "field": "数据字段名",
      "src": "图片URL",
      "alt": "图片描述",
      "variant": "文本变体",
      "fontSize": "16px",
      "fontWeight": "400",
      "color": "#333",
      "textAlign": "left|center|right",
      "width": "100%",
      "height": "auto",
      "objectFit": "cover|contain|fill",
      "header": ["列1", "列2", "列3"],
      "rows": [["数据1", "数据2", "数据3"]],
      "columnStyles": [{ "width": "100px" }],
      "striped": true,
      "bordered": true,
      "chartType": "bar|line|pie",
      "chartData": {
        /* 图表数据 */
      },
      "component": "Vue组件",
      "componentId": "注册的组件ID",
      "props": {
        /* 组件属性 */
      }
    }
  }
}
```

## 完整示例

### 基础模板示例

```json
{
  "templateName": "现代简约简历",
  "version": "1.0.0",
  "description": "简洁现代的简历模板，支持双列布局",
  "author": "简历系统",
  "tags": ["现代", "简约", "双列"],
  "previewImage": "https://example.com/preview.jpg",
  "templateData": {
    "profile": {
      "basic": {
        "name": "张三",
        "title": "前端工程师",
        "avatar": "https://example.com/avatar.jpg",
        "contacts": {
          "email": "zhangsan@example.com",
          "phone": "13800138000",
          "site": "https://zhangsan.dev"
        }
      },
      "summary": "5年前端开发经验，精通Vue.js、React等现代前端技术栈"
    },
    "sections": [
      {
        "id": "basic-1",
        "type": "basic",
        "title": "个人信息",
        "visible": true,
        "order": 0,
        "items": [],
        "config": {
          "layout": "center",
          "customClass": "profile-section"
        },
        "style": {
          "gridColumn": "1 / 2"
        }
      },
      {
        "id": "experience-1",
        "type": "experience",
        "title": "工作经验",
        "visible": true,
        "order": 1,
        "items": [
          {
            "company": "ABC科技有限公司",
            "role": "高级前端工程师",
            "start": "2020-01",
            "end": "至今",
            "desc": "负责公司核心产品的前端开发工作"
          }
        ],
        "config": {
          "titleColor": "#2c3e50",
          "titleAlignment": "left"
        },
        "style": {
          "gridColumn": "2 / 3"
        }
      }
    ],
    "styles": {
      "colors": {
        "primary": "#3498db",
        "secondary": "#2ecc71",
        "text": "#2c3e50",
        "background": "#ffffff"
      },
      "fonts": {
        "heading": "Inter, sans-serif",
        "body": "Inter, sans-serif"
      },
      "spacing": {
        "sectionMargin": "25px",
        "elementMargin": "15px"
      },
      "customCss": `
        .profile-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
        }
        .section-title {
          position: relative;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background: var(--colors-primary);
        }
      `
    },
    "globalConfig": {
      "maxWidth": "860px",
      "margin": "0 auto",
      "padding": "30px",
      "contentBackground": "#ffffff",
      "borderRadius": "6px",
      "boxShadow": "0 2px 10px rgba(0,0,0,0.1)"
    },
    "responsive": {
      "breakpoints": {
        "mobile": "0px",
        "tablet": "768px",
        "desktop": "1024px"
      },
      "grid": {
        "mobile": { "columns": 1, "gap": "16px" },
        "tablet": { "columns": 2, "gap": "20px" },
        "desktop": { "columns": 2, "gap": "24px" }
      }
    }
  }
}
```

### 高级 Schema 模板示例

```json
{
  "templateName": "创意简历模板",
  "version": "2.0.0",
  "description": "使用JSON Schema的创意简历模板",
  "templateData": {
    "sections": [
      {
        "id": "hero-section",
        "type": "custom",
        "title": "个人展示区",
        "visible": true,
        "order": 0,
        "items": [],
        "config": {
          "schema": {
            "type": "flex",
            "direction": "row",
            "justify": "space-between",
            "align": "center",
            "gap": "40px",
            "style": {
              "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "padding": "60px 40px",
              "borderRadius": "20px",
              "color": "white"
            },
            "items": [
              {
                "type": "text",
                "content": "张三",
                "style": {
                  "fontSize": "48px",
                  "fontWeight": "700",
                  "marginBottom": "10px"
                }
              },
              {
                "type": "text",
                "content": "高级前端工程师",
                "style": {
                  "fontSize": "24px",
                  "opacity": "0.9"
                }
              },
              {
                "type": "image",
                "src": "https://example.com/avatar.jpg",
                "style": {
                  "width": "120px",
                  "height": "120px",
                  "borderRadius": "50%",
                  "border": "4px solid white"
                }
              }
            ]
          }
        }
      },
      {
        "id": "skills-grid",
        "type": "custom",
        "title": "技能展示",
        "visible": true,
        "order": 1,
        "items": [],
        "config": {
          "schema": {
            "type": "grid",
            "columns": 3,
            "gap": "20px",
            "items": [
              {
                "type": "text",
                "content": "Vue.js",
                "className": "skill-tag",
                "style": {
                  "background": "#4fc08d",
                  "color": "white",
                  "padding": "10px 20px",
                  "borderRadius": "25px",
                  "textAlign": "center",
                  "fontWeight": "600"
                }
              },
              {
                "type": "text",
                "content": "React",
                "className": "skill-tag",
                "style": {
                  "background": "#61dafb",
                  "color": "white",
                  "padding": "10px 20px",
                  "borderRadius": "25px",
                  "textAlign": "center",
                  "fontWeight": "600"
                }
              },
              {
                "type": "text",
                "content": "TypeScript",
                "className": "skill-tag",
                "style": {
                  "background": "#3178c6",
                  "color": "white",
                  "padding": "10px 20px",
                  "borderRadius": "25px",
                  "textAlign": "center",
                  "fontWeight": "600"
                }
              }
            ]
          }
        }
      }
    ],
    "styles": {
      "customCss": `
        .skill-tag {
          transition: transform 0.2s ease;
        }
        .skill-tag:hover {
          transform: translateY(-2px);
        }
      `
    }
  }
}
```

## 使用说明

1. **模板创建**: 按照规范创建 JSON 文件，包含所有必要的字段
2. **样式自定义**: 使用`customCss`字段添加全局样式，使用`customClass`和`customStyle`自定义模块样式
3. **响应式设计**: 配置`responsive`字段实现多端适配
4. **组件扩展**: 通过`components`字段注册自定义组件
5. **Schema 渲染**: 使用`schema`字段实现声明式布局

## 注意事项

1. 所有字段都是可选的，系统会使用默认值
2. `customCss`会经过安全过滤，移除危险代码
3. 响应式配置会生成对应的媒体查询 CSS
4. Schema 渲染器支持嵌套和组合使用
5. 组件注册需要验证安全性

这个规范提供了完整的模板定义能力，支持从简单到复杂的各种简历模板需求。
