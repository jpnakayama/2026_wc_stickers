import { useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

const MIN_PASSWORD = 6

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [msgOk, setMsgOk] = useState(false)

  const switchMode = (next) => {
    setMode(next)
    setMsg(null)
    setMsgOk(false)
    setPassword('')
  }

  const sendResetEmail = async () => {
    setMsg(null)
    setMsgOk(false)
    if (!supabase || !supabaseConfigured) {
      setMsg('Falta configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no build.')
      return
    }
    if (!isValidEmail(email)) {
      setMsg('Introduz o email da conta para receberes o link de recuperação.')
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/`,
      })
      if (error) {
        setMsg(error.message)
      } else {
        setMsgOk(true)
        setMsg('Se existir uma conta com este email, enviámos um link para repores a palavra-passe.')
      }
    } catch (e) {
      setMsg(e?.message || 'Erro ao enviar.')
    } finally {
      setBusy(false)
    }
  }

  const submit = async () => {
    setMsg(null)
    setMsgOk(false)
    if (!supabase || !supabaseConfigured) {
      setMsg('Falta configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no build.')
      return
    }
    if (!isValidEmail(email)) {
      setMsg('Introduz um email válido.')
      return
    }
    if (password.length < MIN_PASSWORD) {
      setMsg(`A palavra-passe deve ter pelo menos ${MIN_PASSWORD} caracteres.`)
      return
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) {
          setMsg(error.message === 'Invalid login credentials' ? 'Email ou palavra-passe incorretos.' : error.message)
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        })
        if (error) {
          setMsg(error.message)
        } else if (data.session) {
          setMsgOk(true)
          setMsg('Conta criada. A entrar…')
        } else {
          setMsgOk(true)
          setMsg(
            'Conta criada. Se o projeto exigir confirmação por email, abre o link que enviámos; depois usa «Entrar» aqui.'
          )
        }
      }
    } catch (e) {
      setMsg(e?.message || 'Erro inesperado.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">FIFA World Cup 2026</h1>
        {mode !== 'forgot' && (
          <p className="login-sub">
            Álbum de Figurinhas — entra com email e palavra-passe ou cria conta no primeiro acesso.
          </p>
        )}
        {!supabaseConfigured && (
          <p className="login-warn">
            Variáveis <code className="login-code">VITE_SUPABASE_*</code> em falta. Define-as na Vercel (e em{' '}
            <code className="login-code">.env.local</code> para dev) e faz redeploy.
          </p>
        )}

        {mode !== 'forgot' && (
          <div className="login-tabs" role="tablist" aria-label="Tipo de acesso">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`login-tab${mode === 'login' ? ' login-tab--active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`login-tab${mode === 'signup' ? ' login-tab--active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Cadastre-se
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <button type="button" className="login-back-link" onClick={() => switchMode('login')}>
            ← Voltar ao login
          </button>
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
          disabled={busy}
        />

        {mode !== 'forgot' && (
          <>
            <label className="login-email-label" htmlFor="login-password">
              Palavra-passe
            </label>
            <input
              id="login-password"
              className="login-email-input"
              type="password"
              name="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
            {mode === 'login' && (
              <button type="button" className="login-forgot-link" onClick={() => switchMode('forgot')}>
                Esqueci-me da palavra-passe
              </button>
            )}
          </>
        )}

        {mode === 'forgot' && (
          <p className="login-sub login-sub--compact">
            Indica o email da conta. Se existir registo, recebes um link para definires uma nova palavra-passe.
          </p>
        )}

        <button
          type="button"
          className="login-primary-btn"
          onClick={mode === 'forgot' ? sendResetEmail : submit}
          disabled={busy || !supabaseConfigured}
        >
          {busy
            ? 'A processar…'
            : mode === 'forgot'
              ? 'Enviar link de recuperação'
              : mode === 'login'
                ? 'Entrar'
                : 'Criar conta e entrar'}
        </button>

        {msg && (
          <p className={`login-msg${msgOk ? ' login-msg--ok' : ''}`} role="status">
            {msg}
          </p>
        )}

        <p className="login-hint">
          No Supabase: <strong>Authentication → Providers → Email</strong> com email+password ativo. Em{' '}
          <strong>URL Configuration</strong> o Site URL e os Redirect URLs devem incluir o URL exacto da app (ex.{' '}
          <code className="login-code">http://localhost:5173</code> e produção), senão o link do email de recuperação
          falha. Opcional: modelo <strong>Reset password</strong> em Authentication → Emails.
        </p>
      </div>
    </div>
  )
}
