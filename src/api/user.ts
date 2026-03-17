import request from '@/utils/request'
import type { UserQuery, UserPageResult, UserParams } from '@/types/user'

/** 获取用户列表（分页） */
export function getUserList(params: UserQuery) {
  return request.get<UserPageResult>('/users', params as unknown as Record<string, unknown>)
}

/** 创建用户 */
export function createUser(data: UserParams) {
  return request.post<null>('/users', data)
}

/** 更新用户 */
export function updateUser(data: UserParams) {
  return request.put<null>(`/users/${data.id}`, data)
}

/** 删除用户 */
export function deleteUser(id: string) {
  return request.del<null>(`/users/${id}`)
}
