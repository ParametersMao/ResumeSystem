/**
 * 组件注册表
 * 用于动态注册和解析Vue组件
 */
import { markRaw } from 'vue';
// 组件注册表
const registry = new Map();
/**
 * 组件注册表 API
 */
export const componentRegistry = {
    /**
     * 注册组件
     * @param id 组件ID
     * @param component 组件定义
     * @param metadata 组件元数据
     */
    register(id, component, metadata = {}) {
        if (registry.has(id)) {
            console.warn(`ComponentRegistry: 组件 "${id}" 已存在，将被覆盖`);
        }
        // 使用markRaw优化性能，防止组件被代理
        registry.set(id, {
            id,
            component: markRaw(component),
            metadata
        });
        return this;
    },
    /**
     * 批量注册组件
     * @param components 组件配置数组
     */
    registerBatch(components) {
        components.forEach(item => {
            this.register(item.id, item.component, item.metadata);
        });
        return this;
    },
    /**
     * 获取组件
     * @param id 组件ID
     */
    get(id) {
        return registry.get(id);
    },
    /**
     * 检查组件是否存在
     * @param id 组件ID
     */
    has(id) {
        return registry.has(id);
    },
    /**
     * 移除组件
     * @param id 组件ID
     */
    unregister(id) {
        return registry.delete(id);
    },
    /**
     * 获取所有组件
     */
    getAll() {
        return Array.from(registry.values());
    },
    /**
     * 查找满足条件的组件
     * @param filter 过滤函数
     */
    find(filter) {
        return this.getAll().filter(filter);
    },
    /**
     * 按类型查找组件
     * @param type 组件类型
     */
    findByType(type) {
        return this.find(item => item.metadata?.type === type);
    },
    /**
     * 清空注册表
     */
    clear() {
        registry.clear();
        return this;
    }
};
