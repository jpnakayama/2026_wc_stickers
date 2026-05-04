export function validateSyncIdInput(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(id.trim())
}
