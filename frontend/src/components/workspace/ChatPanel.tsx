import { useEffect, useRef } from 'react'
import { Button } from '../Button'
import { ChatComposer } from './ChatComposer'
import { ChatMessage, type ChatMessageData } from './ChatMessage'

type ChatPanelProps = {
  messages: ChatMessageData[]
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  stagedFile: File | null
  stagedPreviewUrl: string | null
  onStageFile: (file: File) => void
  onClearStaged: () => void
  activeAttachmentId?: string | null
  onSelectAttachment?: (id: string) => void
  onExpandChat: () => void
  busy?: boolean
  title?: string
  subtitle?: string
}

export function ChatPanel({
  messages,
  draft,
  onDraftChange,
  onSend,
  stagedFile,
  stagedPreviewUrl,
  onStageFile,
  onClearStaged,
  activeAttachmentId,
  onSelectAttachment,
  onExpandChat,
  busy,
  title = 'Ask this scene',
  subtitle = 'Attach a scene, ask a question, then Send',
}: ChatPanelProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border bg-bg">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
        <Button variant="ghost" className="text-xs" onClick={onExpandChat}>
          Expand chat
        </Button>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            activeAttachmentId={activeAttachmentId}
            onSelectAttachment={onSelectAttachment}
          />
        ))}
        <div ref={endRef} />
      </div>
      <ChatComposer
        value={draft}
        onChange={onDraftChange}
        onSend={onSend}
        stagedFile={stagedFile}
        stagedPreviewUrl={stagedPreviewUrl}
        onStageFile={onStageFile}
        onClearStaged={onClearStaged}
        busy={busy}
      />
    </div>
  )
}
