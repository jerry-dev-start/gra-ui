import React from 'react'
import * as Icons from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { MenuRecord } from '@/types/menu'

type AntMenuItem = Required<MenuProps>['items'][number]

/**
 * icon 字符串 → antd Icon 组件
 * 后端存的是 icon 名称字符串，如 "DashboardOutlined"
 */
function resolveIcon(iconName: string): React.ReactNode {
  if (!iconName) return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[iconName]
  return IconComponent ? React.createElement(IconComponent) : undefined
}

/**
 * 递归将 MenuRecord[] 转为 antd MenuItem[]
 * - 只处理 visible === true 且 status === 1 的节点
 * - button 类型跳过（按钮权限不显示在菜单中）
 * - directory 有 children 则递归生成子菜单
 * - menu 为叶子节点
 */
export function generateMenuItems(menus: MenuRecord[]): AntMenuItem[] {
  const items: AntMenuItem[] = []

  for (const menu of menus) {
    // 跳过不可见、禁用、按钮类型
    if (!menu.visible || menu.status === 0 || menu.type === 'button') continue

    if (menu.type === 'directory') {
      const children = menu.children?.length
        ? generateMenuItems(menu.children)
        : []
      // 目录下没有可见子菜单则不显示
      if (children.length === 0) continue
      items.push({
        key: menu.path || menu.id,
        icon: resolveIcon(menu.icon),
        label: menu.name,
        children,
      })
      continue
    }

    // menu 类型：叶子节点
    items.push({
      key: menu.path,
      icon: resolveIcon(menu.icon),
      label: menu.name,
    })
  }

  return items
}
