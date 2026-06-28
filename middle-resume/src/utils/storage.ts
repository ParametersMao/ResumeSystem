import { STORAGE_KEYS } from '@/constants'

/**
 * 设置本地存储
 * @param key 键名
 * @param value 值
 */
export const setStorage = (key: string, value: any): void => {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error('设置本地存储失败:', error)
  }
}

/**
 * 获取本地存储
 * @param key 键名
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export const getStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue || null
    }
    return JSON.parse(item)
  } catch (error) {
    console.error('获取本地存储失败:', error)
    return defaultValue || null
  }
}

/**
 * 移除本地存储
 * @param key 键名
 */
export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('移除本地存储失败:', error)
  }
}

/**
 * 清空本地存储
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('清空本地存储失败:', error)
  }
}

/**
 * 设置Token
 * @param token Token值
 */
export const setToken = (token: string): void => {
  setStorage(STORAGE_KEYS.TOKEN, token)
}

/**
 * 获取Token
 * @returns Token值
 */
export const getToken = (): string | null => {
  return getStorage<string>(STORAGE_KEYS.TOKEN)
}

/**
 * 移除Token
 */
export const removeToken = (): void => {
  removeStorage(STORAGE_KEYS.TOKEN)
}

/**
 * 设置用户信息
 * @param user 用户信息
 */
export const setUser = (user: any): void => {
  setStorage(STORAGE_KEYS.USER, user)
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export const getUser = (): any => {
  return getStorage(STORAGE_KEYS.USER)
}

/**
 * 移除用户信息
 */
export const removeUser = (): void => {
  removeStorage(STORAGE_KEYS.USER)
}

/**
 * 设置主题
 * @param theme 主题
 */
export const setTheme = (theme: string): void => {
  setStorage(STORAGE_KEYS.THEME, theme)
}

/**
 * 获取主题
 * @returns 主题
 */
export const getTheme = (): string => {
  return getStorage<string>(STORAGE_KEYS.THEME) || 'light'
}

/**
 * 设置语言
 * @param language 语言
 */
export const setLanguage = (language: string): void => {
  setStorage(STORAGE_KEYS.LANGUAGE, language)
}

/**
 * 获取语言
 * @returns 语言
 */
export const getLanguage = (): string => {
  return getStorage<string>(STORAGE_KEYS.LANGUAGE) || 'zh-CN'
}

/**
 * 检查本地存储是否可用
 * @returns 是否可用
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 获取存储大小（字节）
 * @returns 存储大小
 */
export const getStorageSize = (): number => {
  let total = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }
  return total
}

/**
 * 获取存储使用率
 * @returns 使用率（百分比）
 */
export const getStorageUsage = (): number => {
  const used = getStorageSize()
  const total = 5 * 1024 * 1024 // 假设5MB限制
  return (used / total) * 100
} 