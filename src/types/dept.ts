/** 部门状态：1 启用 / 2 禁用 */
export type DeptStatus = "1" | "2"

/** 部门记录 */
export interface DeptRecord {
  id: string
  /** 父级部门 ID，顶级为 "0" */
  parentId: string
  /** 部门名称 */
  deptName: string
  /** 负责人 */
  leader?: string
  /** 联系电话 */
  phone?: string
  /** 邮箱 */
  email?: string
  /** 显示排序 */
  sortOrder: number
  /** 状态 */
  status: DeptStatus
  createdAt?: string
  updatedAt?: string
  children?: DeptRecord[]
}

/** 部门查询参数 */
export interface DeptQuery {
  name?: string
  status?: DeptStatus
}

/** 新增/编辑部门参数 */
export interface DeptParams {
  id?: string
  parentId: string
  name: string
  leader?: string
  phone?: string
  email?: string
  sort: number
  status: DeptStatus
}
