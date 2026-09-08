export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'satquery-theme'

export function getStoredTheme(): Theme | null {
  const value = localStorage.getItem(THEME_STORAGE_KEY)
  if (value === 'light' || value === 'dark') return value
  return null
}

export function getPreferredTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function initTheme(): Theme {
  const theme = getStoredTheme() ?? getPreferredTheme()
  applyTheme(theme)
  return theme
}

export function toggleTheme(current: Theme): Theme {
  const next: Theme = current === 'light' ? 'dark' : 'light'
  applyTheme(next)
  return next
}
