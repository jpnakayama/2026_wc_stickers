import { useState } from 'react'
import { useStickers } from './hooks/useStickers'
import { useTheme } from './hooks/useTheme'
import BottomNav from './components/BottomNav'
import Collection from './pages/Collection'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import { GROUPS, FWC_SECTIONS, TOTAL_STICKERS } from './data/stickers'

const ALL_CODES = [
  ...FWC_SECTIONS.flatMap((s) => s.stickers.map((st) => st.code)),
  ...GROUPS.flatMap((g) => g.teams.flatMap((t) => t.stickers.map((s) => s.code))),
]

export default function App() {
  const [page, setPage] = useState('collection')
  const { theme, setTheme } = useTheme()
  const {
    toggle,
    isOwned,
    countOwned,
    syncId,
    syncStatus,
    syncError,
    applySyncId,
    reloadCollection,
  } = useStickers()
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
            syncId={syncId}
            syncStatus={syncStatus}
            syncError={syncError}
            applySyncId={applySyncId}
            reloadCollection={reloadCollection}
            theme={theme}
            setTheme={setTheme}
          />
        )}
      </main>

      <BottomNav page={page} onNavigate={setPage} />
    </div>
  )
}
