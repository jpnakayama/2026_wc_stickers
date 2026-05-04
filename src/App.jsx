import { useState, useMemo } from 'react'
import { useStickers } from './hooks/useStickers'
import BottomNav from './components/BottomNav'
import Collection from './pages/Collection'
import Stats from './pages/Stats'
import { GROUPS, FWC_SECTIONS, TOTAL_STICKERS } from './data/stickers'

const ALL_CODES = [
  ...FWC_SECTIONS.flatMap((s) => s.stickers.map((st) => st.code)),
  ...GROUPS.flatMap((g) => g.teams.flatMap((t) => t.stickers.map((s) => s.code))),
]

export default function App() {
  const [page, setPage] = useState('collection')
  const { toggle, isOwned, countOwned } = useStickers()
  const totalOwned = countOwned(ALL_CODES)

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo">⚽</div>
        <div className="header-titles">
          <h1 className="header-title">Copa 2026</h1>
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
      </main>

      <BottomNav page={page} onNavigate={setPage} />
    </div>
  )
}
