import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_LOGO_ID,
  LOGO_STORAGE_KEY,
  getActiveLogo,
  getStoredLogo,
  setStoredLogo,
} from './logo'

describe('logo', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('getStoredLogo returns null when empty or invalid', () => {
    expect(getStoredLogo()).toBeNull()
    localStorage.setItem(LOGO_STORAGE_KEY, 'nope')
    expect(getStoredLogo()).toBeNull()
  })

  it('setStoredLogo persists a valid id', () => {
    setStoredLogo('radar-arc')
    expect(localStorage.getItem(LOGO_STORAGE_KEY)).toBe('radar-arc')
    expect(getStoredLogo()).toBe('radar-arc')
  })

  it('getActiveLogo falls back to default', () => {
    expect(getActiveLogo()).toBe(DEFAULT_LOGO_ID)
    setStoredLogo('dish-beam')
    expect(getActiveLogo()).toBe('dish-beam')
  })
})
