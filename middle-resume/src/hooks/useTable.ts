import { ref, reactive } from 'vue'
import type { PaginationParams, PaginatedResponse } from '@/types'

interface UseTableOptions<T> {
  fetchData: (params: PaginationParams) => Promise<PaginatedResponse<T>>
  defaultLimit?: number
}

export function useTable<T>(options: UseTableOptions<T>) {
  const { fetchData, defaultLimit = 10 } = options

  // 数据列表
  const dataList = ref<T[]>([])
  
  // 加载状态
  const loading = ref(false)
  
  // 分页信息
  const pagination = reactive({
    page: 1,
    limit: defaultLimit,
    total: 0
  })

  // 搜索参数
  const searchParams = ref<Record<string, any>>({})

  // 获取数据
  const getData = async () => {
    loading.value = true
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...searchParams.value
      }
      
      console.log('发送的请求参数:', params);
      const response = await fetchData(params)
      dataList.value = response.data.data.list
      pagination.total = response.data.data.total
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = (params: Record<string, any> = {}) => {
    searchParams.value = params
    pagination.page = 1
    getData()
  }

  // 重置
  const handleReset = () => {
    searchParams.value = {}
    pagination.page = 1
    getData()
  }

  // 分页改变
  const handlePageChange = (page: number) => {
    pagination.page = page
    getData()
  }

  // 每页条数改变
  const handleSizeChange = (size: number) => {
    pagination.limit = size
    pagination.page = 1
    getData()
  }

  // 刷新
  const refresh = () => {
    getData()
  }

  return {
    dataList,
    loading,
    pagination,
    searchParams,
    getData,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    refresh
  }
} 