import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'
import { Navbar } from '../components/Navbar'
import { ChatPanel } from '../components/workspace/ChatPanel'
import type { ChatMessageData } from '../components/workspace/ChatMessage'
import { ImageRenderer } from '../components/workspace/ImageRenderer'
import { SessionSidebar } from '../components/workspace/SessionSidebar'
import { SplitWorkspace } from '../components/workspace/SplitWorkspace'
import type { WorkspaceMode } from '../components/workspace/splitState'
import {
  createSession,
  deleteSession,
  getMessages,
  getSession,
  listSessions,
  previewToObjectUrl,
  sendSessionMessage,
  type ImageMetadata,
  type MessageOut,
  type SessionListItem,
  uploadSessionAsset,
} from '../lib/api'
import { ASK_JOB, filterAskSessions } from '../lib/sessionJob'
import { ROUTES } from '../routes'

type StoredPreview = {
  url: string
  metadata: ImageMetadata
}

const WELCOME: ChatMessageData = {
  id: 'welcome',
  role: 'assistant',
  text: 'Attach a GeoTIFF (or PNG/JPEG benchmark), type your question, then Send.',
}

const ACTIVE_SESSION_KEY = 'satquery.activeSessionId'
const SIDEBAR_KEY = 'satquery.sidebarCollapsed'

function messageToUi(msg: MessageOut, previews: Record<string, StoredPreview>): ChatMessageData {
  const data: ChatMessageData = {
    id: msg.id,
    role: msg.role === 'user' ? 'user' : 'assistant',
    text: msg.content,
  }
  if (msg.attachment?.preview_png_base64) {
    const existing = previews[msg.attachment.id]
    data.attachment = {
      id: msg.attachment.id,
      url: existing?.url ?? previewToObjectUrl(msg.attachment.preview_png_base64),
      filename: msg.attachment.filename,
    }
  }
  return data
}

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

export function AskScenePage() {
  return (
    <>
      <SignedOut>
        <Navigate to={ROUTES.signIn} replace />
      </SignedOut>
      <SignedIn>
        <AskSceneWorkspace />
      </SignedIn>
    </>
  )
}

function AskSceneWorkspace() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken

  const [mode, setMode] = useState<WorkspaceMode>('split')
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageData[]>([WELCOME])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [previews, setPreviews] = useState<Record<string, StoredPreview>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [booting, setBooting] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)
  const [stagedFile, setStagedFile] = useState<File | null>(null)
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState<string | null>(null)

  const active = activeId ? previews[activeId] ?? null : null

  const tokenFn = useCallback(async () => getTokenRef.current(), [])

  const selectSessionId = useCallback((id: string) => {
    setSessionId(id)
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, id)
    } catch {
      /* ignore */
    }
  }, [])

  const setCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [])

  const clearStaged = useCallback(() => {
    setStagedPreviewUrl((url) => {
      if (url) URL.revokeObjectURL(url)
      return null
    })
    setStagedFile(null)
  }, [])

  const stageFile = useCallback((file: File) => {
    setStagedPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setStagedFile(file)
  }, [])

  const refreshSessions = useCallback(async () => {
    const rows = filterAskSessions(await listSessions(tokenFn))
    setSessions(rows)
    return rows
  }, [tokenFn])

  const loadSession = useCallback(
    async (id: string) => {
      setBusy(true)
      setError(null)
      clearStaged()
      try {
        const [detail, thread] = await Promise.all([
          getSession(tokenFn, id),
          getMessages(tokenFn, id),
        ])
        selectSessionId(id)
        const nextPreviews: Record<string, StoredPreview> = {}
        for (const asset of detail.assets) {
          if (!asset.preview_png_base64) continue
          nextPreviews[asset.id] = {
            url: previewToObjectUrl(asset.preview_png_base64),
            metadata: asset.metadata,
          }
        }
        setPreviews((prev) => {
          Object.values(prev).forEach((p) => URL.revokeObjectURL(p.url))
          return nextPreviews
        })
        const uiMessages =
          thread.length === 0
            ? [WELCOME]
            : thread.map((m) => messageToUi(m, nextPreviews))
        setMessages(uiMessages)
        const lastAsset = detail.assets[detail.assets.length - 1]
        setActiveId(lastAsset?.id ?? null)
        setZoom(1)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat')
      } finally {
        setBusy(false)
      }
    },
    [clearStaged, selectSessionId, tokenFn],
  )

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let cancelled = false
    ;(async () => {
      try {
        const rows = filterAskSessions(await listSessions(tokenFn))
        if (cancelled) return
        setSessions(rows)
        if (rows.length === 0) {
          const created = await createSession(tokenFn, 'New chat', ASK_JOB)
          if (cancelled) return
          setSessions([created])
          selectSessionId(created.id)
          setMessages([WELCOME])
          return
        }
        let preferred: string | null = null
        try {
          preferred = localStorage.getItem(ACTIVE_SESSION_KEY)
        } catch {
          preferred = null
        }
        const match = preferred && rows.some((r) => r.id === preferred)
        const id = match && preferred ? preferred : rows[0].id
        if (cancelled) return
        await loadSession(id)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not start chat')
        }
      } finally {
        if (!cancelled) setBooting(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot boot
  }, [isLoaded, isSignedIn])

  async function handleNewChat() {
    setBusy(true)
    setError(null)
    try {
      const created = await createSession(tokenFn, 'New chat', ASK_JOB)
      setSessions((prev) => [created, ...prev])
      selectSessionId(created.id)
      setMessages([WELCOME])
      clearStaged()
      setPreviews((prev) => {
        Object.values(prev).forEach((p) => URL.revokeObjectURL(p.url))
        return {}
      })
      setActiveId(null)
      setDraft('')
      setZoom(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create chat')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: string) {
    setBusy(true)
    setError(null)
    try {
      await deleteSession(tokenFn, id)
      if (sessionId === id) {
        try {
          localStorage.removeItem(ACTIVE_SESSION_KEY)
        } catch {
          /* ignore */
        }
      }
      const rows = await refreshSessions()
      if (sessionId === id) {
        if (rows.length === 0) {
          await handleNewChat()
        } else {
          await loadSession(rows[0].id)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete chat')
    } finally {
      setBusy(false)
    }
  }

  async function handleSend() {
    const text = draft.trim()
    if (!text || !sessionId) return
    setDraft('')
    setBusy(true)
    setError(null)
    const file = stagedFile
    try {
      if (file) {
        const res = await uploadSessionAsset(tokenFn, sessionId, file, text)
        const url = previewToObjectUrl(res.asset.preview_png_base64 ?? '')
        const id = res.asset.id
        setPreviews((prev) => ({
          ...prev,
          [id]: { url, metadata: res.asset.metadata },
        }))
        setActiveId(id)
        setZoom(1)
        setMode('split')
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== 'welcome'),
          messageToUi(res.user_message, {
            [id]: { url, metadata: res.asset.metadata },
          }),
          messageToUi(res.assistant_message, {}),
        ])
        clearStaged()
      } else {
        const res = await sendSessionMessage(tokenFn, sessionId, text)
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== 'welcome'),
          messageToUi(res.user_message, previews),
          messageToUi(res.assistant_message, previews),
        ])
      }
      await refreshSessions()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Send failed'
      setError(message)
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', text: message },
      ])
    } finally {
      setBusy(false)
    }
  }

  function selectAttachment(id: string) {
    if (!previews[id]) return
    setActiveId(id)
    setZoom(1)
    if (mode === 'chat') setMode('split')
  }

  return (
    <div className="flex h-screen flex-col bg-bg text-ink">
      <Navbar />
      {error ? (
        <div className="border-b border-change/40 bg-change/10 px-4 py-2 text-xs text-ink">
          {error}
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1">
        <SessionSidebar
          sessions={sessions}
          activeSessionId={sessionId}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setCollapsed}
          onNewChat={() => void handleNewChat()}
          onSelect={(id) => void loadSession(id)}
          onDelete={(id) => void handleDelete(id)}
          busy={busy || booting}
        />
        <div className="min-h-0 min-w-0 flex-1">
          <SplitWorkspace
            mode={mode}
            onModeChange={setMode}
            chat={
              <ChatPanel
                messages={messages}
                draft={draft}
                onDraftChange={setDraft}
                onSend={() => void handleSend()}
                stagedFile={stagedFile}
                stagedPreviewUrl={stagedPreviewUrl}
                onStageFile={stageFile}
                onClearStaged={clearStaged}
                activeAttachmentId={activeId}
                onSelectAttachment={selectAttachment}
                onExpandChat={() => setMode('chat')}
                busy={busy || booting}
              />
            }
            renderer={
              <ImageRenderer
                previewUrl={
                  stagedPreviewUrl && !active?.url
                    ? stagedPreviewUrl
                    : (active?.url ?? stagedPreviewUrl)
                }
                metadata={active?.metadata ?? null}
                zoom={zoom}
                onZoomChange={setZoom}
                onExpand={() => setMode('renderer')}
                onCloseToSplit={() => setMode('split')}
                expanded={mode === 'renderer'}
              />
            }
          />
        </div>
      </div>
    </div>
  )
}
