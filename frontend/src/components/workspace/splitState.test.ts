import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  SPLIT_STORAGE_KEY,
  loadSplitPercent,
  saveSplitPercent,
} from './splitState'

describe('splitState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('loadSplitPercent uses default when empty', () => {
    expect(loadSplitPercent(40)).toBe(40)
  })

  it('save and load split percent clamped', () => {
    saveSplitPercent(55)
    expect(localStorage.getItem(SPLIT_STORAGE_KEY)).toBe('55')
    expect(loadSplitPercent()).toBe(55)
    saveSplitPercent(10)
    expect(loadSplitPercent()).toBe(25)
  })
})
