import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const MIN_PASSWORD = 6

export default function RecoverPassword({ onSuccess }) {
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const submit = async () => {
    setMsg(null)
    if (p1.length < MIN_PASSWORD) {
      setMsg(`A nova palavra-passe deve ter pelo menos ${MIN_PASSWORD} caracteres.`)
      return
    }
    if (p1 !== p2) {
      setMsg('As duas palavras-passe não coincidem.')
      return
    }
    if (!supabase) return
    setBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: p1 })
      if (error) {
        setMsg(error.message)
      } else {
        onSuccess()
      }
    } catch (e) {
      setMsg(e?.message || 'Erro ao atualizar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Nova palavra-passe</h1>
        <p className="login-sub">Define uma nova palavra-passe para a tua conta.</p>

        <label className="login-email-label" htmlFor="recover-p1">
          Nova palavra-passe
        </label>
        <input
          id="recover-p1"
          className="login-email-input"
          type="password"
          autoComplete="new-password"
          value={p1}
          onChange={(e) => setP1(e.target.value)}
          disabled={busy}
        />

        <label className="login-email-label" htmlFor="recover-p2">
          Repetir palavra-passe
        </label>
        <input
          id="recover-p2"
          className="login-email-input"
          type="password"
          autoComplete="new-password"
          value={p2}
          onChange={(e) => setP2(e.target.value)}
          disabled={busy}
        />

        <button type="button" className="login-primary-btn" onClick={submit} disabled={busy}>
          {busy ? 'A guardar…' : 'Guardar palavra-passe'}
        </button>

        {msg && (
          <p className="login-msg" role="status">
            {msg}
          </p>
        )}
      </div>
    </div>
  )
}
