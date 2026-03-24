/** 后端统一响应结构 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** API 请求方式 */
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/** API 状态：1 启用 / 0 禁用 */
export type ApiStatus = 0 | 1

/** API 管理记录 */
export interface ApiManagerRecord {
  id: string
  path: string
  method: ApiMethod
  groupName?: string
  status: ApiStatus
  createdAt?: string
}

/** API 管理列表查询参数 */
export interface ApiManagerQuery {
  path?: string
  method?: ApiMethod
  groupName?: string
  status?: ApiStatus
  page: number
  pageSize: number
}

/** API 管理分页响应 */
export interface ApiManagerPageResult {
  list: ApiManagerRecord[]
  total: number
}
