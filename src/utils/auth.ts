import { create } from 'zustand'

const TOKEN_KEY = 'gra_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

// ---- 响应式 token 状态 ----

interface AuthState {
  /** 是否持有 token（响应式） */
  hasToken: boolean
  /** 写入 token 并同步状态 */
  setToken: (token: string) => void
  /** 清除 token 并同步状态 */
  removeToken: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  hasToken: !!localStorage.getItem(TOKEN_KEY),

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ hasToken: true })
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ hasToken: false })
  },
}))

/** @deprecated 兼容旧调用，优先使用 useAuthStore().setToken */
export function setToken(token: string): void {
  useAuthStore.getState().setToken(token)
}

/** @deprecated 兼容旧调用，优先使用 useAuthStore().removeToken */
export function removeToken(): void {
  useAuthStore.getState().removeToken()
}
