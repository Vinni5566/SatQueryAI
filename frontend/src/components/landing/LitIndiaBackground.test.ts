import { describe, expect, it } from 'vitest'
import { litIndiaOpacity } from './LitIndiaBackground'

describe('litIndiaOpacity', () => {
  it('fades in then holds then soft-fades with scroll', () => {
    expect(litIndiaOpacity(0, false)).toBe(0)
    expect(litIndiaOpacity(0.2, false)).toBeGreaterThan(0)
    expect(litIndiaOpacity(0.2, false)).toBeLessThan(1)
    expect(litIndiaOpacity(0.5, false)).toBe(1)
    expect(litIndiaOpacity(0.9, false)).toBeLessThan(1)
    expect(litIndiaOpacity(0.9, false)).toBeGreaterThan(0)
  })

  it('stays visible when reduced motion', () => {
    expect(litIndiaOpacity(0, true)).toBe(0.9)
  })
})
