export default function BottomNav({ page, onNavigate }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-btn${page === 'collection' ? ' active' : ''}`}
        onClick={() => onNavigate('collection')}
      >
        <span className="nav-icon">🏷️</span>
        <span className="nav-label">Coleção</span>
      </button>
      <button
        className={`nav-btn${page === 'stats' ? ' active' : ''}`}
        onClick={() => onNavigate('stats')}
      >
        <span className="nav-icon">📊</span>
        <span className="nav-label">Estatísticas</span>
      </button>
    </nav>
  )
}
