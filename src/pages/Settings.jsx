import { supabase } from '../lib/supabaseClient'

export default function Settings({ session, theme, setTheme }) {
  const email = session?.user?.email ?? '—'

  const signOut = async () => {
    await supabase?.auth.signOut()
  }

  return (
    <div className="page settings-page">
      <section className="settings-card" aria-labelledby="settings-account-title">
        <h2 id="settings-account-title" className="settings-card-title">
          Conta
        </h2>
        <p className="settings-card-desc">
          Sessão: <strong className="settings-email">{email}</strong>
        </p>
        <div className="settings-actions">
          <button type="button" className="settings-signout-btn" onClick={signOut}>
            Terminar sessão
          </button>
        </div>
      </section>

      <section className="settings-card" aria-labelledby="settings-appearance-title">
        <h2 id="settings-appearance-title" className="settings-card-title">
          Aparência
        </h2>
        <p className="settings-card-desc">Tema da interface (escuro ou claro).</p>
        <div className="theme-toggle" role="group" aria-label="Tema">
          <button
            type="button"
            className={`theme-toggle-btn${theme === 'dark' ? ' active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            Escuro
          </button>
          <button
            type="button"
            className={`theme-toggle-btn${theme === 'light' ? ' active' : ''}`}
            onClick={() => setTheme('light')}
          >
            Claro
          </button>
        </div>
      </section>
    </div>
  )
}
