import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'
import { useScroll, useTransform } from 'framer-motion'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'
import { BeneficiariesReel } from '../components/landing/BeneficiariesReel'
import { FeatureMissions } from '../components/landing/FeatureMissions'
import { LandingCta } from '../components/landing/LandingCta'
import { LandingHero } from '../components/landing/LandingHero'
import { LanguageVoice } from '../components/landing/LanguageVoice'
import { LitIndiaBackground } from '../components/landing/LitIndiaBackground'
import { TrustStrip } from '../components/landing/TrustStrip'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useTheme } from '../ThemeContext'
import { ROUTES } from '../routes'

function LandingNav() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="h-0.5 w-full bg-accent" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link to={ROUTES.home} className="no-underline">
          <span className="font-display text-lg font-bold tracking-tight text-white">
            SatQuery AI
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <span className="hidden text-sm text-white/60 sm:inline" aria-label="Language">
            <span className="font-medium text-white">EN</span>
            <span className="mx-1.5 text-white/30">|</span>
            <span>हिं</span>
          </span>
          <Link to={ROUTES.signIn}>
            <Button
              variant="secondary"
              className="border-white/35 text-white hover:bg-white/10 dark:border-white/35 dark:text-white"
            >
              Sign in
            </Button>
          </Link>
          <Link to={ROUTES.signUp} className="hidden sm:inline-flex">
            <Button
              variant="primary"
              className="bg-accent text-navy hover:opacity-90 dark:bg-accent dark:text-navy"
            >
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const [progress, setProgress] = useState(reducedMotion ? 0.5 : 0)
  const progressMotion = useTransform(scrollYProgress, [0, 1], [0, 1])

  useEffect(() => {
    if (reducedMotion) return
    return progressMotion.on('change', (v) => setProgress(v))
  }, [progressMotion, reducedMotion])

  const heroProgress = reducedMotion ? 0.5 : progress

  return (
    <div
      className="min-h-screen bg-[#050a14] text-ink"
      data-testid="landing"
    >
      <LandingNav />

      <section
        ref={heroRef}
        className="relative h-[180vh]"
        aria-label="SatQuery AI introduction"
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <LitIndiaBackground
            progress={heroProgress}
            reducedMotion={reducedMotion}
          />
          <LandingHero progress={heroProgress} />
          <p className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[11px] tracking-widest text-white/40 uppercase">
            Scroll
          </p>
        </div>
      </section>

      <div className="relative z-10 bg-bg">
        <FeatureMissions />
        <LanguageVoice />
        <BeneficiariesReel />
        <TrustStrip />
        <LandingCta />

        <footer className="border-t border-border bg-bg px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display font-bold text-ink">
                SatQuery AI
              </p>
              <p className="mt-1 text-xs text-muted">
                Department of Space · SIH 26167 · Ask satellite pictures in plain
                language
              </p>
            </div>
            <Link
              to={ROUTES.signIn}
              className="text-sm text-muted no-underline hover:text-ink"
            >
              Sign in
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}

/** Signed-in hub kept on `/` (wireframe 10). Landing is signed-out only. */
export function SignedInHome() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-border bg-bg">
        <div className="h-0.5 w-full bg-accent" aria-hidden="true" />
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
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            What do you need to know?
          </h1>
          <p className="mt-3 text-base text-muted">
            Pick a job, upload pictures, and ask in plain language.
          </p>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-1">
            <Link
              to={ROUTES.ask}
              className="rounded-xl border-2 border-navy bg-surface p-5 no-underline transition-colors hover:bg-bg dark:border-accent"
            >
              <div className="text-xs font-semibold text-accent">1</div>
              <h2 className="mt-1 text-lg font-bold text-ink">
                Ask this scene — one image
              </h2>
              <p className="mt-1 text-sm text-muted">
                Describe or highlight water, fields, buildings.
              </p>
            </Link>
          </div>
          <div className="mt-6">
            <Link to={ROUTES.design}>
              <Button variant="ghost">Open design preview</Button>
            </Link>
          </div>
        </div>
        <p className="mt-16 text-center text-xs text-muted">
          GeoTIFF preferred · Generic photo-chatbots are not used on pixels.
        </p>
      </main>
    </div>
  )
}

export function HomeGate() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <SignedInHome />
      </SignedIn>
    </>
  )
}
