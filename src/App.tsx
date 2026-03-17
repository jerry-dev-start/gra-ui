import { useState, useEffect, useRef } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, Spin, theme } from 'antd'
import { useAuthStore } from './utils/auth'
import { useUserStore } from './stores/user'
import { useMenuStore } from './stores/menu'
import { createStaticRouter, createDynamicRouter } from './router'
import type { RouterProviderProps } from 'react-router-dom'

function App() {
  const hasToken = useAuthStore((s) => s.hasToken)
  const fetchUser = useUserStore((s) => s.fetchUser)
  const fetchMenus = useMenuStore((s) => s.fetchMenus)
  const loaded = useMenuStore((s) => s.loaded)
  const routes = useMenuStore((s) => s.routes)
  const [initializing, setInitializing] = useState(hasToken)

  // 缓存 router 实例，避免每次 render 都 createBrowserRouter
  const routerRef = useRef<RouterProviderProps['router'] | null>(null)
  // 追踪上一次构建 router 时的 key，仅当真正变化时才重建
  const routerKeyRef = useRef('')

  useEffect(() => {
    if (!hasToken) {
      setInitializing(false)
      return
    }
    setInitializing(true)
    Promise.all([fetchUser(), fetchMenus()]).finally(() => {
      setInitializing(false)
    })
  }, [hasToken, fetchUser, fetchMenus])

  // 计算当前应使用的 router key
  const currentKey = hasToken && loaded ? `dynamic-${routes.length}` : 'static'

  // 仅当 key 变化时才重建 router
  if (routerKeyRef.current !== currentKey) {
    routerKeyRef.current = currentKey
    routerRef.current =
      hasToken && loaded ? createDynamicRouter(routes) : createStaticRouter()
  }

  if (initializing) {
    return (
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <RouterProvider router={routerRef.current!} />
    </ConfigProvider>
  )
}

export default App
