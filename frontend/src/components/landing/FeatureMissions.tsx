import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

const missions = [
  {
    id: 'ask',
    number: '01',
    title: 'Ask this scene',
    line: 'One image. Describe or highlight what matters.',
    image: '/landing/ask-scene.png',
    accent: 'accent' as const,
    treatment: 'highlight' as const,
  },
  {
    id: 'change',
    number: '02',
    title: 'Before vs after',
    line: 'Two dates. What changed — and where.',
    image: '/landing/before-after.png',
    accent: 'change' as const,
    treatment: 'wipe' as const,
  },
  {
    id: 'fusion',
    number: '03',
    title: 'See through cloud',
    line: 'Optical + radar. Answers when clouds hide the ground.',
    image: '/landing/cloud-sar.png',
    accent: 'water' as const,
    treatment: 'reveal' as const,
  },
]

function MissionPanel({
  mission,
  index,
}: {
  mission: (typeof missions)[number]
  index: number
}) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { amount: 0.45, once: false })
  const reduceMotion = useReducedMotion()
  const active = reduceMotion || inView

  const ringClass =
    mission.accent === 'change'
      ? 'border-change'
      : mission.accent === 'water'
        ? 'border-water'
        : 'border-accent'

  return (
    <motion.article
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.05 }}
      className="relative min-w-0 flex-1 snap-center"
    >
      <div className="mb-4 flex items-baseline gap-3">
        <span
          className={`font-display text-sm font-semibold tracking-widest ${
            mission.accent === 'change'
              ? 'text-change'
              : mission.accent === 'water'
                ? 'text-water'
                : 'text-accent'
          }`}
        >
          {mission.number}
        </span>
        <h3 className="font-display text-2xl font-bold text-ink">
          {mission.title}
        </h3>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-navy">
        <img
          src={mission.image}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />

        {mission.treatment === 'highlight' && (
          <motion.div
            aria-hidden
            className={`absolute inset-[12%] rounded-lg border-2 ${ringClass}`}
            initial={false}
            animate={{
              opacity: active ? 1 : 0,
              scale: active ? 1 : 0.92,
            }}
            transition={{ duration: 0.7 }}
            style={{ boxShadow: '0 0 0 9999px rgba(11,31,58,0.35)' }}
          />
        )}

        {mission.treatment === 'wipe' && (
          <motion.div
            aria-hidden
            className="absolute inset-y-0 right-0 w-1/2 bg-change/35 mix-blend-multiply"
            initial={false}
            animate={{ opacity: active ? 1 : 0, x: active ? 0 : 40 }}
            transition={{ duration: 0.7 }}
          />
        )}

        {mission.treatment === 'reveal' && (
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-white/55 via-white/20 to-transparent"
            initial={false}
            animate={{ opacity: active ? 0.15 : 0.7 }}
            transition={{ duration: 1 }}
          />
        )}
      </div>

      <p className="mt-3 text-sm text-muted sm:text-base">{mission.line}</p>
    </motion.article>
  )
}

export function FeatureMissions() {
  return (
    <section
      id="missions"
      className="relative border-t border-border bg-bg py-20 sm:py-28"
      aria-labelledby="missions-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-12">
          <div className="mb-10 lg:sticky lg:top-28 lg:mb-0 lg:self-start">
            <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
              Three jobs
            </p>
            <h2
              id="missions-heading"
              className="mt-2 font-display text-3xl font-bold text-ink"
            >
              Pick a mission. Ask in plain language.
            </h2>
          </div>

          <div className="flex flex-col gap-16 lg:gap-20">
            {missions.map((mission, index) => (
              <MissionPanel key={mission.id} mission={mission} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
