import StickerCard from './StickerCard'

function stickerSlotNumber(code) {
  const m = String(code).match(/(\d+)$/)
  return m ? parseInt(m[1], 10) : null
}

export default function TeamSection({ team, isOwned, onToggle, countOwned }) {
  const total = team.stickers.length
  const owned = countOwned(team.stickers.map((s) => s.code))
  const pct = Math.round((owned / total) * 100)

  return (
    <div className="team-section">
      <div className="team-header">
        <span className="team-name">{team.name}</span>
        <span className="team-count">
          {owned}/{total}
        </span>
      </div>
      <div className="team-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="sticker-grid">
        {team.stickers.map((s) => {
          const n = stickerSlotNumber(s.code)
          const owned = isOwned(s.code)
          const goldFirst = n === 1 && !owned
          return (
            <StickerCard
              key={s.code}
              code={s.code}
              label={s.label}
              owned={owned}
              onToggle={onToggle}
              goldFirst={goldFirst}
            />
          )
        })}
      </div>
    </div>
  )
}
