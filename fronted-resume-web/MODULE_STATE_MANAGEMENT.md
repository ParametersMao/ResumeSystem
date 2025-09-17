# 模块状态管理系统

## 概述

本系统实现了简历编辑器的分层控制状态管理，确保编辑区域和预览区域的完全同步。系统采用三层架构：

1. **模板层**：控制默认显示状态
2. **用户层**：保存用户偏好设置
3. **会话层**：实时编辑状态

## 核心特性

### 1. 模块类型支持

- `basic` - 基本信息（必需，不可隐藏/收起）
- `intention` - 求职意向
- `education` - 教育背景
- `experience` - 工作经验
- `projects` - 项目经历
- `internship` - 实习经历
- `campus` - 校园经历
- `skills` - 技能特长
- `awards` - 荣誉证书
- `summary` - 自我评价
- `hobbies` - 兴趣爱好
- `custom` - 自定义模块

### 2. 状态控制

- **可见性控制**：`visible`（模板默认） + `userVisible`（用户设置）
- **收起控制**：`collapsed`（是否收起）
- **顺序控制**：`order`（模块排序）
- **权限控制**：`allowHide`、`allowCollapse`（是否允许操作）

### 3. 本地持久化

- 使用 `localStorage` 保存用户设置
- 自动加载/保存用户偏好
- 支持重置为模板默认值

## 使用方法

### 1. 基本使用

```typescript
import { moduleStateManager } from "@/utils/moduleStateManager";

// 设置模板数据
moduleStateManager.setTemplateData(templateData);

// 获取编辑区域可见模块
const editorModules = moduleStateManager.getEditorVisibleModules();

// 获取预览区域可见模块
const previewModules = moduleStateManager.getPreviewVisibleModules();

// 切换模块可见性
moduleStateManager.toggleModuleVisibility("skills");

// 切换模块收起状态
moduleStateManager.toggleModuleCollapse("education");

// 移动模块顺序
moduleStateManager.moveModule("experience", 1); // 下移
moduleStateManager.moveModule("education", -1); // 上移
```

### 2. 在组件中使用

```vue
<template>
  <div class="module-list">
    <div
      v-for="module in editorVisibleModules"
      :key="module.type"
      class="module-item"
      :class="{ collapsed: module.collapsed }"
    >
      <div class="module-header">
        <span>{{ module.config.title }}</span>
        <div class="module-controls">
          <!-- 收起/展开按钮 -->
          <el-button
            v-if="module.allowCollapse"
            @click="toggleCollapse(module.type)"
          >
            {{ module.collapsed ? "展开" : "收起" }}
          </el-button>

          <!-- 显示/隐藏开关 -->
          <el-switch
            v-if="module.allowHide"
            v-model="module.userVisible"
            @change="toggleVisibility(module.type)"
          />
        </div>
      </div>

      <!-- 模块内容 -->
      <div v-show="!module.collapsed" class="module-content">
        <!-- 模块编辑器 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { moduleStateManager } from "@/utils/moduleStateManager";

const editorVisibleModules = computed(
  () => moduleStateManager.getEditorVisibleModules().value
);

const toggleVisibility = (moduleType: string) => {
  moduleStateManager.toggleModuleVisibility(moduleType);
};

const toggleCollapse = (moduleType: string) => {
  moduleStateManager.toggleModuleCollapse(moduleType);
};
</script>
```

### 3. 模板数据结构

```json
{
  "templateName": "标准模板",
  "templateVersion": 1,
  "styles": {
    /* 样式配置 */
  },
  "globalConfig": {
    /* 全局配置 */
  },
  "layout": [
    {
      "type": "basic",
      "visible": true,
      "collapsed": false,
      "order": 0,
      "config": {
        "title": "基本信息",
        "allowHide": false,
        "allowCollapse": false
      }
    },
    {
      "type": "education",
      "visible": true,
      "collapsed": false,
      "order": 1,
      "config": {
        "title": "教育背景",
        "allowHide": true,
        "allowCollapse": true
      }
    }
  ]
}
```

## 状态同步机制

### 1. 编辑区域 ↔ 预览区域

- 编辑区域只显示 `visible && userVisible` 的模块
- 预览区域只渲染 `visible && userVisible` 的模块
- 实时同步，无延迟

### 2. 模板切换

- 新模板自动应用默认状态
- 保留用户之前的设置（如果兼容）
- 支持重置为模板默认值

### 3. 数据持久化

- 用户设置自动保存到 `localStorage`
- 页面刷新后自动恢复用户偏好
- 支持清除所有用户设置

## 测试页面

访问 `/module-state-test` 路由可以查看测试页面，包含：

- 模块状态实时显示
- 可见性/收起状态控制
- 模块顺序调整
- 编辑区域/预览区域同步预览
- 模板加载/重置功能

## 注意事项

1. **必需模块**：`basic` 模块不可隐藏，不可收起
2. **类型安全**：使用 TypeScript 确保类型安全
3. **性能优化**：使用 Vue 3 的 `computed` 和 `ref` 优化性能
4. **错误处理**：包含完整的错误处理和边界检查
5. **向后兼容**：支持旧版本模板数据格式

## 扩展功能

### 1. 云存储集成

- 用户设置可同步到云端
- 多设备设置同步
- 设置版本管理

### 2. 高级权限控制

- 角色权限管理
- 模块访问控制
- 操作审计日志

### 3. 模板市场

- 模板分享与下载
- 用户设置导入/导出
- 社区模板推荐

## 技术架构

```
ModuleStateManager (单例)
├── 状态管理
│   ├── 模板状态 (templateData)
│   ├── 用户状态 (userSettings)
│   └── 计算状态 (moduleStates)
├── 持久化
│   ├── localStorage 存储
│   └── 设置加载/保存
├── 状态计算
│   ├── 编辑区域可见性
│   ├── 预览区域可见性
│   └── 模块排序
└── 操作接口
    ├── 可见性切换
    ├── 收起状态切换
    └── 顺序调整
```

## 更新日志

### v1.0.0 (当前版本)

- ✅ 基础状态管理
- ✅ 本地持久化
- ✅ 实时同步
- ✅ 类型安全
- ✅ 测试页面

### v1.1.0 (计划中)

- 🔄 云存储集成
- 🔄 高级权限控制
- 🔄 批量操作
- 🔄 设置导入/导出

### v2.0.0 (计划中)

- 🔄 模板市场
- 🔄 社区功能
- 🔄 高级分析
- 🔄 插件系统
