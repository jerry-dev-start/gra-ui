/** 菜单类型 */
export type MenuType = 'directory' | 'menu' | 'button'

/** 菜单状态：1 启用 / 0 禁用 */
export type MenuStatus = 0 | 1

export interface MenuRecord {
  id: string
  parentId: string
  name: string
  type: MenuType
  path: string
  component: string
  icon: string
  permission: string
  sort: number
  visible: boolean
  status: MenuStatus
  createdAt: string
  updatedAt: string
  children?: MenuRecord[]
}

/** 新增/编辑菜单参数 */
export interface MenuParams {
  id?: string
  parentId: string
  name: string
  type: MenuType
  path: string
  component: string
  icon: string
  permission: string
  sort: number
  visible: boolean
  status: MenuStatus
}
