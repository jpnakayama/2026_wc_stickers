import { useEffect, useState } from 'react'
import { useStickers } from './hooks/useStickers'
import { useTheme } from './hooks/useTheme'
import { supabase, supabaseConfigured } from './lib/supabaseClient'
import BottomNav from './components/BottomNav'
import Collection from './pages/Collection'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { GROUPS, FWC_SECTIONS, TOTAL_STICKERS } from './data/stickers'

const ALL_CODES = [
  ...FWC_SECTIONS.flatMap((s) => s.stickers.map((st) => st.code)),
  ...GROUPS.flatMap((g) => g.teams.flatMap((t) => t.stickers.map((s) => s.code))),
]

function AuthenticatedApp({ session, theme, setTheme }) {
  const [page, setPage] = useState('collection')
  const { toggle, isOwned, countOwned, albumStatus, albumError, reloadAlbum } = useStickers(session.user.id)
  const totalOwned = countOwned(ALL_CODES)

  return (
    <div className="app">
      <header className="app-header">
        <button
          type="button"
          className="header-logo-btn"
          onClick={() => setPage((p) => (p === 'settings' ? 'collection' : 'settings'))}
          aria-label={page === 'settings' ? 'Voltar à coleção' : 'Ajustes'}
        >
          <img
            className="header-logo"
            src="/logo.jpg"
            alt=""
            width={44}
            height={44}
            decoding="async"
          />
        </button>
        <div className="header-titles">
          <h1 className="header-title">FIFA World Cup 2026</h1>
          <p className="header-sub">Álbum de Figurinhas</p>
        </div>
        <div className="header-badge">
          <span className="header-owned">{totalOwned}</span>
          <span className="header-sep">/</span>
          <span className="header-total">{TOTAL_STICKERS}</span>
        </div>
      </header>

      <main className="app-main">
        {page === 'collection' && (
          <Collection isOwned={isOwned} onToggle={toggle} countOwned={countOwned} />
        )}
        {page === 'stats' && <Stats countOwned={countOwned} />}
        {page === 'settings' && (
          <Settings
            session={session}
            theme={theme}
            setTheme={setTheme}
            albumStatus={albumStatus}
            albumError={albumError}
            onReloadAlbum={reloadAlbum}
          />
        )}
      </main>

      <BottomNav page={page} onNavigate={setPage} />
    </div>
  )
}

export default function App() {
  const { theme, setTheme } = useTheme()
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !supabaseConfigured) {
      setSession(null)
      setAuthLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (authLoading) {
    return (
      <div className="auth-loading">
        <p>A carregar…</p>
      </div>
    )
  }

  if (!supabaseConfigured || !supabase) {
    return <Login />
  }

  if (!session) {
    return <Login />
  }

  return <AuthenticatedApp session={session} theme={theme} setTheme={setTheme} />
}
