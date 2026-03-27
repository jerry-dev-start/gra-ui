/** 角色状态：1 启用 / 0 禁用 */
export type RoleStatus = 0 | 1
export interface  RoleApiSelectRes  {
  apiPers: string[]
}
/** 角色记录 */
export interface RoleRecord {
  id: string
  /** 角色名称 */
  roleName: string
  /** 角色编码（唯一标识，如 admin / editor） */
  roleCode: string
  /** 描述 */
  description?: string
  /** 显示排序 */
  sortOrder: number
  /** 状态 */
  status: RoleStatus
  /** 是否系统内置（内置角色不可删除） */
  isReadonly: boolean
  createdAt?: string
  updatedAt?: string
}

/** 角色列表查询参数 */
export interface RoleQuery {
  roleName?: string
  roleCode?: string
  status?: RoleStatus
  page: number
  pageSize: number
}

/** 角色分页响应 */
export interface RolePageResult {
  list: RoleRecord[]
  total: number
}

/** 新增/编辑角色参数 */
export interface RoleParams {
  id?: string
  roleName: string
  roleCode: string
  description?: string
  sortOrder: number
  status: RoleStatus
}
