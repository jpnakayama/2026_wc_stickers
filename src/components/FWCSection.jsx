import { useState } from 'react'
import StickerCard from './StickerCard'
import { FWC_SECTIONS, FWC_TOTAL } from '../data/stickers'

export default function FWCSection({ isOwned, onToggle, countOwned }) {
  const [open, setOpen] = useState(false)
  const [openSubs, setOpenSubs] = useState({})

  const allFwcCodes = FWC_SECTIONS.flatMap((s) => s.stickers.map((st) => st.code))
  const owned = countOwned(allFwcCodes)
  const pct = Math.round((owned / FWC_TOTAL) * 100)

  const toggleSub = (id) => setOpenSubs((v) => ({ ...v, [id]: !v[id] }))

  return (
    <div className="group-section fwc-section">
      <button className="group-header fwc-header" onClick={() => setOpen((v) => !v)}>
        <div className="group-header-left">
          <span className="group-badge fwc-badge">FWC</span>
          <span className="group-teams">Especiais · Bolas e Países · História</span>
        </div>
        <div className="group-header-right">
          <span className="group-count">
            {owned}/{FWC_TOTAL}
          </span>
          <span className="group-chevron">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      <div className="group-progress">
        <div className="progress-bar">
          <div className="progress-fill fwc-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {open && (
        <div className="group-body">
          {FWC_SECTIONS.map((section) => {
            const subCodes = section.stickers.map((s) => s.code)
            const subOwned = countOwned(subCodes)
            const isSubOpen = openSubs[section.id]
            return (
              <div key={section.id} className="team-section">
                <button
                  className="team-header subsection-toggle"
                  onClick={() => toggleSub(section.id)}
                >
                  <span className="team-name">{section.label}</span>
                  <span className="team-count">
                    {subOwned}/{subCodes.length}{' '}
                    <span className="group-chevron">{isSubOpen ? '▲' : '▼'}</span>
                  </span>
                </button>
                {isSubOpen && (
                  <div className="sticker-grid">
                    {section.stickers.map((s) => (
                      <StickerCard
                        key={s.code}
                        code={s.code}
                        label={s.label}
                        owned={isOwned(s.code)}
                        onToggle={onToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
