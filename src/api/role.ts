import request from '@/utils/request'
import type { RoleQuery, RolePageResult, RoleParams } from '@/types/role'

/** 获取角色列表（分页） */
export function getRoleList(params: RoleQuery) {
  return request.get<RolePageResult>('/roles', params as unknown as Record<string, unknown>)
}

/** 创建角色 */
export function createRole(data: RoleParams) {
  return request.post<null>('/roles', data)
}

/** 更新角色 */
export function updateRole(data: RoleParams) {
  return request.put<null>(`/roles/${data.id}`, data)
}

/** 删除角色 */
export function deleteRole(id: string) {
  return request.del<null>(`/roles/${id}`)
}
