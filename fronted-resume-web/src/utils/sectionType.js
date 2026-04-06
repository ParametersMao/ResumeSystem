const BASIC_SECTION_TYPES = new Set(['basic', 'personal']);
/**
 * 判断模块类型是否属于基本信息模块
 */
export function isBasicSection(type) {
    if (!type)
        return false;
    return BASIC_SECTION_TYPES.has(type);
}
/**
 * 将模块类型转换为规范化的 key，用于比较/映射。
 * 例如：personal/basic -> basic，其它类型保持不变。
 */
export function getCanonicalSectionType(type) {
    if (!type)
        return type ?? undefined;
    return isBasicSection(type) ? 'basic' : type;
}
