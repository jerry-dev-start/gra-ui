import { useState, useEffect, useMemo } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, Spin, theme } from 'antd'
import { isAuthenticated } from './utils/auth'
import { useUserStore } from './stores/user'
import { useMenuStore } from './stores/menu'
import { createStaticRouter, createDynamicRouter } from './router'

function App() {
  const hasToken = isAuthenticated()
  const { fetchUser } = useUserStore()
  const { fetchMenus, loaded, routes } = useMenuStore()
  const [initializing, setInitializing] = useState(hasToken)

  useEffect(() => {
    if (!hasToken) return
    // 并行请求用户信息 + 菜单树
    Promise.all([fetchUser(), fetchMenus()]).finally(() => {
      setInitializing(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const router = useMemo(() => {
    if (!hasToken || !loaded) {
      return createStaticRouter()
    }
    return createDynamicRouter(routes)
  }, [hasToken, loaded, routes])

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
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App
