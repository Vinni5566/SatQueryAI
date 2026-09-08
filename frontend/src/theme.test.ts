import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredTheme,
  initTheme,
  toggleTheme,
} from './theme'

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('applyTheme sets dark class and stores preference', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('applyTheme sets light class and stores preference', () => {
    applyTheme('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('getStoredTheme reads valid values only', () => {
    expect(getStoredTheme()).toBeNull()
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    expect(getStoredTheme()).toBe('dark')
    localStorage.setItem(THEME_STORAGE_KEY, 'nope')
    expect(getStoredTheme()).toBeNull()
  })

  it('toggleTheme flips light to dark and back', () => {
    expect(toggleTheme('light')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(toggleTheme('dark')).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('initTheme uses stored theme when present', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    expect(initTheme()).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
