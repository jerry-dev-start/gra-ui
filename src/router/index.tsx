import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import Layout from '../layouts'
import Login from '../pages/system/Login'
import { GuestOnly } from '../components/AuthGuard'

const ProfilePage = lazy(() => import('../pages/system/Profile'))
const profileRoute: RouteObject = {
  path: 'profile',
  element: (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 200 }}><Spin /></div>}>
      <ProfilePage />
    </Suspense>
  ),
}

const loginRoute: RouteObject = {
  path: '/login',
  element: (
    <GuestOnly>
      <Login />
    </GuestOnly>
  ),
}

/** 未登录时的静态路由：仅 /login，其余全部跳转 /login */
export function createStaticRouter() {
  return createBrowserRouter([
    loginRoute,
    {
      path: '*',
      element: <Navigate to="/login" replace />,
    },
  ])
}

/** 登录后的动态路由：Layout 包裹动态子路由 + /login */
export function createDynamicRouter(dynamicRoutes: RouteObject[]) {
  return createBrowserRouter([
    loginRoute,
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Navigate to={dynamicRoutes[0]?.path ? `/${dynamicRoutes[0].path}` : '/login'} replace />,
        },
        ...dynamicRoutes,
        profileRoute,
        {
          path: '*',
          element: (
            <div style={{ color: '#c8cdd8', textAlign: 'center', paddingTop: 100 }}>
              404 — 页面不存在
            </div>
          ),
        },
      ],
    },
  ])
}
