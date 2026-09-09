import { describe, expect, it } from 'vitest'
import {
  clampComparePercent,
  percentFromPointer,
} from './compareSliderMath'

describe('compareSliderMath', () => {
  it('clamps percent to 0–100', () => {
    expect(clampComparePercent(-10)).toBe(0)
    expect(clampComparePercent(50)).toBe(50)
    expect(clampComparePercent(140)).toBe(100)
    expect(clampComparePercent(Number.NaN)).toBe(50)
  })

  it('maps pointer x to percent across the frame', () => {
    expect(percentFromPointer(100, 0, 200)).toBe(50)
    expect(percentFromPointer(0, 0, 200)).toBe(0)
    expect(percentFromPointer(200, 0, 200)).toBe(100)
    expect(percentFromPointer(-20, 0, 200)).toBe(0)
  })
})
