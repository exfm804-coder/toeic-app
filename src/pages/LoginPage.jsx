import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="login-wrap">
      <div className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="header-title">TOEIC 公式問題集</div>
            <div className="header-sub">ログイン</div>
          </div>
        </div>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <div className="login-field">
          <label className="login-label">メールアドレス</label>
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="login-field">
          <label className="login-label">パスワード</label>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <div className="login-error">{error}</div>}
        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </div>
  )
}
