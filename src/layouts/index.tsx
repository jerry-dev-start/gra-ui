import { useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Breadcrumb, Layout as AntLayout, Menu, theme } from 'antd'
import { HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { MenuRecord } from '@/types/menu'
import { removeToken } from '../utils/auth'
import { logout } from '../api/auth'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import { useThemeStore } from '@/stores/theme'
import './index.css'

const { Sider, Header, Content } = AntLayout

type AntMenuItem = Required<MenuProps>['items'][number]

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

/**
 * 从原始菜单树中递归查找当前路径对应的面包屑链
 * 返回 [{ name, path }, ...] 从根到叶
 */
function findBreadcrumbTrail(
  menus: MenuRecord[],
  pathname: string,
): { name: string; path?: string }[] {
  for (const menu of menus) {
    if (menu.type === 'button' || menu.status === 0) continue

    // 叶子命中
    if (menu.type === 'menu' && menu.path === pathname) {
      return [{ name: menu.name, path: menu.path }]
    }

    // 目录：递归子节点
    if (menu.type === 'directory' && menu.children?.length) {
      const trail = findBreadcrumbTrail(menu.children, pathname)
      if (trail.length) {
        return [{ name: menu.name }, ...trail]
      }
    }
  }
  return []
}

const MOBILE_BREAKPOINT = 768

function Layout() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < MOBILE_BREAKPOINT)
  const navigate = useNavigate()
  const location = useLocation()
  const { token: themeToken } = theme.useToken()

  // 监听窗口尺寸变化，移动端自动收起
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT)
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      if (mobile) setCollapsed(true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const { user, clearUser } = useUserStore()
  const { menus, antdMenuItems, clearMenus } = useMenuStore()
  const { mode: themeMode, toggleMode } = useThemeStore()

  const defaultOpenKey = findOpenKey(antdMenuItems, location.pathname)

  // 面包屑：首页 / 父目录 / 当前页
  const breadcrumbItems = useMemo(() => {
    const trail = findBreadcrumbTrail(menus, location.pathname)
    const items: { title: React.ReactNode; href?: string }[] = [
      { title: <HomeOutlined />, href: '/' },
    ]
    trail.forEach((item, idx) => {
      const isLast = idx === trail.length - 1
      items.push({
        title: item.name,
        ...(isLast || !item.path ? {} : { href: item.path }),
      })
    })
    return items
  }, [menus, location.pathname])

  const handleLogout = () => {
    logout().finally(() => {
      clearUser()
      clearMenus()
      removeToken()
      navigate('/login', { replace: true })
    })
  }

  return (
    <AntLayout style={{ height: '100vh', overflow: 'hidden' }}>
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
          height: '100vh',
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
            items={antdMenuItems}
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
            <div
              className="sidebar-user-avatar"
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer' }}
              title="个人中心"
            >
              {user?.avatar
                ? <img src={import.meta.env.VITE_API_PRE + user.avatar} alt="avatar" className="sidebar-user-avatar-img" />
                : (user?.nickname?.charAt(0) || user?.username?.charAt(0) || '?')
              }
            </div>
            {!collapsed && (
              <>
                <div
                  className="sidebar-user-info"
                  onClick={() => navigate('/profile')}
                  style={{ cursor: 'pointer' }}
                  title="个人中心"
                >
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

      <AntLayout style={{ overflow: 'hidden' }}>
        <Header
          style={{
            padding: '0 24px',
            background: themeToken.colorBgContainer,
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexShrink: 0,
          }}
        >
          {!isMobile && (
            collapsed
              ? <MenuUnfoldOutlined onClick={() => setCollapsed(false)} style={{ fontSize: 18, cursor: 'pointer' }} />
              : <MenuFoldOutlined onClick={() => setCollapsed(true)} style={{ fontSize: 18, cursor: 'pointer' }} />
          )}
          <Breadcrumb items={breadcrumbItems} />
          <div style={{ flex: 1 }} />
          {themeMode === 'dark'
            ? <SunOutlined onClick={toggleMode} style={{ fontSize: 18, cursor: 'pointer' }} title="切换亮色模式" />
            : <MoonOutlined onClick={toggleMode} style={{ fontSize: 18, cursor: 'pointer' }} title="切换暗色模式" />
          }
        </Header>

        <Content style={{ padding: 24, overflow: 'auto', flex: 1 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
