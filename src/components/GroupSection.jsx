import TeamFlag from './TeamFlag'

export default function GroupSection({ group, openTeamCode, onToggleTeam }) {
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
                onClick={() => onToggleTeam(t.code)}
                aria-expanded={isOpen}
                aria-controls={isOpen ? `team-panel-${group.id}-${t.code}` : undefined}
                id={`team-flag-${group.id}-${t.code}`}
                title={t.name}
              >
                <TeamFlag variant="round" teamCode={t.code} teamName={t.name} width={104} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
