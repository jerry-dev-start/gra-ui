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

/** 获取角色已分配的菜单 ID 列表 */
export function getRoleMenuIds(roleId: string) {
  return request.get<string[]>(`/roles/${roleId}/menus`)
}

/** 保存角色的菜单权限 */
export function saveRoleMenus(roleId: string, menuIds: string[]) {
  return request.put<null>(`/roles/${roleId}/menus`, { menuIds })
}
