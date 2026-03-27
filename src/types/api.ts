/** 后端统一响应结构 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** API 请求方式 */
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/** API 状态：1 启用 / 0 禁用 */
export type ApiStatus = 1 | 2

/** API 管理记录 */
export interface ApiManagerRecord {
  id: string
  path: string
  method: ApiMethod
  groupName?: string
  permissionCode?: string
  desc?: string
  status: ApiStatus
  createdAt?: string
}

/** API 权限树原始叶子节点 */
export interface ApiPermissionTreeLeaf {
  id: string
  method: ApiMethod
  apiUrl?: string
  path?: string
  permissionCode?: string
  desc?: string
}

/** API 权限树原始分组节点 */
export interface ApiPermissionTreeGroup {
  groupName: string
  children?: ApiPermissionTreeLeaf[]
}

/** API 权限树归一化叶子节点 */
export interface NormalizedApiPermissionLeaf extends ApiPermissionTreeLeaf {
  path: string
}

/** API 管理表单值 */
export interface ApiManagerFormValues {
  path: string
  method: ApiMethod
  groupName?: string
  permissionCode?: string
  desc?: string
  status: ApiStatus
}

/** 创建 API 请求参数 */
export type CreateApiManagerRequest = ApiManagerFormValues

/** 更新 API 请求参数 */
export type UpdateApiManagerRequest = ApiManagerFormValues & {
  id: string
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
