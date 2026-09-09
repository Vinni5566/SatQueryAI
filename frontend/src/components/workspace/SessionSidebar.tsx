import { Button } from '../Button'
import type { SessionListItem } from '../../lib/api'

type SessionSidebarProps = {
  sessions: SessionListItem[]
  activeSessionId: string | null
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onNewChat: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  busy?: boolean
}

function TrashIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  collapsed,
  onCollapsedChange,
  onNewChat,
  onSelect,
  onDelete,
  busy,
}: SessionSidebarProps) {
  if (collapsed) {
    return (
      <aside className="flex h-full w-10 shrink-0 flex-col items-center gap-2 border-r border-border bg-surface py-2">
        <button
          type="button"
          title="Expand chats"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink hover:bg-bg"
          onClick={() => onCollapsedChange(false)}
        >
          ›
        </button>
        <button
          type="button"
          title="New chat"
          disabled={busy}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
          onClick={onNewChat}
        >
          +
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <Button
          className="w-full bg-accent text-xs text-white hover:opacity-90 dark:bg-accent dark:text-navy"
          onClick={onNewChat}
          disabled={busy}
        >
          New chat
        </Button>
        <button
          type="button"
          title="Collapse chats"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-ink hover:bg-bg"
          onClick={() => onCollapsedChange(true)}
        >
          ‹
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted">No chats yet</p>
        ) : (
          <ul className="space-y-1">
            {sessions.map((s) => {
              const active = s.id === activeSessionId
              return (
                <li key={s.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(s.id)}
                    className={`w-full rounded-lg border-l-2 py-2 pl-2 pr-9 text-left text-xs ${
                      active
                        ? 'border-accent bg-accent/15 font-medium text-ink dark:bg-accent/25'
                        : 'border-transparent text-ink hover:bg-bg'
                    }`}
                  >
                    <span className="line-clamp-2 font-medium">
                      {s.title || 'New chat'}
                    </span>
                  </button>
                  <button
                    type="button"
                    title="Delete chat"
                    aria-label="Delete chat"
                    disabled={busy}
                    className={`absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-opacity hover:bg-change/10 hover:text-change disabled:opacity-40 ${
                      active
                        ? 'opacity-70'
                        : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(s.id)
                    }}
                  >
                    <TrashIcon />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
