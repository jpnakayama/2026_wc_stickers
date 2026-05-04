export default function StickerCard({ code, label, owned, onToggle, goldFirst = false }) {
  return (
    <button
      className={`sticker-card${owned ? ' owned' : ''}${goldFirst ? ' sticker-card--gold-first' : ''}`}
      onClick={() => onToggle(code)}
      title={label}
      aria-label={`${code} - ${label}${owned ? ' (tenho)' : ' (falta)'}`}
      aria-pressed={owned}
    >
      <span className="sticker-code">{code}</span>
    </button>
  )
}
