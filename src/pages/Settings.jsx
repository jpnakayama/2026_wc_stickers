import SyncBar from '../components/SyncBar'

export default function Settings({
  syncId,
  syncStatus,
  syncError,
  applySyncId,
  reloadCollection,
  theme,
  setTheme,
}) {
  return (
    <div className="page settings-page">
      <section className="settings-card" aria-labelledby="settings-appearance-title">
        <h2 id="settings-appearance-title" className="settings-card-title">
          Aparência
        </h2>
        <p className="settings-card-desc">Tema da interface (escuro ou claro).</p>
        <div className="theme-toggle" role="group" aria-label="Tema">
          <button
            type="button"
            className={`theme-toggle-btn${theme === 'dark' ? ' active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            Escuro
          </button>
          <button
            type="button"
            className={`theme-toggle-btn${theme === 'light' ? ' active' : ''}`}
            onClick={() => setTheme('light')}
          >
            Claro
          </button>
        </div>
      </section>

      <section className="settings-card" aria-labelledby="settings-sync-title">
        <h2 id="settings-sync-title" className="settings-card-title">
          Sincronização
        </h2>
        <p className="settings-card-desc">
          Código para partilhar a coleção entre dispositivos.
        </p>
        <SyncBar
          embedded
          syncId={syncId}
          syncStatus={syncStatus}
          syncError={syncError}
          applySyncId={applySyncId}
          reloadCollection={reloadCollection}
        />
      </section>
    </div>
  )
}
