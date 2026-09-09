import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  loadSplitPercent,
  saveSplitPercent,
  type WorkspaceMode,
} from './splitState'

type SplitWorkspaceProps = {
  mode: WorkspaceMode
  onModeChange: (mode: WorkspaceMode) => void
  chat: ReactNode
  renderer: ReactNode
}

export function SplitWorkspace({
  mode,
  onModeChange,
  chat,
  renderer,
}: SplitWorkspaceProps) {
  const [percent, setPercent] = useState(40)
  const dragging = useRef(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPercent(loadSplitPercent())
  }, [])

  const onPointerMove = useCallback((event: PointerEvent) => {
    if (!dragging.current || !rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    const next = ((event.clientX - rect.left) / rect.width) * 100
    setPercent(Math.min(70, Math.max(25, next)))
  }, [])

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    setPercent((p) => {
      saveSplitPercent(p)
      return p
    })
  }, [])

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [onPointerMove, onPointerUp])

  if (mode === 'chat') {
    return (
      <div className="flex h-full min-h-0">
        <div className="min-w-0 flex-1">{chat}</div>
        <button
          type="button"
          className="flex w-10 shrink-0 flex-col items-center justify-center gap-2 border-l border-border bg-surface text-xs text-muted hover:bg-bg hover:text-ink"
          onClick={() => onModeChange('split')}
          title="Show renderer"
        >
          <span className="writing-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>
            Renderer
          </span>
          <span aria-hidden="true">‹</span>
        </button>
      </div>
    )
  }

  if (mode === 'renderer') {
    return (
      <div className="flex h-full min-h-0">
        <button
          type="button"
          className="flex w-10 shrink-0 flex-col items-center justify-center gap-2 border-r border-border bg-surface text-xs text-muted hover:bg-bg hover:text-ink"
          onClick={() => onModeChange('split')}
          title="Show chat"
        >
          <span aria-hidden="true">›</span>
          <span style={{ writingMode: 'vertical-rl' }}>Chat</span>
        </button>
        <div className="min-w-0 flex-1">{renderer}</div>
      </div>
    )
  }

  return (
    <div ref={rootRef} className="flex h-full min-h-0">
      <div className="min-w-0" style={{ width: `${percent}%` }}>
        {chat}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        title="Drag to resize"
        className="group relative z-10 flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-border/60 hover:bg-accent"
        onPointerDown={() => {
          dragging.current = true
        }}
      >
        <span className="h-8 w-1 rounded-full bg-muted group-hover:bg-accent" />
      </div>
      <div className="min-w-0 flex-1">{renderer}</div>
    </div>
  )
}
