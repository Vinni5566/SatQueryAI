export const LOGO_STORAGE_KEY = 'satquery-logo'

export const LOGO_IDS = [
  'signin-dish',
  'dish-beam',
  'orbit-sat',
  'globe-scan',
  'sq-mark',
  'constellation',
  'radar-arc',
] as const

export type LogoId = (typeof LOGO_IDS)[number]

/** Locked to the signup wireframe mark */
export const DEFAULT_LOGO_ID: LogoId = 'signin-dish'

export const LOGO_LABELS: Record<LogoId, string> = {
  'signin-dish': 'Sign-in dish (wireframe)',
  'dish-beam': 'Dish + beam',
  'orbit-sat': 'Orbit satellite',
  'globe-scan': 'Globe scan',
  'sq-mark': 'SQ monogram',
  constellation: 'Constellation',
  'radar-arc': 'Radar arcs',
}

export function isLogoId(value: string | null): value is LogoId {
  return LOGO_IDS.includes(value as LogoId)
}

export function getStoredLogo(): LogoId | null {
  const value = localStorage.getItem(LOGO_STORAGE_KEY)
  return isLogoId(value) ? value : null
}

export function setStoredLogo(id: LogoId): void {
  localStorage.setItem(LOGO_STORAGE_KEY, id)
}

export function getActiveLogo(): LogoId {
  return getStoredLogo() ?? DEFAULT_LOGO_ID
}
