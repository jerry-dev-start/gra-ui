import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../layouts'
import Login from '../pages/Login'
import MenuPage from '../pages/Menu'
import { RequireAuth, GuestOnly } from '../components/AuthGuard'

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestOnly>
        <Login />
      </GuestOnly>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <div style={{ color: '#c8cdd8' }}>Dashboard 页面 — 待开发</div>,
      },
      {
        path: 'users',
        element: <div style={{ color: '#c8cdd8' }}>用户管理 — 待开发</div>,
      },
      {
        path: 'settings',
        element: <div style={{ color: '#c8cdd8' }}>系统设置 — 待开发</div>,
      },
      {
        path: 'menus',
        element: <MenuPage />,
      },
    ],
  },
])

export default router
