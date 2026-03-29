import { create } from 'zustand'
import type { User } from '@/types/user'
import { getUserInfo } from '@/api/auth'
import { removeToken } from '@/utils/auth'

interface UserState {
  user: User | null
  permissions: string[] | null
  loading: boolean
  /** 拉取用户信息 */
  fetchUser: () => Promise<void>
  /** 清空用户信息（退出登录时调用） */
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  permissions: null,
  loading: false,
  fetchUser: async () => {
    set({ loading: true })
    try {
      const data = await getUserInfo()
      set({ user: data.userInfo,permissions: data.permissions, loading: false })
    } catch {
      // 拉取失败（token 过期/无效），清 token 让 App 层跳登录
      removeToken()
      set({ user: null,permissions: null, loading: false })
    }
  },
  clearUser: () => set({ user: null,permissions: null }),
}))
