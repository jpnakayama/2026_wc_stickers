import { useState } from 'react'
import { validateSyncIdInput } from '../utils/syncId'

export default function SyncBar({
  embedded = false,
  syncId,
  syncStatus,
  syncError,
  applySyncId,
  reloadCollection,
}) {
  const [paste, setPaste] = useState('')
  const [applyMsg, setApplyMsg] = useState(null)

  const copyCode = async () => {
    if (!syncId) return
    try {
      await navigator.clipboard.writeText(syncId)
      setApplyMsg('Código copiado.')
      setTimeout(() => setApplyMsg(null), 2000)
    } catch {
      setApplyMsg('Não foi possível copiar.')
      setTimeout(() => setApplyMsg(null), 2500)
    }
  }

  const onApply = async () => {
    setApplyMsg(null)
    if (!validateSyncIdInput(paste)) {
      setApplyMsg('Código inválido (8–64 caracteres: letras, números, _ ou -).')
      return
    }
    const ok = await applySyncId(paste.trim())
    if (ok) {
      setPaste('')
      setApplyMsg('Código aplicado. Coleção carregada.')
      setTimeout(() => setApplyMsg(null), 2500)
    } else {
      setApplyMsg('Não foi possível guardar o código.')
    }
  }

  const statusLabel =
    syncStatus === 'loading'
      ? 'A sincronizar…'
      : syncStatus === 'local_fallback'
        ? 'Modo local (sem servidor ou Redis). Os dados ficam só neste dispositivo até configurares o Upstash.'
        : 'Sincronizado na nuvem'

  return (
    <div className={`sync-bar${embedded ? ' sync-bar--embedded' : ''}`}>
      <div className="sync-bar-row">
        <span className="sync-bar-label">Código de sincronização</span>
        <button type="button" className="sync-bar-copy" onClick={copyCode} disabled={!syncId}>
          Copiar
        </button>
      </div>
      <code className="sync-bar-code" title={syncId || ''}>
        {syncStatus === 'loading' ? '…' : syncId || '—'}
      </code>
      <p className="sync-bar-hint">
        Usa o mesmo código noutro telemóvel ou PC para carregar esta coleção. Não partilhes com quem não
        queres que edite o teu álbum.
      </p>
      <div className="sync-bar-status">
        <span className={`sync-bar-dot${syncStatus === 'ready' ? ' online' : ''}`} aria-hidden />
        <span>{statusLabel}</span>
      </div>
      {syncError && syncStatus === 'local_fallback' && (
        <p className="sync-bar-warn">Detalhe: {syncError}</p>
      )}
      <div className="sync-bar-paste">
        <input
          className="sync-bar-input"
          type="text"
          placeholder="Colar código existente"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="button" className="sync-bar-apply" onClick={onApply}>
          Aplicar
        </button>
        {syncStatus === 'ready' && (
          <button type="button" className="sync-bar-refresh" onClick={() => reloadCollection()}>
            Recarregar
          </button>
        )}
      </div>
      {applyMsg && <p className="sync-bar-msg">{applyMsg}</p>}
    </div>
  )
}
