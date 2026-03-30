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

  updateAvatar:(url: string) => Promise<void>
}

export const useUserStore = create<UserState>((set,get) => ({
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
  updateAvatar: async (url: string)=>{
    const currentUser = get().user;
    // 确保这里的赋值能触发订阅者的更新
    const userInfo:User = {
      ...currentUser,
      username: currentUser!.username,
      avatar: url
    }
    set({user: userInfo})
  },
  clearUser: () => set({ user: null,permissions: null }),

}))
