/**
 * 渲染引擎验证工具
 * 用于测试和验证所有模块类型的渲染是否正常
 */
import { normalizeModuleType, getRendererName, STANDARD_MODULE_TYPES } from './sectionTypeMapping';
import { adaptRendererConfig } from './rendererConfigAdapter';
/**
 * 验证单个模块类型
 */
export function validateModuleType(type, sampleData) {
    const result = {
        success: true,
        type,
        normalizedType: '',
        rendererName: '',
        hasConfig: false,
        errors: [],
        warnings: []
    };
    try {
        // 1. 测试类型标准化
        const normalizedType = normalizeModuleType(type);
        result.normalizedType = normalizedType;
        if (!normalizedType) {
            result.errors.push('类型标准化失败');
            result.success = false;
        }
        // 2. 测试渲染器名称生成
        const rendererName = getRendererName(type);
        result.rendererName = rendererName;
        if (!rendererName) {
            result.errors.push('渲染器名称生成失败');
            result.success = false;
        }
        // 3. 测试配置适配
        if (sampleData) {
            const section = {
                type,
                config: sampleData.config || {},
                items: sampleData.items || []
            };
            const styleConfig = sampleData.styleConfig || {};
            try {
                const adaptedConfig = adaptRendererConfig(section, styleConfig);
                result.hasConfig = Object.keys(adaptedConfig).length > 0;
                if (!result.hasConfig) {
                    result.warnings.push('配置适配返回空对象');
                }
            }
            catch (error) {
                result.errors.push(`配置适配失败: ${error.message}`);
                result.success = false;
            }
        }
        // 4. 检查是否为标准类型
        if (!STANDARD_MODULE_TYPES.includes(normalizedType) && normalizedType !== 'custom') {
            result.warnings.push(`非标准模块类型: ${normalizedType}`);
        }
    }
    catch (error) {
        result.errors.push(`验证过程出错: ${error.message}`);
        result.success = false;
    }
    return result;
}
/**
 * 验证所有标准模块类型
 */
export function validateAllModuleTypes() {
    const results = [];
    // 测试所有标准类型
    STANDARD_MODULE_TYPES.forEach(type => {
        results.push(validateModuleType(type));
    });
    // 测试一些常见的别名
    const aliases = [
        'personal',
        'personalInfo',
        'work',
        'edu',
        'skill',
        'self-evaluation'
    ];
    aliases.forEach(alias => {
        results.push(validateModuleType(alias));
    });
    return results;
}
/**
 * 生成验证报告
 */
export function generateValidationReport(results) {
    const lines = [
        '='.repeat(80),
        '渲染引擎验证报告',
        '='.repeat(80),
        '',
        `测试时间: ${new Date().toLocaleString()}`,
        `测试项目数: ${results.length}`,
        ''
    ];
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const warningCount = results.filter(r => r.warnings.length > 0).length;
    lines.push(`成功: ${successCount}`);
    lines.push(`失败: ${failureCount}`);
    lines.push(`警告: ${warningCount}`);
    lines.push('');
    lines.push('-'.repeat(80));
    lines.push('');
    // 详细结果
    results.forEach((result, index) => {
        lines.push(`[${index + 1}] ${result.type}`);
        lines.push(`  标准化类型: ${result.normalizedType}`);
        lines.push(`  渲染器: ${result.rendererName}`);
        lines.push(`  状态: ${result.success ? '✓ 通过' : '✗ 失败'}`);
        if (result.errors.length > 0) {
            lines.push(`  错误:`);
            result.errors.forEach(err => {
                lines.push(`    - ${err}`);
            });
        }
        if (result.warnings.length > 0) {
            lines.push(`  警告:`);
            result.warnings.forEach(warn => {
                lines.push(`    - ${warn}`);
            });
        }
        lines.push('');
    });
    lines.push('='.repeat(80));
    return lines.join('\n');
}
/**
 * 在控制台运行完整验证
 */
export function runValidation() {
    console.log('%c渲染引擎验证开始', 'color: blue; font-weight: bold; font-size: 14px');
    const results = validateAllModuleTypes();
    const report = generateValidationReport(results);
    console.log(report);
    const failedResults = results.filter(r => !r.success);
    if (failedResults.length > 0) {
        console.error('%c发现问题!', 'color: red; font-weight: bold');
        failedResults.forEach(result => {
            console.error(`模块 "${result.type}" 验证失败:`, result.errors);
        });
    }
    else {
        console.log('%c所有测试通过!', 'color: green; font-weight: bold');
    }
}
/**
 * 测试模板数据
 */
export function validateTemplateData(templateData) {
    const errors = [];
    const warnings = [];
    const moduleResults = [];
    // 检查模板结构
    if (!templateData) {
        errors.push('模板数据为空');
        return { success: false, errors, warnings, moduleResults };
    }
    // 检查 layout 配置
    if (templateData.layout && Array.isArray(templateData.layout)) {
        templateData.layout.forEach((module, index) => {
            if (!module.type) {
                warnings.push(`模块 #${index} 缺少 type 属性`);
            }
            else {
                const result = validateModuleType(module.type, {
                    config: module.config,
                    styleConfig: {}
                });
                moduleResults.push(result);
                if (!result.success) {
                    errors.push(`模块 #${index} (${module.type}) 验证失败`);
                }
            }
        });
    }
    // 检查 sectionStyles
    if (templateData.sectionStyles) {
        Object.keys(templateData.sectionStyles).forEach(type => {
            const normalized = normalizeModuleType(type);
            if (normalized !== type && type !== 'custom') {
                warnings.push(`sectionStyles 中使用了非标准类型 "${type}"，建议使用 "${normalized}"`);
            }
        });
    }
    const success = errors.length === 0;
    return { success, errors, warnings, moduleResults };
}
/**
 * 导出供外部使用的验证函数
 */
export default {
    validateModuleType,
    validateAllModuleTypes,
    generateValidationReport,
    runValidation,
    validateTemplateData
};
