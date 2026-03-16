import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { setToken } from '../../utils/auth'
import './index.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  // 登录前的来源页，登录后跳回
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('请输入用户名')
      return
    }
    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    setLoading(true)
    // TODO: 替换为真实后端 API 调用
    setTimeout(() => {
      setToken('mock_token_' + Date.now())
      setLoading(false)
      navigate(from, { replace: true })
    }, 1000)
  }

  return (
    <div className="login-page">
      {/* 科技感背景 */}
      <div className="login-bg">
        <div className="grid-lines" />
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="glow glow-3" />
      </div>

      {/* 毛玻璃登录卡片 */}
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect width="40" height="40" rx="10" fill="rgba(0,194,255,0.15)" />
              <path d="M12 20l6-8 6 8-6 8z" fill="#00c2ff" />
              <path d="M22 16l4-2v12l-4-2z" fill="#00c2ff" opacity="0.6" />
            </svg>
          </div>
          <h1 className="login-title">GRA Admin</h1>
          <p className="login-subtitle">后台管理系统</p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="#ff4d6a" strokeWidth="1.5" />
              <path d="M8 4.5v4M8 10.5v1" stroke="#ff4d6a" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="username">用户名</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2.5 16.5c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                id="username"
                type="text"
                placeholder="请输入用户名"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password">密码</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 8V5.5a3 3 0 116 0V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="9" cy="12.5" r="1.2" fill="currentColor" />
              </svg>
              <input
                id="password"
                type="password"
                placeholder="请输入密码"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner" aria-label="登录中" />
            ) : (
              '登 录'
            )}
          </button>
        </form>

        <p className="login-footer">
          &copy; {new Date().getFullYear()} GRA Admin &middot; All rights reserved
        </p>
      </div>
    </div>
  )
}

export default Login
