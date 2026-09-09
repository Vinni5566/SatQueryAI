import type { SessionListItem } from '../lib/api'

export const ASK_JOB = 'ask_scene'
export const CHANGE_JOB = 'before_after'

/** Legacy change chats were created as ask_scene with this title. */
function looksLikeChangeTitle(title: string): boolean {
  const t = title.trim().toLowerCase()
  return t === 'before vs after' || t.startsWith('before vs after')
}

export function isChangeSession(session: SessionListItem): boolean {
  if (session.job_type === CHANGE_JOB) return true
  if (session.job_type === ASK_JOB || !session.job_type) {
    return looksLikeChangeTitle(session.title || '')
  }
  return false
}

export function isAskSession(session: SessionListItem): boolean {
  return !isChangeSession(session)
}

export function filterAskSessions(
  sessions: SessionListItem[],
): SessionListItem[] {
  return sessions.filter(isAskSession)
}

export function filterChangeSessions(
  sessions: SessionListItem[],
): SessionListItem[] {
  return sessions.filter(isChangeSession)
}
