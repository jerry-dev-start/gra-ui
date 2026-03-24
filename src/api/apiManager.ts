import request from '@/utils/request'
import type {
  ApiManagerPageResult,
  ApiManagerQuery,
  ApiManagerRecord,
  ApiPermissionTreeGroup,
  CreateApiManagerRequest,
  UpdateApiManagerRequest,
} from '@/types/api'

/** 获取 API 管理列表（分页） */
export function getApiManagerList(params: ApiManagerQuery) {
  return request.get<ApiManagerPageResult>('/jkManager', params as unknown as Record<string, unknown>)
}

/** 获取 API 详情 */
export function getApiDetail(id: string) {
  return request.get<ApiManagerRecord>(`/jkManager/${id}`)
}

/** 获取 API 权限树 */
export function getApiPermissionTree() {
  return request.get<ApiPermissionTreeGroup[]>('/jkManager/tree')
}

/** 创建 API */
export function createApi(data: CreateApiManagerRequest) {
  return request.post<null>('/jkManager', data)
}

/** 更新 API */
export function updateApi(data: UpdateApiManagerRequest) {
  const { id, ...payload } = data
  return request.put<null>(`/jkManager/${id}`, payload)
}

/** 删除 API */
export function deleteApi(id: string) {
  return request.del<null>(`/jkManager/${id}`)
}
