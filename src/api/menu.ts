import request from '@/utils/request'
import type { MenuRecord, MenuParams } from '@/types/menu'

/** 获取菜单树 */
export function getMenuTree() {
  return request.get<MenuRecord[]>('/menus/tree')
}

/** 创建菜单 */
export function createMenu(data: MenuParams) {
  return request.post<null>('/menus', data)
}

/** 更新菜单 */
export function updateMenu(data: MenuParams) {
  return request.put<null>(`/menus/${data.id}`, data)
}

/** 删除菜单 */
export function deleteMenu(id: string) {
  return request.del<null>(`/menus/${id}`)
}
