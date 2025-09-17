import { createI18n } from 'vue-i18n'

const messages = {
  'zh-CN': {
    common: {
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      reset: '重置',
      loading: '加载中...',
      success: '操作成功',
      error: '操作失败',
      warning: '警告',
      info: '提示'
    },
    auth: {
      login: '登录',
      logout: '退出登录',
      username: '用户名',
      password: '密码',
      loginSuccess: '登录成功',
      loginFailed: '登录失败'
    },
    menu: {
      dashboard: '仪表盘',
      userManagement: '用户管理',
      templateManagement: '模板管理',
      dataStatistics: '数据统计',
      aiOperations: 'AI操作监控'
    }
  },
  'en-US': {
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      reset: 'Reset',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      username: 'Username',
      password: 'Password',
      loginSuccess: 'Login successful',
      loginFailed: 'Login failed'
    },
    menu: {
      dashboard: 'Dashboard',
      userManagement: 'User Management',
      templateManagement: 'Template Management',
      dataStatistics: 'Data Statistics',
      aiOperations: 'AI Operations'
    }
  }
}

export const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages
}) 