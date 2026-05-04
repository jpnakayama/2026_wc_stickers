export default function StickerCard({ code, label, owned, onToggle }) {
  return (
    <button
      className={`sticker-card${owned ? ' owned' : ''}`}
      onClick={() => onToggle(code)}
      title={label}
      aria-label={`${code} - ${label}${owned ? ' (tenho)' : ' (falta)'}`}
      aria-pressed={owned}
    >
      <span className="sticker-code">{code}</span>
    </button>
  )
}
