"use strict";
/**
 * 数据库模板验证脚本
 * 用于验证数据库中的模板数据是否符合渲染引擎期望的格式
 * 
 * 运行方式: node verify-db-templates.js
 */

const mysql = require('mysql2/promise');

// 期望的顶级字段
const REQUIRED_FIELDS = ['templateName', 'theme', 'layout', 'sectionStyles'];

// 期望的 theme.colors 字段
const REQUIRED_THEME_COLORS = ['primary', 'text', 'background', 'border'];

// 期望的 theme.colors.text 字段
const REQUIRED_TEXT_COLORS = ['primary'];

// 期望的 layout 字段
const REQUIRED_LAYOUT_FIELDS = ['type'];

// 期望的 sectionStyles 模块类型
const EXPECTED_MODULE_TYPES = ['basic', 'summary', 'education', 'experience', 
  'projects', 'skills', 'awards', 'intention', 'internship', 'campus', 
  'hobbies', 'custom'];

// 期望的 sectionStyle 字段（每个模块）
const SECTION_STYLE_FIELDS = ['container', 'title', 'content'];

async function verifyTemplate(obj, name) {
  const issues = [];
  const warnings = [];
  
  // 1. 检查顶级字段
  for (const field of REQUIRED_FIELDS) {
    if (!obj[field]) {
      issues.push(`缺少必需字段: ${field}`);
    }
  }
  
  if (!obj.templateName) {
    issues.push('缺少 templateName');
  }
  
  // 2. 检查 theme.colors
  if (obj.theme && obj.theme.colors) {
    const colors = obj.theme.colors;
    
    // 检查 primary
    if (!colors.primary) {
      issues.push('theme.colors.primary 未定义');
    }
    
    // 检查 text - 必须是对象，包含 primary
    if (colors.text === undefined) {
      warnings.push('theme.colors.text 未定义');
    } else if (typeof colors.text === 'string') {
      issues.push('theme.colors.text 是字符串，应为对象 { primary, secondary, muted }');
    } else if (!colors.text.primary) {
      issues.push('theme.colors.text.primary 未定义');
    }
    
    // 检查 background
    if (!colors.background) {
      warnings.push('theme.colors.background 未定义');
    }
    
    // 检查 border
    if (!colors.border) {
      warnings.push('theme.colors.border 未定义');
    }
    
    // 检查是否有旧的 text 字段（字符串形式）
    if (colors.text && typeof colors.text === 'string') {
      issues.push(`theme.colors.text 是字符串 "${colors.text}"，应为对象 { primary: "${colors.text}" }`);
    }
  } else {
    issues.push('theme.colors 未定义');
  }
  
  // 3. 检查 layout
  if (obj.layout) {
    if (!obj.layout.type) {
      issues.push('layout.type 未定义');
    } else {
      // 验证布局类型
      const validTypes = ['single-column', 'two-column', 'three-column', 'custom'];
      if (!validTypes.includes(obj.layout.type)) {
        warnings.push(`layout.type "${obj.layout.type}" 不是标准类型`);
      }
    }
    
    // 两列布局检查
    if (obj.layout.type === 'two-column') {
      if (!obj.layout.columns) {
        warnings.push('两列布局缺少 layout.columns 配置');
      } else {
        if (!obj.layout.columns.widths) {
          warnings.push('两列布局缺少 layout.columns.widths');
        }
        if (!obj.layout.columns.leftStyle) {
          warnings.push('两列布局缺少 layout.columns.leftStyle');
        }
        if (!obj.layout.columns.rightStyle) {
          warnings.push('两列布局缺少 layout.columns.rightStyle');
      }
    }
  } else {
    issues.push('layout 未定义');
  }
  
  // 4. 检查 sectionStyles
  if (obj.sectionStyles) {
    // 检查基础模块
    const sectionTypes = Object.keys(obj.sectionStyles);
    
    if (sectionTypes.length === 0) {
      issues.push('sectionStyles 为空');
    }
    
    // 检查关键模块是否存在
    const criticalModules = ['basic', 'education', 'experience', 'skills'];
    for (const mod of criticalModules) {
      if (!obj.sectionStyles[mod]) {
        warnings.push(`sectionStyles 缺少关键模块: ${mod}`);
      }
    }
    
    // 检查每个模块的样式结构
    for (const [modType, style] of Object.entries(obj.sectionStyles)) {
      if (typeof style !== 'object') {
        issues.push(`sectionStyles.${modType} 不是对象`);
        continue;
      }
      
      // 检查 container
      if (!style.container) {
        warnings.push(`sectionStyles.${modType}.container 未定义`);
      }
      
      // 检查 title
      if (!style.title) {
        warnings.push(`sectionStyles.${modType}.title 未定义`);
      } else {
        // title.special 应该是对象
        if (style.title.special && typeof style.title.special !== 'object') {
          issues.push(`sectionStyles.${modType}.title.special 应为对象`);
        }
      }
      
      // 检查 content
      if (!style.content) {
        warnings.push(`sectionStyles.${modType}.content 未定义`);
      }
    }
    
    console.log(`  模块类型 (${sectionTypes.length}): ${sectionTypes.join(', ')}`);
  } else {
    issues.push('sectionStyles 未定义');
  }
  
  // 5. 检查 CSS 变量引用
  if (obj.globalStyles) {
    const gs = obj.globalStyles;
    
    // 检查是否使用了 CSS 变量
    const usesCssVars = JSON.stringify(gs).includes('var(--');
    if (usesCssVars) {
      if (!obj.theme || !obj.theme.colors) {
        warnings.push('使用了 CSS 变量但 theme.colors 不完整');
      }
    }
  }
  
  return { issues, warnings };
}

async function main() {
  try {
    console.log('🔍 验证数据库模板数据...\n');
    
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'resume_system'
    });
    
    const [rows] = await conn.query('SELECT id, name, html_content FROM templates');
    
    let allPassed = true;
    
    for (const row of rows) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📄 模板 #${row.id}: ${row.name}`);
      console.log('='.repeat(60));
      
      try {
        const obj = JSON.parse(row.html_content);
        
        // 基本信息
        console.log(`\n  ✅ 模板名称: ${obj.templateName}`);
        console.log(`  ✅ 布局类型: ${obj.layout?.type || '❌ 未定义'}`);
        console.log(`  ✅ 主题主色: ${obj.theme?.colors?.primary || '❌ 未定义'}`);
        
        // 验证
        const { issues, warnings } = await verifyTemplate(obj, row.name);
        
        // 统计
        const moduleCount = Object.keys(obj.sectionStyles || {}).length;
        console.log(`  ✅ 模块数量: ${moduleCount}`);
        
        if (issues.length > 0) {
          allPassed = false;
          console.log(`\n  ❌ 错误 (${issues.length}):`);
          issues.forEach(issue => console.log(`     - ${issue}`));
        }
        
        if (warnings.length > 0) {
          console.log(`\n  ⚠️  警告 (${warnings.length}):`);
          warnings.forEach(w => console.log(`     - ${w}`));
        }
        
        if (issues.length === 0 && warnings.length === 0) {
          console.log('\n  ✅ 所有检查通过！');
        }
        
      } catch(e) {
        allPassed = false;
        console.log(`\n  ❌ JSON 解析错误: ${e.message}`);
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    if (allPassed) {
      console.log('🎉 所有模板验证通过！');
    } else {
      console.log('⚠️  部分模板存在问题，请查看上述详细信息');
    }
    
    await conn.end();
    process.exit(allPassed ? 0 : 1);
    
  } catch(e) {
    console.error('❌ 数据库连接失败:', e.message);
    console.error('\n请确保 MySQL 服务正在运行：');
    console.error('  sc.exe start MySQL84');
    process.exit(1);
  }
}

main();
