export type WorkspaceMode = 'split' | 'chat' | 'renderer'

export const SPLIT_STORAGE_KEY = 'satquery-ask-split'

export function loadSplitPercent(defaultPercent = 40): number {
  const raw = localStorage.getItem(SPLIT_STORAGE_KEY)
  const n = raw ? Number(raw) : defaultPercent
  if (!Number.isFinite(n)) return defaultPercent
  return Math.min(70, Math.max(25, n))
}

export function saveSplitPercent(percent: number): void {
  const clamped = Math.min(70, Math.max(25, percent))
  localStorage.setItem(SPLIT_STORAGE_KEY, String(clamped))
}
