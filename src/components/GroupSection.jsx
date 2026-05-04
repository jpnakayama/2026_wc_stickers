import { useState } from 'react'
import TeamSection from './TeamSection'

export default function GroupSection({ group, isOwned, onToggle, countOwned }) {
  const [open, setOpen] = useState(false)

  const allCodes = group.teams.flatMap((t) => t.stickers.map((s) => s.code))
  const total = allCodes.length
  const owned = countOwned(allCodes)
  const pct = Math.round((owned / total) * 100)

  return (
    <div className="group-section">
      <button className="group-header" onClick={() => setOpen((v) => !v)}>
        <div className="group-header-left">
          <span className="group-badge">Grupo {group.id}</span>
          <span className="group-teams">
            {group.teams.map((t) => t.name).join(' · ')}
          </span>
        </div>
        <div className="group-header-right">
          <span className="group-count">
            {owned}/{total}
          </span>
          <span className="group-chevron">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      <div className="group-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {open && (
        <div className="group-body">
          {group.teams.map((team) => (
            <TeamSection
              key={team.code}
              team={team}
              isOwned={isOwned}
              onToggle={onToggle}
              countOwned={countOwned}
            />
          ))}
        </div>
      )}
    </div>
  )
}
