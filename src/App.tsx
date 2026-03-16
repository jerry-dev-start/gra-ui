import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import router from './router'

function App() {
  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App
