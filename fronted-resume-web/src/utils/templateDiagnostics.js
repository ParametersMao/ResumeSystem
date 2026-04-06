/**
 * 模板诊断和修复工具
 * 用于检测和修复模板兼容性问题
 */
import { normalizeModuleType } from './sectionTypeMapping';
/**
 * 诊断模板
 */
export function diagnoseTemplate(templateData) {
    const result = {
        isValid: true,
        format: 'unknown',
        errors: [],
        warnings: [],
        fixes: [],
        canAutoFix: true
    };
    if (!templateData || typeof templateData !== 'object') {
        result.isValid = false;
        result.errors.push({
            type: 'INVALID_DATA',
            message: '模板数据为空或类型错误',
            path: 'root',
            severity: 'critical'
        });
        result.canAutoFix = false;
        return result;
    }
    // 1. 检测模板格式
    result.format = detectTemplateFormat(templateData);
    // 2. 检查必需字段
    checkRequiredFields(templateData, result);
    // 3. 检查模块配置
    checkModuleConfiguration(templateData, result);
    // 4. 检查样式配置
    checkStyleConfiguration(templateData, result);
    // 5. 检查颜色配置
    checkColorConfiguration(templateData, result);
    // 6. 检查布局配置
    checkLayoutConfiguration(templateData, result);
    return result;
}
/**
 * 检测模板格式
 */
function detectTemplateFormat(templateData) {
    // 新格式特征：有 theme, layout, sectionStyles
    const hasNewFormat = templateData.theme && templateData.layout && templateData.sectionStyles;
    // 旧格式特征：有 styles, globalConfig, layout数组
    const hasOldFormat = (templateData.styles || templateData.globalConfig) &&
        Array.isArray(templateData.layout);
    if (hasNewFormat)
        return 'new';
    if (hasOldFormat)
        return 'old';
    return 'unknown';
}
/**
 * 检查必需字段
 */
function checkRequiredFields(templateData, result) {
    const format = result.format;
    if (format === 'new') {
        // 新格式必需字段
        if (!templateData.theme) {
            result.errors.push({
                type: 'MISSING_FIELD',
                message: '缺少 theme 配置',
                path: 'theme',
                severity: 'error'
            });
            result.fixes.push({
                type: 'ADD_DEFAULT_THEME',
                description: '添加默认主题配置',
                autoApplicable: true
            });
        }
        if (!templateData.layout) {
            result.errors.push({
                type: 'MISSING_FIELD',
                message: '缺少 layout 配置',
                path: 'layout',
                severity: 'error'
            });
            result.fixes.push({
                type: 'ADD_DEFAULT_LAYOUT',
                description: '添加默认布局配置',
                autoApplicable: true
            });
        }
    }
    else if (format === 'old') {
        // 旧格式必需字段
        if (!Array.isArray(templateData.layout) || templateData.layout.length === 0) {
            result.errors.push({
                type: 'MISSING_FIELD',
                message: '缺少或为空的 layout 数组',
                path: 'layout',
                severity: 'error'
            });
            result.canAutoFix = false;
        }
        if (!templateData.templateName && !templateData.name) {
            result.warnings.push({
                type: 'MISSING_NAME',
                message: '缺少模板名称',
                path: 'templateName',
                suggestion: '添加 templateName 字段'
            });
        }
    }
}
/**
 * 检查模块配置
 */
function checkModuleConfiguration(templateData, result) {
    const format = result.format;
    if (format === 'old' && Array.isArray(templateData.layout)) {
        templateData.layout.forEach((module, index) => {
            // 检查模块类型
            if (!module.type) {
                result.errors.push({
                    type: 'INVALID_MODULE',
                    message: `模块 #${index} 缺少 type 字段`,
                    path: `layout[${index}].type`,
                    severity: 'error'
                });
            }
            else {
                // 检查类型是否可识别
                const normalizedType = normalizeModuleType(module.type);
                if (normalizedType === module.type.toLowerCase() &&
                    !['basic', 'education', 'experience', 'projects', 'skills',
                        'intention', 'internship', 'campus', 'awards', 'summary', 'custom']
                        .includes(normalizedType)) {
                    result.warnings.push({
                        type: 'UNKNOWN_MODULE_TYPE',
                        message: `未知的模块类型: ${module.type}`,
                        path: `layout[${index}].type`,
                        suggestion: '将被作为自定义模块处理'
                    });
                }
            }
            // 检查 config
            if (!module.config) {
                result.warnings.push({
                    type: 'MISSING_CONFIG',
                    message: `模块 #${index} (${module.type}) 缺少 config 配置`,
                    path: `layout[${index}].config`,
                    suggestion: '添加基本的 config 配置'
                });
                result.fixes.push({
                    type: 'ADD_DEFAULT_CONFIG',
                    description: `为模块 ${module.type} 添加默认配置`,
                    autoApplicable: true
                });
            }
            // 检查 visible 字段
            if (module.visible === undefined) {
                result.warnings.push({
                    type: 'MISSING_VISIBLE',
                    message: `模块 #${index} (${module.type}) 缺少 visible 字段`,
                    path: `layout[${index}].visible`,
                    suggestion: '添加 visible: true'
                });
            }
        });
    }
}
/**
 * 检查样式配置
 */
function checkStyleConfiguration(templateData, result) {
    const format = result.format;
    if (format === 'old') {
        const styles = templateData.styles || {};
        // 检查颜色配置
        if (!styles.colors) {
            result.warnings.push({
                type: 'MISSING_COLORS',
                message: '缺少颜色配置',
                path: 'styles.colors',
                suggestion: '添加基本颜色配置'
            });
        }
        // 检查字体配置
        if (!styles.fonts) {
            result.warnings.push({
                type: 'MISSING_FONTS',
                message: '缺少字体配置',
                path: 'styles.fonts',
                suggestion: '添加字体配置'
            });
        }
    }
}
/**
 * 检查颜色配置
 */
function checkColorConfiguration(templateData, result) {
    const colors = templateData.styles?.colors || templateData.theme?.colors;
    if (colors) {
        // 检查颜色值格式
        Object.entries(colors).forEach(([key, value]) => {
            if (typeof value === 'string' && !isValidColor(value)) {
                result.warnings.push({
                    type: 'INVALID_COLOR',
                    message: `无效的颜色值: ${key} = ${value}`,
                    path: `colors.${key}`,
                    suggestion: '使用有效的颜色格式（#RRGGBB）'
                });
            }
        });
    }
}
/**
 * 检查布局配置
 */
function checkLayoutConfiguration(templateData, result) {
    const format = result.format;
    if (format === 'new') {
        const layout = templateData.layout;
        if (layout && layout.type) {
            const validTypes = ['single-column', 'two-column', 'three-column', 'custom'];
            if (!validTypes.includes(layout.type)) {
                result.warnings.push({
                    type: 'INVALID_LAYOUT_TYPE',
                    message: `无效的布局类型: ${layout.type}`,
                    path: 'layout.type',
                    suggestion: `使用: ${validTypes.join(', ')}`
                });
            }
        }
    }
}
/**
 * 验证颜色格式
 */
function isValidColor(color) {
    // 支持 #RRGGBB, #RGB, rgb(), rgba(), 颜色名
    const patterns = [
        /^#[0-9A-Fa-f]{6}$/, // #RRGGBB
        /^#[0-9A-Fa-f]{3}$/, // #RGB
        /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
        /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/,
    ];
    return patterns.some(pattern => pattern.test(color));
}
/**
 * 自动修复模板
 */
export function autoFixTemplate(templateData, diagnostics) {
    if (!diagnostics.canAutoFix) {
        throw new Error('该模板无法自动修复，需要手动处理');
    }
    const fixed = JSON.parse(JSON.stringify(templateData));
    diagnostics.fixes.forEach(fix => {
        switch (fix.type) {
            case 'ADD_DEFAULT_THEME':
                if (!fixed.theme) {
                    fixed.theme = {
                        colors: {
                            primary: '#2f80ed',
                            secondary: '#2ecc71',
                            text: {
                                primary: '#333333',
                                secondary: '#666666',
                                muted: '#999999'
                            },
                            background: '#ffffff',
                            border: '#eeeeee'
                        },
                        typography: {
                            fontFamily: {
                                body: 'Microsoft YaHei, Arial, sans-serif',
                                heading: 'Microsoft YaHei, Arial, sans-serif'
                            }
                        }
                    };
                }
                break;
            case 'ADD_DEFAULT_LAYOUT':
                if (!fixed.layout || typeof fixed.layout !== 'object' || Array.isArray(fixed.layout)) {
                    fixed.layout = {
                        type: 'single-column',
                        container: {
                            maxWidth: '860px',
                            margin: '0 auto',
                            padding: '20px'
                        },
                        content: {
                            padding: '30px',
                            backgroundColor: '#ffffff',
                            borderRadius: '6px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }
                    };
                }
                break;
            case 'ADD_DEFAULT_CONFIG':
                // 为缺少config的模块添加默认配置
                if (Array.isArray(fixed.layout)) {
                    fixed.layout = fixed.layout.map((module) => {
                        if (!module.config) {
                            const normalizedType = normalizeModuleType(module.type);
                            module.config = {
                                layout: getDefaultLayout(normalizedType),
                                showTitle: normalizedType !== 'basic'
                            };
                        }
                        if (module.visible === undefined) {
                            module.visible = true;
                        }
                        return module;
                    });
                }
                break;
        }
    });
    return fixed;
}
/**
 * 获取默认布局类型
 */
function getDefaultLayout(moduleType) {
    const layoutMap = {
        'basic': 'flexible',
        'intention': 'simple',
        'education': 'timeline',
        'experience': 'timeline',
        'projects': 'timeline',
        'skills': 'mixed',
        'internship': 'timeline',
        'campus': 'timeline',
        'awards': 'simple',
        'summary': 'simple',
        'custom': 'simple'
    };
    return layoutMap[moduleType] || 'simple';
}
/**
 * 生成诊断报告
 */
export function generateDiagnosticReport(result) {
    const lines = [];
    lines.push('='.repeat(80));
    lines.push('模板诊断报告');
    lines.push('='.repeat(80));
    lines.push('');
    lines.push(`模板格式: ${result.format}`);
    lines.push(`是否有效: ${result.isValid ? '✓ 是' : '✗ 否'}`);
    lines.push(`可自动修复: ${result.canAutoFix ? '✓ 是' : '✗ 否'}`);
    lines.push('');
    if (result.errors.length > 0) {
        lines.push('❌ 错误 (' + result.errors.length + ')');
        lines.push('-'.repeat(80));
        result.errors.forEach((error, index) => {
            lines.push(`${index + 1}. [${error.severity.toUpperCase()}] ${error.message}`);
            lines.push(`   位置: ${error.path}`);
            lines.push('');
        });
    }
    if (result.warnings.length > 0) {
        lines.push('⚠️ 警告 (' + result.warnings.length + ')');
        lines.push('-'.repeat(80));
        result.warnings.forEach((warning, index) => {
            lines.push(`${index + 1}. ${warning.message}`);
            lines.push(`   位置: ${warning.path}`);
            lines.push(`   建议: ${warning.suggestion}`);
            lines.push('');
        });
    }
    if (result.fixes.length > 0) {
        lines.push('🔧 可用修复 (' + result.fixes.length + ')');
        lines.push('-'.repeat(80));
        result.fixes.forEach((fix, index) => {
            const icon = fix.autoApplicable ? '✓' : '⚠';
            lines.push(`${index + 1}. ${icon} ${fix.description}`);
            lines.push('');
        });
    }
    if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
        lines.push('✓ 模板检查通过，没有发现问题');
    }
    lines.push('='.repeat(80));
    return lines.join('\n');
}
/**
 * 批量诊断多个模板
 */
export function batchDiagnose(templates) {
    const results = new Map();
    templates.forEach(template => {
        try {
            const result = diagnoseTemplate(template.data);
            results.set(template.id, result);
        }
        catch (error) {
            results.set(template.id, {
                isValid: false,
                format: 'unknown',
                errors: [{
                        type: 'DIAGNOSTIC_ERROR',
                        message: `诊断失败: ${error.message}`,
                        path: 'root',
                        severity: 'critical'
                    }],
                warnings: [],
                fixes: [],
                canAutoFix: false
            });
        }
    });
    return results;
}
/**
 * 导出诊断工具
 */
export default {
    diagnoseTemplate,
    autoFixTemplate,
    generateDiagnosticReport,
    batchDiagnose
};
