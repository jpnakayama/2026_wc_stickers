import { flagUrl } from '../data/flagCodes'

export default function TeamFlag({ teamCode, teamName, width = 40, variant = 'default' }) {
  const src = flagUrl(teamCode, width)
  if (!src) return null
  const cls =
    variant === 'round' ? 'team-flag team-flag--round' : 'team-flag'
  const hideAlt = variant === 'round'
  return (
    <img
      className={cls}
      src={src}
      alt={hideAlt ? '' : teamName}
      aria-hidden={hideAlt ? true : undefined}
      loading="lazy"
      decoding="async"
    />
  )
}
