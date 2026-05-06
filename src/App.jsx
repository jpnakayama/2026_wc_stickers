import { useEffect, useRef, useState } from 'react'
import { useStickers } from './hooks/useStickers'
import { useTheme } from './hooks/useTheme'
import { supabase, supabaseConfigured } from './lib/supabaseClient'
import BottomNav from './components/BottomNav'
import Collection from './pages/Collection'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import Login from './pages/Login'
import RecoverPassword from './pages/RecoverPassword'
import { GROUPS, FWC_SECTIONS, TOTAL_STICKERS } from './data/stickers'

const ALL_CODES = [
  ...FWC_SECTIONS.flatMap((s) => s.stickers.map((st) => st.code)),
  ...GROUPS.flatMap((g) => g.teams.flatMap((t) => t.stickers.map((s) => s.code))),
]

function AuthenticatedApp({ session, theme, setTheme }) {
  const [page, setPage] = useState('collection')
  const { toggle, isOwned, countOwned } = useStickers(session.user.id)
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
            src="/opening_img.png"
            alt=""
            width={44}
            height={44}
            decoding="async"
          />
        </button>
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
          <Settings session={session} theme={theme} setTheme={setTheme} />
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
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const authInitDoneRef = useRef(false)

  useEffect(() => {
    if (!supabase || !supabaseConfigured) {
      setSession(null)
      setAuthLoading(false)
      authInitDoneRef.current = true
      return
    }

    let cancelled = false
    authInitDoneRef.current = false

    async function initAuth() {
      try {
        const recoveryFromUrl =
          typeof window !== 'undefined' && /type=recovery/.test(window.location.hash)
        const {
          data: { session: initial },
        } = await supabase.auth.getSession()
        if (cancelled) return

        if (initial && recoveryFromUrl) {
          setPasswordRecovery(true)
        }

        if (initial) {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (cancelled) return
          if (error) {
            const msg = (error.message || '').toLowerCase()
            const looksNetwork = msg.includes('failed to fetch') || msg.includes('network')
            if (looksNetwork) {
              setSession(initial)
            } else {
              await supabase.auth.signOut({ scope: 'local' })
              setSession(null)
            }
          } else if (!user) {
            await supabase.auth.signOut({ scope: 'local' })
            setSession(null)
          } else {
            setSession(initial)
          }
        } else {
          setSession(null)
        }
      } catch {
        if (!cancelled) setSession(null)
      } finally {
        if (!cancelled) {
          authInitDoneRef.current = true
          setAuthLoading(false)
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true)
        setSession(s)
        return
      }
      if (event === 'SIGNED_OUT') {
        setPasswordRecovery(false)
      }
      if (!authInitDoneRef.current) return
      setSession(s)
    })

    initAuth()

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  if (authLoading) {
    return (
      <div
        className="auth-loading"
        role="status"
        aria-live="polite"
        aria-label="A carregar"
      >
        <img
          className="auth-loading__img"
          src="/opening_img.png"
          alt=""
          width={200}
          height={200}
          decoding="async"
        />
      </div>
    )
  }

  if (!supabaseConfigured || !supabase) {
    return <Login />
  }

  if (!session) {
    return <Login />
  }

  if (passwordRecovery) {
    return (
      <RecoverPassword
        onSuccess={() => {
          setPasswordRecovery(false)
        }}
      />
    )
  }

  return <AuthenticatedApp session={session} theme={theme} setTheme={setTheme} />
}
