import { useRef } from 'react'
import { Button } from '../Button'
import { CompareSlider } from './CompareSlider'

type SlotProps = {
  label: string
  filename: string | null
  onFile: (file: File) => void
  busy?: boolean
}

function UploadSlot({ label, filename, onFile, busy }: SlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border border-dashed border-border bg-bg px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide text-ink uppercase">
          {label}
        </p>
        <Button
          variant="secondary"
          className="shrink-0 px-2.5 text-xs"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          Upload
        </Button>
      </div>
      <p className="truncate text-[11px] text-muted">
        {filename ?? 'GeoTIFF or PNG/JPEG · drop-in for this date'}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".tif,.tiff,.png,.jpg,.jpeg,image/tiff,image/png,image/jpeg"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          event.target.value = ''
        }}
      />
    </div>
  )
}

type BeforeAfterRendererProps = {
  beforeUrl: string
  afterUrl: string
  beforeFilename?: string | null
  afterFilename?: string | null
  title?: string
  subtitle?: string
  legendLabel?: string | null
  zoom: number
  onZoomChange: (zoom: number) => void
  onExpand: () => void
  onCloseToSplit: () => void
  expanded?: boolean
  onUploadBefore: (file: File) => void
  onUploadAfter: (file: File) => void
  uploadBusy?: boolean
}

export function BeforeAfterRenderer({
  beforeUrl,
  afterUrl,
  beforeFilename,
  afterFilename,
  title = 'Before · After',
  subtitle,
  legendLabel = 'New built-up',
  zoom,
  onZoomChange,
  onExpand,
  onCloseToSplit,
  expanded,
  onUploadBefore,
  onUploadAfter,
  uploadBusy,
}: BeforeAfterRendererProps) {
  function download() {
    const a = document.createElement('a')
    a.href = afterUrl
    a.download = 'satquery-after-preview.png'
    a.click()
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-bg px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{title}</p>
          {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
        </div>
        <Button
          variant="ghost"
          className="px-2 text-xs"
          onClick={() => onZoomChange(Math.max(0.5, zoom - 0.25))}
        >
          −
        </Button>
        <Button
          variant="ghost"
          className="px-2 text-xs"
          onClick={() => onZoomChange(1)}
        >
          Fit
        </Button>
        <Button
          variant="ghost"
          className="px-2 text-xs"
          onClick={() => onZoomChange(Math.min(4, zoom + 0.25))}
        >
          +
        </Button>
        <Button variant="secondary" className="text-xs" onClick={download}>
          Download
        </Button>
        {expanded ? (
          <Button variant="secondary" className="text-xs" onClick={onCloseToSplit}>
            Close
          </Button>
        ) : (
          <Button variant="secondary" className="text-xs" onClick={onExpand}>
            Expand
          </Button>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden p-3">
        <CompareSlider
          beforeUrl={beforeUrl}
          afterUrl={afterUrl}
          legendLabel={legendLabel ?? undefined}
          zoom={zoom}
        />
      </div>

      <div className="border-t border-border px-3 py-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <UploadSlot
            label="Before (left)"
            filename={beforeFilename ?? null}
            onFile={onUploadBefore}
            busy={uploadBusy}
          />
          <UploadSlot
            label="After (right)"
            filename={afterFilename ?? null}
            onFile={onUploadAfter}
            busy={uploadBusy}
          />
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">
          Drag the handle to compare · upload replaces each side
        </p>
      </div>
    </div>
  )
}
