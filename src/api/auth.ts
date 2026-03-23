import request from '../utils/request'
import type { UserAllInfo } from '@/types/auth'
import type { LoginParams, LoginResult, RefreshResult } from '../types/auth'

/** 登录 */
export function login(data: LoginParams) {
  return request.post<LoginResult>('/auth/login', data)
}

/** 使用 refreshToken 换取新的访问 Token */
export function refreshTokenApi(refreshToken: string) {
  return request.post<RefreshResult>('/auth/refresh', { refreshToken })
}

/** 登出，服务端销毁 Token */
export function logout() {
  return request.post<null>('/auth/logout')
}

// 获取用户信息
export function getUserInfo() {
  return request.get<UserAllInfo>('/users/profile')
}