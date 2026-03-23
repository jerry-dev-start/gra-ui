import { create } from 'zustand'

const TOKEN_KEY = 'gra_token'
const REFRESH_TOKEN_KEY = 'gra_refresh_token'
const EXPIRE_AT_KEY = 'gra_expire_at'
const REFRESH_EXPIRE_AT_KEY = 'gra_refresh_expire_at'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/** 访问 Token 是否已过期（提前 60s 判定，留出刷新窗口） */
export function isTokenExpired(): boolean {
  const expireAt = localStorage.getItem(EXPIRE_AT_KEY)
  if (!expireAt) return true
  return Date.now() >= Number(expireAt) * 1000 - 60_000
}

/** 刷新 Token 是否已过期 */
export function isRefreshTokenExpired(): boolean {
  const refreshExpAt = localStorage.getItem(REFRESH_EXPIRE_AT_KEY)
  if (!refreshExpAt) return true
  return Date.now() >= Number(refreshExpAt) * 1000
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

// ---- 响应式 token 状态 ----

interface AuthState {
  /** 是否持有 token（响应式） */
  hasToken: boolean
  /** 写入全部 token 信息并同步状态 */
  setTokens: (info: {
    token: string
    refreshToken: string
    expireAt: number
    refreshExpAt: number
  }) => void
  /** 仅更新访问 token（刷新场景） */
  updateAccessToken: (info: {
    token: string
    expireAt: number
  }) => void
  /** 清除全部 token 并同步状态 */
  removeToken: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  hasToken: !!localStorage.getItem(TOKEN_KEY),

  setTokens: ({ token, refreshToken, expireAt, refreshExpAt }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(EXPIRE_AT_KEY, String(expireAt))
    localStorage.setItem(REFRESH_EXPIRE_AT_KEY, String(refreshExpAt))
    set({ hasToken: true })
  },

  updateAccessToken: ({ token, expireAt }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(EXPIRE_AT_KEY, String(expireAt))
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(EXPIRE_AT_KEY)
    localStorage.removeItem(REFRESH_EXPIRE_AT_KEY)
    set({ hasToken: false })
  },
}))

/** @deprecated 兼容旧调用，请使用 useAuthStore().setTokens */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  useAuthStore.setState({ hasToken: true })
}

/** @deprecated 兼容旧调用，优先使用 useAuthStore().removeToken */
export function removeToken(): void {
  useAuthStore.getState().removeToken()
}
