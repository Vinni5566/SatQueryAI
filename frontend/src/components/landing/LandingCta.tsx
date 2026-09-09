import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '../Button'
import { ROUTES } from '../../routes'

export function LandingCta() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden border-t border-border bg-navy py-20 text-white sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(232,93,4,0.3), transparent 55%)',
        }}
        aria-hidden
      />
      <motion.div
        className="relative mx-auto max-w-3xl px-6 text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Sign in and pick a job
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/70 sm:text-base">
          Upload one scene, two dates, or optical + radar — then ask in plain
          language.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
    </section>
  )
}
