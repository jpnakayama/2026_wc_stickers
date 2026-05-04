import FWCSection from '../components/FWCSection'
import GroupSection from '../components/GroupSection'
import { GROUPS } from '../data/stickers'

export default function Collection({ isOwned, onToggle, countOwned }) {
  return (
    <div className="page">
      <FWCSection isOwned={isOwned} onToggle={onToggle} countOwned={countOwned} />
      {GROUPS.map((group) => (
        <GroupSection
          key={group.id}
          group={group}
          isOwned={isOwned}
          onToggle={onToggle}
          countOwned={countOwned}
        />
      ))}
    </div>
  )
}
