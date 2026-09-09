import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ImageThumb } from './ImageThumb'

export type ChatRole = 'user' | 'assistant'

export type ChatAttachment = {
  id: string
  url: string
  filename: string
}

export type ChatMessageData = {
  id: string
  role: ChatRole
  text: string
  attachment?: ChatAttachment
  confidence?: number
}

type ChatMessageProps = {
  message: ChatMessageData
  activeAttachmentId?: string | null
  onSelectAttachment?: (id: string) => void
}

export function ChatMessage({
  message,
  activeAttachmentId,
  onSelectAttachment,
}: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
          isUser
            ? 'bg-navy text-white dark:bg-accent dark:text-navy'
            : 'border border-border bg-surface text-ink'
        }`}
      >
        {message.attachment ? (
          <div className="mb-2">
            <ImageThumb
              src={message.attachment.url}
              label={message.attachment.filename}
              selected={activeAttachmentId === message.attachment.id}
              onClick={() => onSelectAttachment?.(message.attachment!.id)}
            />
            <p
              className={`mt-1 text-[11px] ${
                isUser ? 'text-white/80 dark:text-navy/70' : 'text-muted'
              }`}
            >
              Click thumbnail to show in renderer
            </p>
          </div>
        ) : null}
        <div
          className={`chat-md [&_a]:underline [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:text-[0.85em] dark:[&_code]:bg-white/10 [&_li]:ml-4 [&_ol]:my-1 [&_ol]:list-decimal [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:my-1 [&_ul]:list-disc ${
            isUser
              ? '[&_a]:text-white [&_code]:bg-white/20'
              : '[&_a]:text-accent'
          }`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
        </div>
        {typeof message.confidence === 'number' ? (
          <p className="mt-2 text-[11px] text-muted">
            Confidence {message.confidence.toFixed(2)}
          </p>
        ) : null}
      </div>
    </div>
  )
}
