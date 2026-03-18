import request from '@/utils/request'
import type { DeptRecord, DeptQuery, DeptParams } from '@/types/dept'

/** 获取部门树 */
export function getDeptTree(params?: DeptQuery) {
  return request.get<DeptRecord[]>('/depts/tree', params as unknown as Record<string, unknown>)
}

/** 创建部门 */
export function createDept(data: DeptParams) {
  return request.post<null>('/depts', data)
}

/** 更新部门 */
export function updateDept(data: DeptParams) {
  return request.put<null>(`/depts/${data.id}`, data)
}

/** 删除部门 */
export function deleteDept(id: string) {
  return request.del<null>(`/depts/${id}`)
}
