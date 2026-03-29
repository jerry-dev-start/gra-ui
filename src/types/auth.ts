import type { User } from "./user"

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 登录响应 Data */
export interface LoginResult {
  token: string
  refreshToken: string
  expireAt: number
  refreshExpAt: number
}

/** 刷新 Token 响应 Data */
export interface RefreshResult {
  token: string
  expireAt: number
}

export interface UserAllInfo {
  userInfo: User
  permissions: string[]
}
