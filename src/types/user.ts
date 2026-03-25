export interface User {
  /** * 用户唯一标识 (雪花算法 ID)
   * 注意：后端 uint64 传到前端建议使用 string 接收，避免精度丢失
   */
  id?: string;

  /** 用户名 */
  username: string;

  /** 昵称 */
  nickname?: string;

  /** 头像地址 */
  avatar?: string;

  /** 邮箱 */
  email?: string;

  /** 手机号 */
  phoneNumber?: string;

  /** 状态：1 启用 / 0 禁用 */
  status?: 0 | 1;

  /** 最后登录时间 */
  lastLoginDate?: string;

  deptId?: string;

  /** 角色 ID 列表 */
  roleIds?: string[];
}

/** 当前登录用户资料 */
export interface CurrentUserInfo {
  nickname?: string
  phone?: string
  email?: string
  username: string
  lastLoginDate?: string
  roleCount?: number
  roleName?: string[]
}

/** 用户列表查询参数 */
export interface UserQuery {
  username?: string
  phoneNumber?: string
  deptId?: string
  page: number
  pageSize: number
}

/** 分页响应 */
export interface UserPageResult {
  list: User[]
  total: number
}

/** 新增/编辑用户参数 */
export interface UserParams {
  id?: string
  username: string
  nickname?: string
  avatar?: string
  email?: string
  phoneNumber?: string
  status?: 0 | 1
  deptId?: string
  password?: string
  roleIds?: string[]
}