import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import './index.css'

interface MenuItem {
  key: string
  label: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    label: '仪表盘',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="2" width="7" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="2" y="11" width="7" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="8" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    key: '/users',
    label: '用户管理',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 18c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: '/settings',
    label: '系统设置',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6L16 16M4 16l1.4-1.4M14.6 5.4L16 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
]

function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="layout">
      {/* 侧边栏 */}
      <aside className={`layout-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-header">
          <svg className="sidebar-logo" width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect width="40" height="40" rx="10" fill="rgba(0,194,255,0.15)" />
            <path d="M12 20l6-8 6 8-6 8z" fill="#00c2ff" />
            <path d="M22 16l4-2v12l-4-2z" fill="#00c2ff" opacity="0.6" />
          </svg>
          {!collapsed && <span className="sidebar-title">GRA Admin</span>}
        </div>

        <nav className="sidebar-nav" aria-label="主导航">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item${location.pathname === item.key ? ' active' : ''}`}
              onClick={() => navigate(item.key)}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? '展开菜单' : '收起菜单'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d={collapsed ? 'M7 4l5 5-5 5' : 'M11 4L6 9l5 5'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </aside>

      {/* 右侧内容区 */}
      <div className="layout-main">
        <header className="layout-header">
          <div className="header-breadcrumb">
            {menuItems.find((m) => m.key === location.pathname)?.label ?? '首页'}
          </div>
          <div className="header-actions">
            <div className="header-avatar" aria-label="用户头像">A</div>
          </div>
        </header>

        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
