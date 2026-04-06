import { templateSchema, validateTemplateData } from './templateSchema';
import { diagnoseTemplate, autoFixTemplate } from './templateDiagnostics';
import { adaptLegacyTemplateData } from './templateAdapter';
export function parseTemplateFile(content) {
    const raw = JSON.parse(content);
    const validation = templateSchema.safeParse(raw);
    if (!validation.success) {
        const issues = validation.error.issues;
        throw new Error(issues.map((issue) => `[${issue.path.join('.') || 'root'}] ${issue.message}`).join('\n'));
    }
    return validation.data;
}
export function normalizeTemplateFile(content) {
    const raw = JSON.parse(content);
    return normalizeTemplateData(raw);
}
export function normalizeTemplateData(raw) {
    const diagnostics = diagnoseTemplate(raw);
    const format = diagnostics.format;
    let normalized = raw;
    if (format === 'old') {
        normalized = adaptLegacyTemplateData(raw);
    }
    else if (diagnostics.canAutoFix && (diagnostics.errors.length || diagnostics.warnings.length)) {
        normalized = autoFixTemplate(raw, diagnostics);
    }
    const validation = validateTemplateData(normalized);
    return {
        raw,
        normalized,
        diagnostics,
        validation,
        format
    };
}
export function validateTemplateFile(content) {
    try {
        const parsed = parseTemplateFile(content);
        return {
            success: true,
            data: parsed
        };
    }
    catch (error) {
        const message = typeof error?.message === 'string' ? error.message : '未知错误';
        return {
            success: false,
            issues: message.split('\n')
        };
    }
}
