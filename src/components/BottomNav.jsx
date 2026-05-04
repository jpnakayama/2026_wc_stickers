function IconCollection() {
  return (
    <svg
      className="nav-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="3.5"
        y="3.5"
        width="7"
        height="7"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="13.5"
        y="3.5"
        width="7"
        height="7"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="3.5"
        y="13.5"
        width="7"
        height="7"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="13.5"
        y="13.5"
        width="7"
        height="7"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  )
}

function IconStats() {
  return (
    <svg
      className="nav-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 20h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M4 20V6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect
        x="6.5"
        y="13"
        width="3.5"
        height="6"
        rx="0.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="12"
        y="9"
        width="3.5"
        height="10"
        rx="0.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="17.5"
        y="5"
        width="3.5"
        height="14"
        rx="0.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  )
}

export default function BottomNav({ page, onNavigate }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-btn${page === 'collection' ? ' active' : ''}`}
        onClick={() => onNavigate('collection')}
        type="button"
        aria-label="Coleção"
      >
        <span className="nav-icon">
          <IconCollection />
        </span>
      </button>
      <button
        className={`nav-btn${page === 'stats' ? ' active' : ''}`}
        onClick={() => onNavigate('stats')}
        type="button"
        aria-label="Estatísticas"
      >
        <span className="nav-icon">
          <IconStats />
        </span>
      </button>
    </nav>
  )
}
