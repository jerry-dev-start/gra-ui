import axios from 'axios'
import type { AxiosResponse,AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import type { ApiResponse } from '../types/api'
import {
  getToken,
  getRefreshToken,
  isTokenExpired,
  isRefreshTokenExpired,
  removeToken,
} from './auth'
import { useAuthStore } from './auth'

const instance = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
})

// ---- 静默刷新相关 ----
let isRefreshing = false
let pendingQueue: {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}[] = []

function resolvePending(token: string) {
  pendingQueue.forEach((cb) => cb.resolve(token))
  pendingQueue = []
}

function rejectPending(err: unknown) {
  pendingQueue.forEach((cb) => cb.reject(err))
  pendingQueue = []
}

/** 强制登出：清除 token 并跳转登录页 */
function forceLogout() {
  removeToken()
  window.location.href = '/login'
}

/**
 * 使用 refreshToken 换取新的 accessToken
 * 注意：这里直接用 axios 发请求，绕过 instance 拦截器，避免死循环
 */
async function doRefreshToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken || isRefreshTokenExpired()) {
    throw new Error('refresh_token_expired')
  }

  const res = await axios.post<ApiResponse<{ token: string; expireAt: number }>>(
    '/api/v1/auth/refresh',
    { refreshToken },
  )

  if (res.data.code !== 0) {
    throw new Error(res.data.message || '刷新 Token 失败')
  }

  const { token, expireAt } = res.data.data
  useAuthStore.getState().updateAccessToken({ token, expireAt })
  return token
}

// 请求拦截：自动注入 token，过期时静默刷新
instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // 登录和刷新接口不走 Token 注入和刷新逻辑
  if (config.url === '/auth/login' || config.url === '/auth/refresh') return config

  const token = getToken()
  if (token && !isTokenExpired()) {
    config.headers.Authorization = `Bearer ${token}`
    return config
  }

  // Token 已过期，尝试静默刷新
  if (!isRefreshing) {
    isRefreshing = true
    try {
      const newToken = await doRefreshToken()
      config.headers.Authorization = `Bearer ${newToken}`
      resolvePending(newToken)
      return config
    } catch (err) {
      rejectPending(err)
      forceLogout()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }

  // 已有刷新请求在进行中，排队等待
  return new Promise((resolve, reject) => {
    pendingQueue.push({
      resolve: (newToken: string) => {
        config.headers.Authorization = `Bearer ${newToken}`
        resolve(config)
      },
      reject,
    })
  })
})

// 响应拦截：统一处理错误
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message: msg } = response.data
    const noGlobalMessage = response.config.noGlobalMessage ?? true
    if (code !== 0 ) {
      if (noGlobalMessage) {
        message.error(msg || '请求失败')
      }
      return Promise.reject(new Error(msg || '请求失败'))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      forceLogout()
    }
    return Promise.reject(error)
  },
)

/**
 * 封装请求 — 泛型 T 对应 Data 字段的类型
 *
 * @example
 * interface User { id: number; name: string }
 * const user = await request<User>('/user/info')
 * // user 的类型就是 User
 */
async function request<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await instance.request<ApiResponse<T>>({ url, ...config })
  return res.data.data
}

// 语义化快捷方法
request.get = <T = unknown>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig) =>
  request<T>(url, { method: 'GET', params, ...config })

request.post = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>(url, { method: 'POST', data, ...config })

request.put = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>(url, { method: 'PUT', data, ...config })

request.del = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>(url, { method: 'DELETE', data, ...config })

export default request


