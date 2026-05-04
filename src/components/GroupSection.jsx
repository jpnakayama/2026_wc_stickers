import { useState } from 'react'
import TeamSection from './TeamSection'
import TeamFlag from './TeamFlag'

export default function GroupSection({ group, isOwned, onToggle, countOwned }) {
  const [openTeamCode, setOpenTeamCode] = useState(null)

  const openTeam =
    openTeamCode != null
      ? group.teams.find((t) => t.code === openTeamCode) ?? null
      : null

  const toggleTeam = (code) => {
    setOpenTeamCode((prev) => (prev === code ? null : code))
  }

  return (
    <div className="group-section">
      <div className="group-card-head">
        <span className="group-badge">Grupo {group.id}</span>
        <div className="group-flags-row" role="group" aria-label={`Seleções do grupo ${group.id}`}>
          {group.teams.map((t) => {
            const isOpen = openTeamCode === t.code
            return (
              <button
                key={t.code}
                type="button"
                className={`group-flag-cell${isOpen ? ' active' : ''}`}
                onClick={() => toggleTeam(t.code)}
                aria-expanded={isOpen}
                aria-controls={`team-panel-${group.id}-${t.code}`}
                id={`team-flag-${group.id}-${t.code}`}
                title={t.name}
              >
                <TeamFlag teamCode={t.code} teamName={t.name} width={96} />
              </button>
            )
          })}
        </div>
      </div>
      {openTeam && (
        <div
          className="group-body"
          id={`team-panel-${group.id}-${openTeam.code}`}
          role="region"
          aria-labelledby={`team-flag-${group.id}-${openTeam.code}`}
        >
          <TeamSection
            team={openTeam}
            isOwned={isOwned}
            onToggle={onToggle}
            countOwned={countOwned}
          />
        </div>
      )}
    </div>
  )
}
