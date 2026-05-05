import { useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [sent, setSent] = useState(false)

  const sendMagicLink = async () => {
    setMsg(null)
    if (!supabase || !supabaseConfigured) {
      setMsg('Falta configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no build.')
      return
    }
    if (!isValidEmail(email)) {
      setMsg('Introduz um email válido.')
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })
      if (error) {
        setMsg(error.message)
        setSent(false)
      } else {
        setSent(true)
        setMsg('Enviámos um link para o teu email. Abre-o neste dispositivo para entrar.')
      }
    } catch (e) {
      setMsg(e?.message || 'Erro ao enviar o link.')
      setSent(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">FIFA World Cup 2026</h1>
        <p className="login-sub">Álbum de Figurinhas — indica o teu email e recebes um link para entrar (sem palavra-passe).</p>
        {!supabaseConfigured && (
          <p className="login-warn">
            Variáveis <code className="login-code">VITE_SUPABASE_*</code> em falta. Define-as na Vercel (e em{' '}
            <code className="login-code">.env.local</code> para dev) e faz redeploy.
          </p>
        )}
        <label className="login-email-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          className="login-email-input"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nome@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy || sent}
        />
        <button
          type="button"
          className="login-primary-btn"
          onClick={sendMagicLink}
          disabled={busy || !supabaseConfigured || sent}
        >
          {busy ? 'A enviar…' : sent ? 'Link enviado' : 'Enviar link de acesso'}
        </button>
        {msg && (
          <p className={`login-msg${sent ? ' login-msg--ok' : ''}`} role="status">
            {msg}
          </p>
        )}
        {sent && (
          <button type="button" className="login-retry-btn" onClick={() => { setSent(false); setMsg(null) }}>
            Usar outro email
          </button>
        )}
        <p className="login-hint">
          No Supabase: <strong>Authentication → Providers → Email</strong> ativo; em <strong>URL Configuration</strong>{' '}
          define o Site URL (produção) e redirect local se precisares. Opcional: SMTP próprio em{' '}
          <strong>Authentication → Emails</strong>.
        </p>
      </div>
    </div>
  )
}
