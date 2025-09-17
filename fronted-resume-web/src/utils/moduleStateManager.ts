import { ref, computed, watch } from 'vue'
import type { 
  ModuleState, 
  UserModuleSettings, 
  TemplateLayout, 
  TemplateDataV2,
  ModuleType 
} from '@/types/resume'

// 默认模块配置
const DEFAULT_MODULES: ModuleState[] = [
  {
    type: 'basic',
    visible: true,
    userVisible: true,
    collapsed: false,
    allowHide: false,
    allowCollapse: false,
    order: 0,
    config: { title: '基本信息' }
  },
  {
    type: 'intention',
    visible: false,
    userVisible: false,
    collapsed: true,
    allowHide: true,
    allowCollapse: true,
    order: 1,
    config: { title: '求职意向' }
  },
  {
    type: 'education',
    visible: true,
    userVisible: true,
    collapsed: false,
    allowHide: true,
    allowCollapse: true,
    order: 2,
    config: { title: '教育背景' }
  },
  {
    type: 'experience',
    visible: true,
    userVisible: true,
    collapsed: false,
    allowHide: true,
    allowCollapse: true,
    order: 3,
    config: { title: '工作经验' }
  },
  {
    type: 'projects',
    visible: true,
    userVisible: true,
    collapsed: false,
    allowHide: true,
    allowCollapse: true,
    order: 4,
    config: { title: '项目经历' }
  },
  {
    type: 'internship',
    visible: false,
    userVisible: false,
    collapsed: true,
    allowHide: true,
    allowCollapse: true,
    order: 5,
    config: { title: '实习经历' }
  },
  {
    type: 'campus',
    visible: false,
    userVisible: false,
    collapsed: true,
    allowHide: true,
    allowCollapse: true,
    order: 6,
    config: { title: '校园经历' }
  },
  {
    type: 'skills',
    visible: true,
    userVisible: true,
    collapsed: false,
    allowHide: true,
    allowCollapse: true,
    order: 7,
    config: { title: '技能特长' }
  },
  {
    type: 'awards',
    visible: false,
    userVisible: false,
    collapsed: true,
    allowHide: true,
    allowCollapse: true,
    order: 8,
    config: { title: '荣誉证书' }
  },
  {
    type: 'summary',
    visible: false,
    userVisible: false,
    collapsed: true,
    allowHide: true,
    allowCollapse: true,
    order: 9,
    config: { title: '自我评价' }
  },
  {
    type: 'hobbies',
    visible: false,
    userVisible: false,
    collapsed: true,
    allowHide: true,
    allowCollapse: true,
    order: 10,
    config: { title: '兴趣爱好' }
  },
  {
    type: 'custom',
    visible: false,
    userVisible: false,
    collapsed: true,
    allowHide: true,
    allowCollapse: true,
    order: 11,
    config: { title: '自定义模块' }
  }
]

// 本地存储键名
const STORAGE_KEY = 'resume-user-module-settings'

export class ModuleStateManager {
  private userSettings = ref<UserModuleSettings>({})
  private templateData = ref<TemplateDataV2 | null>(null)
  private moduleStates = ref<ModuleState[]>([])

  constructor() {
    this.loadUserSettings()
  }

  // 加载用户设置
  private loadUserSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        this.userSettings.value = JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load user module settings:', error)
    }
  }

  // 保存用户设置
  private saveUserSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.userSettings.value))
    } catch (error) {
      console.warn('Failed to save user module settings:', error)
    }
  }

  // 设置模板数据
  setTemplateData(template: TemplateDataV2) {
    this.templateData.value = template
    this.initializeModuleStates()
  }

  // 初始化模块状态
  private initializeModuleStates() {
    if (!this.templateData.value) {
      this.moduleStates.value = [...DEFAULT_MODULES]
      return
    }

    // 根据模板数据初始化状态
    this.moduleStates.value = DEFAULT_MODULES.map(defaultModule => {
      const templateModule = this.templateData.value!.layout.find(
        m => m.type === defaultModule.type
      )

      if (templateModule) {
        // 使用模板配置
        return {
          ...defaultModule,
          visible: templateModule.visible,
          collapsed: templateModule.collapsed,
          order: templateModule.order,
          config: { ...defaultModule.config, ...templateModule.config },
          allowHide: templateModule.config.allowHide ?? defaultModule.allowHide,
          allowCollapse: templateModule.config.allowCollapse ?? defaultModule.allowCollapse
        }
      }

      // 使用默认配置
      return defaultModule
    })

    // 应用用户之前的设置
    this.applyUserSettings()
  }

  // 应用用户设置
  private applyUserSettings() {
    this.moduleStates.value.forEach(module => {
      const userSetting = this.userSettings.value[module.type]
      if (userSetting) {
        module.userVisible = userSetting.visible
        module.collapsed = userSetting.collapsed
        module.order = userSetting.order
      } else {
        // 新模块使用模板默认值
        module.userVisible = module.visible
        module.collapsed = module.collapsed
      }
    })
  }

  // 获取编辑区域可见模块
  getEditorVisibleModules() {
    return computed(() => 
      this.moduleStates.value
        .filter(m => m.visible && m.userVisible)
        .sort((a, b) => a.order - b.order)
    )
  }

  // 获取预览区域可见模块
  getPreviewVisibleModules() {
    return computed(() => {
      const visibleModules = this.moduleStates.value
        .filter(m => m.visible && m.userVisible)
        .sort((a, b) => a.order - b.order)
      
      console.log('ModuleStateManager: 预览可见模块:', {
        total: this.moduleStates.value.length,
        visible: visibleModules.length,
        modules: visibleModules.map(m => ({ type: m.type, visible: m.visible, userVisible: m.userVisible }))
      })
      
      return visibleModules
    })
  }

  // 获取所有模块状态
  getAllModuleStates() {
    return computed(() => this.moduleStates.value)
  }

  // 切换模块显示状态
  toggleModuleVisibility(moduleType: ModuleType) {
    const module = this.moduleStates.value.find(m => m.type === moduleType)
    if (!module || !module.allowHide) return

    module.userVisible = !module.userVisible
    
    // 更新用户设置
    this.userSettings.value[moduleType] = {
      ...this.userSettings.value[moduleType],
      visible: module.userVisible
    }
    
    this.saveUserSettings()
  }

  // 切换模块收起状态
  toggleModuleCollapse(moduleType: ModuleType) {
    const module = this.moduleStates.value.find(m => m.type === moduleType)
    if (!module || !module.allowCollapse) return

    module.collapsed = !module.collapsed
    
    // 更新用户设置
    this.userSettings.value[moduleType] = {
      ...this.userSettings.value[moduleType],
      collapsed: module.collapsed
    }
    
    this.saveUserSettings()
  }

  // 移动模块顺序
  moveModule(moduleType: ModuleType, direction: -1 | 1) {
    const module = this.moduleStates.value.find(m => m.type === moduleType)
    if (!module) return

    const currentOrder = module.order
    const newOrder = currentOrder + direction

    // 检查边界
    if (newOrder < 0 || newOrder >= this.moduleStates.value.length) return

    // 交换顺序
    const targetModule = this.moduleStates.value.find(m => m.order === newOrder)
    if (targetModule) {
      module.order = newOrder
      targetModule.order = currentOrder
      
      // 更新用户设置
      this.userSettings.value[moduleType] = {
        ...this.userSettings.value[moduleType],
        order: newOrder
      }
      this.userSettings.value[targetModule.type] = {
        ...this.userSettings.value[targetModule.type],
        order: currentOrder
      }
      
      this.saveUserSettings()
    }
  }

  // 获取模块状态
  getModuleState(moduleType: ModuleType): ModuleState | undefined {
    return this.moduleStates.value.find(m => m.type === moduleType)
  }

  // 计算属性：编辑区域显示状态
  get editorVisible() {
    return computed(() => 
      this.moduleStates.value.map(m => ({
        ...m,
        editorVisible: m.visible && m.userVisible
      }))
    )
  }

  // 计算属性：预览区域显示状态
  get previewVisible() {
    return computed(() => 
      this.moduleStates.value.map(m => ({
        ...m,
        previewVisible: m.visible && m.userVisible
      }))
    )
  }

  // 重置为模板默认状态
  resetToTemplateDefaults() {
    this.initializeModuleStates()
  }

  // 清除用户设置
  clearUserSettings() {
    this.userSettings.value = {}
    this.saveUserSettings()
    this.applyUserSettings()
  }
}

// 创建单例实例
export const moduleStateManager = new ModuleStateManager()
