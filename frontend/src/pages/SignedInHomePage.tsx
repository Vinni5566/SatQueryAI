import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useUser, UserButton } from '@clerk/clerk-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Logo } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'
import { JobCards } from '../components/home/JobCards'
import { RecentChats } from '../components/home/RecentChats'
import { RecentReports } from '../components/home/RecentReports'
import { listSessions, type SessionListItem } from '../lib/api'
import { useTheme } from '../ThemeContext'
import { ROUTES } from '../routes'

export function SignedInHomePage() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useUser()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken
  const reduce = useReducedMotion()

  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tokenFn = useCallback(async () => getTokenRef.current(), [])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const rows = await listSessions(tokenFn)
        if (!cancelled) setSessions(rows.slice(0, 8))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load chats')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, tokenFn])

  const firstName = user?.firstName

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg text-ink">
      {/* Soft atmosphere — not a flat white slab */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-accent/[0.09] blur-3xl" />
        <div className="absolute -right-16 top-40 h-[22rem] w-[22rem] rounded-full bg-navy/[0.06] blur-3xl dark:bg-accent/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-water/[0.06] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--sq-ink) 8%, transparent) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/75 backdrop-blur-md">
        <div className="h-0.5 w-full bg-gradient-to-r from-accent via-accent to-builtup" aria-hidden />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link to={ROUTES.home} className="no-underline">
            <Logo theme={theme} />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <UserButton afterSignOutUrl={ROUTES.home} />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-14">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          {firstName ? (
            <p className="text-sm font-medium text-accent">
              Welcome back, {firstName}
            </p>
          ) : (
            <p className="text-sm font-medium text-accent">Job console</p>
          )}
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            What do you need{' '}
            <span className="bg-gradient-to-r from-accent to-builtup bg-clip-text text-transparent">
              to know?
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Pick a job. Upload the matching pictures. Type a question. We choose
            the models — you stay with the map.
          </p>
        </motion.div>

        <div className="mt-12">
          <JobCards />
        </div>

        <div className="mt-12 grid min-h-[280px] gap-5 lg:grid-cols-2">
          <RecentChats sessions={sessions} loading={loading} error={error} />
          <RecentReports />
        </div>

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-16 text-center text-xs text-muted"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            GeoTIFF preferred · Generic photo-chatbots are not used on pixels
          </span>
        </motion.p>
      </main>
    </div>
  )
}
