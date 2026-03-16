import type { User } from "./user"

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 登录响应 Data */
export interface LoginResult {
  token: string
}

export interface UserAllInfo {
  userInfo: User
}