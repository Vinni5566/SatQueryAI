import { motion, useReducedMotion } from 'framer-motion'

export function RecentReports() {
  const reduce = useReducedMotion()

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.34 }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/80 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-display text-base font-bold text-ink">Recent reports</h2>
          <p className="mt-0.5 text-xs text-muted">One-page briefings for your file note</p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/8 text-navy dark:bg-accent/15 dark:text-accent">
          <DocIcon />
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="relative mb-5">
          <div className="absolute -inset-3 rounded-3xl bg-accent/10 blur-md" aria-hidden />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/25 bg-bg text-accent shadow-sm">
            <DocIcon large />
          </div>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-muted">
          Reports will appear here after you export a one-page briefing from a
          chat.
        </p>
      </div>
    </motion.section>
  )
}

function DocIcon({ large }: { large?: boolean }) {
  const s = large ? 28 : 16
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 12h7M8.5 15.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
