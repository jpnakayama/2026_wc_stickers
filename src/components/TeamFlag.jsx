import { teamFlagImageUrl } from '../data/flagCodes'

export default function TeamFlag({ teamCode, teamName, width = 40, variant = 'default' }) {
  const requestW = variant === 'round' ? Math.max(80, width) : width
  const src = teamFlagImageUrl(teamCode, requestW)
  if (!src) return null

  const isRound = variant === 'round'
  const cls = `team-flag${isRound ? ' team-flag--round' : ''}`
  const hideAlt = isRound
  const diameter = isRound ? Math.min(48, Math.max(32, Math.round(width * 0.375))) : null

  return (
    <img
      className={cls}
      src={src}
      alt={hideAlt ? '' : `${teamName} — bandeira`}
      aria-hidden={hideAlt ? true : undefined}
      width={isRound ? diameter ?? 36 : undefined}
      height={isRound ? diameter ?? 36 : undefined}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  )
}
