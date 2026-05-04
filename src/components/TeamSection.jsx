import StickerCard from './StickerCard'

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
        {team.stickers.map((s) => (
          <StickerCard
            key={s.code}
            code={s.code}
            label={s.label}
            owned={isOwned(s.code)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
