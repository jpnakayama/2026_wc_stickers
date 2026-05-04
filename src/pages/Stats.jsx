import { useState } from 'react'
import { GROUPS, FWC_SECTIONS, TOTAL_STICKERS, FWC_TOTAL } from '../data/stickers'
import TeamFlag from '../components/TeamFlag'

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

function compareTeams(a, b, sortBy) {
  const diff =
    sortBy === 'pct-desc' ? b.pct - a.pct : a.pct - b.pct
  if (diff !== 0) return diff
  return a.team.name.localeCompare(b.team.name, 'pt')
}

export default function Stats({ countOwned }) {
  const [sortBy, setSortBy] = useState('album')

  const allCodes = [
    ...FWC_SECTIONS.flatMap((s) => s.stickers.map((st) => st.code)),
    ...GROUPS.flatMap((g) => g.teams.flatMap((t) => t.stickers.map((s) => s.code))),
  ]
  const totalOwned = countOwned(allCodes)
  const fwcCodes = FWC_SECTIONS.flatMap((s) => s.stickers.map((st) => st.code))
  const fwcOwned = countOwned(fwcCodes)

  const rows = GROUPS.flatMap((group) =>
    group.teams.map((team) => {
      const codes = team.stickers.map((s) => s.code)
      const owned = countOwned(codes)
      const total = codes.length
      const pct = total > 0 ? (owned / total) * 100 : 0
      return { team, owned, total, pct }
    })
  )
  const teamRows =
    sortBy === 'album'
      ? rows
      : [...rows].sort((a, b) => compareTeams(a, b, sortBy))

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
        <div className="stats-card-toolbar">
          <div className="stats-title stats-title--toolbar">Por Seleção</div>
          <div className="stats-sort">
            <label htmlFor="stats-team-sort" className="stats-sort-label">
              Ordenar
            </label>
            <select
              id="stats-team-sort"
              className="stats-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="album">Ordem do álbum</option>
              <option value="pct-desc">% completo (maior)</option>
              <option value="pct-asc">% completo (menor)</option>
            </select>
          </div>
        </div>
        <div className="stats-teams-list">
          {teamRows.map(({ team, owned, total, pct }) => {
            const pctRounded = Math.round(pct)
            return (
              <div key={team.code} className="stats-team-row">
                <div className="stats-team-left">
                  <TeamFlag
                    variant="round"
                    teamCode={team.code}
                    teamName={team.name}
                    width={96}
                  />
                  <span className="stats-team-name">{team.name}</span>
                </div>
                <div className="stats-team-right">
                  <span className="stats-team-count">
                    {owned}/{total}
                  </span>
                  <div className="progress-bar small">
                    <div
                      className="progress-fill"
                      style={{ width: `${pctRounded}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
