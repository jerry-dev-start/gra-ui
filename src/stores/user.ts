import { create } from 'zustand'
import type { User } from '@/types/user'
import { getUserInfo } from '@/api/auth'

interface UserState {
  user: User | null
  loading: boolean
  /** 拉取用户信息 */
  fetchUser: () => Promise<void>
  /** 清空用户信息（退出登录时调用） */
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  fetchUser: async () => {
    set({ loading: true })
    try {
      const data = await getUserInfo()
      set({ user: data.userInfo, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },
  clearUser: () => set({ user: null }),
}))
