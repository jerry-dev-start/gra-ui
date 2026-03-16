import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

/** 需要登录才能访问的路由守卫 */
export function RequireAuth({ children }: AuthGuardProps) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

/** 已登录时跳转到首页（防止重复登录） */
export function GuestOnly({ children }: AuthGuardProps) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
