import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, theme } from 'antd'
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { removeToken } from '../utils/auth'
import { useUserStore } from '@/stores/user'
import './index.css'

const { Sider, Header, Content } = AntLayout

type AntMenuItem = Required<MenuProps>['items'][number]

const menuItems: AntMenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      {
        key: '/users',
        icon: <UserOutlined />,
        label: '用户管理',
      },
      {
        key: '/menus',
        icon: <MenuOutlined />,
        label: '菜单管理',
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: '系统设置',
      },
    ],
  },
]

/** 根据路径查找菜单标签 */
function findLabel(items: AntMenuItem[], pathname: string): string {
  for (const item of items ?? []) {
    if (!item || !('key' in item)) continue
    if (item.key === pathname) return (item as { label?: string }).label ?? ''
    if ('children' in item && item.children) {
      const found = findLabel(item.children as AntMenuItem[], pathname)
      if (found) return found
    }
  }
  return '首页'
}

/** 根据路径查找父级 key（用于自动展开子菜单） */
function findOpenKey(items: AntMenuItem[], pathname: string): string | undefined {
  for (const item of items ?? []) {
    if (!item || !('key' in item)) continue
    if ('children' in item && item.children) {
      for (const child of item.children as AntMenuItem[]) {
        if (child && 'key' in child && child.key === pathname) {
          return item.key as string
        }
      }
    }
  }
  return undefined
}

function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { token: themeToken } = theme.useToken()

  const defaultOpenKey = findOpenKey(menuItems, location.pathname)

  const { user, fetchUser, clearUser } = useUserStore()

  const handleLogout = () => {
    clearUser()
    removeToken()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={240}
        collapsedWidth={64}
        style={{
          background: themeToken.colorBgContainer,
          borderRight: `1px solid ${themeToken.colorBorderSecondary}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="sidebar-header">
            <svg className="sidebar-logo" width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect width="40" height="40" rx="10" fill="rgba(0,194,255,0.15)" />
              <path d="M12 20l6-8 6 8-6 8z" fill="#00c2ff" />
              <path d="M22 16l4-2v12l-4-2z" fill="#00c2ff" opacity="0.6" />
            </svg>
            {!collapsed && <span className="sidebar-title">GRA Admin</span>}
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={defaultOpenKey ? [defaultOpenKey] : []}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderInlineEnd: 'none', flex: 1, overflow: 'auto' }}
          />

          {/* 底部用户信息 */}
          <div
            className="sidebar-user"
            style={{
              borderTop: `1px solid ${themeToken.colorBorderSecondary}`,
              color: themeToken.colorText,
            }}
          >
            <div className="sidebar-user-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="sidebar-user-avatar-img" />
                : (user?.nickname?.charAt(0) || user?.username?.charAt(0) || '?')
              }
            </div>
            {!collapsed && (
              <>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{user?.nickname || user?.username || '--'}</span>
                  <span className="sidebar-user-role" style={{ color: themeToken.colorTextSecondary }}>{user?.email || '--'}</span>
                </div>
                <LogoutOutlined
                  className="sidebar-user-logout"
                  onClick={handleLogout}
                  title="退出登录"
                />
              </>
            )}
          </div>
        </div>
      </Sider>

      <AntLayout>
        <Header
          style={{
            padding: '0 24px',
            background: themeToken.colorBgContainer,
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {collapsed
            ? <MenuUnfoldOutlined onClick={() => setCollapsed(false)} style={{ fontSize: 18, cursor: 'pointer' }} />
            : <MenuFoldOutlined onClick={() => setCollapsed(true)} style={{ fontSize: 18, cursor: 'pointer' }} />
          }
          <span>{findLabel(menuItems, location.pathname)}</span>
        </Header>

        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
