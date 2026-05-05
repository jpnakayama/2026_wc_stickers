import { useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

export default function Login() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const signInGoogle = async () => {
    setMsg(null)
    if (!supabase || !supabaseConfigured) {
      setMsg('Falta configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no build.')
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) setMsg(error.message)
    } catch (e) {
      setMsg(e?.message || 'Erro ao iniciar login.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">FIFA World Cup 2026</h1>
        <p className="login-sub">Álbum de Figurinhas — inicia sessão para guardar a coleção na nuvem.</p>
        {!supabaseConfigured && (
          <p className="login-warn">
            Variáveis <code className="login-code">VITE_SUPABASE_*</code> em falta. Define-as na Vercel (e em{' '}
            <code className="login-code">.env.local</code> para dev) e faz redeploy.
          </p>
        )}
        <button
          type="button"
          className="login-google-btn"
          onClick={signInGoogle}
          disabled={busy || !supabaseConfigured}
        >
          {busy ? 'A abrir…' : 'Continuar com Google'}
        </button>
        {msg && <p className="login-msg">{msg}</p>}
        <p className="login-hint">
          No Supabase: Authentication → Providers → Google (e URL do site em Authentication → URL Configuration).
        </p>
      </div>
    </div>
  )
}
