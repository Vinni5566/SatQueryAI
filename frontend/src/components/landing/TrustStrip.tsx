import { motion, useReducedMotion } from 'framer-motion'

const beats = [
  {
    title: 'Answer on the picture',
    body: 'Highlights and overlays you can verify in a meeting — not a paragraph that invents lakes.',
  },
  {
    title: 'Right tool for the job',
    body: 'Specialist remote-sensing paths — not a generic photo chatbot guessing on satellite pixels.',
  },
  {
    title: 'GeoTIFF-first · honest refusals',
    body: 'Prefers map-aware files. Blocks bad pairings when the upload does not match the job.',
  },
]

export function TrustStrip() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      className="border-t border-border bg-surface py-16 sm:py-20"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
          Why trust it
        </p>
        <h2
          id="trust-heading"
          className="mt-2 font-display text-3xl font-bold text-ink"
        >
          Evidence you can check
        </h2>

        <ol className="mt-10 grid gap-0 sm:grid-cols-3">
          {beats.map((beat, i) => (
            <motion.li
              key={beat.title}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative border-border px-0 py-6 sm:border-l sm:px-8 sm:py-2 first:sm:border-l-0 first:sm:pl-0"
            >
              <span className="font-display text-xs font-semibold tracking-widest text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 text-lg font-bold text-ink">{beat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{beat.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
