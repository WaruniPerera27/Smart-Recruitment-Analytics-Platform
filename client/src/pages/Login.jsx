
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = isLogin
        ? await loginUser({
            email: formData.email,
            password: formData.password
          })
        : await registerUser(formData)

      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={s.container} className="login-container">
      <div style={s.glowOne} />
      <div style={s.glowTwo} />

      <section style={s.card} className="login-card">
        <div style={s.logoIcon}>
          <span style={s.logoLetter}>S</span>
        </div>

        <header style={s.brand}>
          <h1 style={s.title} className="login-title">
            Smart Recruitment
          </h1>
          <p style={s.subtitle}>ANALYTICS PLATFORM</p>
        </header>

        <div style={s.divider}>
          <span style={s.dividerLine} />
          <span style={s.dividerDot} />
          <span style={s.dividerLine} />
        </div>

        <div style={s.welcome}>
          <h2 style={s.formTitle}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={s.description}>
            {isLogin
              ? 'Sign in to continue to your dashboard.'
              : 'Join us to make recruitment smarter.'}
          </p>
        </div>

        <div style={s.tabs}>
          <button
            type="button"
            className="login-tab"
            style={isLogin ? s.activeTab : s.inactiveTab}
            onClick={() => {
              setIsLogin(true)
              setError('')
            }}
          >
            Login
          </button>

          <button
            type="button"
            className="login-tab"
            style={!isLogin ? s.activeTab : s.inactiveTab}
            onClick={() => {
              setIsLogin(false)
              setError('')
            }}
          >
            Register
          </button>
        </div>

        {error && <div style={s.error} role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={s.fieldGroup}>
              <label htmlFor="name" style={s.label}>Full name</label>
              <input
                id="name"
                className="login-input"
                style={s.input}
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div style={s.fieldGroup}>
            <label htmlFor="email" style={s.label}>Email address</label>
            <input
              id="email"
              className="login-input"
              style={s.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div style={s.fieldGroup}>
            <label htmlFor="password" style={s.label}>Password</label>
            <input
              id="password"
              className="login-input"
              style={s.input}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </div>

          <button
            className="login-primary-button"
            style={s.button}
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Sign in to your account  →'
                : 'Create account  →'}
          </button>
        </form>

        <div style={s.footer}>
          <span style={s.footerText}>
            {isLogin
              ? "Don't have an account?"
              : 'Already have an account?'}
          </span>

          <button
            type="button"
            className="login-switch"
            style={s.switchLink}
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
          >
            {isLogin ? 'Register now' : 'Login here'}
          </button>
        </div>

        <div style={s.security}>
          <span style={s.securityDot} />
          Secure recruitment workspace
        </div>
      </section>

      <p style={s.bottomText}>
        SMARTER HIRING. BETTER DECISIONS.
      </p>
    </main>
  )
}

const s = {
  container: {
    position: 'relative',
    isolation: 'isolate',
    width: '100%',
    minWidth: 0,
    minHeight: '100vh',
    minHeight: '100dvh',
    flex: '1 0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '36px 20px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background:
      'radial-gradient(ellipse at 12% 10%, rgba(14, 116, 144, 0.20), transparent 38%), radial-gradient(ellipse at 90% 90%, rgba(109, 40, 217, 0.17), transparent 38%), linear-gradient(135deg, #080d1b 0%, #10172b 52%, #080d1b 100%)',
    fontFamily: "Inter, 'Segoe UI', sans-serif",
    color: '#f1f5f9'
  },

  glowOne: {
    position: 'absolute',
    zIndex: -1,
    width: '400px',
    height: '400px',
    top: '-200px',
    left: '-150px',
    borderRadius: '50%',
    background: 'rgba(56, 189, 248, 0.12)',
    filter: 'blur(100px)',
    pointerEvents: 'none'
  },

  glowTwo: {
    position: 'absolute',
    zIndex: -1,
    width: '420px',
    height: '420px',
    right: '-180px',
    bottom: '-220px',
    borderRadius: '50%',
    background: 'rgba(139, 92, 246, 0.16)',
    filter: 'blur(100px)',
    pointerEvents: 'none'
  },

  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '496px',
    boxSizing: 'border-box',
    padding: '42px 40px 30px',
    borderRadius: '28px',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    background: 'rgba(17, 25, 45, 0.96)',
    boxShadow: '0 28px 90px rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(18px)'
  },

  logoIcon: {
    width: '68px',
    height: '68px',
    margin: '0 auto 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '22px',
    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    boxShadow: '0 10px 35px rgba(56, 189, 248, 0.22)'
  },

  logoLetter: {
    fontSize: '34px',
    fontWeight: '850',
    color: '#08111f'
  },

  brand: {
    textAlign: 'center',
    marginBottom: '28px'
  },

  title: {
    color: '#f8fafc',
    fontSize: '29px',
    lineHeight: 1.25,
    fontWeight: '800',
    letterSpacing: '-0.9px',
    margin: '0 0 9px'
  },

  subtitle: {
    color: '#7dd3fc',
    fontSize: '11px',
    fontWeight: '750',
    letterSpacing: '3.2px',
    margin: 0
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '30px'
  },

  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(148, 163, 184, 0.17)'
  },

  dividerDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#38bdf8',
    boxShadow: '0 0 12px rgba(56, 189, 248, 0.55)'
  },

  welcome: {
    textAlign: 'center',
    marginBottom: '25px'
  },

  formTitle: {
    color: '#f8fafc',
    fontSize: '27px',
    lineHeight: 1.3,
    fontWeight: '750',
    letterSpacing: '-0.7px',
    margin: '0 0 9px'
  },

  description: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: 1.6,
    margin: 0
  },

  tabs: {
    display: 'flex',
    gap: '5px',
    padding: '6px',
    borderRadius: '14px',
    background: '#0b1222',
    marginBottom: '28px'
  },

  activeTab: {
    flex: 1,
    padding: '13px',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(110deg, #38bdf8, #60a5fa)',
    color: '#07111f',
    fontSize: '14px',
    fontWeight: '750',
    cursor: 'pointer'
  },

  inactiveTab: {
    flex: 1,
    padding: '13px',
    border: '1px solid transparent',
    borderRadius: '10px',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '650',
    cursor: 'pointer'
  },

  fieldGroup: {
    marginBottom: '21px'
  },

  label: {
    display: 'block',
    color: '#cbd5e1',
    fontSize: '13px',
    fontWeight: '650',
    marginBottom: '10px'
  },

  input: {
    display: 'block',
    width: '100%',
    minWidth: 0,
    padding: '15px 16px',
    borderRadius: '12px',
    border: '1px solid #29354c',
    background: '#0b1222',
    color: '#f1f5f9',
    fontSize: '14px',
    lineHeight: 1.4,
    outline: 'none'
  },

  button: {
    display: 'block',
    width: '100%',
    padding: '16px 14px',
    marginTop: '8px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(110deg, #38bdf8, #818cf8)',
    color: '#07111f',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(56, 189, 248, 0.13)'
  },

  error: {
    background: 'rgba(127, 29, 29, 0.25)',
    border: '1px solid rgba(248, 113, 113, 0.3)',
    color: '#fca5a5',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '18px',
    fontSize: '13px',
    lineHeight: 1.5
  },

  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginTop: '25px',
    fontSize: '13px'
  },

  footerText: {
    color: '#94a3b8'
  },

  switchLink: {
    border: 'none',
    background: 'transparent',
    color: '#7dd3fc',
    fontSize: '13px',
    fontWeight: '750',
    cursor: 'pointer',
    padding: '4px'
  },

  security: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderTop: '1px solid rgba(148, 163, 184, 0.12)',
    paddingTop: '21px',
    marginTop: '25px',
    color: '#64748b',
    fontSize: '11px',
    letterSpacing: '0.2px'
  },

  securityDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#34d399',
    boxShadow: '0 0 9px rgba(52, 211, 153, 0.45)'
  },

  bottomText: {
    position: 'relative',
    zIndex: 1,
    color: '#64748b',
    fontSize: '10px',
    fontWeight: '650',
    letterSpacing: '2.5px',
    textAlign: 'center',
    lineHeight: 1.5,
    margin: '24px 0 0'
  }
}

export default Login
