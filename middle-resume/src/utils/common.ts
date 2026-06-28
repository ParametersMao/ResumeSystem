import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { DATE_FORMATS } from '@/constants'

// 配置dayjs插件
dayjs.extend(relativeTime)

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date, format: string = DATE_FORMATS.DATETIME): string => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化相对时间
 * @param date 日期
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * 截断文本
 * @param text 文本
 * @param length 最大长度
 * @param suffix 后缀
 * @returns 截断后的文本
 */
export const truncateText = (text: string, length: number, suffix: string = '...'): string => {
  if (!text || text.length <= length) return text
  return text.substring(0, length) + suffix
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 生成随机ID
 * @returns 随机ID字符串
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }) as T
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 等待时间
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
  let previous = 0
  return ((...args: any[]) => {
    const now = Date.now()
    if (now - previous > wait) {
      func.apply(this, args)
      previous = now
    }
  }) as T
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 扩展名
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * 检查文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的类型数组
 * @returns 是否允许
 */
export const checkFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type)
}

/**
 * 检查文件大小
 * @param file 文件对象
 * @param maxSize 最大大小（字节）
 * @returns 是否在限制内
 */
export const checkFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize
}

/**
 * 下载文件
 * @param url 文件URL
 * @param filename 文件名
 */
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

/**
 * 获取浏览器信息
 * @returns 浏览器信息对象
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent
  const browserInfo = {
    name: '',
    version: '',
    os: ''
  }

  // 检测浏览器
  if (userAgent.includes('Chrome')) {
    browserInfo.name = 'Chrome'
  } else if (userAgent.includes('Firefox')) {
    browserInfo.name = 'Firefox'
  } else if (userAgent.includes('Safari')) {
    browserInfo.name = 'Safari'
  } else if (userAgent.includes('Edge')) {
    browserInfo.name = 'Edge'
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
    browserInfo.name = 'IE'
  }

  // 检测操作系统
  if (userAgent.includes('Windows')) {
    browserInfo.os = 'Windows'
  } else if (userAgent.includes('Mac')) {
    browserInfo.os = 'Mac'
  } else if (userAgent.includes('Linux')) {
    browserInfo.os = 'Linux'
  } else if (userAgent.includes('Android')) {
    browserInfo.os = 'Android'
  } else if (userAgent.includes('iOS')) {
    browserInfo.os = 'iOS'
  }

  return browserInfo
} 