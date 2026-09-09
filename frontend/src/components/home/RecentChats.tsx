import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { SessionListItem } from '../../lib/api'
import { ROUTES } from '../../routes'

const ACTIVE_SESSION_KEY = 'satquery.activeSessionId'

type RecentChatsProps = {
  sessions: SessionListItem[]
  loading: boolean
  error: string | null
}

function formatWhen(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function RecentChats({ sessions, loading, error }: RecentChatsProps) {
  const reduce = useReducedMotion()

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.28 }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-[inset_0_1px_0_0_rgba(232,93,4,0.08)] backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-display text-base font-bold text-ink">Recent chats</h2>
          <p className="mt-0.5 text-xs text-muted">Continue where you left off</p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
          <ChatIcon />
        </span>
      </div>

      <div className="min-h-0 flex-1 p-2">
        {loading ? (
          <div className="space-y-2 p-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-xl bg-border/60"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : error ? (
          <p className="px-3 py-6 text-sm text-change">{error}</p>
        ) : sessions.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <ChatIcon />
            </div>
            <p className="text-sm text-muted">
              No chats yet — pick a job above to begin.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5 p-1">
            {sessions.map((s, i) => (
              <motion.li
                key={s.id}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32 + i * 0.04 }}
              >
                <Link
                  to={ROUTES.ask}
                  onClick={() => {
                    try {
                      localStorage.setItem(ACTIVE_SESSION_KEY, s.id)
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 no-underline transition-colors hover:bg-accent/8"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent/70 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink group-hover:text-accent">
                    {s.title || 'New chat'}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted">
                    {formatWhen(s.updated_at)}
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  )
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3v-3H7.5A2.5 2.5 0 0 1 5 13.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}
