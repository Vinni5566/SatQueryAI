import { describe, expect, it } from 'vitest'
import {
  filterAskSessions,
  filterChangeSessions,
  isAskSession,
  isChangeSession,
} from './sessionJob'
import type { SessionListItem } from './api'

function row(
  partial: Partial<SessionListItem> & Pick<SessionListItem, 'id' | 'title' | 'job_type'>,
): SessionListItem {
  return {
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...partial,
  }
}

describe('sessionJob filters', () => {
  const ask = row({ id: '1', title: 'New chat', job_type: 'ask_scene' })
  const changeNew = row({
    id: '2',
    title: 'Before vs after',
    job_type: 'before_after',
  })
  const changeLegacy = row({
    id: '3',
    title: 'Before vs after',
    job_type: 'ask_scene',
  })

  it('keeps ask and change lists separate including legacy titles', () => {
    expect(isAskSession(ask)).toBe(true)
    expect(isChangeSession(ask)).toBe(false)
    expect(isChangeSession(changeNew)).toBe(true)
    expect(isAskSession(changeNew)).toBe(false)
    expect(isChangeSession(changeLegacy)).toBe(true)
    expect(isAskSession(changeLegacy)).toBe(false)

    const all = [ask, changeNew, changeLegacy]
    expect(filterAskSessions(all).map((s) => s.id)).toEqual(['1'])
    expect(filterChangeSessions(all).map((s) => s.id)).toEqual(['2', '3'])
  })
})
