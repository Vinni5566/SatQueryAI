import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '../Button'
import { ROUTES } from '../../routes'

type LandingHeroProps = {
  /** 0–1 scroll progress through the hero scroll act */
  progress: number
}

export function LandingHero({ progress }: LandingHeroProps) {
  const reduceMotion = useReducedMotion()
  const fadeOut = reduceMotion ? 1 : Math.max(0, 1 - progress * 1.4)

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-end pb-16 sm:items-center sm:pb-0">
      <div className="mx-auto w-full max-w-6xl px-6 pt-24 sm:pt-8">
        <motion.div
          style={{ opacity: fadeOut }}
          className="pointer-events-auto max-w-xl"
        >
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
            Department of Space · SIH 26167
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            SatQuery AI
          </h1>
          <p className="mt-4 text-xl font-semibold text-white/95 sm:text-2xl">
            Ask satellite pictures in plain language
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            Upload a scene. Ask what changed, where the water is, or what radar
            still sees under cloud — and check the answer on the image.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={ROUTES.signUp}>
              <Button
                variant="primary"
                className="bg-accent text-navy hover:opacity-90 dark:bg-accent dark:text-navy"
              >
                Sign up
              </Button>
            </Link>
            <Link to={ROUTES.signIn}>
              <Button
                variant="secondary"
                className="border-white/40 text-white hover:bg-white/10 dark:border-white/40 dark:text-white"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
