import { Fragment, useMemo, useState } from 'react'
import FWCSection from '../components/FWCSection'
import GroupSection from '../components/GroupSection'
import TeamSection from '../components/TeamSection'
import { GROUPS } from '../data/stickers'

function chunkPairs(groups) {
  const rows = []
  for (let i = 0; i < groups.length; i += 2) {
    rows.push([groups[i], groups[i + 1]].filter(Boolean))
  }
  return rows
}

export default function Collection({ isOwned, onToggle, countOwned }) {
  const [open, setOpen] = useState(null)

  const groupRows = useMemo(() => chunkPairs(GROUPS), [])

  const openTeam = useMemo(() => {
    if (!open) return null
    const g = GROUPS.find((x) => x.id === open.groupId)
    const team = g?.teams.find((t) => t.code === open.teamCode) ?? null
    return team && g ? { group: g, team } : null
  }, [open])

  const toggleTeam = (groupId, teamCode) => {
    setOpen((prev) => {
      if (prev?.groupId === groupId && prev?.teamCode === teamCode) return null
      return { groupId, teamCode }
    })
  }

  return (
    <div className="page">
      <FWCSection isOwned={isOwned} onToggle={onToggle} countOwned={countOwned} />
      <div className="groups-grid">
        {groupRows.map((pair) => {
          const [left, right] = pair
          const rowKey = `${left.id}-${right?.id ?? 'solo'}`
          const openInThisRow =
            open &&
            openTeam?.team &&
            (open.groupId === left.id || (right && open.groupId === right.id))

          return (
            <Fragment key={rowKey}>
              <GroupSection
                group={left}
                openTeamCode={open?.groupId === left.id ? open.teamCode : null}
                onToggleTeam={(code) => toggleTeam(left.id, code)}
              />
              {right && (
                <GroupSection
                  group={right}
                  openTeamCode={open?.groupId === right.id ? open.teamCode : null}
                  onToggleTeam={(code) => toggleTeam(right.id, code)}
                />
              )}
              {openInThisRow && (
                <div
                  className="team-expansion-panel"
                  id={`team-panel-${open.groupId}-${open.teamCode}`}
                  role="region"
                  aria-label={`Figurinhas — ${openTeam.team.name}`}
                >
                  <TeamSection
                    team={openTeam.team}
                    isOwned={isOwned}
                    onToggle={onToggle}
                    countOwned={countOwned}
                  />
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
