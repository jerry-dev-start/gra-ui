import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Spin } from 'antd'
import type { MenuRecord } from '@/types/menu'
import componentMap from './component-map'

const fallback = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 200 }}>
    <Spin />
  </div>
)

/**
 * 递归将 MenuRecord[] 转为 RouteObject[]
 * - directory: 只递归 children，自身不生成路由
 * - menu: 从 componentMap 取组件，用 lazy() 包裹动态 import
 * - button: 跳过（按钮权限，不是页面）
 * - status === 0 的禁用菜单跳过
 */
export function generateRoutes(menus: MenuRecord[]): RouteObject[] {
  const routes: RouteObject[] = []

  for (const menu of menus) {
    // 跳过禁用菜单和按钮类型
    if (menu.status === 0 || menu.type === 'button') continue

    if (menu.type === 'directory') {
      // 目录：递归 children，将子路由提升到同级
      if (menu.children?.length) {
        routes.push(...generateRoutes(menu.children))
      }
      continue
    }

    // menu 类型：从 componentMap 取动态 import 函数
    const loadFn = componentMap[menu.component]
    if (!loadFn) continue

    const Component = lazy(loadFn)

    // 去掉 path 开头的 /，因为作为子路由使用
    const path = menu.path.replace(/^\//, '')

    routes.push({
      path,
      element: (
        <Suspense fallback={fallback}>
          <Component />
        </Suspense>
      ),
    })
  }

  return routes
}
