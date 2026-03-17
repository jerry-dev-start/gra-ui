import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import type { ApiResponse } from '../types/api'
import { getToken, removeToken } from './auth'

const instance = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
})

// 请求拦截：自动注入 token
instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一处理错误
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message: msg } = response.data
    if (code !== 0) {
      message.error(msg || '请求失败')
      return Promise.reject(new Error(msg || '请求失败'))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
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
