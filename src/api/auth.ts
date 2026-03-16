import request from '../utils/request'
import type { UserAllInfo } from '@/types/auth'
import type { LoginParams, LoginResult } from '../types/auth'

/** 登录 */
export function login(data: LoginParams) {
  return request.post<LoginResult>('/auth/login', data)
}

// 获取用户信息
export function getUserInfo() {
  return request.get<UserAllInfo>('/users/profile')
}