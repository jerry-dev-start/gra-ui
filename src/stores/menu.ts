import { create } from 'zustand'
import type { RouteObject } from 'react-router-dom'
import type { MenuProps } from 'antd'
import type { MenuRecord } from '@/types/menu'
import { getMenuTree } from '@/api/menu'
import { generateRoutes } from '@/router/generate-routes'
import { generateMenuItems } from '@/router/generate-menus'

type AntMenuItem = Required<MenuProps>['items'][number]

interface MenuState {
  /** 原始菜单树（后端返回） */
  menus: MenuRecord[]
  /** 转换后的 antd 菜单项（侧边栏用） */
  antdMenuItems: AntMenuItem[]
  /** 转换后的路由（动态注册用） */
  routes: RouteObject[]
  /** 是否已加载完成 */
  loaded: boolean
  /** 拉取菜单树并生成路由和菜单 */
  fetchMenus: () => Promise<void>
  /** 清空菜单（退出登录时调用） */
  clearMenus: () => void
}

export const useMenuStore = create<MenuState>((set) => ({
  menus: [],
  antdMenuItems: [],
  routes: [],
  loaded: false,

  fetchMenus: async () => {
    try {
      const menus = await getMenuTree()
      const antdMenuItems = generateMenuItems(menus)
      const routes = generateRoutes(menus)
      debugger
      set({ menus, antdMenuItems, routes, loaded: true })
    } catch {
      set({ menus: [], antdMenuItems: [], routes: [], loaded: true })
    }
  },

  clearMenus: () =>
    set({ menus: [], antdMenuItems: [], routes: [], loaded: false }),
}))
