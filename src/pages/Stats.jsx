import { GROUPS, FWC_SECTIONS, TOTAL_STICKERS, FWC_TOTAL } from '../data/stickers'

function ProgressBar({ value, max, accent }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="stats-progress-row">
      <div className="progress-bar">
        <div
          className={`progress-fill${accent ? ' ' + accent : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="stats-pct">{pct}%</span>
    </div>
  )
}

export default function Stats({ countOwned }) {
  const allCodes = [
    ...FWC_SECTIONS.flatMap((s) => s.stickers.map((st) => st.code)),
    ...GROUPS.flatMap((g) => g.teams.flatMap((t) => t.stickers.map((s) => s.code))),
  ]
  const totalOwned = countOwned(allCodes)
  const fwcCodes = FWC_SECTIONS.flatMap((s) => s.stickers.map((st) => st.code))
  const fwcOwned = countOwned(fwcCodes)

  return (
    <div className="page stats-page">
      <div className="stats-card">
        <div className="stats-title">Total Geral</div>
        <div className="stats-big-count">
          <span className="stats-owned">{totalOwned}</span>
          <span className="stats-separator"> / </span>
          <span className="stats-total">{TOTAL_STICKERS}</span>
        </div>
        <ProgressBar value={totalOwned} max={TOTAL_STICKERS} />
      </div>

      <div className="stats-card">
        <div className="stats-title">FWC — Especiais</div>
        <div className="stats-row-count">
          {fwcOwned} / {FWC_TOTAL}
        </div>
        <ProgressBar value={fwcOwned} max={FWC_TOTAL} accent="fwc-fill" />
      </div>

      <div className="stats-card">
        <div className="stats-title">Por Grupo</div>
        {GROUPS.map((group) => {
          const codes = group.teams.flatMap((t) => t.stickers.map((s) => s.code))
          const owned = countOwned(codes)
          const total = codes.length
          return (
            <div key={group.id} className="stats-group-row">
              <div className="stats-group-info">
                <span className="stats-group-label">Grupo {group.id}</span>
                <span className="stats-group-teams">
                  {group.teams.map((t) => t.name).join(', ')}
                </span>
              </div>
              <div className="stats-group-right">
                <span className="stats-row-count">
                  {owned}/{total}
                </span>
                <ProgressBar value={owned} max={total} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="stats-card">
        <div className="stats-title">Por Seleção</div>
        <div className="stats-teams-list">
          {GROUPS.flatMap((group) =>
            group.teams.map((team) => {
              const codes = team.stickers.map((s) => s.code)
              const owned = countOwned(codes)
              const total = codes.length
              const pct = Math.round((owned / total) * 100)
              return (
                <div key={team.code} className="stats-team-row">
                  <span className="stats-team-name">{team.name}</span>
                  <div className="stats-team-right">
                    <span className="stats-team-count">
                      {owned}/{total}
                    </span>
                    <div className="progress-bar small">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
