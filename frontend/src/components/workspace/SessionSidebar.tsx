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
                    className={`w-full rounded-lg border-l-2 px-2 py-2 text-left text-xs ${
                      active
                        ? 'border-accent bg-accent/15 font-medium text-ink dark:bg-accent/25'
                        : 'border-transparent text-ink hover:bg-bg'
                    }`}
                  >
                    <span className="line-clamp-2 pr-5 font-medium">
                      {s.title || 'New chat'}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="Delete chat"
                    className="absolute right-1 top-1 rounded px-1 text-[10px] text-muted opacity-0 hover:text-change group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(s.id)
                    }}
                  >
                    ×
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
