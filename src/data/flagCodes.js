/**
 * ISO 3166-1 alpha-2 (incl. gb-eng, gb-sct) → URLs no CDN usado pela Flagpedia
 * (ver https://flagpedia.net/download/api — serviço flagcdn.com).
 */
export const TEAM_FLAG_ISO = {
  MEX: 'mx',
  RSA: 'za',
  KOR: 'kr',
  CZE: 'cz',
  CAN: 'ca',
  BIH: 'ba',
  QAT: 'qa',
  SUI: 'ch',
  BRA: 'br',
  MAR: 'ma',
  HAI: 'ht',
  SCO: 'gb-sct',
  USA: 'us',
  PAR: 'py',
  AUS: 'au',
  TUR: 'tr',
  GER: 'de',
  CUW: 'cw',
  CIV: 'ci',
  ECU: 'ec',
  NED: 'nl',
  JPN: 'jp',
  SWE: 'se',
  TUN: 'tn',
  BEL: 'be',
  EGY: 'eg',
  IRN: 'ir',
  NZL: 'nz',
  ESP: 'es',
  CPV: 'cv',
  KSA: 'sa',
  URU: 'uy',
  FRA: 'fr',
  SEN: 'sn',
  IRQ: 'iq',
  NOR: 'no',
  ARG: 'ar',
  ALG: 'dz',
  AUT: 'at',
  JOR: 'jo',
  POR: 'pt',
  COD: 'cd',
  UZB: 'uz',
  COL: 'co',
  ENG: 'gb-eng',
  CRO: 'hr',
  GHA: 'gh',
  PAN: 'pa',
}

/** Larguras suportadas por flagcdn (w*) — escolhemos a menor ≥ pedido, ou a maior disponível */
const FLAGCDN_W = [20, 40, 80, 160, 320, 640, 1280, 2560]

function flagcdnWidthForDisplay(px) {
  const n = Math.max(16, Math.round(px))
  const found = FLAGCDN_W.find((w) => w >= n)
  return found ?? FLAGCDN_W[FLAGCDN_W.length - 1]
}

/**
 * URL PNG no CDN (Flagpedia / flagcdn).
 * @param {string} teamCode código FIFA (ex.: MEX)
 * @param {number} displayWidth largura lógica em CSS px (para escolher w20/w40/…)
 */
export function teamFlagImageUrl(teamCode, displayWidth = 40) {
  const iso = TEAM_FLAG_ISO[teamCode]
  if (!iso) return null
  const w = flagcdnWidthForDisplay(displayWidth * (typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 1.25 : 1))
  return `https://flagcdn.com/w${w}/${iso}.png`
}
